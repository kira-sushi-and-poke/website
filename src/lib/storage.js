/**
 * localStorage utility with error handling and availability detection
 */

/**
 * Check if localStorage is available and can be used
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get order data from localStorage
 * @returns {Object|null} Order object { orderId, version } or null if not found
 */
export function getOrderFromStorage() {
  try {
    const storedOrder = localStorage.getItem("order");
    if (!storedOrder) return null;
    return JSON.parse(storedOrder);
  } catch (error) {
    return null;
  }
}

/**
 * Save order data to localStorage
 * @param {string} orderId - The Square order ID
 * @param {number} version - The order version
 * @returns {boolean} True if save was successful
 */
export function saveOrderToStorage(orderId, version) {
  try {
    localStorage.setItem("order", JSON.stringify({ orderId, version }));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Remove order data from localStorage
 * @returns {boolean} True if removal was successful
 */
export function clearOrderFromStorage() {
  try {
    localStorage.removeItem("order");
    return true;
  } catch (error) {
    return false;
  }
}
