"use client";
import React from "react";

const Sidebar = () => {
    return (
        <aside className="bg-hot-pink text-white p-4 md:p-6 w-full md:min-w-[280px] md:max-w-[320px] md:sticky md:top-0 md:h-fit">
            <div className="space-y-4 md:space-y-6">
                {/* Address Section */}
                <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-yellow border-b-2 border-yellow pb-2">
                        Location
                    </h2>
                    <address className="not-italic text-sm md:text-base">
                        <p className="mb-2 font-semibold">Kira Sushi and Poke</p>
                        <p className="mb-1">123 Main Street</p>
                        <p className="mb-1">Suite 100</p>
                        <p className="mb-3">Your City, ST 12345</p>
                        <p className="mb-1">
                            <span className="font-semibold">Phone:</span>
                            <br />
                            <a href="tel:+1234567890" className="hover:text-yellow transition-colors underline">
                                (123) 456-7890
                            </a>
                        </p>
                    </address>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
