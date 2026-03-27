"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrderFromStorage } from "@/lib/storage";

/**
 * Client component that validates orderId from URL against localStorage
 * Redirects if localStorage has a different orderId (localStorage is source of truth)
 * 
 * @param {Object} props
 * @param {string} props.currentPath - The current page path (e.g., "/menu/order/payment")
 * @param {React.ReactNode} props.children - The page content to render
 */
export default function OrderIdValidator({ currentPath, children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId");
  
  const [validationState, setValidationState] = useState("validating"); // "validating" | "valid" | "mismatch"
  const [correctOrderId, setCorrectOrderId] = useState(null);

  useEffect(() => {
    // Get orderId from localStorage
    const storedOrder = getOrderFromStorage();
    const storageOrderId = storedOrder?.orderId;

    // If localStorage has an orderId
    if (storageOrderId) {
      // If URL orderId is different or missing, show error and redirect
      if (urlOrderId !== storageOrderId) {
        setCorrectOrderId(storageOrderId);
        setValidationState("mismatch");
        
        // Auto-redirect after 3 seconds
        const timer = setTimeout(() => {
          router.replace(`${currentPath}?orderId=${storageOrderId}`);
        }, 15000);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Valid state - orderId matches or no localStorage orderId (external link)
    setValidationState("valid");
  }, [urlOrderId, currentPath, router]);

  // Show loading state while validating
  if (validationState === "validating") {
    return (
      <div className="fixed inset-0 bg-[#fffef9] flex flex-col items-center justify-center z-50">
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-hot-pink/20 to-yellow/20 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-receipt text-hot-pink text-4xl"></i>
          </div>
        </div>
        <div className="w-16 h-16 border-4 border-hot-pink border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-bold text-hot-pink">Validating order...</p>
      </div>
    );
  }

  // Show mismatch error with redirect countdown
  if (validationState === "mismatch") {
    return (
      <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-yellow">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-yellow text-6xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Old Order Detected
          </h1>
          <p className="text-gray-600 mb-4">
            You&apos;re trying to view an old order, but you have an active order in progress.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you to your current order in 15 seconds...
          </p>
          
          <div className="space-y-3">
            <Link
              href="/menu/order"
              className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold"
            >
              Back to Menu
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Current Order ID: {correctOrderId?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Valid state - render children
  return <>{children}</>;
}
