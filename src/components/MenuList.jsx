import React from 'react';
import MenuItem from './MenuItem';

const MenuList = ({ menuItems }) => {
  return (
    <div className="menu-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map(item => (
        <MenuItem
          key={item.id}
          id={item.id}
          name={item.name}
          originalPrice={item.originalPrice}
          discountedPrice={item.discountedPrice}
          image={item.imageLink}
          description={item.description}
        />
      ))}
    </div>
  );
};

export default MenuList;
