"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuList from "@/components/MenuList";
import CategoryNavigation from "../CategoryNavigation";
import AllergenNotice from "../AllergenNotice";
import { createOrder, getOrder, updateOrderItems } from "./actions";
import StickyCartSummary from "./StickyCartSummary";

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

    // Initialize order on mount
    useEffect(() => {
        initializeOrder();
    }, []);

    // Navigation protection - Desktop (beforeunload)
    useEffect(() => {
        const hasItems = Object.keys(cart).length > 0;
        
        if (!hasItems) return;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ""; // Required for Chrome
            return ""; // Required for some browsers
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [cart]);

    // Navigation protection - Mobile Safari (visibilitychange)
    useEffect(() => {
        const hasItems = Object.keys(cart).length > 0;
        
        if (!hasItems) return;

        const handleVisibilityChange = () => {
            if (document.hidden && hasItems) {
                // Note: On mobile, this fires for tab switches, backgrounding, and screen lock
                // The order persists in Square, so data loss risk is low
                // User can resume order when they return to /menu/order
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [cart]);

    const initializeOrder = async () => {
        try {
            // Check localStorage for existing order
            const storedOrder = localStorage.getItem("order");
            
            if (storedOrder) {
                const { orderId: existingOrderId, version: existingVersion } = JSON.parse(storedOrder);
                
                // Fetch order from Square to check current state
                const { success, order, error: fetchError } = await getOrder(existingOrderId);
                
                if (success && order) {
                    const orderState = order.state;
                    
                    if (orderState === "DRAFT" || orderState === "OPEN") {
                        // Reuse order and rehydrate cart
                        setOrderId(order.id);
                        setVersion(order.version);
                        
                        // Rehydrate cart from line items
                        const rehydratedCart = {};
                        if (order.line_items) {
                            order.line_items.forEach(item => {
                                if (item.catalog_object_id) {
                                    rehydratedCart[item.catalog_object_id] = parseInt(item.quantity);
                                }
                            });
                        }
                        setCart(rehydratedCart);
                        
                        // Show order summary modal automatically if state is OPEN
                        if (orderState === "OPEN") {
                            setShowOrderModal(true);
                        }
                        
                        setIsInitializing(false);
                        return;
                    } else if (orderState === "COMPLETED" || orderState === "CANCELED") {
                        // Clear localStorage and create fresh draft
                        localStorage.removeItem("order");
                    }
                }
            }
            
            // Create new draft order
            const { success, orderId: newOrderId, version: newVersion, error: createError } = await createOrder();
            
            if (success) {
                setOrderId(newOrderId);
                setVersion(newVersion);
                localStorage.setItem("order", JSON.stringify({ 
                    orderId: newOrderId, 
                    version: newVersion 
                }));
            } else {
                setOrderInitError(createError || "Failed to initialize order. Please refresh the page.");
            }
        } catch (err) {
            setOrderInitError("Failed to initialize order. Please refresh the page.");
        } finally {
            setIsInitializing(false);
        }
    };

    const rehydrateCartFromOrder = (order) => {
        const rehydratedCart = {};
        if (order.line_items) {
            order.line_items.forEach(item => {
                if (item.catalog_object_id) {
                    rehydratedCart[item.catalog_object_id] = parseInt(item.quantity);
                }
            });
        }
        return rehydratedCart;
    };

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
                localStorage.setItem("order", JSON.stringify({ 
                    orderId, 
                    version: result.version 
                }));
            } else if (result.isConflict) {
                // Re-fetch order to sync
                const { success, order } = await getOrder(orderId);
                if (success && order) {
                    setVersion(order.version);
                    setCart(rehydrateCartFromOrder(order));
                    localStorage.setItem("order", JSON.stringify({ 
                        orderId, 
                        version: order.version 
                    }));
                }
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
        
        console.log("Removing item, new cart:", newCart);
        setCart(newCart);
        
        // Mark item as updating
        setUpdatingItems(prev => new Set(prev).add(variationId));
        
        try {
            const result = await updateOrderItems(orderId, version, newCart);
            
            if (result.success) {
                // Update version in state and localStorage
                setVersion(result.version);
                localStorage.setItem("order", JSON.stringify({ 
                    orderId, 
                    version: result.version 
                }));
            } else if (result.isConflict) {
                // Re-fetch order to sync
                const { success, order } = await getOrder(orderId);
                if (success && order) {
                    setVersion(order.version);
                    setCart(rehydrateCartFromOrder(order));
                    localStorage.setItem("order", JSON.stringify({ 
                        orderId, 
                        version: order.version 
                    }));
                }
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
                localStorage.setItem("order", JSON.stringify({ 
                    orderId, 
                    version: result.version 
                }));
            } else if (result.isConflict) {
                // Re-fetch order to sync
                const { success, order } = await getOrder(orderId);
                if (success && order) {
                    setVersion(order.version);
                    setCart(rehydrateCartFromOrder(order));
                    localStorage.setItem("order", JSON.stringify({ 
                        orderId, 
                        version: order.version 
                    }));
                }
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
        
        // Mark all items as updating
        const allVariationIds = Object.keys(cart);
        setUpdatingItems(prev => new Set([...prev, ...allVariationIds]));
        
        // Optimistically clear cart
        const emptyCart = {};
        setCart(emptyCart);
        
        try {
            const result = await updateOrderItems(orderId, version, emptyCart);
            
            if (result.success) {
                // Update version in state and localStorage
                setVersion(result.version);
                localStorage.setItem("order", JSON.stringify({ 
                    orderId, 
                    version: result.version 
                }));
            } else if (result.isConflict) {
                // Re-fetch order to sync
                const { success, order } = await getOrder(orderId);
                if (success && order) {
                    setVersion(order.version);
                    setCart(rehydrateCartFromOrder(order));
                    localStorage.setItem("order", JSON.stringify({ 
                        orderId, 
                        version: order.version 
                    }));
                }
            } else {
                // Revert optimistic update
                setCart(cart);
                setError(result.error || "Failed to clear cart");
            }
        } catch (err) {
            // Revert optimistic update
            setCart(cart);
            setError("Failed to clear cart");
        } finally {
            // Remove all updating states
            setUpdatingItems(new Set());
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
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Add padding to bottom if cart has items - extra space for collapsed cart */}
            <div className={Object.keys(cart).length > 0 ? "pb-28" : ""}>
                <AllergenNotice />
                <CategoryNavigation />
                <MenuList 
                    menuItems={menuData} 
                    cart={cart}
                    addItem={addItem}
                    removeItem={removeItem}
                    updatingItems={updatingItems}
                    isOrderMode={true}
                />
            </div>

            {/* Sticky Cart Summary */}
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
        </>
    );
}
