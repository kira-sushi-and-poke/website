import React, { Suspense } from "react";
import MenuList from "@/components/MenuList";
import CategoryNavigation from "../CategoryNavigation";
import MenuSkeleton from "../MenuSkeleton";
import ErrorDisplay from "../ErrorDisplay";
import AllergenNotice from "../AllergenNotice";
import { getMenuData } from "@/lib/getMenuData";
import { getLocationData } from "@/lib/getLocationData";
import { checkRestaurantStatus } from "@/lib/checkRestaurantStatus";
import { generateMenuSchema } from "../menuSchema";
import ScrollCTABanner from "./ScrollCTABanner";

// Generate metadata for SEO
export const metadata = {
    title: "Menu | Kira Sushi & Poke",
    description: "Explore our menu of fresh sushi rolls, poke bowls, and Japanese dishes. Made daily with premium ingredients for dine-in or takeaway.",
};

export default async function MenuViewPage() {
    const { success, error, data: menuData } = await getMenuData();
    const { openingHours, isFallback, mobileLocationData } = await getLocationData();
    const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);

    const menuSchema = success && menuData.length > 0 ? generateMenuSchema(menuData) : null;

    return (
        <>
            {menuSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(menuSchema)
                    }}
                />
            )}
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-7xl mx-auto overflow-visible">
                <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 text-hot-pink">Menu | Kira Sushi & Poke</h1>
                <p className="text-sm md:text-base text-gray-600 mb-3">Real photos, no filters - what you see is what you get!</p>

                {!success && error && (
                    <ErrorDisplay error={error} />
                )}

                {success && menuData.length > 0 && (
                    <>
                        <AllergenNotice />
                        <CategoryNavigation />
                        <Suspense fallback={<MenuSkeleton />}>
                            <MenuList menuItems={menuData} />
                        </Suspense>
                    </>
                )}
            </div>
            
            {/* Scroll-triggered CTA Banner - Only show when restaurant is open */}
            {restaurantStatus.isOpen && <ScrollCTABanner />}
        </>
    );
}
