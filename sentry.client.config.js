import * as Sentry from "@sentry/nextjs";
import { beforeSend, beforeBreadcrumb } from './src/lib/sentryConfig';

// Only initialize Sentry in production to avoid sending dev errors to cloud
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Free tier: Disable performance monitoring to stay within quota
    // Paid tier: Set to 0.1 for 10% sampling
    tracesSampleRate: 0,

    // Apply data sanitization hooks
    beforeSend,
    beforeBreadcrumb,

    // Enable debug mode in non-production to see what would be sent
    debug: false,

    // Set environment
    environment: process.env.NODE_ENV,

    integrations: [
      // CSP violation reporting - captures full violation details
      new Sentry.Integrations.ReportingObserver({
        types: ['csp-violation'],
      }),

      // Browser tracing for network request breadcrumbs
      // Note: traceFetch/traceXHR create breadcrumbs even with tracesSampleRate: 0
      new Sentry.BrowserTracing({
        traceFetch: true,
        traceXHR: true,
      }),
    ],

    // Session Replay is disabled (requires Business plan)
    // Uncomment if you upgrade:
    // replaysSessionSampleRate: 0.1,
    // replaysOnErrorSampleRate: 1.0,
  });
}
