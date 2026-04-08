// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { beforeSend } from './src/lib/sentryConfig';

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: "https://6c647a5c6658a21a0a7593646c05f49c@o4511179430166528.ingest.de.sentry.io/4511179438882896",

    // Free tier: Disable performance monitoring
    tracesSampleRate: 0,

    // Apply data sanitization to prevent PII leaks
    beforeSend,

    // CRITICAL: Do NOT send PII - our beforeSend hook handles what's safe
    sendDefaultPii: false,

    // Set environment
    environment: process.env.NODE_ENV,
    
    // Add context tags (safe business identifiers only)
    initialScope: {
      tags: {
        runtime: 'server',
      },
    },
  });
}
