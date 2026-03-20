/**
 * Generate Menu Schema for SEO
 */
export function generateMenuSchema(menuData) {
    return {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Kira Sushi and Poke Menu",
        "description": "Fresh Japanese sushi and poke bowls",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Moriawase (Chef's Selection)",
                "hasMenuItem": menuData.filter(item => item.category === "platters").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Sushi",
                "hasMenuItem": menuData.filter(item => item.category === "sushi").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Poke Bowls",
                "hasMenuItem": menuData.filter(item => item.category === "poke").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Main Dishes (Hot)",
                "hasMenuItem": menuData.filter(item => item.category === "hot").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Sides & Appetizers",
                "hasMenuItem": menuData.filter(item => item.category === "solo").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Desserts",
                "hasMenuItem": menuData.filter(item => item.category === "desserts").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            },
            {
                "@type": "MenuSection",
                "name": "Drinks & Beverages",
                "hasMenuItem": menuData.filter(item => item.category === "drinks").map(item => ({
                    "@type": "MenuItem",
                    "name": item.name,
                    "description": item.description,
                    "offers": {
                        "@type": "Offer",
                        "price": item.discountedPrice || item.originalPrice,
                        "priceCurrency": "GBP"
                    }
                }))
            }
        ]
    };
}
