# Custom Payment Page - Setup Guide

This guide explains how to configure and use the custom payment page alongside the existing Square Checkout redirect.

## Overview

The application now supports two payment methods:
1. **Custom Payment Page** - With Apple Pay, Google Pay, and Credit Card support
2. **Square Checkout** - The original redirect to Square's hosted checkout page

## Architecture

### User Flow

1. User adds items to cart on `/menu/order`
2. User clicks "Confirm & Pay" → navigates to `/menu/order/checkout`
3. User fills in contact details (name, email, phone)
4. User chooses payment method:
   - **Pay with Card / Apple Pay / Google Pay** → Custom payment page (`/menu/order/payment`)
   - **Pay with Square Checkout** → Redirects to Square's hosted checkout

### Backend Flow (Custom Payment)

1. Customer creation: `POST /api/customers` creates a Square customer and attaches to order
2. Payment processing: `POST /api/payments` processes the payment with Square
3. Webhook handling: `POST /api/webhooks/square` receives `payment.updated` events (checks for `COMPLETED` status)

## Environment Variables

Update your `.env.local` file with the following:

```bash
# Server-only access token (no NEXT_PUBLIC_ prefix)
ACCESS_TOKEN=your_square_access_token

# Location ID
LOCATION_ID=your_square_location_id

# API URLs
API_ORDERS_URL=https://connect.squareupsandbox.com/v2/orders  # Use squareup.com for production
API_PAYMENT_LINKS_URL=https://connect.squareupsandbox.com/v2/online-checkout/payment-links
API_CUSTOMERS_URL=https://connect.squareupsandbox.com/v2/customers
API_PAYMENTS_URL=https://connect.squareupsandbox.com/v2/payments

# Site URL for redirects
SITE_URL=http://localhost:3000  # Update for production

# Public environment variables (exposed to browser)
NEXT_PUBLIC_SQUARE_APP_ID=your_square_app_id_here
NEXT_PUBLIC_SQUARE_LOCATION_ID=your_square_location_id

# Webhook Configuration
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

### Getting Your Square App ID

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Go to **Credentials** tab
4. Find **Application ID** (this is your App ID)
5. Copy and paste it into `NEXT_PUBLIC_SQUARE_APP_ID`

### Getting Your Webhook Signature Key

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Select your application
3. Go to **Webhooks** tab
4. Click on **Show** next to Signature Key
5. Copy and paste it into `SQUARE_WEBHOOK_SIGNATURE_KEY`

## Webhook Setup

### 1. Configure Webhook Endpoint

In the Square Developer Dashboard:
1. Go to **Webhooks** tab
2. Add a new webhook endpoint: `https://yourdomain.com/api/webhooks/square`
3. Subscribe to the `payment.updated` event
4. Save the webhook

### 2. Test Webhook (Local Development)

