"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { PaymentForm, CreditCard, GooglePay, ApplePay } from "react-square-web-payments-sdk";
import { generatePickupTimes } from "@/lib/generatePickupTimes";
import { validateContactDetails, validatePickupTime } from "@/lib/validation";
import { processPayment } from "../actions";
import PickupDetails from "./PickupDetails";

export default function PaymentFormComponent({ orderId, totalAmount, openingHours, overridePeriods = [] }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing Payment...");
  const paymentTimeoutRef = useRef(null);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
    pickupTime: "",
    specialInstructions: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [pickupTimeOptions, setPickupTimeOptions] = useState([]);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(null);
  
  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const isProduction = process.env.NODE_ENV === "production";
  
  // Generate pickup time options based on actual opening hours and mobile override periods
  React.useEffect(() => {
    const times = generatePickupTimes(openingHours, overridePeriods);
    setPickupTimeOptions(times);
  }, [openingHours, overridePeriods]);
  
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
    // Clear timeout since callback was triggered
    if (paymentTimeoutRef.current) {
      clearTimeout(paymentTimeoutRef.current);
      paymentTimeoutRef.current = null;
    }
    
    // Set loading state if not already set (e.g., for credit card payments)
    if (!isProcessing) {
      setIsProcessing(true);
      setLoadingMessage("Processing Payment...");
    }

    try {
      // Check token status - handle cancel/error cases
      if (token.status === 'Cancel') {
        // User cancelled the payment sheet
        setIsProcessing(false);
        return;
      }
      
      if (token.status === 'Error' || token.status === 'Invalid') {
        // Tokenization error
        setIsProcessing(false);
        const errorMessage = token.errors?.[0]?.message || "Payment failed. Please try again.";
        toast.error(errorMessage, { duration: 10000 });
        return;
      }
      
      if (token.status !== 'OK') {
        // Unknown/Abort status
        setIsProcessing(false);
        toast.error("Payment processing failed. Please try again.", { duration: 10000 });
        return;
      }
      
      // Update message to show we're now processing the payment
      setLoadingMessage("Processing Payment...");
      
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
          // Wallet didn"t provide complete info - use manual form
          if (!contactDetails.email || !contactDetails.name || !contactDetails.phone) {
            setIsProcessing(false);
            toast.error("Please fill in all contact details below before paying.", { duration: 10000 });
            return;
          }
          contactInfo = contactDetails;
        }
        
        // Always validate pickup time for all payments
        if (!contactDetails.pickupTime) {
          setIsProcessing(false);
          setFormErrors(prev => ({
            ...prev,
            pickupTime: "Pickup time is required"
          }));
          toast.error("Please select a pickup time", { duration: 10000 });
          return;
        }
        
        // Validate pickup time is at least 45 minutes from now
        const pickupError = validatePickupTime(contactDetails.pickupTime);
        if (pickupError) {
          setIsProcessing(false);
          setFormErrors(prev => ({
            ...prev,
            pickupTime: pickupError
          }));
          toast.error(pickupError, { duration: 10000 });
          return;
        }
      } else {
        // Credit card - validate manual form
        if (!validateContactForm()) {
          setIsProcessing(false);
          toast.error("Please check all required fields", { duration: 10000 });
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
        contactDetails.specialInstructions,
        tipAmount
      );
      
      if (result.success) {
        // Payment successful - redirect to confirmation
        toast.success("Payment successful! Redirecting...");
        router.push(`/menu/order/confirmation?orderId=${orderId}`);
      } else {
        // Payment failed
        toast.error(result.error || "Payment failed. Please try again.", { duration: 10000 });
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error("Payment failed. Please try again.", { duration: 10000 });
      setIsProcessing(false);
    }
  };
  
  const createPaymentRequest = useMemo(() => {
    return () => {
      const finalTotal = totalAmount + tipAmount;
      
      return {
        countryCode: "GB",
        currencyCode: "GBP",
        total: {
          amount: (finalTotal / 100).toFixed(2),
          label: "Kira Sushi & Poke",
        },
        // Request contact information from Apple Pay / Google Pay
        requestBillingContact: true,
        requestShippingContact: false,
        // Explicitly request email and phone
        requiredBillingContactFields: ["email", "phone", "name"],
      };
    };
  }, [totalAmount, tipAmount]);
  
  const createVerificationDetails = useMemo(() => {
    return () => {
      const finalTotal = totalAmount + tipAmount;
      const nameParts = contactDetails.name.trim().split(/\s+/);
      
      return {
        amount: (finalTotal / 100).toFixed(2),
        billingContact: {
          givenName: nameParts.length === 1 ? nameParts[0] : nameParts.slice(0, -1).join(" "),
          familyName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
          email: contactDetails.email,
          phone: contactDetails.phone,
        },
        currencyCode: "GBP",
        intent: "CHARGE",
      };
    };
  }, [totalAmount, tipAmount, contactDetails.name, contactDetails.email, contactDetails.phone]);
  
  const handleWalletPayClick = () => {
    // Set loading state when pickup time is selected
    if (contactDetails.pickupTime && !isProcessing) {
      setIsProcessing(true);
      setLoadingMessage("Please wait while we process your payment");
      
      // Set timeout to reset loading if callback doesn't fire
      // Square SDK doesn't call cardTokenizeResponseReceived when user cancels
      paymentTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        paymentTimeoutRef.current = null;
      }, 30000); // 30 seconds
    }
    // Click continues to propagate to GooglePay button or overlay
  };
  
  const handleClickForValidation = (e) => {
    if (!contactDetails.pickupTime) {
      e.preventDefault();
      e.stopPropagation();

      // Clear error first to ensure useEffect in PickupDetails triggers every time
      setFormErrors(prev => ({
        ...prev,
        pickupTime: undefined
      }));
      
      // Set error after a brief delay to trigger the useEffect
      setTimeout(() => {
        setFormErrors(prev => ({
          ...prev,
          pickupTime: "Pickup time is required"
        }));
      }, 10);
      
      toast.error("Please select a pickup time", { duration: 10000 });
    }
  };
  
  if (!appId || !locationId) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
        <div className="flex items-start">
          <div className="shrink-0">
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
        <p className="text-xl font-bold text-hot-pink">{loadingMessage}</p>
        <p className="text-sm text-gray-600 mt-2">Please don't close this page</p>
      </div>
    )}
    
    <PickupDetails
      contactDetails={contactDetails}
      handleInputChange={handleInputChange}
      formErrors={formErrors}
      isProcessing={isProcessing}
      pickupTimeOptions={pickupTimeOptions}
    />
    
    <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-hot-pink">
      <PaymentForm
        key={`payment-form-${tipAmount}`}
        applicationId={appId}
        locationId={locationId}
        cardTokenizeResponseReceived={cardTokenizeResponseReceived}
        createPaymentRequest={createPaymentRequest}
        createVerificationDetails={createVerificationDetails}
        formProps={{
          onSubmit: (e) => {
            // Form submission handled by Square SDK
          }
        }}
      >
        <h1 className="text-xl font-bold text-hot-pink mb-4">
          <i className="fas fa-credit-card mr-2"></i>Payment
        </h1>
        
        {/* Tip Section */}
        <div className="mb-5">
          <h3 className="text-sm font-bold mb-1 text-hot-pink">
            <i className="fas fa-heart mr-2"></i>Add a Tip (Optional)
          </h3>
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
        <div className="bg-hot-pink/5 border border-hot-pink/20 rounded-lg p-3 mb-3">
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
        
        {/* Quick checkout with digital wallets */}
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
            <i className="fas fa-mobile-alt mr-2"></i>
            Quick Checkout
          </h3>
          
          {/* Apple Pay - Only in production (requires domain verification) */}
          {isProduction && (
            <div className="mb-3 relative" onClickCapture={handleWalletPayClick}>
              <ApplePay />

              {!contactDetails.pickupTime && (
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={handleClickForValidation}
                />
              )}
            </div>
          )}
          
          {/* Google Pay */}
          <div className="mb-3 relative" onClickCapture={handleWalletPayClick}>
            <GooglePay />

            {!contactDetails.pickupTime && (
              <div
                className="absolute inset-0 cursor-pointer z-10"
                onClick={handleClickForValidation}
              />
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Contact details collected automatically from your wallet.
          </p>
        </div>
        
        {/* Divider */}
        <div className="relative my-5">
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
            Required for card payments.
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
            <div className="relative">
              <Button disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay £${((totalAmount + tipAmount) / 100).toFixed(2)}`}
              </Button>

              {!contactDetails.pickupTime && (
                <div
                  className="absolute inset-0 cursor-pointer z-10"
                  onClick={handleClickForValidation}
                />
              )}
            </div>
          )}
        />
      </PaymentForm>
      
      <p className="text-xs text-green-500 mt-4 text-center flex items-center justify-center">
        <i className="fas fa-lock mr-2"></i>
        Payments are securely processed by Square
      </p>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            marginTop: "100px",
            fontSize: "14px",
          },
          success: {
            duration: 3000,
            style: {
              background: "#D1FAE5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              fontSize: "14px",
            },
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: Infinity,
            style: {
              background: "#FEE2E2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              fontSize: "14px",
            },
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
    </>
          
  );
}
