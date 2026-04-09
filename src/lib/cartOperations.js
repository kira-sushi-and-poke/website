/**
 * Cart operations utilities
 * Works with dual-format cart structure: { variationId: number | Array<{quantity, modifiers}> }
 * All functions are pure and return new values (immutable)
 */

import { matchModifiers } from "./arrayUtils";

/**
 * Add one item to a cart entry
 * 
 * @param {number|Array<{quantity: number, modifiers: Array<string>}>|undefined} currentValue - Current cart value for this variation
 * @param {Array<string>} [modifiers] - Optional modifiers array
 * @returns {number|Array<{quantity: number, modifiers: Array<string>}>} Updated cart value
 * 
 * @example
 * // Without modifiers
 * addToCartEntry(undefined, undefined) // => 1
 * addToCartEntry(5, undefined) // => 6
 * 
 * // With modifiers
 * addToCartEntry(undefined, ["mod1"]) // => [{quantity: 1, modifiers: ["mod1"]}]
 * addToCartEntry([{quantity: 2, modifiers: ["mod1"]}], ["mod1"]) // => [{quantity: 3, modifiers: ["mod1"]}]
 */
export function addToCartEntry(currentValue, modifiers = undefined) {
  // If no modifiers, simple increment (existing behavior)
  if (!modifiers || modifiers.length === 0) {
    if (typeof currentValue === "number" || !currentValue) {
      return (currentValue || 0) + 1;
    } else {
      // Cart has array (modifiers), but adding without modifiers
      // Add to array with empty modifiers
      const newArray = Array.isArray(currentValue) ? [...currentValue] : [];
      const existingIndex = newArray.findIndex(entry => entry.modifiers.length === 0);
      
      if (existingIndex >= 0) {
        newArray[existingIndex] = {
          ...newArray[existingIndex],
          quantity: newArray[existingIndex].quantity + 1
        };
      } else {
        newArray.push({ quantity: 1, modifiers: [] });
      }
      
      return newArray;
    }
  } else {
    // Has modifiers - use array structure
    let newArray;
    
    if (!currentValue || typeof currentValue === "number") {
      newArray = [];
    } else {
      newArray = [...currentValue];
    }
    
    // Find matching modifiers entry
    const existingIndex = newArray.findIndex(entry => 
      matchModifiers(entry.modifiers, modifiers)
    );
    
    if (existingIndex >= 0) {
      // Increment existing entry
      newArray[existingIndex] = {
        ...newArray[existingIndex],
        quantity: newArray[existingIndex].quantity + 1
      };
    } else {
      // Create new entry
      newArray.push({ quantity: 1, modifiers });
    }
    
    return newArray;
  }
}

/**
 * Remove one item from a cart entry
 * 
 * @param {number|Array<{quantity: number, modifiers: Array<string>}>} currentValue - Current cart value for this variation
 * @param {Array<string>} [modifiers] - Optional modifiers array
 * @returns {number|Array<{quantity: number, modifiers: Array<string>}>|null} Updated cart value, or null if should be removed
 * 
 * @example
 * removeFromCartEntry(5, undefined) // => 4
 * removeFromCartEntry(1, undefined) // => null (remove from cart)
 * removeFromCartEntry([{quantity: 2, modifiers: ["mod1"]}], ["mod1"]) // => [{quantity: 1, modifiers: ["mod1"]}]
 */
export function removeFromCartEntry(currentValue, modifiers = undefined) {
  // Handle simple number case (no modifiers)
  if (typeof currentValue === "number") {
    const newValue = Math.max(0, currentValue - 1);
    return newValue === 0 ? null : newValue;
  } else if (Array.isArray(currentValue)) {
    // Handle array case (with modifiers)
    const newArray = [...currentValue];
    
    if (!modifiers || modifiers.length === 0) {
      // Remove from entry without modifiers
      const existingIndex = newArray.findIndex(entry => entry.modifiers.length === 0);
      
      if (existingIndex >= 0) {
        newArray[existingIndex] = {
          ...newArray[existingIndex],
          quantity: newArray[existingIndex].quantity - 1
        };
        
        if (newArray[existingIndex].quantity <= 0) {
          newArray.splice(existingIndex, 1);
        }
      }
    } else {
      // Remove from entry with matching modifiers
      const existingIndex = newArray.findIndex(entry => 
        matchModifiers(entry.modifiers, modifiers)
      );
      
      if (existingIndex >= 0) {
        newArray[existingIndex] = {
          ...newArray[existingIndex],
          quantity: newArray[existingIndex].quantity - 1
        };
        
        if (newArray[existingIndex].quantity <= 0) {
          newArray.splice(existingIndex, 1);
        }
      }
    }
    
    // Return null if array is empty (remove from cart)
    return newArray.length === 0 ? null : newArray;
  }
  
  return null;
}

