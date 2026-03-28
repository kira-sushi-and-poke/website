import React from "react";

export default function AllergenNotice() {
    return (
        <div className="bg-yellow/20 border-l-4 border-hot-pink p-3 md:p-4 mb-4 md:mb-8 rounded">
            <p className="text-xs md:text-sm font-semibold text-hot-pink">
                <i className="fas fa-exclamation-triangle"></i> Allergen Notice: Menu items may contain common allergens. If you have dietary restrictions or allergies, please add a note to your order before checkout.
            </p>
        </div>
    );
}
