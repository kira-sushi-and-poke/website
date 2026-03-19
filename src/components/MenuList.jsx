import React from "react";
import MenuItem from "./MenuItem";

const MenuList = ({ menuItems }) => {
  // Define status priority for sorting
  const statusPriority = {
    "popular": 1,
    "new": 2,
    "seasonal": 3,
    "available": 4,
    "out-of-stock": 5
  };

  // Sort function to order by status
  const sortByStatus = (items) => {
    return [...items].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      return priorityA - priorityB;
    });
  };

  // Group items by category
  const categories = {
    sharer: menuItems.filter(item => item.category === "sharer"),
    sushi: menuItems.filter(item => item.category === "sushi"),
    poke: menuItems.filter(item => item.category === "poke"),
    hot: menuItems.filter(item => item.category === "hot"),
    solo: menuItems.filter(item => item.category === "solo"),
    desserts: menuItems.filter(item => item.category === "desserts"),
    drinks: menuItems.filter(item => item.category === "drinks")
  };

  const categoryTitles = {
    sushi: "Sushi",
    poke: "Poke Bowls",
    hot: "Hot Dishes",
    solo: "Sides & Appetizers",
    desserts: "Desserts",
    sharer: "Moriawase (Chef's Selection)",
    drinks: "Drinks & Beverages"
  };

  // Group items by subcategory within a category
  const groupBySubcategory = (items) => {
    const subcategories = {};
    items.forEach(item => {
      const subcategory = item.subcategory || null;
      if (!subcategories[subcategory]) {
        subcategories[subcategory] = [];
      }
      subcategories[subcategory].push(item);
    });
    
    // Sort items within each subcategory by status
    Object.keys(subcategories).forEach(key => {
      subcategories[key] = sortByStatus(subcategories[key]);
    });
    
    return subcategories;
  };

  return (
    <div className="menu-list space-y-10 md:space-y-12">
      {Object.entries(categories).map(([category, items]) => {
        if (items.length === 0) return null;
        
        const subcategories = groupBySubcategory(items);
        
        return (
          <div key={category} id={category} className="category-section scroll-mt-32">
            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 md:mb-8 border-b-2 border-yellow pb-2">
              {categoryTitles[category]}
            </h2>
            
            {Object.entries(subcategories).map(([subcategory, subcategoryItems]) => (
              <div key={subcategory} className="subcategory-section mb-8">
                {subcategory !== 'null' && subcategory && (
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="bg-hot-pink/10 text-hot-pink px-3 py-1 rounded-full text-base md:text-lg">
                      {subcategory}
                    </span>
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {subcategoryItems.map((item, index) => (
                    <MenuItem
                      key={item.variationId || `${item.id}-${item.name}-${index}`}
                      id={item.id}
                      name={item.name}
                      originalPrice={item.originalPrice}
                      discountedPrice={item.discountedPrice}
                      image={item.imageLink}
                      description={item.description}
                      status={item.status}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;
