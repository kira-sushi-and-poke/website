import React from "react";

export default function ErrorDisplay({ error }) {
    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 text-center my-8">
            <div className="mb-4">
                <svg
                    className="mx-auto h-16 w-16 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to Load Menu
            </h2>

            <p className="text-gray-600 mb-4">
                {error}
            </p>

            <p className="text-gray-600 mb-6">
                You can reach us via{' '}
                <a
                    href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-hot-pink hover:underline font-medium"
                >
                    Facebook
                </a>
                {' '}or{' '}
                <a
                    href="https://www.instagram.com/kira_sushi_and_poke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-hot-pink hover:underline font-medium"
                >
                    Instagram
                </a>
                {' '}to place your order.
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
                <a
                    href="/menu"
                    className="bg-hot-pink text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                    Try Again
                </a>

                <a
                    href="/"
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}
