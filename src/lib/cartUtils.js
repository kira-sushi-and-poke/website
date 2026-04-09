/**
 * Cart utility functions for order rehydration and data transformation
 */

/**
 * Rehydrate cart state from a Square order object
 * Converts order line items back to cart format
 * 
 * @param {Object} order - Square order object with line_items
 * @returns {Object} Cart object in format { variationId: number | Array<{quantity, modifiers}> }
 * 
 * @example
 * const order = { line_items: [...] };
 * const cart = rehydrateCartFromOrder(order);
 * // Returns: { "var1": 3, "var2": [{quantity: 2, modifiers: ["mod1"]}] }
 */
export function rehydrateCartFromOrder(order) {
  if (!order.line_items) return {};
  
  const cart = {};
  
  order.line_items.forEach(item => {
    if (!item.catalog_object_id) return;
    
    const variationId = item.catalog_object_id;
    const quantity = parseInt(item.quantity);
    const modifiers = item.modifiers?.map(m => m.catalog_object_id) || [];
    
    // If no modifiers, store as simple number (backward compatible)
    if (modifiers.length === 0) {
      cart[variationId] = (cart[variationId] || 0) + quantity;
    } else {
      // If has modifiers, store as array
      if (!cart[variationId]) {
        cart[variationId] = [];
      } else if (typeof cart[variationId] === "number") {
        // Convert existing number to array
        cart[variationId] = [];
      }
      
      cart[variationId].push({ quantity, modifiers });
    }
  });
  
  return cart;
}

/**
 * Find modifier names from modifier IDs
 * 
 * @param {Array<string>} modifiers - Array of modifier IDs
 * @param {Object} menuItem - Menu item object with modifiers array
 * @returns {string} Comma-separated modifier names
 * 
 * @example
 * const menuItem = { modifiers: [{ id: "mod1", name: "Extra Cheese" }] };
 * findModifierNames(["mod1"], menuItem); // => "Extra Cheese"
 */
export function findModifierNames(modifiers, menuItem) {
  if (!modifiers || modifiers.length === 0) return "";
  
  return modifiers.map(modId => {
    const modifier = menuItem?.modifiers?.find(m => m.id === modId);
    return modifier?.name || modId;
  }).join(", ");
}
