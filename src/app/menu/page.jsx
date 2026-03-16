import React from "react";
import MenuList from "@/components/MenuList";
import menuData from "@/data/menu.json";

const MenuPage = () => {
    return (
        <div className="py-8 md:py-12 px-5 md:px-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-hot-pink">Menu</h1>
            
            {/* Sample Menu Notice */}
            <div className="bg-yellow/20 border-l-4 border-hot-pink p-4 mb-6 md:mb-8 rounded">
                <p className="text-sm font-semibold text-hot-pink">
                    <i className="fas fa-clipboard-list"></i> Note: These are sample menu items for demonstration purposes only. The actual menu is coming soon!
                </p>
            </div>
            
            <MenuList menuItems={menuData} />
        </div>
    );
};

export default MenuPage;
