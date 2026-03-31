"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Constants at the top
const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
const REFRESH_BUTTON_DELAY = 5000; // 5 seconds

export default function TrackOrderClient({ initialData }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive order properties once at the top
  const order = initialData?.order;
  const orderId = initialData?.orderId;
  const orderState = order?.state;
  const fulfillmentState = order?.fulfillment_status || "PROPOSED";
  const hasPaid = order?.has_payment;
  const pickupTime = order?.pickup_time;
  const isOrderActive = orderState !== "COMPLETED" && fulfillmentState !== "CANCELED";

  // Auto-refresh effect for active orders
  useEffect(() => {
    if (!order || !isOrderActive) return;
    
    const interval = setInterval(() => {
      router.refresh();
    }, AUTO_REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [order, isOrderActive, router]);

  // Redirect effect for unpaid/draft orders
  useEffect(() => {
    if (!order) return;
    
    if (!hasPaid || orderState === "DRAFT") {
      router.push("/menu/order");
    }
  }, [order, hasPaid, orderState, router]);

  // Handler functions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), REFRESH_BUTTON_DELAY);
  };
  
  // Helper function to get status configuration
  const getStatusConfig = (fulfillmentState, orderState) => {
    if (fulfillmentState === "RESERVED") {
      return {
        icon: "fa-fire",
        title: "We're preparing your food!",
        message: "Our kitchen is preparing your order right now. Stay on this page to know when it's ready for pickup.",
        color: "yellow",
        showPickupTime: true,
      };
    }

    if (fulfillmentState === "PREPARED") {
      return {
        icon: "fa-check-circle",
        title: "Your order is ready!",
        message: "Come and get it! Your fresh meal is packed and waiting for you.",
        color: "hot-pink",
        showPickupTime: true,
      };
    }
    
    if (fulfillmentState === "CANCELED") {
      return {
        icon: "fa-times-circle",
        title: "Order canceled",
        message: "This order has been canceled. You will be refunded shortly. Contact us if you have questions.",
        color: "yellow",
        showPickupTime: false,
      };
    }
    
    if (orderState === "COMPLETED") {
      return {
        icon: "fa-check",
        title: "Order completed",
        message: "Thank you for your order! We hope you enjoyed your meal.",
        color: "hot-pink",
        showPickupTime: false,
      };
    }

    // Default: PROPOSED
    return {
      icon: "fa-clock",
      title: "We got your order!",
      message: "Your order is in! We'll start preparing shortly. This page will update automatically as your order progresses.",
      color: "yellow",
      showPickupTime: true,
    };
  };

  // Early returns for error states
  if (!initialData) {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-yellow">
          <div className="mb-4">
            <i className="fas fa-search text-yellow text-7xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No order ID provided
          </h1>
          <Link
            href="/menu/order"
            className="block w-full bg-hot-pink text-white py-4 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-bold text-lg"
          >
            Back to order
          </Link>
        </div>
      </div>
    );
  }

  if (initialData.error === "not_found") {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-hot-pink">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-hot-pink text-7xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order not found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this order. Please check your order ID and try again.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">
              Order ID: {orderId}
            </p>
            <Link
              href="/contact"
              className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-semibold"
            >
              Contact support
            </Link>
            <Link
              href="/menu/order"
              className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold"
            >
              Back to order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format pickup time
  const formattedPickupTime = pickupTime 
    ? new Date(pickupTime).toLocaleString("en-GB", {
        timeZone: "Europe/London",
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const statusConfig = getStatusConfig(fulfillmentState, orderState);

  // Main render
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
          <p className="text-md text-gray-600 mb-4">
            {statusConfig.message}
          </p>
          
          {statusConfig.showPickupTime && formattedPickupTime && (
            <div className="bg-gradient-to-r from-hot-pink/10 to-yellow/10 border border-hot-pink rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-center">
                <i className="fas fa-clock mr-2"></i>
                Pickup time
              </p>
              <p className="text-base font-bold text-hot-pink">{formattedPickupTime}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block mb-4">
            Order ID: {orderId}
          </p>
          
          {/* Auto-refresh indicator - only show for active orders */}
          {isOrderActive && (
            <p className="text-xs text-gray-500 mb-3">
              <i className="fas fa-sync-alt mr-1 text-yellow"></i>
              Auto-refreshing every 30 seconds
            </p>
          )}
          
          {/* Refresh Button - only show for active orders */}
          {isOrderActive && (
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
                  Refresh now
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
            View order details
          </Link>
          <Link
            href="/menu/order"
            className="block w-full bg-hot-pink text-white py-4 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors text-center font-bold text-lg"
          >
            Back to menu order
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors text-center font-semibold"
          >
            Back to home
          </Link>
          {isOrderActive && (
            <Link
              href="/contact"
              className="block w-full border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg hover:border-hot-pink hover:text-hot-pink transition-colors text-center font-semibold"
            >
              Need help?
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
