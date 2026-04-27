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
  Tuesday: { open: "12:00", close: "19:00" },
  Wednesday: { open: "12:00", close: "19:00" },
  Thursday: { open: "12:00", close: "19:00" },
  Friday: { open: "12:00", close: "19:30" },
  Saturday: { open: "12:00", close: "19:30" },
  Sunday: { open: "12:00", close: "19:00" }
};

/**
 * Default Opening Hours in Schema.org format
 * Used for structured data / SEO
 */
export const DEFAULT_OPENING_HOURS_SCHEMA = [
  "Tu 12:00-19:00",
  "We 12:00-19:00",
  "Th 12:00-19:00",
  "Fr 12:00-19:30",
  "Sa 12:00-19:30",
  "Su 12:00-19:00"
];

/**
 * Default Opening Hours Text (Fallback)
 * Pre-formatted text for display components
 */
export const DEFAULT_OPENING_HOURS_TEXT = {
  short: "Tue-Sun 12:00 PM - 7:00 PM",
  days: "Tuesday - Sunday",
  times: "12:00 PM - 7:00 PM",
  sentence: "Tuesday through Sunday from 12:00 PM, closed Mondays"
};

/**
 * Opening Hours Helper Constants
 */
export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const CLOSING_SOON_THRESHOLD = 30; // minutes before closing to show "closing soon"
export const PICKUP_LEAD_TIME_MINUTES = 30; // minimum lead time for pickup orders
export const PICKUP_ASAP = "ASAP"; // Special value for ASAP pickup orders

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

/**
 * Toast Notification Configuration
 */
export const TOASTER_CONFIG = {
  position: "top-center",
  toastOptions: {
    duration: 3000,
    style: {
      marginTop: "100px",
      fontSize: "14px",
    },
    success: {
      duration: 3000,
      style: {
        background: "#D1FAE5",
        color: "#065F46",
        border: "1px solid #A7F3D0",
        fontSize: "14px",
      },
      iconTheme: {
        primary: "#10B981",
        secondary: "#fff",
      },
    },
    error: {
      duration: 10000,
      style: {
        background: "#FEE2E2",
        color: "#991B1B",
        border: "1px solid #FECACA",
        fontSize: "14px",
      },
      iconTheme: {
        primary: "#EF4444",
        secondary: "#fff",
      },
    },
  },
};

/**
 * Common Toast Messages
 */
export const TOAST_MESSAGES = {
  // Cart messages
  CART_UPDATE_FAILED: "Failed to update cart",
  CART_CONFLICT: "Cart was modified elsewhere. Please refresh the page to see the latest.",
  CART_ITEM_ADDED: "Item added to the cart",
  CART_ITEM_REMOVED: "Item removed from the cart",
  CART_CLEARED: "Cart cleared. Starting fresh order.",
  
  // Payment messages
  PAYMENT_FAILED: "Payment failed. Please try again.",
  PAYMENT_SUCCESS: "Payment successful! Redirecting...",
  PAYMENT_PROCESSING_FAILED: "Payment processing failed. Please try again.",
  PAYMENT_CONTACT_REQUIRED: "Please fill in all contact details below before paying.",
  PAYMENT_PICKUP_TIME_REQUIRED: "Please select a pickup time (ASAP or schedule for later)",
  PAYMENT_FIELDS_REQUIRED: "Please check all required fields",
  
  // Order messages
  ORDER_INIT_FAILED: "Failed to initialize order. Please refresh the page.",
  ORDER_CREATE_FAILED: "Failed to create new order",
  ORDER_CLEAR_FAILED: "Failed to clear cart",
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  fontWeights: {
    semibold: "600",
    bold: "700",
  },
  spacing: {
    cardPadding: "p-4 md:p-6",
    sectionSpacing: "space-y-4 md:space-y-6",
  },
};

/**
 * Contact Information
 * Centralized restaurant contact details
 */
export const CONTACT_INFO = {
  name: "Kira Sushi and Poke",
  phone: {
    display: "(123) 456-7890",
    link: "tel:+1234567890",
  },
  address: {
    street: "148 Front Street",
    city: "Chester-le-Street",
    postcode: "DH3 3AY",
    country: "United Kingdom",
    full: "148 Front Street, Chester-le-Street, DH3 3AY, United Kingdom",
  },
  social: {
    googleReviews: "https://www.google.com/maps/place/Kira+Sushi+%26+Poke/@54.8543708,-1.5734128,15z/data=!4m8!3m7!1s0x487e7d3063ec70ab:0x73eefb3105389bbe!8m2!3d54.8543708!4d-1.5734128!9m1!1b1!16s%2Fg%2F11y3g0dy8w",
    facebook: "https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/",
    tripadvisor: "https://www.tripadvisor.com/Restaurant_Review-g1156051-d34241645-Reviews-Kira_Sushi_and_Poke-Chester_le_Street_County_Durham_England.html",
    instagram: "https://www.instagram.com/kira_sushi_and_poke",
  },
  maps: {
    directions: "https://www.google.com/maps/dir/?api=1&destination=Kira+Sushi+%26+Poke,+148+Front+St,+Chester-le-Street+DH3+3AY",
    embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1148.3826793575272!2d-1.5734128000000687!3d54.854370800000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487e7d3063ec70ab%3A0x73eefb3105389bbe!2sKira%20Sushi%20%26%20Poke!5e0!3m2!1sen!2suk!4v1775843239401!5m2!1sen!2suk",
  },
};
