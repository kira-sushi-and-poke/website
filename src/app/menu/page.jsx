import React from 'react';
import MenuList from '@/components/MenuList';
import menuData from '@/data/menu.json';

const MenuPage = () => {
    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4 text-hot-pink">Menu</h1>
            
            {/* Sample Menu Notice */}
            <div className="bg-yellow/20 border-l-4 border-hot-pink p-4 mb-6 rounded">
                <p className="text-sm font-semibold text-hot-pink">
                    📋 Note: These are sample menu items for demonstration purposes only. The actual menu is coming soon!
                </p>
            </div>
            
            <MenuList menuItems={menuData} />
        </div>
    );
};

export default MenuPage;
