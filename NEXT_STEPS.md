# Next Steps

## Immediate Priorities

### 0. Deployment Configuration ⚠️ CRITICAL
- [ ] **Set `TZ=UTC` environment variable in production deployment**
  - Required for pickup time validation to work correctly
  - Prevents timezone issues between client and server
  - See README.md Deployment section for details
- [ ] Verify all environment variables from `.env.example` are set in production
- [ ] Test pickup time validation works correctly in production environment

### 1. Testing & Quality Assurance
- [ ] Test complete order flow with real payments (sandbox → production)
- [ ] Verify tip calculation and display across all payment methods (Card, Google Pay, Apple Pay)
- [ ] Test special instructions are properly saved and visible to restaurant
- [ ] Verify CSP headers work correctly with Square's payment SDK
- [ ] Test order tracking page auto-refresh functionality
- [ ] Validate all payment error handling scenarios

### 2. Payment Features
- [ ] Test Apple Pay in production (requires domain verification)
- [ ] Verify declined card handling and error messages
- [ ] Test payment retries for failed transactions
- [ ] Confirm receipt URLs are working correctly

### 3. Order Management
- [ ] Verify service charges (tips) appear correctly in Square Dashboard
- [ ] Test order status updates and fulfillment workflow
- [ ] Ensure special instructions display properly for staff
- [ ] Validate pickup time selection and scheduling

## Short-term Improvements

### User Experience
- [ ] Add order history for returning customers
- [ ] Implement "favorite items" or "recent orders" feature
- [ ] Add email confirmation after successful order
- [ ] Create SMS notifications for order status updates
- [ ] Improve mobile responsiveness for payment form

### Admin/Operations
- [ ] Create admin dashboard for order management
- [ ] Add ability to update order statuses (RESERVED → PREPARED)
- [ ] Build notification system for new orders
- [ ] Add analytics/reporting for orders and revenue
- [ ] Create staff interface for viewing special instructions

### Performance & SEO
- [ ] Optimize images (already using WebP, but check sizes)
- [ ] Add loading states for all async operations
- [ ] Implement error boundaries for better error handling
- [ ] Add structured data for menu items
- [ ] Optimize lazy loading for menu images

## Medium-term Goals

### Feature Enhancements
- [ ] Add delivery option (mentioned as planned feature)
- [ ] Implement loyalty/rewards program
- [ ] Add promotional codes/discounts
- [ ] Create gift card functionality
- [ ] Enable scheduled orders (order now, pickup later in the week)
- [ ] Add ability to save multiple addresses for future delivery

### Integration & Automation
- [ ] Integrate with email marketing platform
- [ ] Add kitchen display system integration
- [ ] Connect with inventory management
- [ ] Set up automated order confirmations via email/SMS
- [ ] Integrate with accounting software

### Payment & Checkout
- [ ] Add "Pay at pickup" option (if desired)
- [ ] Implement split payment functionality
- [ ] Add ability to save payment methods for returning customers
- [ ] Create subscription/meal plan options

## Long-term Vision

### Platform Expansion
- [ ] Mobile app (React Native or similar)
- [ ] Multi-location support
- [ ] Franchise/white-label solution
- [ ] API for third-party integrations

### Advanced Features
- [ ] AI-powered recommendations based on order history
- [ ] Dietary preference filtering (vegetarian, vegan, gluten-free)
- [ ] Nutritional information display
- [ ] Real-time wait time estimates
- [ ] Table reservation system integration

## Technical Debt & Maintenance

### Code Quality
- [ ] Add comprehensive unit tests
- [ ] Implement E2E testing with Playwright or Cypress
- [ ] Set up CI/CD pipeline
- [ ] Add TypeScript for better type safety
- [ ] Document all API endpoints and data flows

### Security & Compliance
- [ ] Security audit of payment flow
- [ ] GDPR compliance review (if applicable)
- [ ] PCI compliance verification
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper logging and monitoring

### Infrastructure
- [ ] Set up staging environment
- [ ] Implement proper environment variable management
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up performance monitoring
- [ ] Configure automated backups

## Known Issues to Address

## Documentation Needed

- [ ] API documentation for Square integration
- [ ] Deployment guide
- [ ] Environment variable setup guide
- [ ] Developer onboarding documentation
- [ ] User manual for admin features
- [ ] Troubleshooting guide for common issues

## Notes

- Square Sandbox testing completed successfully
- Production deployment requires domain verification for Apple Pay
- CSP headers configured to allow Square SDK and other required services
- Service charges used for tip functionality (appears as line item in Square)
- Order tracking auto-refreshes every 30 seconds for active orders
- All PII properly sanitized in client-exposed order data