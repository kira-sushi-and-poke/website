import { DEFAULT_OPENING_HOURS_SCHEMA, CONTACT_INFO } from "../lib/constants";

// Restaurant Business Information
export const restaurantInfo = {
  name: "Kira Sushi and Poke",
  description: "Authentic Japanese sushi and poke bowls made fresh daily with premium ingredients",
  cuisine: ["Japanese", "Sushi", "Poke"],
  priceRange: "££",
  
  address: {
    streetAddress: "148 Front Street",
    addressLocality: "Chester-le-Street",
    addressRegion: "County Durham",
    postalCode: "DH3 3AY",
    addressCountry: "GB"
  },
  
  // Fallback hours - dynamic hours fetched from Square in layout.jsx
  openingHours: DEFAULT_OPENING_HOURS_SCHEMA,
  
  socialMedia: {
    facebook: CONTACT_INFO.social.facebook,
    instagram: CONTACT_INFO.social.instagram
  },
  
  // SEO
  keywords: [
    "sushi restaurant",
    "poke bowl",
    "japanese food",
    "fresh sushi",
    "sushi",
    "sushi chester-le-street",
    "sushi durham",
    "poke chester-le-street",
    "japanese restaurant",
    "sushi county durham",
    "makizushi",
    "nigiri",
    "sashimi",
    "hosomaki",
    "inarizushi",
    "moriawase",
    "japanese curry",
    "teriyaki",
    "hot japanese dishes"
  ],
  
  // URL
  url: "https://kirasushi.co.uk",
  logo: "/kira-sushi-and-poke-logo.png",
  image: "/images/restaurant-exterior.jpg" // Add this image
};

export default restaurantInfo;
