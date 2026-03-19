export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Reviews Header Skeleton */}
            <div className="text-center mb-12 animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>

            {/* Overall Rating Skeleton */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12 max-w-2xl mx-auto animate-pulse">
                <div className="text-center">
                    <div className="h-16 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
                </div>
            </div>

            {/* Facebook Reviews Skeleton */}
            <div className="mb-12">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Google Reviews Skeleton */}
            <div className="mb-12">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading text */}
            <div className="text-center mt-8">
                <p className="text-gray-500 text-lg">Loading reviews...</p>
            </div>
        </div>
    );
}
