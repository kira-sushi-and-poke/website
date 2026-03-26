"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MenuList from "@/components/MenuList";
import CategoryNavigation from "../CategoryNavigation";
import AllergenNotice from "../AllergenNotice";
import { createOrder, getOrder, updateOrderItems } from "./actions";
import StickyCartSummary from "./StickyCartSummary";
import LocalStorageModal from "@/components/LocalStorageModal";
import { getOrderFromStorage, saveOrderToStorage, clearOrderFromStorage } from "@/lib/storage";

export default function OrderMenuClient({ menuData }) {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [cart, setCart] = useState({}); // { variationId: quantity }
    const [orderId, setOrderId] = useState(null);
    const [version, setVersion] = useState(null);
    const [orderInitError, setOrderInitError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [isInitializing, setIsInitializing] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isPaidOrder, setIsPaidOrder] = useState(false); // Flag for already paid orders

    // Initialize order on mount
    useEffect(() => {
        initializeOrder();
    }, []);

    const initializeOrder = async () => {
        try {
            // Check localStorage for existing order
            const storedOrder = getOrderFromStorage();
            
            if (storedOrder) {
                const { orderId: existingOrderId, version: existingVersion } = storedOrder;
                
                // Fetch order from Square to check current state
                const { success, order, error: fetchError } = await getOrder(existingOrderId);
                
                if (success && order) {
                    const orderState = order.state;
                    const hasPaid = order.has_payment;
                    
                    // Rehydrate DRAFT orders or OPEN orders (paid or unpaid)
                    if (orderState === "DRAFT" || orderState === "OPEN") {
                        setOrderId(order.id);
                        setVersion(order.version);
                        setCart(rehydrateCartFromOrder(order));
                        
                        // Flag paid OPEN orders as read-only
                        if (orderState === "OPEN" && hasPaid) {
                            setIsPaidOrder(true);
                        }
                        
                        setIsInitializing(false);
                        return;
                    } else {
                        // COMPLETED, CANCELED, or unexpected state - clear and start fresh
                        clearOrderFromStorage();
                    }
                }
            }
            
            // Create new draft order
            const { success, orderId: newOrderId, version: newVersion, error: createError } = await createOrder();
            
            if (success) {
                setOrderId(newOrderId);
                setVersion(newVersion);
                saveOrderToStorage(newOrderId, newVersion);
            } else {
                setOrderInitError(createError || "Failed to initialize order. Please refresh the page.");
            }
        } catch (err) {
            setOrderInitError("Failed to initialize order. Please refresh the page.");
        } finally {
            setIsInitializing(false);
        }
    };

    const rehydrateCartFromOrder = (order) => 
        order.line_items?.reduce((cart, item) => {
            if (item.catalog_object_id) {
                cart[item.catalog_object_id] = parseInt(item.quantity);
            }
            return cart;
        }, {}) ?? {};

    const addItem = async (variationId) => {
        if (!orderId || updatingItems.has(variationId)) return;
        
        // Optimistically update cart
        const newCart = { ...cart };
        newCart[variationId] = (newCart[variationId] || 0) + 1;
        setCart(newCart);
        
        // Mark item as updating
        setUpdatingItems(prev => new Set(prev).add(variationId));
        
        try {
            const result = await updateOrderItems(orderId, version, newCart);
            
            if (result.success) {
                // Update version in state and localStorage
                setVersion(result.version);
                saveOrderToStorage(orderId, result.version);
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                setError("Cart was modified elsewhere. Please refresh to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                setError(result.error || "Failed to update cart");
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            setError("Failed to update cart");
        } finally {
            // Remove updating state
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(variationId);
                return newSet;
            });
        }
    };

    const removeItem = async (variationId) => {
        if (!orderId || !cart[variationId] || updatingItems.has(variationId)) return;
        
        // Optimistically update cart
        const newCart = { ...cart };
        newCart[variationId] = Math.max(0, (newCart[variationId] || 0) - 1);
        
        // Remove from cart if quantity is 0
        if (newCart[variationId] === 0) {
            delete newCart[variationId];
        }
        
        setCart(newCart);
        
        // Mark item as updating
        setUpdatingItems(prev => new Set(prev).add(variationId));
        
        try {
            const result = await updateOrderItems(orderId, version, newCart);
            
            if (result.success) {
                // Update version in state and localStorage
                setVersion(result.version);
                saveOrderToStorage(orderId, result.version);
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                setError("Cart was modified elsewhere. Please refresh to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                setError(result.error || "Failed to update cart");
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            setError("Failed to update cart");
        } finally {
            // Remove updating state
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(variationId);
                return newSet;
            });
        }
    };

    const removeItemCompletely = async (variationId) => {
        if (!orderId || !cart[variationId] || updatingItems.has(variationId)) return;
        
        // Optimistically remove item from cart
        const newCart = { ...cart };
        delete newCart[variationId];
        setCart(newCart);
        
        // Mark item as updating
        setUpdatingItems(prev => new Set(prev).add(variationId));
        
        try {
            const result = await updateOrderItems(orderId, version, newCart);
            
            if (result.success) {
                // Update version in state and localStorage
                setVersion(result.version);
                saveOrderToStorage(orderId, result.version);
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                setError("Cart was modified elsewhere. Please refresh to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                setError(result.error || "Failed to update cart");
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            setError("Failed to update cart");
        } finally {
            // Remove updating state
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(variationId);
                return newSet;
            });
        }
    };

    const clearCart = async () => {
        if (!orderId || Object.keys(cart).length === 0) return;
        
        // Optimistically clear cart and paid order flag
        setCart({});
        setIsPaidOrder(false);
        
        try {
            // Clear localStorage and create new order
            clearOrderFromStorage();
            
            const { success, orderId: newOrderId, version: newVersion, error: createError } = await createOrder();
            
            if (success) {
                setOrderId(newOrderId);
                setVersion(newVersion);
                saveOrderToStorage(newOrderId, newVersion);
            } else {
                setError(createError || "Failed to create new order after clearing cart");
            }
        } catch (err) {
            setError("Failed to clear cart");
        }
    };

    const handleCheckout = () => {
        if (!orderId || isCheckingOut) return;
        
        // Navigate directly to payment page
        router.push(`/menu/order/payment?orderId=${orderId}`);
    };

    if (orderInitError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Unable to Initialize Order</p>
                <p>{orderInitError}</p>
            </div>
        );
    }

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <LocalStorageModal />
            
            {/* Conflict Error Modal */}
            {error && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border-t-4 border-red-500">
                        <div className="mb-4 flex justify-center">
                            <i className="fas fa-exclamation-triangle text-red-500 text-7xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Cart Updated Elsewhere
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            {error}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-bold text-lg flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-sync-alt"></i>
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paid Order Banner */}
            {isPaidOrder && (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <svg
                            className="h-8 w-8 text-green-600 flex-shrink-0"
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
                        <h3 className="text-lg font-bold text-green-900">
                            Order In Progress
                        </h3>
                    </div>
                    <p className="text-green-800 mb-3">
                        You have an order that is currently in progress. Track your order status below or start a new order.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/menu/order/track?orderId=${orderId}`}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
                        >
                            View Order Status
                        </Link>
                        <button
                            onClick={clearCart}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start New Order
                        </button>
                    </div>
                </div>
            )}

            {/* Add padding to bottom if cart has items - extra space for collapsed cart */}
            <div className={Object.keys(cart).length > 0 ? "pb-28" : ""}>
                <AllergenNotice />
                <CategoryNavigation />
                <MenuList 
                    menuItems={menuData} 
                    cart={cart}
                    addItem={isPaidOrder ? () => {} : addItem}
                    removeItem={isPaidOrder ? () => {} : removeItem}
                    updatingItems={updatingItems}
                    isOrderMode={true}
                />
            </div>

            {/* Sticky Cart Summary */}
            {!isPaidOrder && (
                <StickyCartSummary 
                    cart={cart}
                    menuData={menuData}
                    addItem={addItem}
                    removeItem={removeItem}
                    removeItemCompletely={removeItemCompletely}
                    clearCart={clearCart}
                    updatingItems={updatingItems}
                    onCheckout={handleCheckout}
                    isCheckingOut={isCheckingOut}
                />
            )}
        </>
    );
}
