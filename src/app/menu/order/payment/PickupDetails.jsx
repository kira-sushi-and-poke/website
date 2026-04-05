"use client";

import { useState, useEffect, useRef } from "react";
import PickupOnlyNotice from "@/components/PickupOnlyNotice";
import { PICKUP_ASAP } from "@/lib/constants";

export default function PickupDetails({ 
  contactDetails, 
  handleInputChange, 
  formErrors, 
  isProcessing, 
  pickupTimeOptions,
  restaurantStatus 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pickupMode, setPickupMode] = useState("asap"); // "asap" or "scheduled"
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
  
  // Initialize pickupMode based on existing pickupTime value
  useEffect(() => {
    if (contactDetails.pickupTime === PICKUP_ASAP) {
      setPickupMode("asap");
    } else if (contactDetails.pickupTime && contactDetails.pickupTime !== "") {
      setPickupMode("scheduled");
    }
  }, [contactDetails.pickupTime]);
  
  const handlePickupModeChange = (mode) => {
    setPickupMode(mode);
    
    if (mode === "asap") {
      // Set ASAP value immediately
      handleInputChange({ target: { name: "pickupTime", value: PICKUP_ASAP } });
    } else {
      // Clear pickup time when switching to scheduled
      handleInputChange({ target: { name: "pickupTime", value: "" } });
    }
  };

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
            <label className="block text-sm font-medium mb-3">
              Pickup Time * <span className="text-gray-600 text-xs">(UK time)</span>
            </label>
            
            {/* Radio buttons for ASAP vs Scheduled */}
            <div className="space-y-3 mb-4">
              <label 
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  pickupMode === "asap" 
                    ? "border-hot-pink bg-hot-pink/5" 
                    : "border-gray-300 hover:border-gray-400"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="pickupMode"
                  value="asap"
                  checked={pickupMode === "asap"}
                  onChange={() => handlePickupModeChange("asap")}
                  disabled={isProcessing}
                  className="h-4 w-4 text-hot-pink focus:ring-hot-pink shrink-0"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">ASAP (approx. 30 minutes)</span>
                  <p className="text-xs text-gray-600 mt-0.5">We'll start preparing your order right away</p>
                </div>
              </label>
              
              <label 
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  pickupMode === "scheduled" 
                    ? "border-hot-pink bg-hot-pink/5" 
                    : "border-gray-300 hover:border-gray-400"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="pickupMode"
                  value="scheduled"
                  checked={pickupMode === "scheduled"}
                  onChange={() => handlePickupModeChange("scheduled")}
                  disabled={isProcessing}
                  className="h-4 w-4 text-hot-pink focus:ring-hot-pink shrink-0"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Schedule for later</span>
                  <p className="text-xs text-gray-600 mt-0.5">Choose a specific pickup time</p>
                </div>
              </label>
            </div>
            
            {/* Dropdown - only show when "scheduled" is selected */}
            {pickupMode === "scheduled" && (
              <div className="animate-fadeIn">
                <select
                  id="pickupTime"
                  name="pickupTime"
                  value={contactDetails.pickupTime === PICKUP_ASAP ? "" : contactDetails.pickupTime}
                  onChange={handleInputChange}
                  onFocus={() => setIsExpanded(true)}
                  className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                    formErrors.pickupTime ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isProcessing}
                >
                  <option value="">Select a pickup time</option>
                  {pickupTimeOptions.filter(option => option.value !== PICKUP_ASAP).map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {formErrors.pickupTime && (
              <p className="text-red-500 text-sm mt-2">{formErrors.pickupTime}</p>
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
