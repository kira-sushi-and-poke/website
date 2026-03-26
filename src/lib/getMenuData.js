"use server";

import { SQUARE_API_VERSION } from "./constants";

/**
 * Fetch menu data server-side directly from third party API
 * This function strictly runs on the server to not expose sensitive credentials
 */
export async function getMenuData() {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    const catalogUrl = process.env.API_CATALOG_URL;

    const response = await fetch(
      `${catalogUrl}/list?types=ITEM,CATEGORY,IMAGE&include_related_objects=true`,
      {
        method: "GET",
        headers: {
          "Square-Version": SQUARE_API_VERSION,
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 120 }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: 'Failed to fetch menu from Square',
        data: []
      };
    }

    const data = await response.json();
    const transformedMenu = transformCatalog(data);

    if (transformedMenu.length === 0) {
      return {
        success: false,
        error: 'No menu items found in catalog',
        data: []
      };
    }

    return {
      success: true,
      error: null,
      data: transformedMenu
    };

  } catch (error) {
    return {
      success: false,
      error: 'Unable to connect to Square. Please try again later.',
      data: []
    };
  }
}

/**
 * Transform Square catalog format to menu.json format
 * Structure: ITEM = subcategory/group, VARIATION = individual menu item
 */
function transformCatalog(catalogData) {
  if (!catalogData.objects) {
    return [];
  }

  // Separate items, categories, and images
  const categories = {};
  const images = {};
  const menuItems = [];

  // First pass: collect categories and images
  catalogData.objects.forEach(obj => {
    if (obj.type === "CATEGORY") {
      categories[obj.id] = obj.category_data.name;
    } else if (obj.type === "IMAGE") {
      images[obj.id] = obj.image_data.url;
    }
  });

  // Second pass: process items and their variations
  catalogData.objects.forEach(obj => {
    if (obj.type === "ITEM" && !obj.is_deleted) {
      const itemData = obj.item_data;

      // The ITEM name is the subcategory (e.g., "Makizushi (Sushi Rolls)")
      const itemName = itemData.name;
      const itemDescription = itemData.description || "";

      // Get category from CATEGORY object or infer from ITEM name
      const categoryIds = itemData.categories || [];
      const firstCategoryId = categoryIds.length > 0 ? categoryIds[0].id : null;
      const apiCategoryName = firstCategoryId ? categories[firstCategoryId] : null;
      const category = mapCategory(apiCategoryName, itemName);

      // Get custom attributes for ITEM level
      const itemCustomAttributes = itemData.custom_attribute_values || {};

      // Check for subcategory custom attribute override
      const subcategoryAttr = Object.values(itemCustomAttributes).find(attr =>
        attr.name?.toLowerCase() === "subcategory" || attr.key?.toLowerCase() === "subcategory"
      );

      // Use custom attribute if set, otherwise infer subcategory
      const subcategory = subcategoryAttr?.string_value || inferSubcategory(category, itemName, itemDescription);

      // Get images for this item group
      const imageItemLinks = (itemData.image_ids || [])
        .map(imageId => images[imageId])
        .filter(Boolean);

      // Loop through each VARIATION and create a menu item
      const variations = itemData.variations || [];
      variations.forEach(variation => {
        if (variation.is_deleted) return; // Skip deleted variations

        const variationData = variation.item_variation_data;
        const priceData = variationData?.price_money;
        const variationImageLinks = (variationData?.image_ids || []);
        const allImageLinks = [...new Set([...imageItemLinks, ...variationImageLinks.map(id => images[id]).filter(Boolean)])];
        // Only create menu item if variation has a price
        if (!priceData || !priceData.amount) return;

        // Convert price from cents to pounds
        const price = priceData.amount / 100;

        // The VARIATION name is the actual menu item name (e.g., "The Kira Roll")
        // BUT if the variation name is generic (like "Regular"), use the ITEM name instead
        const variationName = variationData.name || itemName;
        const isGenericVariationName = /^(regular|small|medium|large|standard)$/i.test(variationName.trim());
        const menuItemName = isGenericVariationName ? itemName : variationName;

        // Extract variation-specific description
        let variationDesc = variationData.price_description?.trim() || "";

        // Get custom attributes from variation
        const customAttributes = variation.custom_attribute_values || {};

        // Check for explicit status custom attribute (variation level first, then item level)
        const variationStatusAttr = Object.values(customAttributes).find(attr =>
          attr.name?.toLowerCase() === "status" || attr.key?.toLowerCase() === "status"
        );
        const itemStatusAttr = Object.values(itemCustomAttributes).find(attr =>
          attr.name?.toLowerCase() === "status" || attr.key?.toLowerCase() === "status"
        );

        // Use custom attribute or default to "available"
        const status = variationStatusAttr?.string_value?.toLowerCase().trim()
          || itemStatusAttr?.string_value?.toLowerCase().trim()
          || "available";

        const customAttributeDescription = Object.values(customAttributes)
          .filter(attr => {
            const attrName = (attr.name || attr.key || "").toLowerCase();
            return attrName !== "status";
          })
          .map(attr => {
            if (attr.string_value) return attr.string_value;
            if (attr.number_value) return attr.number_value;
            if (attr.boolean_value !== undefined) return attr.boolean_value;
            return null;
          })
          .filter(Boolean)
          .join(", ");

        // Combine descriptions
        if (variationDesc && customAttributeDescription) {
          variationDesc = `${variationDesc}, ${customAttributeDescription}`;
        } else if (customAttributeDescription) {
          variationDesc = customAttributeDescription;
        }

        // Use variation description as main description if item description is empty
        const finalDescription = itemDescription?.trim() || variationDesc || "";
        const finalVariationDescription = itemDescription?.trim() ? variationDesc : null;

        menuItems.push({
          id: obj.id,
          variationId: variation.id,
          name: menuItemName,
          category,
          subcategory,
          status,
          originalPrice: price,
          discountedPrice: null,
          description: finalDescription,
          variationDescription: finalVariationDescription,
          imageLink: allImageLinks.length > 0 ? allImageLinks : [],
          apiData: {
            itemId: obj.id,
            variationId: variation.id,
            version: obj.version
          }
        });
      });
    }
  });

  return menuItems;
}

