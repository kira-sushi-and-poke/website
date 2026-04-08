"use client";

import React from "react";
import * as Sentry from '@sentry/nextjs';

export default function ReviewsError({ error, reset }) {
    React.useEffect(() => {
        // Capture review errors in Sentry
        Sentry.captureException(error, {
            tags: { page: 'reviews' }
        });
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-4">
                    <svg
                        className="mx-auto h-16 w-16 text-yellow"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Unable to Load Reviews
                </h2>

                <p className="text-gray-600 mb-6">
                    We're having trouble loading customer reviews at the moment. Please try again later or visit our social media pages to see what people are saying!
                </p>

                {process.env.NODE_ENV === "development" && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                            {error.message}
                        </pre>
                    </details>
                )}

                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={reset}
                        className="bg-hot-pink text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                    >
                        Try Again
                    </button>

                    <a
                        href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Visit Facebook
                    </a>

                    <a
                        href="https://www.instagram.com/kira_sushi_and_poke"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                    >
                        Visit Instagram
                    </a>
                </div>
            </div>
        </div>
    );
}
