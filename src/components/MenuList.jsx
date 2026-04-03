import React from "react";
import MenuItem from "./MenuItem";

const MenuList = ({ 
  menuItems, 
  cart = {}, 
  addItem, 
  removeItem, 
  updatingItems = new Set(), 
  isOrderMode = false 
}) => {
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

    // Items are already sorted by ordinals from API
    return subcategories;
  };

  // Helper: Render a variant card for subcategories with multiple variants
  const renderVariantCard = (subcategory, subcategoryItems) => (
    <MenuItem
      key={`${subcategory}-combined`}
      name={subcategory}
      description={subcategoryItems[0]?.description || ""}
      image={subcategoryItems[0]?.imageLink || "/images/placeholder.svg"}
      originalPrice={null}
      discountedPrice={null}
      status={null}
      variationId={null}
      cart={cart}
      addItem={addItem}
      removeItem={removeItem}
      updatingItems={updatingItems}
      isOrderMode={isOrderMode}
      isVariantCard={true}
      variants={subcategoryItems}
    />
  );

  // Helper: Render regular items with optional subcategory heading
  const renderRegularItems = (subcategory, subcategoryItems) => (
    <>
      {subcategory !== "null" && subcategory && (
        <div className="col-span-full -mb-1.5 md:-mb-2">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-800 flex items-center m-0">
            <span className="bg-hot-pink/10 text-hot-pink px-3 py-1 rounded-full text-base md:text-lg">
              {subcategory}
            </span>
          </h3>
        </div>
      )}
      {subcategoryItems.map((item, itemIndex) => (
        <MenuItem
          key={item.variationId || `${item.id}-${item.name}-${itemIndex}`}
          id={item.id}
          name={item.name}
          originalPrice={item.originalPrice}
          discountedPrice={item.discountedPrice}
          image={item.imageLink}
          description={item.description}
          variationDescription={item.variationDescription}
          status={item.status}
          variationId={item.variationId}
          cart={cart}
          addItem={addItem}
          removeItem={removeItem}
          updatingItems={updatingItems}
          isOrderMode={isOrderMode}
          modifiers={item.modifiers}
        />
      ))}
    </>
  );

  return (
    <div className="menu-list space-y-6 md:space-y-10">
      {Object.entries(categories).map(([category, items]) => {
        if (items.length === 0) return null;

        const subcategories = groupBySubcategory(items);
        // Items are already sorted by ordinals from getMenuData
        const subcategoryEntries = Object.entries(subcategories);

        // Get display name from first item (all items in category have same categoryDisplayName)
        const categoryDisplayName = items[0]?.categoryDisplayName || category;
        
        return (
          <div key={category} id={category} className="category-section scroll-mt-32">
            <h2 className="text-xl md:text-3xl font-bold text-hot-pink mb-3 md:mb-6 border-b-2 border-yellow pb-1.5 md:pb-2">
              {categoryDisplayName}
            </h2>

            {/* Render variant cards and regular items in a unified grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4 mb-4 md:mb-6">
              {subcategoryEntries.map(([subcategory, subcategoryItems], index) => {
                // Check if this subcategory should be a variant card (based on displayType from API)
                // displayType is already normalized to lowercase in getMenuData
                const isVariantSubcategory = subcategoryItems[0]?.displayType === "combined";
                
                // Check if we need to show "Sushi with Variants" heading before this subcategory
                const showSushiVariantsHeading = category === "sushi" && 
                  isVariantSubcategory && 
                  index > 0 && 
                  subcategoryEntries[index - 1][1][0]?.displayType === "separate";
                
                return (
                  <React.Fragment key={subcategory}>
                    {/* Show Sushi with Variants heading */}
                    {showSushiVariantsHeading && (
                      <div className="col-span-full mb-2 mt-4 hidden lg:block">
                        <h3 className="text-lg flex font-semibold text-gray-800 m-0 items-center">
                          <span className="bg-hot-pink/10 text-hot-pink px-3 py-1 rounded-full text-base md:text-lg">
                            And more...
                          </span>
                        </h3>
                      </div>
                    )}
                    
                    {isVariantSubcategory
                      ? renderVariantCard(subcategory, subcategoryItems)
                      : renderRegularItems(subcategory, subcategoryItems)
                    }
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;
