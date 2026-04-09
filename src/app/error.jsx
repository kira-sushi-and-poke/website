"use client";

import React from "react";
import * as Sentry from '@sentry/nextjs';
import ErrorPage from '@/components/ErrorPage';

export default function Error({ error }) {
    React.useEffect(() => {
        // Capture error in Sentry (only sends in production due to config)
        Sentry.captureException(error);
    }, [error]);

    return <ErrorPage errorDetails={error} buttonType="link" />;
}
