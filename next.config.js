const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        // Relaxed CSP for payment page to allow all iframes
        source: '/menu/order/payment',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com https://*.squarecdn.com https://square-fonts-production-f.squarecdn.com https://cash-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
              "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://apple-pay-gateway.apple.com https://*.facebook.com https://*.facebook.net https://*.browser-intake-datadoghq.com https://*.ingest.sentry.io",
              "frame-src *",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action *",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Apply security headers to all routes except payment page (which has its own CSP)
        source: '/:path((?!menu/order/payment$).*)*',
        headers: [
          // Prevents clickjacking by disallowing the site to be embedded in external iframes
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Prevents MIME sniffing (forces browser to respect Content-Type)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Controls referrer information (protects user privacy)
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disables browser features that could be exploited
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Enforce HTTPS in production (HSTS)
          // Note: Only enable this header when serving over HTTPS in production
          // Uncomment the block below when deploying to production with HTTPS
          /*
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          */
          // Content Security Policy - Configured for Square, Google Pay, Google Maps, Facebook, and Font Awesome
          // Adjust this based on your specific needs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from Square, Google Pay, Apple Pay, Facebook, and inline scripts (required for Next.js and Square)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://connect.facebook.net",
              // Allow styles from Square, Font Awesome, Google Fonts, and inline styles
              "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              // Allow images from any HTTPS source (for menu items from Square, social media embeds)
              "img-src 'self' data: blob: https: http:",
              // Allow fonts from Google Fonts, Font Awesome, and Square CDNs
              "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com https://*.squarecdn.com https://square-fonts-production-f.squarecdn.com https://cash-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
              // Allow API connections to Square, Google Pay, Apple Pay, Facebook, and monitoring services (Datadog, Sentry)
              "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://apple-pay-gateway.apple.com https://*.facebook.com https://*.facebook.net https://*.browser-intake-datadoghq.com https://*.ingest.sentry.io",
              // Allow iframes from Square payments, Google (Pay, Maps), Apple Pay, Facebook embeds, and 3D Secure authentication (with wildcards for card issuers)
              "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://www.facebook.com https://api.squareup.com https://*.securesuite.co.uk https://*.rsa3dsauth.co.uk https://channel-cards-html.lloydsbankinggroup.com https://*.monzo.com https://*.stripe.com https://*.adyen.com",
              "object-src 'none'",
              "base-uri 'self'",
              // Allow form submissions to Square checkout and 3D Secure authentication (with wildcards for card issuers)
              "form-action 'self' https://connect.squareup.com https://connect.squareupsandbox.com https://*.securesuite.co.uk https://*.rsa3dsauth.co.uk https://*.monzo.com https://*.stripe.com https://*.adyen.com",
              // Prevent your site from being embedded in external iframes
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

// Wrap with Sentry config for source map uploads
module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "kira-sushi-poke",
  project: "javascript-nextjs",

  // Only upload source maps in production builds
  silent: !process.env.CI,

  // Upload source maps during production build
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disable logger in production to reduce bundle size
  hideSourceMaps: true,

  // Disable Sentry SDK debug logs in production
  disableLogger: true,
  
  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
