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
import { TOASTER_CONFIG, TOAST_MESSAGES } from "@/lib/constants";
import { useCartMutation } from "@/hooks/useCartMutation";
import { addToCartEntry, removeFromCartEntry, removeEntireCartEntry } from "@/lib/cartOperations";
import { rehydrateCartFromOrder } from "@/lib/cartUtils";

export default function OrderMenuClient({ menuData, restaurantStatus }) {
    const router = useRouter();
    const [cart, setCart] = useState({}); // { variationId: quantity }
    const [orderId, setOrderId] = useState(null);
    const [version, setVersion] = useState(null);
    const [orderInitError, setOrderInitError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaidOrder, setIsPaidOrder] = useState(false); // Flag for already paid orders
    const [isMounted, setIsMounted] = useState(false);

    // Initialize cart mutation hook
    const { executeMutation, updatingItems } = useCartMutation(
        cart,
        setCart,
        version,
        setVersion,
        orderId,
        updateOrderItems
    );

    const { isOpen, nextOpenDate, overrideActive } = restaurantStatus;
    
    // Check if restaurant is "closed until further notice"
    const isClosedIndefinitely = !nextOpenDate && overrideActive;

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
                toast.error(createError || TOAST_MESSAGES.ORDER_INIT_FAILED);
                setOrderInitError(createError || "Failed to initialize order.");
            }
        } catch (err) {
            // Capture order initialization errors
            if (process.env.NODE_ENV === "production") {
                Sentry.captureException(err, {
                    tags: { component: "OrderMenuClient", action: "initialize" }
                });
            }
            toast.error(TOAST_MESSAGES.ORDER_INIT_FAILED);
            setOrderInitError("Failed to initialize order.");
        } finally {
            setIsInitializing(false);
        }
    };



    const addItem = async (variationId, modifiers = undefined) => {
        // Compute new cart state using utility function
        const computeNewCart = (currentCart) => {
            const newCart = { ...currentCart };
            newCart[variationId] = addToCartEntry(newCart[variationId], modifiers);
            return newCart;
        };
        
        // Execute mutation using the hook
        await executeMutation(variationId, computeNewCart, TOAST_MESSAGES.CART_ITEM_ADDED);
    };

    const removeItem = async (variationId, modifiers = undefined) => {
        // Guard: don't remove if item doesn't exist in cart
        if (!cart[variationId]) return;
        
        // Compute new cart state using utility function
        const computeNewCart = (currentCart) => {
            const newCart = { ...currentCart };
            const updatedValue = removeFromCartEntry(newCart[variationId], modifiers);
            
            if (updatedValue === null) {
                delete newCart[variationId];
            } else {
                newCart[variationId] = updatedValue;
            }
            
            return newCart;
        };
        
        // Execute mutation using the hook
        await executeMutation(variationId, computeNewCart, TOAST_MESSAGES.CART_ITEM_REMOVED);
    };

    const removeItemCompletely = async (variationId, modifiers = undefined) => {
        // Guard: don't remove if item doesn't exist in cart
        if (!cart[variationId]) return;
        
        // Compute new cart state using utility function
        const computeNewCart = (currentCart) => {
            const newCart = { ...currentCart };
            const updatedValue = removeEntireCartEntry(newCart[variationId], modifiers);
            
            if (updatedValue === null) {
                delete newCart[variationId];
            } else {
                newCart[variationId] = updatedValue;
            }
            
            return newCart;
        };
        
        // Execute mutation using the hook
        await executeMutation(variationId, computeNewCart, TOAST_MESSAGES.CART_ITEM_REMOVED);
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
                toast.success(TOAST_MESSAGES.CART_CLEARED);
            } else {
                toast.error(createError || TOAST_MESSAGES.ORDER_CREATE_FAILED, { duration: 10000 });
            }
        } catch (err) {
            // Capture cart clear errors
            if (process.env.NODE_ENV === "production") {
                Sentry.captureException(err, {
                    tags: { component: "OrderMenuClient", action: "clear_cart" },
                    contexts: { cart: { order_id: orderId } }
                });
            }
            toast.error(TOAST_MESSAGES.ORDER_CLEAR_FAILED, { duration: 10000 });
        }
    };

    const handleCheckout = () => {
        if (!orderId) return;
        
        // Add Sentry breadcrumb for proceed to checkout
        if (process.env.NODE_ENV === "production") {
            Sentry.addBreadcrumb({
                message: "Proceed to checkout clicked",
                category: "cart",
                level: "info",
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
                    addItem={(isPaidOrder || isClosedIndefinitely) ? () => {} : addItem}
                    removeItem={(isPaidOrder || isClosedIndefinitely) ? () => {} : removeItem}
                    updatingItems={updatingItems}
                    isOrderMode={!isClosedIndefinitely}
                />
            </div>

            {/* Sticky Cart Summary - Hide when paid order or closed indefinitely */}
            {!isPaidOrder && !isClosedIndefinitely && (
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
            
            <Toaster {...TOASTER_CONFIG} />
        </>
    );
}