For local testing, use a tool like [ngrok](https://ngrok.com/):

```bash
# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL for your webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/square
```

## Pre-Launch Checklist

Before going live, complete these steps:

### 1. Apple Pay Domain Registration

Apple Pay requires domain verification:

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Navigate to **Apple Pay** section
3. Add your production domain
4. Download the verification file
5. Place it at `public/.well-known/apple-developer-merchantid-domain-association`
6. Verify the domain in Square Dashboard

### 2. Email Receipt Configuration

Check your Square Dashboard settings:
- If you're sending custom confirmation emails, **disable** Square's automatic receipt emails to avoid duplicate emails to customers
- Or keep Square's receipt enabled and skip custom emails

### 3. VAT Configuration (UK)

If selling in the UK, ensure VAT is properly configured in your Square account:
- Go to Square Dashboard → **Items & Orders** → **Tax**
- Set up VAT rates for your location

### 4. Production Environment

Update `.env.local` for production:

```bash
# Change sandbox URLs to production
API_ORDERS_URL=https://connect.squareup.com/v2/orders
API_PAYMENT_LINKS_URL=https://connect.squareup.com/v2/online-checkout/payment-links
API_CUSTOMERS_URL=https://connect.squareup.com/v2/customers
API_PAYMENTS_URL=https://connect.squareup.com/v2/payments

# Use production credentials
ACCESS_TOKEN=your_production_access_token
NEXT_PUBLIC_SQUARE_APP_ID=your_production_app_id

# Update site URL
SITE_URL=https://yourdomain.com
```

### 5. End-to-End Testing

Before launching:
1. Test the complete flow with a real card in production
2. Verify order creation
3. Verify customer creation
4. Verify payment processing
5. Verify webhook receives `payment.updated` event with status `COMPLETED`
6. Test Apple Pay (if applicable)
7. Test Google Pay (if applicable)
8. Test card declines and error scenarios

## Testing

### Test Cards (Sandbox)

Square provides test cards for sandbox testing:

- **Success**: `4111 1111 1111 1111` (Visa)
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Postal Code**: Any valid postal code

For more test cards and scenarios, see [Square Testing Documentation](https://developer.squareup.com/docs/testing/test-values).

### Testing Apple Pay / Google Pay

Apple Pay and Google Pay only work:
- In production environment with a registered domain
- On supported devices (iPhone/iPad for Apple Pay, Android for Google Pay)
- With real cards added to Apple Wallet or Google Pay

For testing, use the credit card form instead.

## Error Handling

The implementation includes comprehensive error handling:

### Customer Creation Errors
- If customer creation fails, the user sees: "Something went wrong, please try again"
- User can retry without losing their cart

### Order Update Errors
- If attaching customer to order fails, user sees an error
- User can retry without re-entering contact details

### Payment Errors
- **Card Declined**: Shows specific decline reason, user can try different card
- **Insufficient Funds**: Specific error message
- **Network Errors**: Generic retry message
- Pay button is re-enabled on error so user can retry
- Order remains intact for retry attempts

### Order Validity
- Payment page checks order state before allowing payment
- Redirects to appropriate page if order is completed, canceled, or empty

## Monitoring

### Webhook Events

Monitor webhook events in Square Dashboard:
- Go to **Webhooks** → **Event Log**
- Check for `payment.updated` events with status `COMPLETED`
- Verify webhook signature validation

### Payment Status

Check payment status in Square Dashboard:
- Go to **Payments**
- View payment details
- Check for any failures or declines

## Customization

### Order Fulfillment

Add custom logic in `/api/webhooks/square/route.js`:

```javascript
if (event.type === "payment.updated") {
  const payment = event.data?.object?.payment;
  
  // Only process completed payments
  if (payment.status === "COMPLETED") {
    // Add your custom logic here:
    // - Send confirmation email
    // - Notify kitchen/staff
    // - Update database
    // - Send to third-party integrations
  }
}
```

### Styling

The payment form uses Tailwind CSS and can be customized in:
- `/menu/order/checkout/page.jsx` - Checkout page styling
- `/menu/order/payment/PaymentForm.jsx` - Payment form styling

### Button Colors

Update the credit card button in `PaymentForm.jsx`:

```javascript
<CreditCard
  buttonProps={{
    css: {
      backgroundColor: "#FF1493",  // Change this color
      // ... other styles
    },
  }}
/>
```

## Support

For issues or questions:
- Square Documentation: https://developer.squareup.com/docs
- Square Support: https://squareup.com/help/contact
- React Square Web Payments SDK: https://github.com/square/react-square-web-payments-sdk

## Files Created

- `/menu/order/checkout/page.jsx` - Checkout page with contact form
- `/menu/order/payment/page.jsx` - Payment page (Server Component)
- `/menu/order/payment/PaymentForm.jsx` - Payment form (Client Component)
- `/api/customers/route.js` - Customer creation endpoint
- `/api/payments/route.js` - Payment processing endpoint
- `/api/webhooks/square/route.js` - Webhook handler

## Files Modified

- `.env.local` - Added environment variables
- `/menu/order/OrderMenuClient.jsx` - Updated to navigate to checkout page
- `/menu/order/actions.js` - (No changes, existing checkout action preserved)
