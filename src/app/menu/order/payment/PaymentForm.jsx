"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { generatePickupTimes } from "@/lib/generatePickupTimes";
import { checkout } from "../actions";
import { TOASTER_CONFIG, TOAST_MESSAGES } from "@/lib/constants";
import PickupDetails from "./PickupDetails";
import { saveOrderToStorage } from "@/lib/storage";

export default function PaymentFormComponent({ orderId, totalAmount, openingHours, overridePeriods = [], restaurantStatus }) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    pickupTime: "",
    specialInstructions: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [pickupTimeOptions, setPickupTimeOptions] = useState([]);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(null);
  
  // Check if restaurant is "closed until further notice"
  const isClosedIndefinitely = !restaurantStatus?.nextOpenDate && restaurantStatus?.overrideActive;
  
  // Generate pickup time options based on actual opening hours and mobile override periods
  React.useEffect(() => {
    const times = generatePickupTimes(openingHours, overridePeriods, undefined, isClosedIndefinitely);
    setPickupTimeOptions(times);
  }, [openingHours, overridePeriods, isClosedIndefinitely]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactDetails(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validatePickupTime = () => {
    const hasValidPickupTime = contactDetails.pickupTime && contactDetails.pickupTime !== "";
    
    if (!hasValidPickupTime) {
      // Clear error first to ensure useEffect in PickupDetails triggers every time
      setFormErrors(prev => ({
        ...prev,
        pickupTime: undefined
      }));
      
      // Set error after a brief delay to trigger the useEffect
      setTimeout(() => {
        setFormErrors(prev => ({
          ...prev,
          pickupTime: "Please select ASAP or choose a pickup time"
        }));
      }, 10);
      
      toast.error("Please select a pickup time (ASAP or schedule for later)", { duration: 10000 });
    }

    return hasValidPickupTime;
  };

  const handleCheckout = async (draftOrderId, pickupTime, tipAmount, specialInstructions) => {
    if (!validatePickupTime()) return;

    setIsProcessing(true);

    const {
      success, 
      error, 
      orderId, 
      squareCheckoutUrl 
    } = await checkout(draftOrderId, pickupTime, tipAmount, specialInstructions);

    if (!success) {
      setIsProcessing(false);

      toast.error(error || TOAST_MESSAGES.PAYMENT_FAILED, { duration: 10000 });
      return;
    }

    saveOrderToStorage(orderId, 1); // Save order ID and version to localStorage for when user goes back to menu order page
    router.replace(squareCheckoutUrl);
  }
  
  return (
    <>
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="mb-6">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-hot-pink/20 to-yellow/20 rounded-full flex items-center justify-center animate-pulse">
              <i className="fas fa-credit-card text-hot-pink text-4xl"></i>
            </div>
          </div>
          <div className="w-16 h-16 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold text-hot-pink">Redirecting to Square's checkout page...</p>
          <p className="text-sm text-gray-600 mt-2">Please don't close this page</p>
        </div>
      )}
      
      <PickupDetails
        contactDetails={contactDetails}
        handleInputChange={handleInputChange}
        formErrors={formErrors}
        isProcessing={isProcessing}
        pickupTimeOptions={pickupTimeOptions}
        restaurantStatus={restaurantStatus}
      />
    
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-hot-pink">
        <h3 className="text-xl font-bold text-hot-pink mb-4">
          <i className="fas fa-credit-card mr-2"></i>Payment
        </h3>
        
        {/* Tip Section */}
        <div className="mb-5">
          <h4 className="font-bold mb-1 text-hot-pink">
            <i className="fas fa-heart mr-2"></i>Add a Tip (Optional)
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Show your appreciation for our service
          </p>
          
          {/* Preset tip buttons */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[5, 10, 15, 20].map(percent => {
              const tipValue = Math.round(totalAmount * (percent / 100));
              return (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    setTipAmount(tipValue);
                    setTipPercentage(percent);
                  }}
                  disabled={isProcessing}
                  className={`py-1 px-2 rounded-lg border-2 transition-all text-xs ${
                    tipPercentage === percent
                      ? "bg-hot-pink text-white border-hot-pink"
                      : "bg-white border-gray-300 hover:border-hot-pink disabled:opacity-50"
                  }`}
                >
                  <div>{percent}%</div>
                  <div className="text-[10px] mt-0.5">£{(tipValue / 100).toFixed(2)}</div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Total Display - Compact */}
        <div className="bg-hot-pink/5 border border-hot-pink/20 rounded-lg p-3 mb-5">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              <div>Order Total: £{(totalAmount / 100).toFixed(2)}</div>
              {tipAmount > 0 && (
                <div className="text-xs text-gray-600">Includes £{(tipAmount / 100).toFixed(2)} tip</div>
              )}
            </div>
            <div className="text-2xl font-bold text-hot-pink">
              £{((totalAmount + tipAmount) / 100).toFixed(2)}
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={async () => await handleCheckout(orderId, contactDetails.pickupTime, tipAmount, contactDetails.specialInstructions)}
          disabled={isProcessing}
          className={`px-6 py-3 bg-hot-pink text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors w-full cursor-pointer ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Pay via Square
        </button>

        <p className="text-xs text-green-500 mt-4 text-center flex justify-center">
          <i className="fas fa-lock mr-2"></i>
          <span>Payments are securely processed by <a href="https://squareup.com/gb/en/about" target="_blank" rel="noopener noreferrer" className="text-green-500 underline">Square</a>, a trusted global payment provider</span>
        </p>
        
        <Toaster {...TOASTER_CONFIG} />
      </div>
    </> 
  );
}
