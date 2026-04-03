"use server";

import { SQUARE_API_VERSION, CATEGORY_CONFIG } from "./constants";

/**
 * Fetch menu data server-side directly from third party API
 * This function strictly runs on the server to not expose sensitive credentials
 */
export async function getMenuData() {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    const catalogUrl = process.env.API_CATALOG_URL;

    const response = await fetch(
      `${catalogUrl}/list?types=ITEM,CATEGORY,IMAGE,MODIFIER_LIST&include_related_objects=true`,
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
        error: "Failed to fetch menu from Square",
        data: []
      };
    }

    const data = await response.json();
    const transformedMenu = transformCatalog(data);

    if (transformedMenu.length === 0) {
      return {
        success: false,
        error: "No menu items found in catalog",
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
      error: "Unable to connect to Square. Please try again later.",
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

  // Separate items, categories, images, and modifier lists
  const categories = {};
  const images = {};
  const modifierLists = {};
  const menuItems = [];

  // First pass: collect categories, images, and modifier lists
  catalogData.objects.forEach(obj => {
    if (obj.type === "CATEGORY") {
      // Store both name and ordinal for category ordering
      const categoryData = obj.category_data;
      categories[obj.id] = {
        name: categoryData.name,
        ordinal: categoryData.parent_category?.ordinal ?? 999999
      };
    } else if (obj.type === "IMAGE") {
      images[obj.id] = obj.image_data.url;
    } else if (obj.type === "MODIFIER_LIST") {
      // Parse modifier list with its options
      const modifierListData = obj.modifier_list_data;
      if (modifierListData && modifierListData.modifiers) {
        modifierLists[obj.id] = {
          id: obj.id,
          name: modifierListData.name,
          selectionType: modifierListData.selection_type,
          modifiers: modifierListData.modifiers.map(mod => ({
            id: mod.id,
            name: mod.modifier_data?.name || "",
            price: mod.modifier_data?.price_money?.amount ? mod.modifier_data.price_money.amount / 100 : 0,
            ordinal: mod.modifier_data?.ordinal ?? 999999
          })).sort((a, b) => a.ordinal - b.ordinal)
        };
      }
    }
  });

  // Second pass: process items and their variations
  catalogData.objects.forEach(obj => {
    if (obj.type === "ITEM" && !obj.is_deleted && !obj.item_data?.is_archived) {
      const itemData = obj.item_data;

      // The ITEM name is the subcategory (e.g., "Makizushi (Sushi Rolls)")
      const itemName = itemData.name;
      const itemDescription = itemData.description || "";

      // Get category from CATEGORY object
      const categoryIds = itemData.categories || [];
      const firstCategoryId = categoryIds.length > 0 ? categoryIds[0].id : null;
      const categoryInfo = firstCategoryId ? categories[firstCategoryId] : null;
      const apiCategoryName = categoryInfo?.name;
      const category = normalizeCategoryName(apiCategoryName);
      const categoryDisplayName = apiCategoryName || "Uncategorized";
      const categoryOrdinal = categoryInfo?.ordinal ?? 999999;

      // Get custom attributes for ITEM level (at obj level, not itemData level!)
      const itemCustomAttributes = obj.custom_attribute_values || {};

      // ITEM name IS the subcategory (e.g., "Makizushi (Sushi Rolls)", "Nigiri")
      const subcategory = itemName;

      // Extract display_type custom attribute (TEXT type)
      const displayTypeAttr = Object.values(itemCustomAttributes).find(attr =>
        attr.name?.toLowerCase() === "display_type" || attr.key?.toLowerCase() === "display_type"
      );
      
      // Get string value and normalize (trim and lowercase), default to "separate"
      const displayType = displayTypeAttr?.string_value?.trim().toLowerCase() || "separate";

      // Extract ITEM ordinal from categories array (this controls order within category)
      const itemOrdinal = categoryIds.length > 0 ? categoryIds[0].ordinal : 999999;

      // Get images for this item group
      const imageItemLinks = (itemData.image_ids || [])
        .map(imageId => images[imageId])
        .filter(Boolean);

      // Get modifier lists for this item
      const itemModifiers = [];
      if (itemData.modifier_list_info && Array.isArray(itemData.modifier_list_info)) {
        itemData.modifier_list_info.forEach(modListInfo => {
          if (modListInfo.enabled !== false && modifierLists[modListInfo.modifier_list_id]) {
            const modList = modifierLists[modListInfo.modifier_list_id];
            itemModifiers.push(...modList.modifiers);
          }
        });
      }

      // Loop through each VARIATION and create a menu item
      const variations = itemData.variations || [];
      variations.forEach(variation => {
        if (variation.is_deleted) return; // Skip deleted variations

        const variationData = variation.item_variation_data;
        const priceData = variationData?.price_money;
        const variationImageLinks = (variationData?.image_ids || []);
        const allImageLinks = [...new Set([...imageItemLinks, ...variationImageLinks.map(id => images[id]).filter(Boolean)])];
        
        // Extract VARIATION ordinal for sorting
        const variationOrdinal = variationData?.ordinal ?? 999999;
        
        // Only create menu item if variation has a price
        if (!priceData || !priceData.amount) return;

        // Convert price from cents to pounds
        const price = priceData.amount / 100;

        // The VARIATION name is the actual menu item name (e.g., "The Kira Roll")
        // BUT if the variation name is generic (like "Regular"), use the ITEM name instead
        const variationName = variationData.name || itemName;
        const isGenericVariationName = /^(regular|small|medium|large|standard)$/i.test(variationName.trim());
        const menuItemName = isGenericVariationName ? itemName : variationName;

        // Construct displayName for orders/cart (with full context)
        let displayName;
        if (isGenericVariationName) {
          displayName = itemName;  // "Chicken Curry" not "Chicken Curry - Regular"
        } else {
          displayName = `${itemName} - ${variationName}`;  // "Nigiri - Prawn"
        }

        // Extract variation-specific description
        let variationDesc = variationData.price_description?.trim() || "";

        // Get custom attributes from variation (at variation level, not variationData level!)
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
          itemName: itemName,
          displayName: displayName,
          category,
          categoryDisplayName,
          subcategory,
          displayType,
          status,
          originalPrice: price,
          discountedPrice: null,
          description: finalDescription,
          variationDescription: finalVariationDescription,
          imageLink: allImageLinks.length > 0 ? allImageLinks : [],
          modifiers: itemModifiers.length > 0 ? itemModifiers : undefined,
          apiData: {
            itemId: obj.id,
            variationId: variation.id,
            version: obj.version
          },
          // Ordinals for sorting
          _categoryOrdinal: categoryOrdinal,
          _itemOrdinal: itemOrdinal,
          _variationOrdinal: variationOrdinal
        });
      });
    }
  });

  // Sort menu items by ordinals: category ordinal, then item ordinal, then variation ordinal
  menuItems.sort((a, b) => {
    // First by category ordinal from Square
    if (a._categoryOrdinal !== b._categoryOrdinal) {
      return a._categoryOrdinal - b._categoryOrdinal;
    }
    
    // Then by item ordinal
    if (a._itemOrdinal !== b._itemOrdinal) {
      return a._itemOrdinal - b._itemOrdinal;
    }
    
    // Finally by variation ordinal
    return a._variationOrdinal - b._variationOrdinal;
  });

  return menuItems;
}

/**
 * Normalize Square category name to app category ID
 * Uses CATEGORY_CONFIG mapping from constants
 */
function normalizeCategoryName(apiCategoryName) {
  if (!apiCategoryName) {
    return "solo"; // Default category for uncategorized items
  }

  const normalized = apiCategoryName.toLowerCase().trim();

  // Direct match from CATEGORY_CONFIG
  if (CATEGORY_CONFIG.mapping[normalized]) {
    return CATEGORY_CONFIG.mapping[normalized];
  }

  // Fuzzy match
  for (const [key, value] of Object.entries(CATEGORY_CONFIG.mapping)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return "solo"; // Default fallback
}
