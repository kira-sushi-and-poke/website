"use client";
import React from "react";

/**
 * Carousel-style selector for one modifier list (e.g., "Ramen Protein")
 * Displays: Label: ← [Modifier Name] →
 * When allowNone is true, selectedIndex -1 means nothing is selected
 */
const SauceSelector = ({
  modifiers = [],
  selectedIndex = 0,
  onSelect,
  label = "Sauce",
  allowNone = false
}) => {
  if (!modifiers || modifiers.length === 0) return null;

  // Cycle through -1 ("None") as well when the list is optional
  const firstIndex = allowNone ? -1 : 0;
  const lastIndex = modifiers.length - 1;

  const handlePrevious = () => {
    onSelect(selectedIndex <= firstIndex ? lastIndex : selectedIndex - 1);
  };

  const handleNext = () => {
    onSelect(selectedIndex >= lastIndex ? firstIndex : selectedIndex + 1);
  };

  const currentModifier = selectedIndex >= 0 ? modifiers[selectedIndex] : null;
  const showArrows = lastIndex - firstIndex > 0;

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Label */}
      <span className="text-xs md:text-sm font-medium text-gray-600 mr-1">
        {label}:
      </span>

      {/* Left Arrow */}
      <button
        onClick={handlePrevious}
        disabled={!showArrows}
        className="min-w-[44px] min-h-[44px] w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white border border-gray-300 active:bg-hot-pink active:text-white active:border-hot-pink md:hover:bg-hot-pink md:hover:text-white md:hover:border-hot-pink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label={`Previous ${label}`}
      >
        <i className="fas fa-chevron-left text-sm"></i>
      </button>

      {/* Current Modifier Name */}
      <div className="flex-1 text-center min-w-[120px] md:min-w-[150px]">
        <span className={`text-sm md:text-base font-semibold ${currentModifier ? "text-hot-pink" : "text-gray-500"}`}>
          {currentModifier ? currentModifier.name : "None"}
        </span>
        {currentModifier?.price > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            (+£{currentModifier.price.toFixed(2)})
          </span>
        )}
        {currentModifier?.price < 0 && (
          <span className="text-xs text-gray-500 ml-1">
            (−£{Math.abs(currentModifier.price).toFixed(2)})
          </span>
        )}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={!showArrows}
        className="min-w-[44px] min-h-[44px] w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white border border-gray-300 active:bg-hot-pink active:text-white active:border-hot-pink md:hover:bg-hot-pink md:hover:text-white md:hover:border-hot-pink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label={`Next ${label}`}
      >
        <i className="fas fa-chevron-right text-sm"></i>
      </button>
    </div>
  );
};

export default SauceSelector;
