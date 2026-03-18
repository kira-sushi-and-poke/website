"use client";
import React, { useRef, useState, useEffect } from "react";
import MenuList from "@/components/MenuList";
import menuData from "@/data/menu.json";
import restaurantInfo from "@/data/restaurant-info";

// Category navigation items
const categoryNavItems = [
    { id: "sharer", label: "Chef's Selection", icon: "fa-star" },
    { id: "sushi", label: "Sushi", icon: "fa-stroopwafel" },
    { id: "poke", label: "Poke Bowls", icon: "fa-bowl-rice" },
    { id: "hot", label: "Hot Dishes", icon: "fa-fire" },
    { id: "solo", label: "Sides", icon: "fa-utensils" },
    { id: "desserts", label: "Desserts", icon: "fa-ice-cream" },
    { id: "drinks", label: "Drinks", icon: "fa-wine-glass" }
];

const MenuPage = () => {
    const navRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [activeCategory, setActiveCategory] = useState("sharer");

    const checkScrollPosition = () => {
        if (navRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
            setShowLeftArrow(scrollLeft > 5);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
        }
    };

    useEffect(() => {
        // Small delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            checkScrollPosition();
        }, 100);
        
        const nav = navRef.current;
        if (nav) {
            nav.addEventListener('scroll', checkScrollPosition);
            window.addEventListener('resize', checkScrollPosition);
            return () => {
                clearTimeout(timer);
                nav.removeEventListener('scroll', checkScrollPosition);
                window.removeEventListener('resize', checkScrollPosition);
            };
        }
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const sections = categoryNavItems.map(item => ({
                id: item.id,
                element: document.getElementById(item.id)
            }));

            // Find which section is currently most visible
            let currentSection = "sharer";
            const scrollPosition = window.scrollY + 200; // Offset for sticky nav

            for (const section of sections) {
                if (section.element) {
                    const { offsetTop } = section.element;
                    if (scrollPosition >= offsetTop) {
                        currentSection = section.id;
                    }
                }
            }

            setActiveCategory(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scroll = (direction) => {
        if (navRef.current) {
            const scrollAmount = 200;
            navRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    // Generate Menu Schema for SEO
    const menuSchema = {
        "@context": "https://schema.org",
        "@type": "Menu",
        "name": "Kira Sushi and Poke Menu",
        "description": "Fresh Japanese sushi and poke bowls",
        "hasMenuSection": [
            {
                "@type": "MenuSection",
                "name": "Moriawase (Chef's Selection)",
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
                "name": "Hot Dishes",
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(menuSchema)
                }}
            />
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink">Menu | Kira Sushi & Poke</h1>
                
                {/* Sample Menu Notice */}
                <div className="bg-yellow/20 border-l-4 border-hot-pink p-4 mb-6 md:mb-8 rounded">
                    <p className="text-sm font-semibold text-hot-pink">
                        <i className="fas fa-clipboard-list"></i> Note: Allergens are likely to change with the special dishes. Please ask staff if you are unsure
                    </p>
                </div>
                
                {/* Sticky Category Navigation */}
                <div className="sticky top-4 z-40 bg-white border-2 border-hot-pink rounded-lg mb-8 shadow-lg relative mx-3 md:mx-0">
                    {/* Left Arrow - Mobile Only */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll('left')}
                            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-hot-pink text-white w-10 h-10 rounded-full shadow-xl hover:bg-yellow transition-colors flex items-center justify-center -ml-5"
                            aria-label="Scroll left"
                        >
                            <i className="fas fa-chevron-left text-sm"></i>
                        </button>
                    )}
                    
                    {/* Right Arrow - Mobile Only */}
                    {showRightArrow && (
                        <button
                            onClick={() => scroll('right')}
                            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-hot-pink text-white w-10 h-10 rounded-full shadow-xl hover:bg-yellow transition-colors flex items-center justify-center -mr-5"
                            aria-label="Scroll right"
                        >
                            <i className="fas fa-chevron-right text-sm"></i>
                        </button>
                    )}
                    
                    <nav ref={navRef} className="flex overflow-x-auto scrollbar-hide w-full">
                        {categoryNavItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-3 md:px-3 md:py-2 text-center transition-colors duration-200 border-r border-hot-pink/20 last:border-r-0 min-w-[100px] md:min-w-0 flex-1 group ${
                                    activeCategory === item.id 
                                        ? 'bg-hot-pink text-white' 
                                        : 'hover:bg-hot-pink hover:text-white'
                                }`}
                            >
                                <i className={`fas ${item.icon} text-lg md:text-base mb-1 transition-colors ${
                                    activeCategory === item.id 
                                        ? 'text-white' 
                                        : 'text-hot-pink group-hover:text-white'
                                }`}></i>
                                <span className={`text-xs md:text-xs font-semibold whitespace-nowrap ${
                                    activeCategory === item.id 
                                        ? 'text-white' 
                                        : 'text-gray-700 group-hover:text-white'
                                }`}>
                                    {item.label}
                                </span>
                            </a>
                        ))}
                    </nav>
                </div>
                
                <MenuList menuItems={menuData} />
            </div>
        </>
    );
};

export default MenuPage;
