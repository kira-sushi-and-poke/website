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
        router.push(`/menu/order/confirmation?orderId=${orderId}&paymentId=${result.paymentId}`);
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
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p className="font-bold">Payment Configuration Required</p>
        <p>Please add your Square App ID to the .env.local file.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold text-gray-800">Processing Payment...</p>
          <p className="text-sm text-gray-600 mt-2">Please don't close this page</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <PaymentForm
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={cardTokenizeResponseReceived}
        createPaymentRequest={createPaymentRequest}
      >
        {/* Pickup Details */}
        <div className="mb-6 p-4 bg-hot-pink/5 border border-hot-pink/20 rounded-lg">
          <h3 className="text-sm font-semibold mb-4 text-gray-800">Pickup Details</h3>
          
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
        
        <h2 className="text-xl font-semibold mb-4">
          Pay £{(totalAmount / 100).toFixed(2)}
        </h2>
        
        {/* Quick checkout with digital wallets */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Quick checkout:</p>
          
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
            {isProduction 
              ? "Contact details collected automatically from your wallet."
              : "In test mode, please fill in the form below first, then use Apple Pay/Google Pay."}
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
          <p className="text-sm font-medium mb-3">Your contact details:</p>
          <p className="text-xs text-gray-500 mb-3">
            {isProduction 
              ? "Required for card payments. May be needed for Apple Pay/Google Pay."
              : "Required for all payment methods in test mode."}
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
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        Payments are securely processed by Square
      </p>
    </div>
  );
}
