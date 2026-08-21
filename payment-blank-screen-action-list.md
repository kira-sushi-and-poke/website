# Payment Blank-Screen Investigation — Action List

Everything below came out of tracing customer reports of a blank screen during
checkout. Organized by file, in the order I'd tackle them.

---

## 1. `next.config.js` — do this first

This is the most likely root cause, so fix and verify it before spending more
time on the component-level items.

### 1.1 Reorder header blocks so the split can't silently fail

Next.js overrides matching headers with whatever matches **last** — it's not
a merge. The current setup relies on a negative-lookahead regex to keep the
strict and relaxed CSP blocks mutually exclusive, which is fragile (trailing
slashes, locale prefixes, `basePath`, etc. could all break it silently and
revert the payment page to the incomplete bank-domain allowlist).

**Before**
```js
async headers() {
  return [
    {
      // Relaxed CSP for payment page to allow all iframes
      source: '/menu/order/payment',
      headers: [ /* frame-src *, form-action * ... */ ],
    },
    {
      // Apply security headers to all routes except payment page
      source: '/:path((?!menu/order/payment$).*)*',
      headers: [ /* strict, curated frame-src list ... */ ],
    },
  ];
}
```

**After**
```js
async headers() {
  return [
    {
      // Strict baseline CSP for everything
      source: '/:path*',
      headers: [ /* strict, curated frame-src list ... */ ],
    },
    {
      // Relaxed CSP for payment page — listed LAST so it always wins
      // on this exact path, regardless of trailing slashes, locale
      // prefixes, or any other edge case in path matching.
      source: '/menu/order/payment',
      headers: [ /* frame-src *, form-action * ... */ ],
    },
  ];
}
```

### 1.2 Fix `connect-src` for the EU Sentry region

The DSN/report-uri domain is `*.ingest.de.sentry.io` (EU data residency), but
the CSP only allowed `*.ingest.sentry.io`. That wildcard does **not** match
the `.de.` domain, meaning client-side Sentry calls have likely been silently
blocked by your own CSP.

**Before**
```js
"connect-src 'self' ... https://*.browser-intake-datadoghq.com https://*.ingest.sentry.io",
```

**After**
```js
"connect-src 'self' ... https://*.browser-intake-datadoghq.com https://*.ingest.de.sentry.io",
```

### 1.3 Add CSP violation reporting

Turns "customer says blank screen, we guess a bank domain" into an actual
Sentry issue naming the exact blocked directive and domain. Add to **both**
header blocks (get the exact URL from your Sentry DSN — see note below).

**Before**
```js
value: [
  "default-src 'self'",
  // ...
  "frame-ancestors 'self'",
].join('; '),
```

**After**
```js
value: [
  "default-src 'self'",
  // ...
  "frame-ancestors 'self'",
  "report-uri https://o4511179430166528.ingest.de.sentry.io/api/4511179438882896/security/?sentry_key=6c647a5c6658a21a0a7593646c05f49c",
].join('; '),
```
> Don't try to visit that URL in a browser — it's a POST-only report
> endpoint, a browser GET will 404. To check it's working: trigger a
> violation, then in Sentry's **Issues** page search `logger:csp` or
> `event.type:csp`.

### 1.4 Enable HSTS

Unrelated to the blank-screen bug, but it's sitting there commented out and
worth turning on now that you're in this file.

**Before**
```js
// Note: Only enable this header when serving over HTTPS in production
/*
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
*/
```

**After**
```js
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
```

---

## 2. `processPayment.js` (server action)

### 2.1 Run independent calls concurrently

**Before**
```js
let orderData;
try {
  orderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, { method: "GET" });
} catch (error) { /* ... */ }

// ...later, sequentially...
if (contactDetails.email && contactDetails.name) {
  const customerData = await fetchSquare(API_CUSTOMERS_URL, { method: "POST", /* ... */ });
  customerId = customerData.customer?.id;
}
```

**After**
```js
const [orderResult, customerResult] = await Promise.allSettled([
  fetchSquare(`${API_ORDERS_URL}/${orderId}`, { method: "GET" }),
  createSquareCustomer(contactDetails, orderId),
]);

if (orderResult.status === "rejected") {
  const error = orderResult.reason;
  if (error.response?.status === 404) {
    return { success: false, error: "Order not found. Please try again." };
  }
  return { success: false, error: "Failed to retrieve order. Please try again." };
}

let orderData = orderResult.value;
const customerId = customerResult.status === "fulfilled" ? customerResult.value : null;
```

### 2.2 Give version-conflict errors a specific message

**Before**
```js
try {
  const updatedOrderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ order: orderUpdate }),
  });
  orderData = updatedOrderData;
} catch (error) {
  return {
    success: false,
    error: "Failed to prepare order for payment. Please try again.",
  };
}
```

**After**
```js
try {
  orderData = await updateOrderForPayment({ /* ... */ });
} catch (error) {
  if (error.response?.status === 409) {
    return {
      success: false,
      error: "This order was just updated elsewhere. Please try again.",
    };
  }
  return { success: false, error: "Failed to prepare order for payment. Please try again." };
}
```

### 2.3 Log silently-swallowed errors

**Before**
```js
} catch (customerError) {
  // Continue with payment even if customer creation fails
}
```

**After**
```js
} catch (error) {
  logSwallowedError("create_customer", orderId, error); // Sentry.captureException, level: warning
  return null; // still don't block payment
}
```

---

## 3. `PaymentFormComponent`

