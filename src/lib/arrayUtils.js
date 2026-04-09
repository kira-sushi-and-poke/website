/**
 * Array utility functions
 */

/**
 * Check if two arrays contain the same modifiers (order-independent)
 * Used for comparing modifier selections in cart operations
 * 
 * @param {Array} a - First array of modifier IDs
 * @param {Array} b - Second array of modifier IDs
 * @returns {boolean} True if arrays contain the same elements
 */
export function matchModifiers(a, b) {
  return a.length === b.length && a.every(id => b.includes(id));
}
