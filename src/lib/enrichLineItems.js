/**
 * Enrich Square order line items with displayName from menu data
 * @param {Array} lineItems - Line items from Square order
 * @param {Array} menuData - Menu data with displayName
 * @returns {Array} Line items with displayName added
 */
export function enrichLineItems(lineItems, menuData) {
  if (!lineItems || !Array.isArray(lineItems)) {
    return [];
  }
  
  if (!menuData || !Array.isArray(menuData)) {
    return lineItems;
  }
  
  return lineItems.map(item => {
    const menuItem = menuData.find(m => m.variationId === item.catalog_object_id);
    return {
      ...item,
      displayName: menuItem?.displayName || item.name
    };
  });
}
