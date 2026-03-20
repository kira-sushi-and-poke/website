import React from "react";

export default function MenuSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Menu Header Skeleton */}
            <div className="mb-8 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-full max-w-64 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-full max-w-96"></div>
            </div>

            {/* Category Tabs Skeleton */}
            <div className="mb-8 animate-pulse">
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded-lg w-full max-w-32"></div>
                    ))}
                </div>
            </div>

            {/* Menu Items Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <p className="text-gray-500 text-lg">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading menu...
                </p>
            </div>
        </div>
    );
}
