"use client";

import { useState } from "react";

export default function OrderSummary({ lineItems, total }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 mb-5 border-t-4 border-yellow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left mb-3"
        type="button"
      >
        <h2 className="text-xl font-bold text-hot-pink">
          <i className="fas fa-receipt mr-2"></i>Order Details
        </h2>
        <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-hot-pink transition-transform`}></i>
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">
                  {item.displayName || item.name} <span className="text-hot-pink font-semibold">×{item.quantity}</span>
                </span>
                {item.modifiers && item.modifiers.length > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    {item.modifiers.map(mod => mod.name).join(", ")}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">£{(parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="border-t-2 border-hot-pink pt-3 mt-3 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-hot-pink">£{(total / 100).toFixed(2)}</span>
      </div>
    </div>
  );
}
