"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentForm, CreditCard, GooglePay, ApplePay } from "react-square-web-payments-sdk";

export default function PaymentFormComponent({ orderId, totalAmount }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  
  const validateContactForm = () => {
    const errors = {};
    
    if (!contactDetails.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!contactDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!contactDetails.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(contactDetails.phone)) {
      errors.phone = "Invalid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
  
  const cardTokenizeResponseReceived = async (token, verifiedBuyer) => {
    // Prevent double submission
    if (isProcessing) return;
    
    // Extract contact details from digital wallets (Apple Pay/Google Pay)
    const billing = token.details?.billing;
    const digitalWalletContact = billing?.contact;
    
    let contactInfo = null;
    
    // For digital wallets (Apple Pay/Google Pay)
    if (digitalWalletContact) {
      contactInfo = {
        email: digitalWalletContact.email || digitalWalletContact.emailAddress,
        phone: digitalWalletContact.phone || digitalWalletContact.phoneNumber,
        name: digitalWalletContact.givenName && digitalWalletContact.familyName 
          ? `${digitalWalletContact.givenName} ${digitalWalletContact.familyName}`
          : digitalWalletContact.name || `${billing?.givenName || ''} ${billing?.familyName || ''}`.trim(),
      };
    } else {
      // For credit card, validate the manual contact form
      if (!validateContactForm()) {
        return;
      }
      contactInfo = contactDetails;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: token.token,
          orderId: orderId,
          amount: totalAmount,
          verificationToken: verifiedBuyer?.token,
          contactDetails: contactInfo,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Payment successful - redirect to confirmation
        router.push(`/menu/order/confirmation?orderId=${orderId}&paymentId=${data.paymentId}`);
      } else if (response.status === 402) {
        // Payment declined
        setError(data.error || "Payment was declined. Please try a different payment method.");
        setIsProcessing(false);
      } else {
        // Other error
        setError(data.error || "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };
  
  const createPaymentRequest = () => ({
    countryCode: "GB",
    currencyCode: "GBP",
    total: {
      amount: (totalAmount / 100).toFixed(2),
      label: "Total",
    },
    // Request contact information from Apple Pay / Google Pay
    requestBillingContact: true,
    requestShippingContact: false,
  });
  
  if (!appId || !locationId) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p className="font-bold">Payment Configuration Required</p>
        <p>Please add your Square App ID to the .env.local file.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Pay £{(totalAmount / 100).toFixed(2)}
      </h2>
      
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
            Contact details collected automatically
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
        
        {/* Contact Form for Credit Card */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Enter your contact details:</p>
          
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
