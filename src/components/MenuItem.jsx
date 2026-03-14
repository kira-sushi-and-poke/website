import React from 'react';

const MenuItem = ({ name, originalPrice, discountedPrice, image, description }) => {
    return (
        <div className="menu-item border-2 border-hot-pink">
            <img src={image} alt={name} className="menu-item-image" />
            <h3 className="menu-item-name text-hot-pink">{name}</h3>
            <p className="menu-item-description">{description}</p>
            {/* <p className="menu-item-prices">
                <span className="original-price text-gray-400 line-through">£{originalPrice.toFixed(2)}</span>
                <span className="discounted-price text-yellow font-bold ml-2.5 text-xl">£{discountedPrice.toFixed(2)}</span>
            </p> */}
        </div>
    );
};

export default MenuItem;
