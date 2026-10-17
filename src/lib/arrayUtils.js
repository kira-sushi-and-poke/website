/**
 * Array utility functions
 */

/**
 * Check if two arrays contain the same modifiers (order-independent)
 * Used for comparing modifier selections in cart operations.
 * A modifier picked more than once appears that many times, so duplicates are counted.
 *
 * @param {Array} a - First array of modifier IDs
 * @param {Array} b - Second array of modifier IDs
 * @returns {boolean} True if arrays contain the same elements with the same counts
 */
export function matchModifiers(a = [], b = []) {
  if (a.length !== b.length) return false;
  const sortedB = [...b].sort();
  return [...a].sort().every((id, i) => id === sortedB[i]);
}

/**
 * Count how many times each modifier ID appears
 * @param {Array<string>} ids - Modifier IDs, repeated for quantity
 * @returns {Object<string, number>} e.g. { kira: 2, pixie: 1 }
 */
export function countModifiers(ids = []) {
  return ids.reduce((counts, id) => {
    counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Expand Square line item modifiers ({catalog_object_id, quantity}) into repeated IDs
 * @param {Array<{catalog_object_id: string, quantity?: string}>} modifiers
 * @returns {Array<string>}
 */
export function expandModifierIds(modifiers = []) {
  return modifiers.flatMap(m =>
    Array(Math.max(1, parseInt(m.quantity || "1", 10))).fill(m.catalog_object_id)
  );
}
