// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
    
    // Add context tags
    initialScope: {
      tags: {
        runtime: 'edge',
      },
    },
  });
}
