import React from "react";
import ErrorDisplay from "../ErrorDisplay";
import { getMenuData } from "@/lib/getMenuData";
import OrderMenuClient from "./OrderMenuClient";

// Generate metadata for SEO
export const metadata = {
    title: "Order Online | Kira Sushi & Poke",
    description: "Order fresh sushi rolls, poke bowls, and Japanese dishes online for pickup or delivery.",
};

export default async function MenuOrderPage() {
    const { success, error, data: menuData } = await getMenuData();

    return (
        <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto overflow-visible">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink">Order Menu</h1>

            {!success && error && (
                <ErrorDisplay error={error} />
            )}

            {success && menuData.length > 0 && (
                <OrderMenuClient menuData={menuData} />
            )}
        </div>
    );
}
