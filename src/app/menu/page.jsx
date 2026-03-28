import React from "react";
import Link from "next/link";

// Generate metadata for SEO
export const metadata = {
    title: "Menu | Kira Sushi & Poke",
    description: "Explore our menu of fresh sushi rolls, poke bowls, and Japanese dishes. Made daily with premium ingredients for dine-in or takeaway.",
};

export default function MenuPage() {
    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto overflow-visible">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink">Menu | Kira Sushi & Poke</h1>

            {/* Menu Choice Section */}
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gray-50 rounded-lg border-2 border-hot-pink/20">
                <p className="text-gray-700 text-sm md:text-base mb-4">
                    What brings you here today?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <Link 
                        href="/menu/view" 
                        className="block p-4 bg-white border-2 border-hot-pink rounded-lg hover:bg-hot-pink/5 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fas fa-book-open text-hot-pink text-xl"></i>
                            <h3 className="font-bold text-hot-pink text-lg">Just Browsing?</h3>
                        </div>
                        <p className="text-gray-600 text-sm">View our menu here</p>
                    </Link>
                    <Link 
                        href="/menu/order" 
                        className="block p-4 bg-hot-pink text-white border-2 border-hot-pink rounded-lg hover:bg-hot-pink/90 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fas fa-shopping-cart text-white text-xl"></i>
                            <h3 className="font-bold text-lg">Ready to Order?</h3>
                        </div>
                        <p className="text-white/90 text-sm">Start your order for pickup</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
