import React from "react";
import MenuList from "@/components/MenuList";
import menuData from "@/data/menu.json";
import restaurantInfo from "@/data/restaurant-info";

export const metadata = {
    title: "Menu | Japanese Sushi & Poke Bowls",
    description: "Explore our menu of fresh sushi rolls, poke bowls, and Japanese drinks. California rolls, dragon rolls, rainbow rolls, family platters, and more available for dine-in or takeaway.",
    openGraph: {
        title: "Menu | Kira Sushi and Poke",
        description: "Fresh sushi rolls, poke bowls, and Japanese cuisine made daily with premium ingredients",
    }
};

const MenuPage = () => {
    // Generate Menu Schema for SEO
    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Kira Sushi and Poke Menu",
        "description": "Fresh Japanese sushi and poke bowls",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Solo Dishes",
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
                "name": "Sharing Platters",
                "hasMenuItem": menuData.filter(item => item.category === "sharer").map(item => ({
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(menuSchema)
                }}
            />
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink">Menu</h1>
                
                {/* Sample Menu Notice */}
                <div className="bg-yellow/20 border-l-4 border-hot-pink p-4 mb-6 md:mb-8 rounded">
                    <p className="text-sm font-semibold text-hot-pink">
                        <i className="fas fa-clipboard-list"></i> Note: Allergens are likely to change with the special dishes. Please ask staff if you are unsure
                    </p>
                </div>
                
                <MenuList menuItems={menuData} />
            </div>
        </>
    );
};

export default MenuPage;
