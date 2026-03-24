"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ConfirmationClient({ orderId, status, order }) {
  // Clear localStorage on mount for completed or canceled orders
  useEffect(() => {
    if (status === "completed" || status === "canceled") {
      localStorage.removeItem("order");
    }
  }, [status]);

  if (status === "canceled") {
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
            Order Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your order has been cancelled. If you didn&apos;t cancel this order, please contact support.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <Link
              href="/menu/order"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Order
            </Link>
            <Link
              href="/contact"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "completed") {
    // Calculate order total
    const totalMoney = order.total_money;
    const formattedTotal = totalMoney
      ? `£${(totalMoney.amount / 100).toFixed(2)}`
      : "N/A";
    
    // Extract pickup time from fulfillments
    const pickupFulfillment = order.fulfillments?.find(f => f.type === "PICKUP");
    const pickupTime = pickupFulfillment?.pickup_details?.pickup_at;
    const formattedPickupTime = pickupTime 
      ? new Date(pickupTime).toLocaleString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-20 w-20 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We&apos;ll start preparing it right away.
            </p>
            {formattedPickupTime && (
              <div className="bg-hot-pink/10 border border-hot-pink rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Pickup Time</p>
                <p className="text-lg font-bold text-hot-pink">{formattedPickupTime}</p>
              </div>
            )}
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            {/* Line Items */}
            {order.line_items && order.line_items.length > 0 ? (
              <div className="space-y-4 mb-6">
                {order.line_items.map((item, index) => {
                  const itemTotal = item.total_money;
                  const formattedItemTotal = itemTotal
                    ? `£${(itemTotal.amount / 100).toFixed(2)}`
                    : "N/A";

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.name || "Item"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        {item.variation_name && (
                          <p className="text-sm text-gray-500">
                            {item.variation_name}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 ml-4">
                        {formattedItemTotal}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No items in order</p>
            )}

            {/* Total */}
            <div className="pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-900">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formattedTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/menu/order"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Order Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