/**
 * Remove entire cart entry (all quantities)
 * 
 * @param {number|Array<{quantity: number, modifiers: Array<string>}>} currentValue - Current cart value for this variation
 * @param {Array<string>} [modifiers] - Optional modifiers array
 * @returns {Array<{quantity: number, modifiers: Array<string>}>|null} Updated cart value, or null if should be removed completely
 * 
 * @example
 * removeEntireCartEntry(5, undefined) // => null (remove completely)
 * removeEntireCartEntry([{quantity: 2, modifiers: ["mod1"]}, {quantity: 3, modifiers: ["mod2"]}], ["mod1"]) 
 * // => [{quantity: 3, modifiers: ["mod2"]}]
 */
export function removeEntireCartEntry(currentValue, modifiers = undefined) {
  // If value is number, delete completely
  if (typeof currentValue === "number") {
    return null;
  }
  // If value is array and modifiers specified, remove only matching entry
  else if (Array.isArray(currentValue) && modifiers) {
    const newArray = [...currentValue];
    const existingIndex = newArray.findIndex(entry => 
      matchModifiers(entry.modifiers, modifiers)
    );
    
    if (existingIndex >= 0) {
      newArray.splice(existingIndex, 1);
    }
    
    // Return null if array is empty
    return newArray.length === 0 ? null : newArray;
  }
  // If no modifiers specified, delete completely
  else {
    return null;
  }
}

/**
 * Get total item count across all cart entries
 * 
 * @param {Object} cart - Cart object with variationId keys
 * @returns {number} Total quantity of all items in cart
 * 
 * @example
 * getCartItemCount({ "var1": 3, "var2": [{quantity: 2, modifiers: []}] }) // => 5
 */
export function getCartItemCount(cart) {
  return Object.values(cart).reduce((sum, value) => {
    if (typeof value === "number") {
      return sum + value;
    } else if (Array.isArray(value)) {
      return sum + value.reduce((arrSum, entry) => arrSum + entry.quantity, 0);
    }
    return sum;
  }, 0);
}

/**
 * Convert cart to display array format for rendering in components
 * 
 * @param {Object} cart - Cart object with variationId keys
 * @param {Array} menuData - Menu data array with item details
 * @returns {Array<{variationId: string, quantity: number, modifiers: Array<string>|undefined, name: string, price: number, image: string, cartIndex?: number}>} Array of cart items ready for display
 * 
 * @example
 * const cart = { "var1": 3, "var2": [{quantity: 2, modifiers: ["mod1"]}] };
 * const items = getCartItems(cart, menuData);
 * // Returns array with detailed item info including names, prices, images
 */
export function getCartItems(cart, menuData) {
  const items = [];
  
  Object.entries(cart).forEach(([variationId, value]) => {
    const menuItem = menuData.find(item => item.variationId === variationId);
    
    // Get image, handling arrays and empty values
    let image = "/images/placeholder.svg";
    if (menuItem?.imageLink) {
      if (Array.isArray(menuItem.imageLink) && menuItem.imageLink.length > 0) {
        image = menuItem.imageLink[0];
      } else if (typeof menuItem.imageLink === "string" && menuItem.imageLink) {
        image = menuItem.imageLink;
      }
    }
    
    const baseName = menuItem?.displayName || menuItem?.name || "Unknown Item";
    const basePrice = menuItem?.discountedPrice || menuItem?.originalPrice || 0;
    
    // Handle simple number case (no modifiers)
    if (typeof value === "number") {
      items.push({
        variationId,
        quantity: value,
        modifiers: undefined,
        name: baseName,
        price: basePrice,
        image,
      });
    }
    // Handle array case (with modifiers)
    else if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        // Get modifier names
        const modifierNames = entry.modifiers?.map(modId => {
          const modifier = menuItem?.modifiers?.find(m => m.id === modId);
          return modifier?.name || modId;
        }).join(", ") || "";
        
        const displayName = modifierNames ? `${baseName} (${modifierNames})` : baseName;
        
        items.push({
          variationId,
          quantity: entry.quantity,
          modifiers: entry.modifiers,
          name: displayName,
          price: basePrice,
          image,
          cartIndex: index, // Track position in array for removal
        });
      });
    }
  });
  
  return items;
}
