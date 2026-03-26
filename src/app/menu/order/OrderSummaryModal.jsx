"use client";

import React, { useEffect, useState } from "react";

export default function OrderSummaryModal({ 
    isOpen, 
    onClose, 
    cart, 
    menuData, 
    addItem, 
    removeItem,
    removeItemCompletely, 
    updatingItems 
}) {
    const [confirmRemove, setConfirmRemove] = useState(null); // { variationId, name }
    const [isClosing, setIsClosing] = useState(false);
    
    // Auto-close modal when cart becomes empty
    useEffect(() => {
        if (isOpen && Object.keys(cart).length === 0) {
            handleClose();
        }
    }, [cart, isOpen]);

    // Reset closing state when opened
    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Match animation duration
    };

    if (!isOpen && !isClosing) return null;

    const handleDecreaseQuantity = (variationId, currentQuantity, itemName) => {
        if (currentQuantity === 1) {
            // Show confirmation modal
            setConfirmRemove({ variationId, name: itemName });
        } else {
            // Decrease normally
            removeItem(variationId);
        }
    };

    const handleConfirmRemove = () => {
        if (confirmRemove) {
            removeItemCompletely(confirmRemove.variationId);
            setConfirmRemove(null);
        }
    };

    // Calculate order details
    const items = Object.entries(cart).map(([variationId, quantity]) => {
        const menuItem = menuData.find(item => item.variationId === variationId);
        
        // Get image, handling arrays and empty values
        let image = "/images/placeholder.svg";
        if (menuItem?.imageLink) {
            if (Array.isArray(menuItem.imageLink) && menuItem.imageLink.length > 0) {
                image = menuItem.imageLink[0];
            } else if (typeof menuItem.imageLink === "string" && menuItem.imageLink) {
                image = menuItem.imageLink;
            }
        }
        
        return {
            variationId,
            quantity,
            name: menuItem?.name || "Unknown Item",
            price: menuItem?.discountedPrice || menuItem?.originalPrice || 0,
            image,
        };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-50"}`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-hot-pink">Order Summary</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="overflow-y-auto max-h-[50vh] p-6">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => {
                                    const isUpdating = updatingItems.has(item.variationId);
                                    
                                    return (
                                        <div key={item.variationId} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0">
                                            <img 
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.onerror = null; // Prevent infinite loop
                                                    e.target.src = "/images/placeholder.svg";
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    £{item.price.toFixed(2)} each
                                                </p>
                                                
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleDecreaseQuantity(item.variationId, item.quantity, item.name)}
                                                        disabled={isUpdating}
                                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-hot-pink hover:text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    
                                                    <div className="min-w-[40px] text-center">
                                                        {isUpdating ? (
                                                            <div className="inline-block w-4 h-4 border-2 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="font-bold">{item.quantity}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => addItem(item.variationId)}
                                                        disabled={isUpdating}
                                                        className="w-8 h-8 rounded-full bg-hot-pink text-white hover:bg-opacity-90 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-yellow font-bold mb-2">
                                                    £{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => setConfirmRemove({ variationId: item.variationId, name: item.name })}
                                                    disabled={isUpdating}
                                                    className="px-3 py-1.5 rounded text-xs bg-red-100 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                                                    title="Remove item from cart"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer with Total and Action */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-gray-800">Subtotal</span>
                            <span className="text-2xl font-bold text-yellow">£{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                        </div>
                        
                        <div className="bg-yellow/10 border border-yellow rounded-lg p-3 mb-4 flex items-start gap-2">
                            <i className="fas fa-shopping-bag text-yellow text-sm mt-0.5"></i>
                            <p className="text-xs text-gray-700">
                                <strong>Pickup only:</strong> We currently only offer pickup orders. Delivery is not available at this time.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 border-2 border-hot-pink text-hot-pink rounded-lg font-bold hover:bg-hot-pink hover:text-white transition-colors"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => {
                                    // TODO: Implement checkout flow (point 7)
                                    alert("Checkout functionality coming soon!");
                                }}
                                disabled={items.length === 0}
                                className="flex-1 px-6 py-3 bg-hot-pink text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmRemove && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-60 z-50"
                        onClick={() => setConfirmRemove(null)}
                    />

                    {/* Confirmation Dialog */}
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div 
                            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Remove Item?</h3>
                                <p className="text-gray-600">
                                    Are you sure you want to remove <strong>{confirmRemove.name}</strong> from your order?
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmRemove(null)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRemove}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
