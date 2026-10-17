import React from "react";
import MenuItem from "./MenuItem";
import { CATEGORY_CONFIG } from "@/lib/constants";

const MenuList = ({ 
  menuItems, 
  cart = {}, 
  addItem, 
  removeItem, 
  updatingItems = new Set(), 
  isOrderMode = false 
}) => {
  // Group items by category, in the section order shared with the category navigation
  const categories = Object.fromEntries(
    CATEGORY_CONFIG.sections.map(section => [
      section.id,
      menuItems.filter(item => item.category === section.id)
    ])
  );
  const sectionLabels = Object.fromEntries(CATEGORY_CONFIG.sections.map(s => [s.id, s.label]));

  // Split a section's items by their Square category (e.g. Sides = "Hot Sides" + "Small Bites").
  // Items arrive sorted by category ordinal, so each Square category is contiguous.
  const groupBySquareCategory = (items) => {
    const groups = new Map();
    items.forEach(item => {
      const key = item.categoryDisplayName;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()];
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

  // Helper: Render regular items with optional subcategory heading.
  // The subcategory is the Square ITEM name, so only show a heading when that item
  // has several variations (e.g. an old-style "Hot Sides" item) - single items flow in the grid
  const renderRegularItems = (subcategory, subcategoryItems) => (
    <>
      {subcategory !== "null" && subcategory && subcategoryItems.length > 1 && (
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
          modifierGroups={item.modifierGroups}
        />
      ))}
    </>
  );

  // Helper: Render one grid of items (optionally under a Square category subheading)
  const renderGrid = (gridItems, category, heading) => {
    // Items are already sorted by ordinals from getMenuData
    const subcategoryEntries = Object.entries(groupBySubcategory(gridItems));

    return (
      <React.Fragment key={heading || category}>
        {heading && (
          <h3 className="text-lg md:text-2xl font-semibold text-gray-800 flex items-center mb-1 md:mb-2">
            <span className="bg-hot-pink/10 text-hot-pink px-3 py-1 rounded-full text-base md:text-lg">
              {heading}
            </span>
          </h3>
        )}

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
      </React.Fragment>
    );
  };

  return (
    <div className="menu-list space-y-6 md:space-y-10">
      {Object.entries(categories).map(([category, items]) => {
        if (items.length === 0) return null;

        const squareCategoryGroups = groupBySquareCategory(items);
        const hasMixedCategories = squareCategoryGroups.length > 1;

        // Single Square category: use its name (e.g. "Sushi Platters"); mixed: use the section label
        const categoryDisplayName = hasMixedCategories
          ? sectionLabels[category]
          : items[0]?.categoryDisplayName || sectionLabels[category] || category;

        return (
          <div key={category} id={category} className="category-section scroll-mt-32">
            <h2 className="text-xl md:text-3xl font-bold text-hot-pink mb-3 md:mb-6 border-b-2 border-yellow pb-1.5 md:pb-2">
              {categoryDisplayName}
            </h2>

            {squareCategoryGroups.map(([squareCategoryName, groupItems]) =>
              renderGrid(groupItems, category, hasMixedCategories ? squareCategoryName : null)
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MenuList;
