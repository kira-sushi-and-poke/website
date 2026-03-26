"use client";

import React from "react";
import Link from "next/link";

export default function ConfirmationClient({ orderId, status, order }) {
  if (status === "canceled") {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-yellow">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-yellow text-6xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            This order has been cancelled and no charges were made. If you need assistance, please contact us.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <Link
              href="/menu/order"
              className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-semibold"
            >
              Start New Order
            </Link>
            <Link
              href="/contact"
              className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold"
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
    
    // Extract pickup time from sanitized order
    const pickupTime = order.pickup_time;
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
      <div className="min-h-screen bg-[#fffef9] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center border-t-4 border-hot-pink">
            <div className="mb-4">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-hot-pink/20 to-yellow/20 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-check-circle text-hot-pink text-5xl"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-hot-pink mb-3">
              Payment Successful!
            </h1>
            <p className="text-base text-gray-600 mb-2">
              Thank you! Your order has been received and we&apos;re preparing your delicious meal.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              You can track your order status <Link href={`/menu/order/track?orderId=${orderId}`} className="text-hot-pink font-semibold underline">here</Link>.
            </p>

            {formattedPickupTime && (
              <div className="bg-gradient-to-r from-hot-pink/10 to-yellow/10 border border-hot-pink rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-center">
                  <i className="fas fa-clock mr-2"></i>
                  Expected Pickup Time
                </p>
                <p className="text-base font-bold text-hot-pink">{formattedPickupTime}</p>
              </div>
            )}
            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">Order ID: {orderId}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-l-4 border-yellow">
            <h2 className="text-2xl font-bold text-hot-pink mb-6 flex items-center">
              <i className="fas fa-shopping-cart mr-2"></i>
              Your Order
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
            <div className="pt-4 border-t-2 border-hot-pink">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-900">Total</p>
                <p className="text-2xl font-bold text-hot-pink">
                  {formattedTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Track Order Link */}
            <Link
              href={`/menu/order/track?orderId=${orderId}`}
              className="block w-full bg-gradient-to-r from-hot-pink to-yellow text-white py-4 px-4 rounded-lg hover:opacity-90 transition-opacity text-center font-bold text-lg"
            >
              <i className="fas fa-search mr-2"></i>
              Track Order Status
            </Link>
            
            <Link
              href="/menu/order"
              className="block w-full bg-hot-pink text-white py-4 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors text-center font-bold text-lg"
            >
              Place Another Order
            </Link>
            <Link
              href="/"
              className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors text-center font-semibold"
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
