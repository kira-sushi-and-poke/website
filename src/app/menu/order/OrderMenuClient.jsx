"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import MenuList from "@/components/MenuList";
import CategoryNavigation from "../CategoryNavigation";
import AllergenNotice from "../AllergenNotice";
import { createOrder, getOrder, updateOrderItems } from "./actions";
import StickyCartSummary from "./StickyCartSummary";
import LocalStorageModal from "@/components/LocalStorageModal";
import { getOrderFromStorage, saveOrderToStorage, clearOrderFromStorage } from "@/lib/storage";

export default function OrderMenuClient({ menuData, restaurantStatus }) {
    const router = useRouter();
    const [cart, setCart] = useState({}); // { variationId: quantity }
    const [orderId, setOrderId] = useState(null);
    const [version, setVersion] = useState(null);
    const [orderInitError, setOrderInitError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaidOrder, setIsPaidOrder] = useState(false); // Flag for already paid orders
    const [isMounted, setIsMounted] = useState(false);

    const { isOpen } = restaurantStatus;

    // Set mounted state to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize order after mount to avoid hydration issues with localStorage
    // Skip initialization if restaurant is closed
    useEffect(() => {
        if (!isMounted) return;

        // If closed, just stop initializing to show the modal
        if (!isOpen) {
            setIsInitializing(false);
            return;
        }

        initializeOrder();
    }, [isMounted, isOpen]);

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
                toast.error(createError || "Failed to initialize order. Please refresh the page.");
                setOrderInitError(createError || "Failed to initialize order.");
            }
        } catch (err) {
            toast.error("Failed to initialize order. Please refresh the page.");
            setOrderInitError("Failed to initialize order.");
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
                toast.success("Item added to the cart");
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                toast.error("Cart was modified elsewhere. Please refresh the page to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                toast.error(result.error || "Failed to update cart", { duration: 10000 });
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            toast.error("Failed to update cart", { duration: 10000 });
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
                toast.success("Item removed from the cart");
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                toast.error("Cart was modified elsewhere. Please refresh the page to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                toast.error(result.error || "Failed to update cart", { duration: 10000 });
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            toast.error("Failed to update cart", { duration: 10000 });
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
                toast.success("Item removed from the cart");
            } else if (result.isConflict) {
                // Conflict detected - revert optimistic update
                setCart(cart);
                toast.error("Cart was modified elsewhere. Please refresh the page to see the latest.");
            } else {
                // Revert optimistic update
                setCart(cart);
                toast.error(result.error || "Failed to update cart", { duration: 10000 });
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            toast.error("Failed to update cart", { duration: 10000 });
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
                toast.success("Cart cleared. Starting fresh order.");
            } else {
                toast.error(createError || "Failed to create new order", { duration: 10000 });
            }
        } catch (err) {
            toast.error("Failed to clear cart", { duration: 10000 });
        }
    };

    const handleCheckout = () => {
        if (!orderId) return;
        
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

    // Show closed modal immediately if restaurant is closed (don't wait for initialization)
    if (!isOpen) {
        return (
            <>
                <LocalStorageModal />
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full relative">
                        <div className="text-center mb-6">
                            <div className="mx-auto h-16 w-16 bg-yellow/20 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-moon text-yellow text-4xl"></i>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-hot-pink mb-3">
                                Sorry, We're Closed Now
                            </h2>
                            <p className="text-gray-700 mb-4">
                                You can still view our menu, but you'll have to wait until we're open to place an order.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Link
                                href="/menu/view"
                                className="bg-hot-pink text-white py-3 px-6 rounded-lg hover:bg-hot-pink/90 transition-colors text-center font-semibold"
                            >
                                View Menu
                            </Link>
                        </div>
                    </div>
                </div>
            </>
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

            {/* Paid Order Banner */}
            {isPaidOrder && (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <svg
                            className="h-6 w-6 md:h-8 md:w-8 text-green-600 shrink-0"
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
                        <h3 className="text-base md:text-lg font-bold text-green-900">
                            Order In Progress
                        </h3>
                    </div>
                    <p className="text-sm md:text-base text-green-800 mb-2 md:mb-3">
                        You have an order that is currently in progress. Track your order status below or start a new order.
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        <Link
                            href={`/menu/order/track?orderId=${orderId}`}
                            className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-sm md:text-base"
                        >
                            View Order Status
                        </Link>
                        <button
                            onClick={clearCart}
                            className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                        >
                            Start New Order
                        </button>
                    </div>
                </div>
            )}

            {/* Add padding to bottom if cart has items - extra space for collapsed cart */}
            <div className={Object.keys(cart).length > 0 && isOpen ? "pb-24 md:pb-28" : ""}>
                <AllergenNotice />
                <CategoryNavigation />
                <MenuList 
                    menuItems={menuData} 
                    cart={cart}
                    addItem={(isPaidOrder || !isOpen) ? () => {} : addItem}
                    removeItem={(isPaidOrder || !isOpen) ? () => {} : removeItem}
                    updatingItems={updatingItems}
                    isOrderMode={true}
                />
            </div>

            {/* Sticky Cart Summary - Hide when closed or paid order */}
            {!isPaidOrder && isOpen && (
                <StickyCartSummary 
                    cart={cart}
                    menuData={menuData}
                    addItem={addItem}
                    removeItem={removeItem}
                    removeItemCompletely={removeItemCompletely}
                    clearCart={clearCart}
                    updatingItems={updatingItems}
                    onCheckout={handleCheckout}
                />
            )}
            
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
        </>
    );
}
