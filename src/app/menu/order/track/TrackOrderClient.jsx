"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackOrderClient({ initialData }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh(); // Re-fetches server component data
    // Reset refreshing state after a delay
    setTimeout(() => setIsRefreshing(false), 5000);
  };
  
  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    if (!initialData?.order) return;
    
    const orderState = initialData.order.state;
    const isActive = orderState !== "COMPLETED" && orderState !== "CANCELED";
    
    if (!isActive) return;
    
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [initialData, router]);
  
  // No initialData means no orderId was provided in URL
  if (!initialData) {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-yellow">
          <div className="mb-4">
            <i className="fas fa-search text-yellow text-7xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Order ID Provided
          </h1>

          <Link
            href="/menu/order"
            className="block w-full bg-hot-pink text-white py-4 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-bold text-lg"
          >
            Back to Order
          </Link>
        </div>
      </div>
    );
  }

  // Handle order fetch errors
  if (initialData.error === "not_found") {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-hot-pink">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-hot-pink text-7xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this order. Please check your Order ID and try again.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">Order ID: {initialData.orderId}</p>
            <Link
              href="/contact"
              className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-semibold"
            >
              Contact Support
            </Link>
            <Link
              href="/menu/order"
              className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold"
            >
              Back to Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { orderId, order } = initialData;

  // Handle different order states
  const orderState = order.state;
  const hasPaid = order.has_payment;

  useEffect(() => {
  // If order is not found or has no items, redirect back to order page with error
    if (!hasPaid || orderState === "DRAFT") {
      router.push("/menu/order");
    }
  }, [orderState, hasPaid, router]);

  // Extract fulfillment status
  const fulfillmentState = order.fulfillment_status || "PROPOSED";
  const pickupTime = order.pickup_time;
  
  const formattedPickupTime = pickupTime 
    ? new Date(pickupTime).toLocaleString("en-GB", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Determine status display based on fulfillment state
  let statusConfig = {
    icon: "fa-clock",
    title: "Order Submitted",
    message: "Your order has been submitted. We will let you know when it is being prepared.",
    color: "yellow",
    showPickupTime: true,
  };

  if (fulfillmentState === "RESERVED") {
    statusConfig = {
      icon: "fa-fire",
      title: "Preparing Your Order",
      message: "Our chef is carefully crafting your delicious meal!",
      color: "yellow",
      showPickupTime: true,
    };
  } else if (fulfillmentState === "PREPARED") {
    statusConfig = {
      icon: "fa-check-circle",
      title: "Order Ready for Pickup!",
      message: "Your order is ready and waiting for you!",
      color: "hot-pink",
      showPickupTime: true,
    };
  } else if (orderState === "COMPLETED") {
    statusConfig = {
      icon: "fa-check",
      title: "Order Completed",
      message: "Thank you for your order. We hope you enjoy your food!",
      color: "hot-pink",
      showPickupTime: false,
    };
  } else if (orderState === "CANCELED") {
    statusConfig = {
      icon: "fa-times-circle",
      title: "Order Canceled",
      message: "This order has been canceled. Contact us if you have questions.",
      color: "yellow",
      showPickupTime: false,
    };
  }

  return (
    <div className="min-h-screen bg-[#fffef9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Order Status Card */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-6 text-center border-t-4 border-${statusConfig.color}`}>
          <div className="mb-4">
            <div className={`mx-auto h-20 w-20 bg-${statusConfig.color}/20 rounded-full flex items-center justify-center ${orderState !== "COMPLETED" ? "animate-pulse" : ""}`}>
              <i className={`fas ${statusConfig.icon} text-5xl text-${statusConfig.color}`}></i>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-hot-pink mb-3">
            {statusConfig.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {statusConfig.message}
          </p>
          
          {statusConfig.showPickupTime && formattedPickupTime && (
            <div className="bg-gradient-to-r from-hot-pink/10 to-yellow/10 border border-hot-pink rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-center">
                <i className="fas fa-clock mr-2"></i>
                Pickup Time
              </p>
              <p className="text-base font-bold text-hot-pink">{formattedPickupTime}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block mb-4">Order ID: {orderId}</p>
          
          {/* Auto-refresh indicator - only show for active orders */}
          {orderState !== "COMPLETED" && orderState !== "CANCELED" && (
            <p className="text-xs text-gray-500 mb-3">
              <i className="fas fa-sync-alt mr-1 text-yellow"></i>
              Auto-refreshing every 30 seconds
            </p>
          )}
          
          {/* Refresh Button - only show for active orders */}
          {orderState !== "COMPLETED" && orderState !== "CANCELED" && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-2 px-6 py-2 border-2 border-hot-pink text-hot-pink rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <>
                  <i className="fas fa-sync-alt animate-spin mr-2"></i>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/menu/order/confirmation?orderId=${order.id}`}
            className="block w-full bg-gradient-to-r from-hot-pink to-yellow text-white py-4 px-4 rounded-lg hover:opacity-90 transition-opacity text-center font-bold text-lg"
          >
            <i className="fas fa-receipt mr-2"></i>
            View Order Details
          </Link>
          <Link
            href="/menu/order"
            className="block w-full bg-hot-pink text-white py-4 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors text-center font-bold text-lg"
          >
            Back to Menu Order
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors text-center font-semibold"
          >
            Back to Home
          </Link>
          {orderState !== "COMPLETED" && (
            <Link
              href="/contact"
              className="block w-full border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg hover:border-hot-pink hover:text-hot-pink transition-colors text-center font-semibold"
            >
              Need Help?
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
