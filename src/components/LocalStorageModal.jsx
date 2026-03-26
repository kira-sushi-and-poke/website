"use client";

import { useState, useEffect } from "react";
import { isLocalStorageAvailable } from "@/lib/storage";

export default function LocalStorageModal() {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once when component mounts
    if (!hasChecked && !isLocalStorageAvailable()) {
      setShowModal(true);
      setHasChecked(true);
    }
  }, [hasChecked]);

  const handleRetry = () => {
    if (isLocalStorageAvailable()) {
      setShowModal(false);
      window.location.reload(); // Refresh to continue normal flow
    } else {
      alert("Storage is still disabled. Please check your browser settings.");
    }
  };

  const handleContinue = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <svg
            className="h-16 w-16 text-yellow-500"
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Browser Storage Required
        </h2>

        {/* Message */}
        <div className="text-gray-600 mb-6 space-y-3">
          <p>
            We use browser storage to track your order and keep your cart items saved.
          </p>
          <p className="text-sm">
            Your browser storage appears to be disabled or blocked. This might be because:
          </p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>You&apos;re using private/incognito mode</li>
            <li>Browser storage is disabled in settings</li>
            <li>A browser extension is blocking storage</li>
          </ul>
        </div>

        {/* What we store */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">What we store:</strong> Only your order ID and version number to track your order status. No personal information is stored.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-semibold"
          >
            I&apos;ve Enabled Storage - Retry
          </button>
          <button
            onClick={handleContinue}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Without Tracking
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Without storage enabled, you won&apos;t be able to track your order or keep items in your cart.
        </p>
      </div>
    </div>
  );
}