/**
 * Map Square category name to app category
 */
function mapCategory(apiCategoryName, itemName) {
  if (!apiCategoryName) {
    // Try to infer from item name
    const itemLower = itemName.toLowerCase();
    if (itemLower.includes("sushi") || itemLower.includes("roll") || itemLower.includes("nigiri") || itemLower.includes("sashimi") || itemLower.includes("hosomaki") || itemLower.includes("inarizushi") || itemLower.includes("inari") || itemLower.includes("onigiri")) {
      return "sushi";
    }
    if (itemLower.includes("poke")) return "poke";
    if (itemLower.includes("curry") || itemLower.includes("teriyaki") || itemLower.includes("katsu")) {
      return "hot";
    }
    if (itemLower.includes("dessert") || itemLower.includes("dorayaki")) return "desserts";
    if (itemLower.includes("drink") || itemLower.includes("pepsi") || itemLower.includes("ramune") || itemLower.includes("water")) {
      return "drinks";
    }
    if (itemLower.includes("moriawase")) return "platters";
    if (itemLower.includes("school special") || itemLower.includes("kids")) return "kids";
    return "solo";
  }

  // Category mapping configuration
  const categoryMap = {
    // Platters/Chef's Selection
    "chef selection": "platters",
    "chef's selection": "platters",
    "moriawase": "platters",
    "sharing": "platters",
    "platters": "platters",
    "sushi platters": "platters",

    // Sushi
    "sushi": "sushi",
    "sushi menu": "sushi",
    "makizushi": "sushi",
    "nigiri": "sushi",
    "sashimi": "sushi",
    "rolls": "sushi",

    // Poke
    "poke": "poke",
    "poke bowls": "poke",
    "poke bowl": "poke",
    "bowls": "poke",

    // Hot dishes
    "hot dishes": "hot",
    "hot": "hot",
    "mains": "hot",
    "main dishes": "hot",
    "main dishes (hot)": "hot",
    "curry": "hot",
    "teriyaki": "hot",

    // Kids Menu
    "kids menu": "kids",
    "kids": "kids",
    "school special": "kids",
    "children": "kids",

    // Sides
    "sides": "solo",
    "appetizers": "solo",
    "starters": "solo",
    "small plates": "solo",

    // Desserts
    "desserts": "desserts",
    "dessert": "desserts",
    "sweets": "desserts",

    // Drinks
    "drinks": "drinks",
    "beverages": "drinks",
    "beverage": "drinks",
    "drink": "drinks",
  };

  const normalized = apiCategoryName.toLowerCase().trim();

  // Direct match
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Fuzzy match
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return "solo";
}

/**
 * Infer subcategory for sushi and hot items
 */
function inferSubcategory(category, itemName, description) {
  const itemLower = itemName.toLowerCase();

  // Handle sushi subcategories
  if (category === 'sushi') {
    // Check if item name contains parentheses - likely a subcategory descriptor
    if (itemName.includes('(') && itemName.includes(')')) {
      return itemName;
    }

    // Exact matches for known subcategory names
    const subcategoryMap = {
      'makizushi': 'Makizushi (Sushi Rolls)',
      'inarizushi': 'Inarizushi',
      'sashimi': 'Sashimi',
      'onigiri': 'Onigiri',
      'nigiri': 'Nigiri',
      'hosomaki': 'Hosomaki',
    };

    // Check for exact match
    for (const [key, value] of Object.entries(subcategoryMap)) {
      if (itemLower === key) {
        return value;
      }
    }

    return null;
  }

  // Handle hot dishes subcategories
  if (category === 'hot') {
    // Check if item name contains parentheses
    if (itemName.includes('(') && itemName.includes(')')) {
      return itemName;
    }

    if (itemLower.includes('curry')) {
      return 'Japanese Curry';
    }
    if (itemLower.includes('teriyaki')) {
      return 'Teriyaki';
    }

    return null;
  }

  return null;
}
