"use client";

import { useState, useEffect, useRef } from "react";
import PickupOnlyNotice from "@/components/PickupOnlyNotice";

export default function PickupDetails({ 
  contactDetails, 
  handleInputChange, 
  formErrors, 
  isProcessing, 
  pickupTimeOptions,
  restaurantStatus 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  
  // Auto-expand if pickup time has an error
  useEffect(() => {
    if (formErrors.pickupTime) {
      setIsExpanded(true);
      // Scroll to this section
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [formErrors.pickupTime]);

  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow-lg px-5 pt-5 pb-3 mb-5 border-t-4 border-hot-pink">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left mb-3"
        type="button"
      >
        <h3 className="text-xl font-bold text-hot-pink">
          <i className="fas fa-clock mr-2"></i>Pickup Details <small className="text-red-500">(required)</small>
        </h3>
        <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-hot-pink transition-transform`}></i>
      </button>
        
      {isExpanded && (
        <div className="space-y-3">
          {/* Pickup Only Notice */}
          <PickupOnlyNotice restaurantStatus={restaurantStatus} />
          
          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium mb-2">
              Pickup Time * <span className="text-gray-600 text-xs">(UK time)</span>
            </label>
            <select
              id="pickupTime"
              name="pickupTime"
              value={contactDetails.pickupTime}
              onChange={handleInputChange}
              onFocus={() => setIsExpanded(true)}
              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                formErrors.pickupTime ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isProcessing}
            >
              <option value="">Select a pickup time</option>
              {pickupTimeOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.pickupTime && (
              <p className="text-red-500 text-sm mt-1">{formErrors.pickupTime}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={contactDetails.specialInstructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="Extra sauce, no wasabi..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink resize-none"
              disabled={isProcessing}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {contactDetails.specialInstructions.length}/200 characters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
