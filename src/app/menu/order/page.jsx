import React from "react";
import ErrorDisplay from "../ErrorDisplay";
import { getMenuData } from "@/lib/getMenuData";
import { getLocationData } from "@/lib/getLocationData";
import { checkRestaurantStatus } from "@/lib/checkRestaurantStatus";
import OrderMenuClient from "./OrderMenuClient";

// Generate metadata for SEO
export const metadata = {
    title: "Order Online | Kira Sushi & Poke",
    description: "Order fresh sushi rolls, poke bowls, and Japanese dishes online for pickup.",
};

export default async function MenuOrderPage() {
    const { success, error, data: menuData } = await getMenuData();
    const { openingHours, isFallback, mobileLocationData } = await getLocationData();
    const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);

    return (
        <div className="py-6 md:py-12 px-3 md:px-10 max-w-7xl mx-auto overflow-visible">
            <h1 className="text-xl md:text-4xl font-bold mb-2 md:mb-3 text-hot-pink">Let's Start Your Order</h1>
            <p className="text-sm md:text-base text-gray-600 mb-3">Real photos, no filters - what you see is what you get! Select your favorites and we'll have them ready for pickup!</p>

            {!success && error && (
                <ErrorDisplay error={error} />
            )}

            {success && menuData.length > 0 && (
                <OrderMenuClient menuData={menuData} restaurantStatus={restaurantStatus} />
            )}
        </div>
    );
}
