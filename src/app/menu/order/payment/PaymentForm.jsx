"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentForm, CreditCard, GooglePay, ApplePay } from "react-square-web-payments-sdk";
import { generatePickupTimes } from "@/lib/generatePickupTimes";
import { validateContactDetails } from "@/lib/validation";
import { processPayment } from "../actions";

export default function PaymentFormComponent({ orderId, totalAmount }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
    pickupTime: "",
    specialInstructions: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [pickupTimeOptions, setPickupTimeOptions] = useState([]);
  
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const isProduction = process.env.NODE_ENV === "production";
  
  // Generate pickup time options (15-min intervals, 30 min from now, 11am-7pm)
  React.useEffect(() => {
    const times = generatePickupTimes();
    setPickupTimeOptions(times);
  }, []);
  
  const validateContactForm = () => {
    const { isValid, errors } = validateContactDetails(contactDetails);
    setFormErrors(errors);
    return isValid;
  };
  
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
  
  // Extract contact info from digital wallet token
  const extractWalletContact = (token) => {
    const billing = token.details?.billing;
    const shipping = token.details?.shipping;
    const digitalWalletContact = billing || shipping?.contact || shipping;
    
    if (!digitalWalletContact) return null;
    
    const email = digitalWalletContact.email || digitalWalletContact.emailAddress;
    const phone = digitalWalletContact.phone || digitalWalletContact.phoneNumber;
    const name = digitalWalletContact.givenName && digitalWalletContact.familyName 
      ? `${digitalWalletContact.givenName} ${digitalWalletContact.familyName}`
      : digitalWalletContact.name || 
        (digitalWalletContact.givenName || digitalWalletContact.familyName ? 
          `${digitalWalletContact.givenName || ""} ${digitalWalletContact.familyName || ""}`.trim() : 
          null);
    
    // Only return if all required fields are present
    return (email && phone && name) ? { email, phone, name } : null;
  };
  
  const cardTokenizeResponseReceived = async (token, verifiedBuyer) => {
    // Prevent double submission
    if (isProcessing) return;
    
    // Set loading state
    setIsProcessing(true);
    setError(null);

    try {
      // Determine payment method
      const paymentMethod = token.details?.method;
      const isWalletPayment = paymentMethod === "Apple Pay" || 
                             paymentMethod === "Google Pay" ||
                             token.token.includes("cnon:");
      
      // Extract contact info
      let contactInfo = null;
      
      if (isWalletPayment) {
        // Try to get contact from wallet
        const walletContact = extractWalletContact(token);
        
        if (walletContact) {
          // Wallet provided complete info
          contactInfo = walletContact;
        } else {
          // Wallet didn't provide complete info - use manual form
          if (!contactDetails.email || !contactDetails.name || !contactDetails.phone) {
            setIsProcessing(false);
            setError("Please fill in all contact details below before paying.");
            return;
          }
          contactInfo = contactDetails;
        }
      } else {
        // Credit card - validate manual form
        if (!validateContactForm()) {
          setIsProcessing(false);
          return;
        }
        contactInfo = contactDetails;
      }
      
      // Process payment
      const result = await processPayment(
        token.token,
        orderId,
        totalAmount,
        verifiedBuyer?.token,
        contactInfo,
        contactDetails.pickupTime,
        contactDetails.specialInstructions
      );
      
      if (result.success) {
        // Payment successful - redirect to confirmation
        router.push(`/menu/order/confirmation?orderId=${orderId}`);
      } else {
        // Payment failed
        setError(result.error || "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };
  
  const createPaymentRequest = () => {
    const request = {
      countryCode: "GB",
      currencyCode: "GBP",
      total: {
        amount: (totalAmount / 100).toFixed(2),
        label: "Kira Sushi & Poke",
      },
      // Request contact information from Apple Pay / Google Pay
      requestBillingContact: true,
      requestShippingContact: false,
      // Explicitly request email and phone
      requiredBillingContactFields: ["email", "phone", "name"],
    };
    
    return request;
  };
  
  if (!appId || !locationId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-yellow-800 mb-1">Payment Configuration Required</p>
            <p className="text-sm text-yellow-700">Please add your Square App ID to the .env.local file.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-hot-pink relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-50">
          <div className="mb-6">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-hot-pink/20 to-yellow/20 rounded-full flex items-center justify-center animate-pulse">
              <i className="fas fa-credit-card text-hot-pink text-4xl"></i>
            </div>
          </div>
          <div className="w-16 h-16 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold text-hot-pink">Processing Payment...</p>
          <p className="text-sm text-gray-600 mt-2">Please don't close this page</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-500 text-2xl"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-red-800 mb-1">Payment Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={cardTokenizeResponseReceived}
        createPaymentRequest={createPaymentRequest}
      >
        {/* Pickup Details */}
        <div className="mb-6 p-5 bg-hot-pink/5 border-2 border-hot-pink/20 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-hot-pink flex items-center">
            <i className="fas fa-clock mr-2"></i>
            Pickup Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="pickupTime" className="block text-sm font-medium mb-2">
                Pickup Time *
              </label>
              <select
                id="pickupTime"
                name="pickupTime"
                value={contactDetails.pickupTime}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
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
                placeholder="E.g., Please call when you arrive, Extra napkins, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink resize-none"
                disabled={isProcessing}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {contactDetails.specialInstructions.length}/500 characters
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-hot-pink mb-6 flex items-center">
          <i className="fas fa-credit-card mr-2"></i>
          Payment Method
        </h2>
        
        <p className="text-gray-700 mb-4">
          Total: <span className="text-2xl font-bold text-hot-pink">£{(totalAmount / 100).toFixed(2)}</span>
        </p>
        
        {/* Quick checkout with digital wallets */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
            <i className="fas fa-mobile-alt mr-2"></i>
            Quick Checkout
          </h3>
          
          {/* Apple Pay - Only in production (requires domain verification) */}
          {isProduction && (
            <div className="mb-3">
              <ApplePay />
            </div>
          )}
          
          {/* Google Pay */}
          <div className="mb-3">
            <GooglePay />
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Contact details collected automatically from your wallet.
          </p>
        </div>
        
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or pay with card</span>
          </div>
        </div>
        
        {/* Contact Form for All Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-hot-pink flex items-center">
            <i className="fas fa-user mr-2"></i>
            Contact Information
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Required for card payments. May be auto-filled from digital wallets.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={contactDetails.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isProcessing}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={contactDetails.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isProcessing}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={contactDetails.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                  formErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isProcessing}
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Credit Card */}
        <CreditCard
          buttonProps={{
            css: {
              backgroundColor: "#FF1493",
              fontSize: "16px",
              fontWeight: "600",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#E6127F",
              },
            },
          }}
          render={(Button) => (
            <Button disabled={isProcessing}>
              {isProcessing ? "Processing..." : `Pay £${(totalAmount / 100).toFixed(2)}`}
            </Button>
          )}
        />
      </PaymentForm>
      
      <p className="text-xs text-green-500 mt-4 text-center flex items-center justify-center">
        <i className="fas fa-lock mr-2"></i>
        Payments are securely processed by Square
      </p>
    </div>
  );
}
