"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrder } from "@/app/menu/order/actions";
import ConfirmationClient from "@/app/menu/order/confirmation/ConfirmationClient";
import { getOrderFromStorage } from "@/lib/storage";

export default function TrackOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Get orderId from localStorage
        const storedOrder = getOrderFromStorage();
        
        if (!storedOrder) {
          setError("no_order");
          setLoading(false);
          return;
        }

        const { orderId } = storedOrder;

        if (!orderId) {
          setError("no_order");
          setLoading(false);
          return;
        }

        // Fetch order from Square
        const { success, order } = await getOrder(orderId);

        if (!success || !order) {
          setError("not_found");
          setOrderData({ orderId });
          setLoading(false);
          return;
        }

        setOrderData({ orderId, order });
        setLoading(false);
      } catch (err) {
        setError("fetch_failed");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
    );
  }

  if (error === "no_order") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Order Found
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have any recent orders. Place an order to track it here.
          </p>
          <a
            href="/menu/order"
            className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors"
          >
            Place Order
          </a>
        </div>
      </div>
    );
  }

  if (error === "not_found" || error === "fetch_failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find this order. Please check your Order ID and try again.
          </p>
          <div className="space-y-3">
            {orderData?.orderId && (
              <p className="text-sm text-gray-500">Order ID: {orderData.orderId}</p>
            )}
            <a
              href="/contact"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/menu/order"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Place New Order
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { orderId, order } = orderData;

  // Handle different order states
  const orderState = order.state;
  const hasPaid = order.has_payment; // Safe flag from sanitizeOrderForClient

  // DRAFT - not yet paid
  if (orderState === "DRAFT") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Pending
          </h1>
          <p className="text-gray-600 mb-6">
            This order hasn&apos;t been paid yet. Please complete payment to track your order.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <a
              href={`/menu/order/payment?orderId=${orderId}`}
              className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors"
            >
              Complete Payment
            </a>
          </div>
        </div>
      </div>
    );
  }

  // OPEN without payment - payment failed/abandoned
  if (orderState === "OPEN" && !hasPaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Required
          </h1>
          <p className="text-gray-600 mb-6">
            This order needs payment to be completed. Please retry payment to proceed.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <a
              href={`/menu/order/payment?orderId=${orderId}`}
              className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors"
            >
              Retry Payment
            </a>
          </div>
        </div>
      </div>
    );
  }

  // OPEN or COMPLETED with payment - show order details
  if ((orderState === "OPEN" && hasPaid) || orderState === "COMPLETED") {
    return (
      <ConfirmationClient
        orderId={orderId}
        status="completed"
        order={order}
      />
    );
  }

  // CANCELED
  if (orderState === "CANCELED") {
    return (
      <ConfirmationClient
        orderId={orderId}
        status="canceled"
        order={null}
      />
    );
  }

  // Unknown state - redirect
  router.push("/");
  return null;
}
