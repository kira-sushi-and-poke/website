/**
 * Square API configuration constants
 * Update these values when Square releases new API versions or if configuration changes
 */

/**
 * Square API Version
 * @see https://developer.squareup.com/docs/api/versioning
 */
export const SQUARE_API_VERSION = "2026-01-22";

/**
 * Payment and Order Constants
 */
export const CURRENCY = "GBP";
export const FULFILLMENT_TYPE_PICKUP = "PICKUP";
export const PICKUP_WINDOW_DURATION = "PT15M";
export const PICKUP_NOTE = "Online order - pickup";

/**
 * Order States
 */
export const ORDER_STATE_DRAFT = "DRAFT";
export const ORDER_STATE_OPEN = "OPEN";

/**
 * Fulfillment States
 */
export const FULFILLMENT_STATE_RESERVED = "RESERVED";

/**
 * Payment Method Labels
 */
export const PAYMENT_METHOD_CUSTOM = "Custom Payment Form";
export const PAYMENT_METHOD_SQUARE_CHECKOUT = "Square Checkout";

/**
 * Payment Status
 */
export const PAYMENT_STATUS_COMPLETED = "COMPLETED";

/**
 * Time Configuration
 */
export const TIME_LOCALE = "en-GB";
export const TIME_FORMAT_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
};
