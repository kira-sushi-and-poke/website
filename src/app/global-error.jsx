"use client";

import React from "react";
import * as Sentry from '@sentry/nextjs';
import ErrorPage from '@/components/ErrorPage';

export default function GlobalError({ error }) {
    React.useEffect(() => {
        // Capture fatal errors in Sentry
        Sentry.captureException(error, { level: "fatal" });
    }, [error]);

    return (
        <html lang="en">
            <body>
                <ErrorPage 
                    message="Something went seriously wrong. Please refresh the page."
                    errorDetails={error} 
                    buttonType="button" 
                />
            </body>
        </html>
    );
}
