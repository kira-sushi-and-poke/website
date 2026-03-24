"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrder } from "../actions";

export default function CheckoutPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupTime: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupTimeOptions, setPickupTimeOptions] = useState([]);
  
  // Generate pickup time options (15-min intervals, 30 min from now, 11am-9pm)
  useEffect(() => {
    const times = [];
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    
    // Start from today at 11 AM
    const startOfDay = new Date(now);
    startOfDay.setHours(11, 0, 0, 0);
    
    // End at 9 PM
    const endOfDay = new Date(now);
    endOfDay.setHours(21, 0, 0, 0);
    
    // If current time is past 11 AM, start from minTime instead
    let currentTime = minTime > startOfDay ? minTime : startOfDay;
    
    // Round up to next 15-min interval
    const minutes = currentTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    currentTime.setMinutes(roundedMinutes, 0, 0);
    
    // Generate time slots
    while (currentTime <= endOfDay) {
      const timeString = currentTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      const isoString = currentTime.toISOString();
      times.push({ label: timeString, value: isoString });
      currentTime = new Date(currentTime.getTime() + 15 * 60000); // Add 15 minutes
    }
    
    // If no times today, add times for tomorrow
    if (times.length === 0) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(21, 0, 0, 0);
      
      let time = tomorrow;
      while (time <= tomorrowEnd) {
        const timeString = time.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) + ' (Tomorrow)';
        const isoString = time.toISOString();
        times.push({ label: timeString, value: isoString });
        time = new Date(time.getTime() + 15 * 60000);
      }
    }
    
    setPickupTimeOptions(times);
  }, []);
  
  // Load order from localStorage
  useEffect(() => {
    const storedOrder = localStorage.getItem("order");
    if (!storedOrder) {
      router.push("/menu/order");
      return;
    }
    
    const { orderId: storedOrderId } = JSON.parse(storedOrder);
    setOrderId(storedOrderId);
    
    // Fetch order details
    fetchOrderDetails(storedOrderId);
  }, [router]);
  
  const fetchOrderDetails = async (id) => {
    try {
      const { success, order: fetchedOrder, error: fetchError } = await getOrder(id);
      
      if (!success || !fetchedOrder) {
        setError(fetchError || "Failed to load order");
        setLoading(false);
        return;
      }
      
      // Check if order is empty
      if (!fetchedOrder.line_items || fetchedOrder.line_items.length === 0) {
        router.push("/menu/order");
        return;
      }
      
      setOrder(fetchedOrder);
      setLoading(false);
    } catch (err) {
      setError("Failed to load order");
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone number";
    }
    
    if (!formData.pickupTime) {
      errors.pickupTime = "Pickup time is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
  
  const handleCustomPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call API to create customer and attach to order
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setError(data.error || "Something went wrong, please try again");
        setIsSubmitting(false);
        return;
      }
      
      // Store customer info in sessionStorage
      sessionStorage.setItem("customerInfo", JSON.stringify({
        ...formData,
        pickupTime: formData.pickupTime,
      }));
      
      // Redirect to payment page
      router.push(`/menu/order/payment?orderId=${orderId}`);
    } catch (err) {
      setError("Something went wrong, please try again");
      setIsSubmitting(false);
    }
  };
  
  const handleSquareCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create customer first
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setError(data.error || "Something went wrong, please try again");
        setIsSubmitting(false);
        return;
      }
      
      // Store customer info and pickup time in sessionStorage
      sessionStorage.setItem("customerInfo", JSON.stringify({
        ...formData,
        pickupTime: formData.pickupTime,
      }));
      
      // Redirect to existing Square checkout action with customer info
      const { checkout } = await import("../actions");
      await checkout(orderId, formData);
    } catch (err) {
      if (err.digest && err.digest.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err.message || "Failed to initiate checkout. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const calculateTotal = () => {
    if (!order || !order.line_items) return 0;
    
    return order.line_items.reduce((total, item) => {
      const itemTotal = parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity);
      return total + itemTotal;
    }, 0) / 100; // Convert from cents to pounds
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {order?.line_items?.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>£{(parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 font-semibold flex justify-between">
            <span>Total</span>
            <span>£{calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Contact Details Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
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
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
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
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                formErrors.phone ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="pickupTime" className="block text-sm font-medium mb-1">
              Pickup Time *
            </label>
            <select
              id="pickupTime"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-pink ${
                formErrors.pickupTime ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
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
          
          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={handleCustomPayment}
              disabled={isSubmitting}
              className="w-full bg-hot-pink text-white font-semibold py-3 rounded-lg hover:bg-hot-pink/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Pay with Card / Apple Pay / Google Pay"}
            </button>
            
            <button
              type="button"
              onClick={handleSquareCheckout}
              disabled={isSubmitting}
              className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Pay with Square Checkout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
