export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="text-center mb-12 animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-8 animate-pulse">
                    {/* Section 1 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="h-8 bg-gray-200 rounded w-56 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>

                {/* Loading text */}
                <div className="text-center mt-8">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-gray-300 border-t-hot-pink rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
