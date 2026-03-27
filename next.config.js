module.exports = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevents clickjacking by disallowing the site to be embedded in iframes
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
              // Allow iframes from Square payments, Google (Pay, Maps), Apple Pay, and Facebook embeds
              "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.google.com https://google.com https://*.apple.com https://apple.com https://www.facebook.com",
              "object-src 'none'",
              "base-uri 'self'",
              // Allow form submissions to Square checkout
              "form-action 'self' https://connect.squareup.com https://connect.squareupsandbox.com",
              // Prevent your site from being embedded in iframes
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};