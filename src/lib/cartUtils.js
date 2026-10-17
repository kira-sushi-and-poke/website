/**
 * Cart utility functions for order rehydration and data transformation
 */

import { countModifiers, expandModifierIds } from "./arrayUtils";

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
    const modifiers = expandModifierIds(item.modifiers);
    
    const existing = cart[variationId];

    // If no modifiers, store as simple number (backward compatible)
    if (modifiers.length === 0 && !Array.isArray(existing)) {
      cart[variationId] = (existing || 0) + quantity;
    } else {
      // Otherwise store as array, keeping any no-modifier quantity as its own entry
      if (!existing) {
        cart[variationId] = [];
      } else if (typeof existing === "number") {
        cart[variationId] = [{ quantity: existing, modifiers: [] }];
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

  // Modifiers picked more than once are shown as "2× Kira"
  return Object.entries(countModifiers(modifiers)).map(([modId, count]) => {
    const modifier = menuItem?.modifiers?.find(m => m.id === modId);
    const name = modifier?.name || modId;
    return count > 1 ? `${count}× ${name}` : name;
  }).join(", ");
}

/**
 * Sum the price of the selected modifiers (in pounds)
 *
 * @param {Array<string>} modifiers - Array of modifier IDs, repeated for quantity
 * @param {Object} menuItem - Menu item object with modifiers array
 * @returns {number} Total modifier price; can be negative for discounts (e.g. Tap Water)
 */
export function getModifiersPrice(modifiers, menuItem) {
  if (!modifiers || modifiers.length === 0) return 0;

  return modifiers.reduce((sum, modId) => {
    const modifier = menuItem?.modifiers?.find(m => m.id === modId);
    return sum + (modifier?.price || 0);
  }, 0);
}
