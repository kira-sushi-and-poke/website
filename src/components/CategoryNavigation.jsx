"use client";
import React, { useRef, useState, useEffect } from "react";

// Category navigation items
const categoryNavItems = [
    { id: "platters", label: "Chef's Selection", icon: "fa-star" },
    { id: "sushi", label: "Sushi", icon: "fa-stroopwafel" },
    { id: "poke", label: "Poke Bowls", icon: "fa-bowl-rice" },
    { id: "hot", label: "Main Dishes (Hot)", icon: "fa-fire" },
    { id: "kids", label: "Kids Menu", icon: "fa-child" },
    { id: "solo", label: "Sides", icon: "fa-utensils" },
    { id: "desserts", label: "Desserts", icon: "fa-ice-cream" },
    { id: "drinks", label: "Drinks", icon: "fa-wine-glass" }
];

const CategoryNavigation = () => {
    const navRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [activeCategory, setActiveCategory] = useState("platters");

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
            nav.addEventListener("scroll", checkScrollPosition);
            window.addEventListener("resize", checkScrollPosition);
            return () => {
                clearTimeout(timer);
                nav.removeEventListener("scroll", checkScrollPosition);
                window.removeEventListener("resize", checkScrollPosition);
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
            let currentSection = "platters";
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

    return (
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
                        className={`flex-shrink-0 flex flex-col items-center px-2 py-2.5 md:px-2 md:py-2 text-center transition-colors duration-200 border-r border-hot-pink/20 last:border-r-0 min-w-[90px] md:min-w-0 flex-1 group ${
                            activeCategory === item.id
                                ? 'bg-hot-pink text-white'
                                : 'hover:bg-hot-pink hover:text-white'
                        }`}
                    >
                        <i className={`fas ${item.icon} text-base md:text-sm mb-1.5 transition-colors ${
                            activeCategory === item.id
                                ? 'text-white'
                                : 'text-hot-pink group-hover:text-white'
                        }`}></i>
                        <span className={`text-xs font-semibold leading-tight max-w-[85px] min-h-[2rem] md:min-h-[1.75rem] flex items-center justify-center ${
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
    );
};

export default CategoryNavigation;
