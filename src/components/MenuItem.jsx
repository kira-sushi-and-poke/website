"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const MenuItem = ({ 
    name, 
    originalPrice, 
    discountedPrice, 
    image, 
    description, 
    variationDescription, 
    status,
    variationId,
    cart = {},
    addItem,
    removeItem,
    updatingItems = new Set(),
    isOrderMode = false
}) => {
    const [showLightbox, setShowLightbox] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Get quantity from cart
    const quantity = cart[variationId] || 0;
    const isUpdating = updatingItems.has(variationId);

    // Convert single image to array for consistent handling
    const rawImages = Array.isArray(image) ? image : [image];
    // Filter out empty/null/undefined images and use placeholder if none
    const images = rawImages.filter(img => img && img.trim() !== "");
    const hasImages = images.length > 0;
    const imagesToDisplay = hasImages ? images : ["/images/placeholder.svg"];
    const currentImage = imagesToDisplay[currentImageIndex];
    const hasMultipleImages = images.length > 1;

    // Keyboard navigation
    useEffect(() => {
        if (!showLightbox) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowLightbox(false);
            } else if (e.key === "ArrowLeft") {
                goToPrevious();
            } else if (e.key === "ArrowRight") {
                goToNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showLightbox, currentImageIndex]);

    const goToNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imagesToDisplay.length);
    };

    const goToPrevious = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imagesToDisplay.length) % imagesToDisplay.length);
    };

    const openLightbox = (index = 0) => {
        setCurrentImageIndex(index);
        setShowLightbox(true);
    };

    return (
        <>
            <div className="border-2 border-hot-pink relative overflow-hidden bg-white rounded-lg my-1.5 md:my-2 transition-shadow duration-300 hover:shadow-md">
                <div
                    className={`bg-hot-pink w-full h-36 md:h-44 flex items-center justify-center rounded-t-lg overflow-hidden ${hasImages ? "cursor-pointer group" : ""} relative`}
                    onClick={() => hasImages && openLightbox(0)}
                >
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-hot-pink animate-pulse"></div>
                    )}
                    <Image
                        src={imagesToDisplay[0]}
                        alt={`${name} - ${description.slice(0, 50)}`}
                        title={hasImages ? `Click to view ${name}` : name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-all duration-300 ${hasImages ? "group-hover:scale-110" : ""} ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                        onLoad={() => setImageLoaded(true)}
                        unoptimized
                    />
                    {hasImages && (
                        <>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                            {/* Desktop hover icon - only on large screens */}
                            <div className="absolute inset-0 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                                    <i className="fas fa-search-plus text-hot-pink text-xl"></i>
                                </div>
                            </div>

                            {/* Mobile & Tablet tap indicator - always visible on touch devices */}
                            <div className="absolute bottom-2 left-2 lg:hidden bg-white bg-opacity-90 text-hot-pink px-2 py-1 rounded text-xs font-bold shadow-md flex items-center gap-1">
                                <i className="fas fa-expand text-xs"></i>
                                <span>Tap to view</span>
                            </div>
                        </>
                    )}
                    
                    {/* Status Tags */}
                    {status === "popular" && (
                        <div className="absolute top-2 right-2 bg-yellow text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 z-20">
                            <i className="fas fa-star"></i>
                            <span>POPULAR</span>
                        </div>
                    )}
                    {status === "new" && (
                        <div className="absolute top-2 right-2 bg-hot-pink text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 z-20">
                            <i className="fas fa-sparkles"></i>
                            <span>NEW</span>
                        </div>
                    )}
                    
                    {hasMultipleImages && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-bold">
                            <i className="fas fa-images mr-1"></i>
                            {imagesToDisplay.length}
                        </div>
                    )}
                </div>
                <div className="p-2.5 md:p-3">
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                        <h3 className="text-hot-pink font-bold text-md md:text-base">{name}</h3>
                        <div>
                            {originalPrice !== null && originalPrice !== undefined ? (
                                <>
                                    <span className={discountedPrice ? "text-gray-400 line-through text-xs md:text-sm" : "text-yellow font-bold text-base md:text-lg"}>
                                        £{originalPrice.toFixed(2)}
                                    </span>
                                    {discountedPrice && (
                                        <span className="text-yellow font-bold ml-2 md:ml-2.5 text-base md:text-lg">£{discountedPrice.toFixed(2)}</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-500 text-xs md:text-sm italic">Price not available</span>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs md:text-sm">
                        {description}
                        {variationDescription && (
                            <span className="text-gray-500 italic ml-2">({variationDescription})</span>
                        )}
                    </p>
                    
                    {/* Quantity Controls for Order Mode */}
                    {isOrderMode && variationId && (
                        <div className="mt-2 md:mt-3 flex flex-col items-center gap-1.5 md:gap-2">
                            <div className="flex items-center gap-2 md:gap-3">
                                <button
                                    onClick={() => removeItem(variationId)}
                                    disabled={isUpdating || quantity === 0}
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 hover:bg-hot-pink hover:text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                
                                <div className="min-w-[50px] md:min-w-[60px] text-center">
                                    {isUpdating ? (
                                        <div className="inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-hot-pink border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="text-base md:text-lg font-bold">{quantity}</span>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => addItem(variationId)}
                                    disabled={isUpdating}
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-hot-pink text-white hover:bg-opacity-90 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                            
                            {quantity > 0 && !isUpdating && (
                                <div className="text-yellow font-bold text-sm md:text-base">
                                    £{((discountedPrice || originalPrice) * quantity).toFixed(2)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {showLightbox && hasImages && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-4 right-4 text-white hover:text-hot-pink text-4xl font-bold z-10"
                        aria-label="Close image"
                    >
                        ×
                    </button>

                    {/* Navigation Buttons */}
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all z-10"
                                aria-label="Previous image"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all z-10"
                                aria-label="Next image"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </>
                    )}

                    <div 
                        className="relative max-w-4xl max-h-[90vh] w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={currentImage}
                            alt={`${name} - ${description}`}
                            title={`${name} - Image ${currentImageIndex + 1}${hasMultipleImages ? ` of ${imagesToDisplay.length}` : ""}`}
                            fill
                            className="object-contain"
                            sizes="90vw"
                            unoptimized
                        />
                    </div>

                    {/* Image Counter and Description */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white px-4">
                        {hasMultipleImages && (
                            <div className="text-sm mb-2 font-bold">
                                {currentImageIndex + 1} / {imagesToDisplay.length}
                            </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{name}</h3>
                        <p className="text-sm opacity-90">{description}</p>
                    </div>

                    {/* Thumbnail Indicators */}
                    {hasMultipleImages && imagesToDisplay.length <= 10 && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {imagesToDisplay.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        index === currentImageIndex
                                            ? "bg-hot-pink w-8"
                                            : "bg-white bg-opacity-50 hover:bg-opacity-75"
                                    }`}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default MenuItem;
