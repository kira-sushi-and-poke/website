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

    // Scroll active category into view when it changes
    useEffect(() => {
        if (navRef.current && activeCategory) {
            const activeButton = navRef.current.querySelector(`[data-category="${activeCategory}"]`);
            if (activeButton) {
                activeButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeCategory]);

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
        <div className="sticky top-4 z-40 bg-white border-2 border-hot-pink rounded-lg mb-4 md:mb-8 shadow-lg mx-3 md:mx-0">
            {/* Left Arrow - Mobile Only */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-hot-pink text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-xl hover:bg-yellow transition-colors flex items-center justify-center -ml-4 md:-ml-5"
                    aria-label="Scroll left"
                >
                    <i className="fas fa-chevron-left text-sm"></i>
                </button>
            )}

            {/* Right Arrow - Mobile Only */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-hot-pink text-white w-8 h-8 md:w-10 md:h-10 rounded-full shadow-xl hover:bg-yellow transition-colors flex items-center justify-center -mr-4 md:-mr-5"
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
                        data-category={item.id}
                        className={`shrink-0 flex flex-col items-center px-2 py-2 md:px-2 md:py-2 text-center transition-colors duration-200 border-r border-hot-pink/20 last:border-r-0 min-w-[80px] md:min-w-0 flex-1 group ${
                            activeCategory === item.id
                                ? 'bg-hot-pink text-white'
                                : 'hover:bg-hot-pink hover:text-white'
                        }`}
                    >
                        <i className={`fas ${item.icon} text-sm md:text-sm mb-1 md:mb-1.5 transition-colors ${
                            activeCategory === item.id
                                ? 'text-white'
                                : 'text-hot-pink group-hover:text-white'
                        }`}></i>
                        <span className={`text-[10px] md:text-xs font-semibold leading-tight max-w-[75px] md:max-w-[85px] min-h-[1.75rem] md:min-h-[1.75rem] flex items-center justify-center ${
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
