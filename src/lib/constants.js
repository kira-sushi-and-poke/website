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
export const FULFILLMENT_STATE_PROPOSED = "PROPOSED";
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
export const UK_TZ = 'Europe/London'; // Restaurant timezone for consistent time display
export const TIME_LOCALE = "en-GB";
export const TIME_FORMAT_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
};

/**
 * Default Opening Hours (Fallback)
 * Used when Square Locations API is unavailable
 */
export const DEFAULT_OPENING_HOURS = {
  Monday: { open: "11:00", close: "19:00" },
  Tuesday: { open: "11:00", close: "19:00" },
  Wednesday: { open: "11:00", close: "19:00" },
  Thursday: { open: "11:00", close: "19:00" },
  Friday: { open: "11:00", close: "19:00" },
  Saturday: { open: "11:00", close: "19:00" },
  Sunday: { open: "11:00", close: "19:00" }
};

/**
 * Default Opening Hours in Schema.org format
 * Used for structured data / SEO
 */
export const DEFAULT_OPENING_HOURS_SCHEMA = [
  "Mo 11:00-19:00",
  "Tu 11:00-19:00",
  "We 11:00-19:00",
  "Th 11:00-19:00",
  "Fr 11:00-19:00",
  "Sa 11:00-19:00",
  "Su 11:00-19:00"
];

/**
 * Default Opening Hours Text (Fallback)
 * Pre-formatted text for display components
 */
export const DEFAULT_OPENING_HOURS_TEXT = {
  short: "Mon-Sun 11:00 AM - 7:00 PM",
  days: "Monday - Sunday",
  times: "11:00 AM - 7:00 PM",
  sentence: "Monday through Sunday from 11:00 AM to 7:00 PM"
};

/**
 * Opening Hours Helper Constants
 */
export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const CLOSING_SOON_THRESHOLD = 30; // minutes before closing to show "closing soon"
export const PICKUP_LEAD_TIME_MINUTES = 30; // minimum lead time for pickup orders

/**
 * Location IDs
 * Note: LOCATION_ID and MOBILE_LOCATION_ID are accessed via process.env
 * MOBILE_LOCATION_ID is optional - if not set, only Physical location hours are used
 * Physical location: Regular weekly schedule (always displayed)
 * Mobile location: Override signal (only active when status is ACTIVE)
 */

/**
 * Menu Category Configuration
 * Maps Square category names to app category IDs
 */
export const CATEGORY_CONFIG = {
  // Category mappings: Square category name → app category ID
  mapping: {
    // Platters/Chef's Selection
    "platters": "platters",
    "moriawase": "platters",
    "chef selection": "platters",
    "chef's selection": "platters",
    "sharing": "platters",
    "sushi platters": "platters",
    
    // Sushi
    "sushi": "sushi",
    "sushi menu": "sushi",
    "makizushi": "sushi",
    "nigiri": "sushi",
    "sashimi": "sushi",
    "rolls": "sushi",
    
    // Poke
    "poke": "poke",
    "poke bowls": "poke",
    "poke bowl": "poke",
    "bowls": "poke",
    
    // Hot dishes
    "hot dishes": "hot",
    "hot": "hot",
    "mains": "hot",
    "main dishes": "hot",
    "main dishes (hot)": "hot",
    "curry": "hot",
    "teriyaki": "hot",
    
    // Kids Menu
    "kids menu": "kids",
    "kids": "kids",
    "school special": "kids",
    "children": "kids",
    
    // Sides
    "sides": "solo",
    "appetizers": "solo",
    "starters": "solo",
    "small plates": "solo",
    
    // Desserts
    "desserts": "desserts",
    "dessert": "desserts",
    "sweets": "desserts",
    
    // Drinks
    "drinks": "drinks",
    "beverages": "drinks",
    "beverage": "drinks",
    "drink": "drinks",
  }
};
