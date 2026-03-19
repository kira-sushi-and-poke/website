import { NextResponse } from 'next/server';

/**
 * Fetches catalog items from Square API
 * GET /api/square/catalog
 */
export async function GET() {
  try {
    // Get credentials from environment variables
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;

    // Validate credentials
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Square access token not configured. Check your .env.local file.' },
        { status: 500 }
      );
    }

    // Choose the right base URL
    const baseUrl = process.env.SQUARE_API_URL;

    // Fetch catalog items, categories, and images
    const response = await fetch(
      `${baseUrl}/v2/catalog/list?types=ITEM,CATEGORY,IMAGE`,
      {
        method: 'GET',
        headers: {
          'Square-Version': '2024-12-18',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Square API Error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to fetch catalog from Square',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Square data to match your menu.json format
    const transformedMenu = transformSquareCatalog(data);

    return NextResponse.json({
      success: true,
      raw: data, // Include raw data for debugging
      transformed: transformedMenu
    });

  } catch (error) {
    console.error('Error fetching Square catalog:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Transform Square catalog format to your menu.json format
 * Structure: ITEM = subcategory/group, VARIATION = individual menu item
 */
function transformSquareCatalog(squareData) {
  if (!squareData.objects) {
    return [];
  }

  // Separate items, categories, and images
  const categories = {};
  const images = {};
  const menuItems = [];

  // First pass: collect categories and images
  squareData.objects.forEach(obj => {
    if (obj.type === 'CATEGORY') {
      categories[obj.id] = obj.category_data.name;
    } else if (obj.type === 'IMAGE') {
      images[obj.id] = obj.image_data.url;
    }
  });

  // Second pass: process items and their variations
  squareData.objects.forEach(obj => {
    if (obj.type === 'ITEM' && !obj.is_deleted) {
      const itemData = obj.item_data;

      // The ITEM name is the subcategory (e.g., "Makizushi (Sushi Rolls)")
      const itemName = itemData.name;
      const itemDescription = itemData.description || '';

      // Get category from Square CATEGORY or infer from ITEM name
      const squareCategoryName = itemData.category_id ? categories[itemData.category_id] : null;
      const category = mapCategory(squareCategoryName, itemName);

      // The ITEM name becomes the subcategory
      const subcategory = inferSubcategory(category, itemName, itemDescription);

      // Get images for this item group
      const imageLinks = (itemData.image_ids || [])
        .map(imageId => images[imageId])
        .filter(Boolean);

      // Loop through each VARIATION and create a menu item
      const variations = itemData.variations || [];
      variations.forEach(variation => {
        if (variation.is_deleted) return; // Skip deleted variations

        const variationData = variation.item_variation_data;
        const priceData = variationData?.price_money;

        // Only create menu item if variation has a price
        if (!priceData || !priceData.amount) return;

        // Convert price from cents to pounds
        const price = priceData.amount / 100;

        // The VARIATION name is the actual menu item name (e.g., "The Kira Roll")
        // BUT if the variation name is generic (like "Regular"), use the ITEM name instead
        const variationName = variationData.name || itemName;
        const isGenericVariationName = /^(regular|small|medium|large|standard)$/i.test(variationName.trim());
        const menuItemName = isGenericVariationName ? itemName : variationName;

        // Infer status from variation name or item name
        const status = inferStatus(menuItemName, itemDescription);

        menuItems.push({
          id: obj.id,
          variationId: variation.id,
          name: menuItemName,
          category,
          subcategory,
          status,
          originalPrice: price,
          discountedPrice: null,
          description: itemDescription,
          imageLink: imageLinks.length > 0 ? imageLinks : [],
          squareData: {
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
function mapCategory(squareCategoryName, itemName) {
  if (!squareCategoryName) {
    // Try to infer from item name
    const itemLower = itemName.toLowerCase();
    if (itemLower.includes('sushi') || itemLower.includes('roll') || itemLower.includes('nigiri') || itemLower.includes('sashimi') || itemLower.includes('hosomaki') || itemLower.includes('inarizushi') || itemLower.includes('inari') || itemLower.includes('onigiri')) {
      return 'sushi';
    }
    if (itemLower.includes('poke')) return 'poke';
    if (itemLower.includes('curry') || itemLower.includes('teriyaki') || itemLower.includes('katsu')) {
      return 'hot';
    }
    if (itemLower.includes('dessert') || itemLower.includes('dorayaki')) return 'desserts';
    if (itemLower.includes('drink') || itemLower.includes('pepsi') || itemLower.includes('ramune') || itemLower.includes('water')) {
      return 'drinks';
    }
    if (itemLower.includes('moriawase')) return 'sharer';
    return 'solo';
  }

  // Category mapping configuration
  const categoryMap = {
    // Sharer/Chef's Selection
    'chef selection': 'sharer',
    "chef's selection": 'sharer',
    'moriawase': 'sharer',
    'sharing': 'sharer',
    'platters': 'sharer',

    // Sushi
    'sushi': 'sushi',
    'makizushi': 'sushi',
    'nigiri': 'sushi',
    'sashimi': 'sushi',
    'rolls': 'sushi',

    // Poke
    'poke': 'poke',
    'poke bowls': 'poke',
    'poke bowl': 'poke',
    'bowls': 'poke',

    // Hot dishes
    'hot dishes': 'hot',
    'hot': 'hot',
    'mains': 'hot',
    'curry': 'hot',
    'teriyaki': 'hot',

    // Sides
    'sides': 'solo',
    'appetizers': 'solo',
    'starters': 'solo',
    'small plates': 'solo',

    // Desserts
    'desserts': 'desserts',
    'dessert': 'desserts',
    'sweets': 'desserts',

    // Drinks
    'drinks': 'drinks',
    'beverages': 'drinks',
    'drink': 'drinks',
  };

  const normalized = squareCategoryName.toLowerCase().trim();

  // Direct match
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Fuzzy match - check if category contains or is contained by a key
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Default fallback
  return 'solo';
}

/**
 * Infer item status from name and description
 */
function inferStatus(name, description) {
  const text = `${name} ${description}`.toLowerCase();

  // Check for status keywords
  if (/(popular|bestseller|signature|favorite|best)/i.test(text)) {
    return 'popular';
  }
  if (/\b(new|newly added)\b/i.test(text)) {
    return 'new';
  }
  if (/(seasonal|limited|special)/i.test(text)) {
    return 'seasonal';
  }
  if (/(sold out|out of stock|unavailable)/i.test(text)) {
    return 'out-of-stock';
  }

  return 'available';
}

/**
 * Infer subcategory for sushi items
 * The ITEM name in Square often IS the subcategory
 */
function inferSubcategory(category, itemName, description) {
  if (category !== 'sushi') {
    return null;
  }

  // Check if the item name itself looks like a subcategory
  const itemLower = itemName.toLowerCase();

  // Direct subcategory matches
  if (itemLower.includes('makizushi') || (itemLower.includes('sushi') && itemLower.includes('roll'))) {
    return 'Makizushi (Sushi Rolls)';
  }
  if (itemLower.includes('inarizushi') || itemLower.includes('inari')) {
    return 'Inarizushi';
  }
  if (itemLower.includes('sashimi')) {
    return 'Sashimi';
  }
  if (itemLower.includes('onigiri')) {
    return 'Onigiri';
  }
  if (itemLower.includes('nigiri')) {
    return 'Nigiri';
  }
  if (itemLower.includes('hosomaki')) {
    return 'Hosomaki';
  }

  // If the item name contains specific keywords, infer from those
  const text = `${itemName} ${description}`.toLowerCase();
  if (/(maki|roll)/i.test(text) && !/(hoso|tera)/i.test(text)) {
    return 'Makizushi (Sushi Rolls)';
  }

  return null;
}