### 3.1 Wallet-payment timeout: give feedback + telemetry instead of silence

**Before**
```js
paymentTimeoutRef.current = setTimeout(() => {
  setIsProcessing(false);
  paymentTimeoutRef.current = null;
}, 30000);
```

**After**
```js
hintTimeoutRef.current = setTimeout(() => {
  setLoadingMessage("Still waiting — check if a payment window opened in a new tab, or if your browser blocked a pop-up.");
}, 8000);

paymentTimeoutRef.current = setTimeout(() => {
  setIsProcessing(false);
  paymentTimeoutRef.current = null;

  toast.error(
    "The payment window didn't open. If you have a pop-up blocker enabled, please allow pop-ups for this site, or pay by card below.",
    { duration: 12000 }
  );

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage('Wallet payment timed out — likely blocked popup', {
      level: 'warning',
      tags: { component: 'PaymentForm' },
      extra: { order_id: orderId },
    });
  }
}, 30000);
```

### 3.2 Clear timers on unmount

**Before**
```js
// no cleanup effect exists
```

**After**
```js
React.useEffect(() => {
  return () => {
    if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
  };
}, []);
```

### 3.3 Disable wallet buttons while a payment is processing

**Before**
```jsx
<div className="mb-3 relative" onClickCapture={handleWalletPayClick}>
  <GooglePay />
  {/* ... */}
</div>
```

**After**
```jsx
<div
  className="mb-3 relative"
  onClickCapture={handleWalletPayClick}
  style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}
>
  <GooglePay />
  {/* ... */}
</div>
```
(same change for the `ApplePay` wrapper)

### 3.4 Stop remounting the whole form on every tip change

**Before**
```jsx
<PaymentForm
  key={`payment-form-${tipAmount}`}
  applicationId={appId}
  locationId={locationId}
  cardTokenizeResponseReceived={cardTokenizeResponseReceived}
  createPaymentRequest={createPaymentRequest}
  createVerificationDetails={createVerificationDetails}
>
```

**After**
```jsx
<PaymentForm
  applicationId={appId}
  locationId={locationId}
  cardTokenizeResponseReceived={cardTokenizeResponseReceived}
  createPaymentRequest={createPaymentRequest}
  createVerificationDetails={createVerificationDetails}
>
```
(no `key` — the SDK reads fresh values from the memoized callbacks when the
user actually pays; remounting tears down and reinitializes the wallet
iframes on every tip click, which is unnecessary risk)

### 3.5 `useMemo` returning a function → `useCallback`

**Before**
```js
const createPaymentRequest = useMemo(() => {
  return () => { /* ... */ };
}, [totalAmount, tipAmount]);
```

**After**
```js
const createPaymentRequest = useCallback(() => {
  /* ... */
}, [totalAmount, tipAmount]);
```
(same change for `createVerificationDetails`)

### 3.6 Replace the timing-hack validation trigger

**Before**
```js
setFormErrors(prev => ({ ...prev, pickupTime: undefined }));
setTimeout(() => {
  setFormErrors(prev => ({ ...prev, pickupTime: "Please select ASAP or choose a pickup time" }));
}, 10);
```

**After**
```js
const [pickupValidationTrigger, setPickupValidationTrigger] = useState(0);

// in handleClickForValidation:
setFormErrors(prev => ({ ...prev, pickupTime: "Please select ASAP or choose a pickup time" }));
setPickupValidationTrigger(n => n + 1); // always changes — no timing hack needed
```
Pass `pickupValidationTrigger` down to `PickupDetails` and have its
`useEffect` watch that value instead of `formErrors.pickupTime` itself.

### 3.7 Add an error boundary around the payment form

**Before**
```jsx
<PaymentForm ...>
  {/* ... */}
</PaymentForm>
```

**After**
```jsx
class PaymentErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, { extra: info });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
          <p className="text-sm font-semibold text-red-800 mb-1">
            We couldn't load the payment form.
          </p>
          <p className="text-sm text-red-700">
            Please refresh the page. If the problem continues, try disabling
            browser extensions or ad blockers, or use a different browser.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
```
```jsx
<PaymentErrorBoundary>
  <PaymentForm ...>
    {/* ... */}
  </PaymentForm>
</PaymentErrorBoundary>
```

### 3.8 Remove dead code

**Before**
```js
const handleCheckout = async (draftOrderId, pickupTime, tipAmount, specialInstructions) => {
  // ... calls checkout(), router.replace(squareCheckoutUrl) ...
};
```
Not called or wired to anything in the render.

**After**
Delete it, or reconnect it if it's actually meant to be a live fallback flow.

---

## 4. Verify & monitor (ongoing)

- [ ] Deploy the `next.config.js` changes, then confirm with:
  ```bash
  curl -sI https://yoursite.example/menu/order/payment | grep -i content-security-policy
  ```
  Exactly one `Content-Security-Policy` header, containing `frame-src *`.
- [ ] In DevTools → Network, trigger a client error and confirm a `POST` to
      `*.ingest.de.sentry.io` succeeds (validates the `connect-src` fix).
- [ ] In Sentry → Issues, search `logger:csp` (or `event.type:csp`) and
      confirm violation reports are landing.
- [ ] Set up an alert rule on that saved search so new violation types
      surface automatically instead of waiting for a support ticket.
- [ ] Consider routing CSP reports to a separate Sentry project — they can be
      noisy (browser extensions trigger false positives unrelated to your
      site).
