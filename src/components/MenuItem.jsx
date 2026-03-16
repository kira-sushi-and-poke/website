import React from "react";

const MenuItem = ({ name, originalPrice, discountedPrice, image, description, status }) => {
    // Define status badge styles
    const statusConfig = {
        available: { label: "Available", className: "bg-green-500 text-white", icon: null },
        popular: { label: " Popular", className: "bg-yellow text-hot-pink font-bold", icon: "fas fa-star" },
        new: { label: " New", className: "bg-hot-pink text-white", icon: "fas fa-tag" },
        seasonal: { label: " Seasonal", className: "bg-orange-500 text-white", icon: "fas fa-leaf" },
        "out-of-stock": { label: "Out of Stock", className: "bg-gray-400 text-white", icon: null }
    };

    const currentStatus = statusConfig[status] || statusConfig.available;

    return (
        <div className="menu-item border-2 border-hot-pink relative overflow-hidden">
            {/* Status Badge */}
            {status && status !== "available" && (
                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.className} z-10`}>
                    {currentStatus.icon && <i className={currentStatus.icon}></i>}
                    {currentStatus.label}
                </span>
            )}
            <div className="bg-hot-pink w-full h-48 flex items-center justify-center rounded-t-lg overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <h3 className="menu-item-name text-hot-pink font-bold text-xl mb-2">{name}</h3>
                <p className="menu-item-description text-gray-700 text-sm">{description}</p>
            </div>
            {/* <p className="menu-item-prices">
                <span className="original-price text-gray-400 line-through">£{originalPrice.toFixed(2)}</span>
                <span className="discounted-price text-yellow font-bold ml-2.5 text-xl">£{discountedPrice.toFixed(2)}</span>
            </p> */}
        </div>
    );
};

export default MenuItem;
