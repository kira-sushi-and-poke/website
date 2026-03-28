"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ScrollCTABanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Calculate halfway point
            const halfwayPoint = (documentHeight - windowHeight) / 2;
            
            // Show banner when scrolled past halfway
            setShowBanner(scrollPosition >= halfwayPoint);
        };

        window.addEventListener("scroll", handleScroll);
        
        // Check initial position
        handleScroll();
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClose = () => {
        setIsDismissed(true);
    };

    if (!showBanner || isDismissed) return null;

    return (
        <div className="fixed top-1/2 -translate-y-1/2 left-0 right-0 z-40 transition-all duration-500 ease-in-out">
            <div className="max-w-7xl w-xs md:w-sm mx-auto px-5 md:px-10">
                <div className="relative p-4 md:py-8 bg-gradient-to-r from-hot-pink to-yellow rounded-lg shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute -top-2 -right-2 bg-hot-pink text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-xl font-bold shadow-lg"
                        aria-label="Close banner"
                    >
                        ×
                    </button>
                    
                    <div className="flex flex-col items-center justify-between gap-3">
                        <div className="text-white text-center">
                            <p className="font-bold text-lg md:text-xl mb-1">Like what you're seeing?</p>
                            <p className="text-sm md:text-base text-white/90">Order online for pickup!</p>
                        </div>
                        <Link 
                            href="/menu/order"
                            className="bg-white text-hot-pink px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Order Here</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
