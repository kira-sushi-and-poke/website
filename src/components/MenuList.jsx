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

  // Group items by category and sort by status
  const categories = {
    solo: sortByStatus(menuItems.filter(item => item.category === "solo")),
    sharer: sortByStatus(menuItems.filter(item => item.category === "sharer")),
    drinks: sortByStatus(menuItems.filter(item => item.category === "drinks"))
  };

  const categoryTitles = {
    solo: "Solo Dishes",
    sharer: "Sharing Platters",
    drinks: "Drinks & Beverages"
  };

  return (
    <div className="menu-list space-y-8 md:space-y-10">
      {Object.entries(categories).map(([category, items]) => (
        items.length > 0 && (
          <div key={category} className="category-section">
            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-4 md:mb-6 border-b-2 border-yellow pb-2">
              {categoryTitles[category]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map(item => (
                <MenuItem
                  key={item.id}
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
        )
      ))}
    </div>
  );
};

export default MenuList;
