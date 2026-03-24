'use client';

import React, { useState, useEffect } from "react";

export default function StickyCartSummary({ 
    cart, 
    menuData, 
    addItem,
    removeItem,
    removeItemCompletely,
    clearCart,
    updatingItems,
    onCheckout,
    isCheckingOut = false
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(null); // { variationId, name }
    const [confirmClearCart, setConfirmClearCart] = useState(false);
    
    // Lock body scroll when expanded
    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExpanded]);
    
    const handleConfirmRemove = () => {
        if (confirmRemove) {
            removeItemCompletely(confirmRemove.variationId);
            setConfirmRemove(null);
        }
    };

    const handleConfirmClearCart = () => {
        clearCart();
        setConfirmClearCart(false);
        setIsExpanded(false);
    };

    const handleDecreaseQuantity = (variationId, currentQuantity, itemName) => {
        if (currentQuantity === 1) {
            // Show confirmation modal
            setConfirmRemove({ variationId, name: itemName });
        } else {
            // Decrease normally
            removeItem(variationId);
        }
    };
    
    // Calculate order details
    const items = Object.entries(cart).map(([variationId, quantity]) => {
        const menuItem = menuData.find(item => item.variationId === variationId);
        
        // Get image, handling arrays and empty values
        let image = '/images/placeholder.svg';
        if (menuItem?.imageLink) {
            if (Array.isArray(menuItem.imageLink) && menuItem.imageLink.length > 0) {
                image = menuItem.imageLink[0];
            } else if (typeof menuItem.imageLink === 'string' && menuItem.imageLink) {
                image = menuItem.imageLink;
            }
        }
        
        return {
            variationId,
            quantity,
            name: menuItem?.name || 'Unknown Item',
            price: menuItem?.discountedPrice || menuItem?.originalPrice || 0,
            image,
        };
    });

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const isEmpty = itemCount === 0;

    return (
        <>
            {/* Backdrop - Always in DOM */}
            <div 
                className={`fixed inset-0 bg-black z-40 transition-all duration-500 ${isExpanded ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsExpanded(false)}
            />

            {/* Cart Summary */}
            <div className={`fixed left-0 right-0 bg-white border-t-2 border-hot-pink shadow-lg z-50 transition-all duration-500 ease-in-out`}
                 style={isExpanded 
                     ? { height: '90vh', bottom: 0 } 
                     : { height: '6rem', bottom: 0 }}>
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    {/* Header - Always Visible */}
                    <div className="px-5 md:px-10 py-4 flex-shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            {/* Cart Summary */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <i className="fas fa-shopping-cart text-hot-pink"></i>
                                    <span className="font-semibold">
                                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-yellow">
                                    £{subtotal.toFixed(2)}
                                </div>
                            </div>

                            {/* Toggle Button */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-6 py-3 bg-hot-pink text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors flex items-center gap-2"
                            >
                                <span>{isExpanded ? 'Hide Details' : 'View Order'}</span>
                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'} transition-transform`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Expanded Content - Always in DOM */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-t border-gray-200">
                        {/* Items List - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-4 min-h-0">
                            {isEmpty ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <i className="fas fa-shopping-basket text-gray-300 text-6xl mb-4"></i>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">Your basket is empty</h3>
                                    <p className="text-gray-500 mb-4">Add some delicious items from our menu!</p>
                                    <button 
                                        onClick={() => setIsExpanded(false)}
                                        className="px-6 py-3 bg-hot-pink text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                            <div className="space-y-4">
                                {items.map((item) => {
                                    const isUpdating = updatingItems.has(item.variationId);
                                    
                                    return (
                                        <div key={item.variationId} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0">
                                            <img 
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/placeholder.svg';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 mb-1 truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    £{item.price.toFixed(2)} each
                                                </p>
                                                
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDecreaseQuantity(item.variationId, item.quantity, item.name)}
                                                        disabled={isUpdating}
                                                        className="w-7 h-7 rounded-full bg-gray-200 hover:bg-hot-pink hover:text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                    >
                                                        −
                                                    </button>
                                                    
                                                    <div className="min-w-[35px] text-center">
                                                        {isUpdating ? (
                                                            <div className="inline-block w-4 h-4 border-2 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="font-bold text-sm">{item.quantity}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => addItem(item.variationId)}
                                                        disabled={isUpdating}
                                                        className="w-7 h-7 rounded-full bg-hot-pink text-white hover:bg-opacity-90 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                    >
                                                        +
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => setConfirmRemove({ variationId: item.variationId, name: item.name })}
                                                        disabled={isUpdating}
                                                        className="ml-2 px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
                                                        title="Remove item from cart"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                        <span className="hidden sm:inline">Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="text-yellow font-bold">
                                                £{(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            )}
                        </div>

                        {/* Footer - Checkout Button */}
                        <div className="border-t border-gray-200 px-5 md:px-10 py-4 bg-gray-50 flex-shrink-0">
                            {!isEmpty && (
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                                    <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                                    <p className="text-sm text-gray-700">
                                        You'll be redirected to Square's secure checkout page to complete your payment.
                                    </p>
                                </div>
                            )}
                            
                            {/* Action Buttons Row */}
                            <div className="flex gap-3">
                                {/* Clear Basket Button - Only show if not empty */}
                                {!isEmpty && (
                                    <button
                                        onClick={() => setConfirmClearCart(true)}
                                        className="px-4 py-3 border-2 border-gray-400 text-gray-700 rounded-lg font-semibold hover:border-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                        title="Remove all items from basket"
                                    >
                                        <i className="fas fa-broom"></i>
                                        <span>Clear All</span>
                                    </button>
                                )}
                                
                                {/* Confirm & Pay Button */}
                                <button
                                    onClick={onCheckout}
                                    disabled={isEmpty || isCheckingOut}
                                    className="flex-1 px-6 py-3 bg-hot-pink text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        "Confirm & Pay"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmRemove && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-60 z-[60]"
                        onClick={() => setConfirmRemove(null)}
                    />

                    {/* Confirmation Dialog */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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

            {/* Clear Cart Confirmation Modal */}
            {confirmClearCart && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-60 z-[60]"
                        onClick={() => setConfirmClearCart(false)}
                    />

                    {/* Confirmation Dialog */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div 
                            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-broom text-orange-500 text-xl"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Clear All Items?</h3>
                                <p className="text-gray-600">
                                    Are you sure you want to empty your basket? <strong>All items</strong> will be removed.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    You can add them back anytime.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmClearCart(false)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmClearCart}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
