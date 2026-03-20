import React from "react";
import MenuItem from "./MenuItem";

const MenuList = ({ menuItems }) => {
  // Group items by category
  const categories = {
    platters: menuItems.filter(item => item.category === "platters"),
    sushi: menuItems.filter(item => item.category === "sushi"),
    poke: menuItems.filter(item => item.category === "poke"),
    hot: menuItems.filter(item => item.category === "hot"),
    kids: menuItems.filter(item => item.category === "kids"),
    solo: menuItems.filter(item => item.category === "solo"),
    desserts: menuItems.filter(item => item.category === "desserts"),
    drinks: menuItems.filter(item => item.category === "drinks")
  };

  const categoryTitles = {
    sushi: "Sushi",
    poke: "Poke Bowls",
    hot: "Main Dishes (Hot)",
    kids: "Kids Menu",
    solo: "Sides & Appetizers",
    desserts: "Desserts",
    platters: "Moriawase (Chef's Selection)",
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

    // Don't sort - preserve original order from API/data
    return subcategories;
  };

  // Define subcategory order for sushi
  const sushiSubcategoryOrder = [
    "Makizushi (Rolls)",
    "Inarizushi",
    "Nigiri",
    "Hosomaki",
    "Onigiri",
    "Sashimi"
  ];

  // Define subcategory order for hot dishes
  const hotSubcategoryOrder = [
    "Japanese Curry",
    "Teriyaki"
  ];

  // Sort subcategories for sushi and hot categories
  const sortSubcategories = (subcategoryEntries, category) => {
    let suborder = null;

    if (category === "sushi") {
      suborder = sushiSubcategoryOrder;
    } else if (category === "hot") {
      suborder = hotSubcategoryOrder;
    } else {
      return subcategoryEntries;
    }

    return subcategoryEntries.sort((a, b) => {
      const [subA] = a;
      const [subB] = b;

      // Handle null/undefined subcategories (items without subcategory go first)
      if (subA === "null" || subA === null || !subA) return -1;
      if (subB === "null" || subB === null || !subB) return 1;

      const indexA = suborder.indexOf(subA);
      const indexB = suborder.indexOf(subB);

      // If both are in the order list, sort by order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one is in the list, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither is in the list, maintain original order
      return 0;
    });
  };

  return (
    <div className="menu-list space-y-10 md:space-y-12">
      {Object.entries(categories).map(([category, items]) => {
        if (items.length === 0) return null;

        const subcategories = groupBySubcategory(items);
        const sortedSubcategories = sortSubcategories(Object.entries(subcategories), category);

        return (
          <div key={category} id={category} className="category-section scroll-mt-32">
            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-6 md:mb-8 border-b-2 border-yellow pb-2">
              {categoryTitles[category]}
            </h2>

            {sortedSubcategories.map(([subcategory, subcategoryItems]) => (
              <div key={subcategory} className="subcategory-section mb-8">
                {subcategory !== "null" && subcategory && (
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
                      variationDescription={item.variationDescription}
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
