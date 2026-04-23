/**
 * localStorage utility with error handling and availability detection
 */

/**
 * Wrapper for localStorage operations with error handling
 * @param {Function} fn - The localStorage operation to execute
 * @param {*} defaultReturn - Default value to return on error
 * @returns {*} Result of the operation or defaultReturn on error
 */
function withLocalStorageError(fn, defaultReturn = false) {
  try {
    return fn();
  } catch (error) {
    return defaultReturn;
  }
}

/**
 * Check if localStorage is available and can be used
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
  return withLocalStorageError(() => {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  }, false);
}

/**
 * Get order data from localStorage
 * @returns {Object|null} Order object { orderId, version } or null if not found
 */
export function getOrderFromStorage() {
  return withLocalStorageError(() => {
    const storedOrder = localStorage.getItem("order");
    if (!storedOrder) return null;
    return JSON.parse(storedOrder);
  }, null);
}

/**
 * Save order data to localStorage
 * @param {string} orderId - The Square order ID
 * @param {number} version - The order version
 * @returns {boolean} True if save was successful
 */
export function saveOrderToStorage(orderId, version) {
  return withLocalStorageError(() => {
    localStorage.setItem("order", JSON.stringify({ orderId, version }));
    return true;
  }, false);
}

/**
 * Remove order data from localStorage
 * @returns {boolean} True if removal was successful
 */
export function clearOrderFromStorage() {
  return withLocalStorageError(() => {
    localStorage.removeItem("order");
    return true;
  }, false);
}
