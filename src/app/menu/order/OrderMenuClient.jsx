"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import * as Sentry from '@sentry/nextjs';
import MenuList from "@/components/MenuList";
import CategoryNavigation from "../CategoryNavigation";
import AllergenNotice from "../AllergenNotice";
import { createOrder, getOrder, updateOrderItems } from "./actions";
import StickyCartSummary from "./StickyCartSummary";
import LocalStorageModal from "@/components/LocalStorageModal";
import PreOrderBanner from "@/components/PreOrderBanner";
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
    useEffect(() => {
        if (!isMounted) return;

        initializeOrder();
    }, [isMounted]);

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
            // Capture order initialization errors
            if (process.env.NODE_ENV === 'production') {
                Sentry.captureException(err, {
                    tags: { component: 'OrderMenuClient', action: 'initialize' }
                });
            }
            toast.error("Failed to initialize order. Please refresh the page.");
            setOrderInitError("Failed to initialize order.");
        } finally {
            setIsInitializing(false);
        }
    };

    const rehydrateCartFromOrder = (order) => {
        if (!order.line_items) return {};
        
        const cart = {};
        
        order.line_items.forEach(item => {
            if (!item.catalog_object_id) return;
            
            const variationId = item.catalog_object_id;
            const quantity = parseInt(item.quantity);
            const modifiers = item.modifiers?.map(m => m.catalog_object_id) || [];
            
            // If no modifiers, store as simple number (backward compatible)
            if (modifiers.length === 0) {
                cart[variationId] = (cart[variationId] || 0) + quantity;
            } else {
                // If has modifiers, store as array
                if (!cart[variationId]) {
                    cart[variationId] = [];
                } else if (typeof cart[variationId] === 'number') {
                    // Convert existing number to array
                    cart[variationId] = [];
                }
                
                cart[variationId].push({ quantity, modifiers });
            }
        });
        
        return cart;
    };

    const addItem = async (variationId, modifiers = undefined) => {
        if (!orderId || updatingItems.has(variationId)) return;
        
        // Optimistically update cart
        const newCart = { ...cart };
        
        // If no modifiers, simple increment (existing behavior)
        if (!modifiers || modifiers.length === 0) {
            if (typeof newCart[variationId] === 'number' || !newCart[variationId]) {
                newCart[variationId] = (newCart[variationId] || 0) + 1;
            } else {
                // Cart has array (modifiers), but adding without modifiers
                // Add to array with empty modifiers
                newCart[variationId] = Array.isArray(newCart[variationId]) ? [...newCart[variationId]] : [];
                const existingIndex = newCart[variationId].findIndex(entry => entry.modifiers.length === 0);
                if (existingIndex >= 0) {
                    newCart[variationId][existingIndex] = {
                        ...newCart[variationId][existingIndex],
                        quantity: newCart[variationId][existingIndex].quantity + 1
                    };
                } else {
                    newCart[variationId].push({ quantity: 1, modifiers: [] });
                }
            }
        } else {
            // Has modifiers - use array structure
            if (!newCart[variationId] || typeof newCart[variationId] === 'number') {
                newCart[variationId] = [];
            } else {
                newCart[variationId] = [...newCart[variationId]];
            }
            
            // Find matching modifiers entry
            const modifiersMatch = (a, b) => 
                a.length === b.length && a.every(id => b.includes(id));
            
            const existingIndex = newCart[variationId].findIndex(entry => 
                modifiersMatch(entry.modifiers, modifiers)
            );
            
            if (existingIndex >= 0) {
                // Increment existing entry
                newCart[variationId][existingIndex] = {
                    ...newCart[variationId][existingIndex],
                    quantity: newCart[variationId][existingIndex].quantity + 1
                };
            } else {
                // Create new entry
                newCart[variationId].push({ quantity: 1, modifiers });
            }
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

    const removeItem = async (variationId, modifiers = undefined) => {
        if (!orderId || !cart[variationId] || updatingItems.has(variationId)) return;
        
        // Optimistically update cart
        const newCart = { ...cart };
        
        // Handle simple number case (no modifiers)
        if (typeof newCart[variationId] === 'number') {
            newCart[variationId] = Math.max(0, newCart[variationId] - 1);
            if (newCart[variationId] === 0) {
                delete newCart[variationId];
            }
        } else if (Array.isArray(newCart[variationId])) {
            // Handle array case (with modifiers)
            newCart[variationId] = [...newCart[variationId]];
            
            if (!modifiers || modifiers.length === 0) {
                // Remove from entry without modifiers
                const existingIndex = newCart[variationId].findIndex(entry => entry.modifiers.length === 0);
                if (existingIndex >= 0) {
                    newCart[variationId][existingIndex] = {
                        ...newCart[variationId][existingIndex],
                        quantity: newCart[variationId][existingIndex].quantity - 1
                    };
                    
                    if (newCart[variationId][existingIndex].quantity <= 0) {
                        newCart[variationId].splice(existingIndex, 1);
                    }
                }
            } else {
                // Remove from entry with matching modifiers
                const modifiersMatch = (a, b) => 
                    a.length === b.length && a.every(id => b.includes(id));
                
                const existingIndex = newCart[variationId].findIndex(entry => 
                    modifiersMatch(entry.modifiers, modifiers)
                );
                
                if (existingIndex >= 0) {
                    newCart[variationId][existingIndex] = {
                        ...newCart[variationId][existingIndex],
                        quantity: newCart[variationId][existingIndex].quantity - 1
                    };
                    
                    if (newCart[variationId][existingIndex].quantity <= 0) {
                        newCart[variationId].splice(existingIndex, 1);
                    }
                }
            }
            
            // Remove key if array is empty
            if (newCart[variationId].length === 0) {
                delete newCart[variationId];
            }
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

    const removeItemCompletely = async (variationId, modifiers = undefined) => {
        if (!orderId || !cart[variationId] || updatingItems.has(variationId)) return;
        
        // Optimistically remove item from cart
        const newCart = { ...cart };
        
        // If value is number, delete completely
        if (typeof newCart[variationId] === 'number') {
            delete newCart[variationId];
        }
        // If value is array and modifiers specified, remove only matching entry
        else if (Array.isArray(newCart[variationId]) && modifiers) {
            newCart[variationId] = [...newCart[variationId]];
            const modifiersMatch = (a, b) => 
                a.length === b.length && a.every(id => b.includes(id));
            
            const existingIndex = newCart[variationId].findIndex(entry => 
                modifiersMatch(entry.modifiers, modifiers)
            );
            
            if (existingIndex >= 0) {
                newCart[variationId].splice(existingIndex, 1);
            }
            
            // Remove key if array is empty
            if (newCart[variationId].length === 0) {
                delete newCart[variationId];
            }
        }
        // If no modifiers specified, delete completely
        else {
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
            // Capture cart clear errors
            if (process.env.NODE_ENV === 'production') {
                Sentry.captureException(err, {
                    tags: { component: 'OrderMenuClient', action: 'clear_cart' },
                    contexts: { cart: { order_id: orderId } }
                });
            }
            toast.error("Failed to clear cart", { duration: 10000 });
        }
    };

    const handleCheckout = () => {
        if (!orderId) return;
        
        // Add Sentry breadcrumb for proceed to checkout
        if (process.env.NODE_ENV === 'production') {
            Sentry.addBreadcrumb({
                message: 'Proceed to checkout clicked',
                category: 'cart',
                level: 'info',
                data: {
                    order_id: orderId,
                    item_count: Object.keys(cart).length
                }
            });
        }
        
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

            {/* Pre-order Banner - Show when closed */}
            <PreOrderBanner restaurantStatus={restaurantStatus} />

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
            <div className={Object.keys(cart).length > 0 ? "pb-24 md:pb-28" : ""}>
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

            {/* Sticky Cart Summary - Hide when paid order */}
            {!isPaidOrder && (
                <StickyCartSummary 
                    cart={cart}
                    menuData={menuData}
                    addItem={addItem}
                    removeItem={removeItem}
                    removeItemCompletely={removeItemCompletely}
                    clearCart={clearCart}
                    updatingItems={updatingItems}
                    orderId={orderId}
                    restaurantStatus={restaurantStatus}
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
