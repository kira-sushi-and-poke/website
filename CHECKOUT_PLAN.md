# Checkout Plan

## Option 2 — Orderable Menu with Square Draft Orders

### 1. Two Menu Views
- `/menu/view` — read only, browsing only, no cart, no ordering
- `/menu/order` — orderable view, has quantity controls, triggers order creation on load

---

### 2. Entering `/menu/order`
- Check localStorage for an existing `order` object `{ orderId, version }`
- If found → fetch order directly in server component to check current state from Square
  - If `DRAFT` → reuse it, sync version from response, rehydrate cart from line items
  - If `OPEN` → reuse it, sync version, rehydrate cart — user has returned after abandoning checkout, show order summary modal automatically
  - If `COMPLETED` or `CANCELED` → clear localStorage, create a fresh draft
- If not found → call `createOrder()` Server Action to create a `DRAFT` order, store `{ orderId, version }` in localStorage
- If `createOrder()` fails → show error message and block the user from ordering until resolved

---

### 3. Cart State with `useState`
- Single `useState` in the top-level menu page — `{ variationId: quantity }`
- Pass `cart`, `addItem`, `removeItem` down as props
- No Context needed — order summary is a modal in the same component tree

---

### 4. Quantity Controls on Menu Items
- `+` / `−` buttons on each item
- Disable buttons on that specific item while `updateOrderItems()` is in flight
- Show a subtle loading indicator per item during the request
- Every change calls `updateOrderItems()` Server Action with current `version` from localStorage
- On success → update `version` in localStorage with what Square returns, re-enable buttons
- On `409` conflict → re-fetch order directly in server component to rehydrate cart and sync latest `version`
- On other failures → revert the quantity change in the UI, show error message to user, re-enable buttons
- Square is the source of truth

---

### 5. Accidental Navigation Protection
- **Desktop** — `beforeunload` listener activates when cart has items, triggers browser's native "are you sure you want to leave?" dialog
- **Mobile Safari** — `visibilitychange` listener detects when page is hidden and shows a custom dialog with **Resume Order** and **Start Fresh** options
- Note: `visibilitychange` fires on tab switch, app backgrounding, and screen lock — not just navigation, hence the Resume Order option
- Note: Since the draft order persists in Square regardless, data loss risk on mobile is low

---

### 6. Order Summary Modal
- Triggered from the menu page when user is ready to review
- Also shown automatically when user returns to `/menu/order` with an `OPEN` order
- Displays full order breakdown — items, quantities, subtotal
- User can close it and go back to the menu to edit items
- Has a **Confirm & Pay** button
- Note: Square payment links are valid for 180 days once generated

---

### 7. Checkout Flow
- Call `checkout()` Server Action:
  - Creates payment link via `POST /v2/online-checkout/payment-links` with the current `orderId` — works for both `DRAFT` and `OPEN` orders
  - Sets `redirect_url` to `/menu/order/confirmation?orderId=xxxx`
  - If this fails → throws an error back to the frontend, shows error message and lets the user retry without losing their order
  - If successful → calls Next.js `redirect()` server-side directly to Square's hosted checkout page, no URL returned to the frontend

---

### 8. Square Handles Payment
- Square hosts the payment page and handles card input and confirmation
- Redirects the user to `/menu/order/confirmation?orderId=xxxx` after payment
- Checkout page branding can be customised in Square Dashboard under Payments & orders → Payment links → Settings → Branding:
  - Logo
  - Button colour (including custom hex code)
  - Button shape
  - Font

---

### 9. `/menu/order/confirmation` Page
- Reads `orderId` from query param
- If `orderId` is missing → redirect to `/menu/order`
- Fetch order directly in server component using `orderId` to check status from Square
  - If `COMPLETED` → clear localStorage, show confirmation to user with order summary and thank you message
  - If `OPEN` → user abandoned payment, redirect back to `/menu/order` — order summary modal will show automatically
  - If `CANCELED` → clear localStorage, show message that the order was cancelled, redirect to `/menu/order`
  - If fetch fails → show error message with option to contact support

---

## Routes Summary

| Route | Purpose |
|---|---|
| `/menu/view` | Read only menu, no ordering |
| `/menu/order` | Orderable menu, full cart and checkout flow |
| `/menu/order/confirmation` | Post-payment confirmation, reads `orderId` from query param |

---

## Server Actions

| Action | Purpose |
|---|---|
| `createOrder()` | Creates a fresh `DRAFT` order in Square |
| `updateOrderItems()` | Updates line items only, state never touched |
| `checkout()` | Creates payment link, redirects to Square via Next.js `redirect()` |

---

## Data Fetching

| Fetch | Where |
|---|---|
| Check existing order on `/menu/order` load | Directly in server component |
| Rehydrate cart on `409` conflict | Directly in server component |
| Verify order status on `/menu/order/confirmation` | Directly in server component |

---

## Before Going Live — Square Dashboard Setup

| Task | Where |
|---|---|
| Set up business location to get Location ID | Square Dashboard → Account & Settings → Locations |
| Enable Apple Pay, Google Pay, Cash App Pay | Square Dashboard → Payments & orders → Payment links → Settings → General |
| Customise checkout page branding | Square Dashboard → Payments & orders → Payment links → Settings → Branding |

---

## Loading States

| Action | Loading Behaviour |
|---|---|
| Entering `/menu/order` | Show full page loader while fetching/creating order |
| Adding/removing item | Disable `+` / `−` on that item, show per-item loader |
| Confirm & Pay | Disable button, show loader while Server Action is in flight |
| `/menu/order/confirmation` load | Show loader while fetching order status from Square |

---

## Error Handling

| Scenario | Action |
|---|---|
| `createOrder()` fails | Show error, block ordering until resolved |
| `updateOrderItems()` fails | Revert quantity change in UI, show error message |
| `409` version conflict | Rehydrate cart from Square, sync latest version |
| `checkout()` fails | Show error, let user retry without losing order |
| Payment link expired on return | Order is `OPEN`, redirect to `/menu/order`, show order summary modal |
| `orderId` missing on confirmation page | Redirect to `/menu/order` |
| Order fetch fails on confirmation page | Show error with option to contact support |

---

## When to Clear localStorage

| Scenario | Action |
|---|---|
| Order is `COMPLETED` on confirmation page | Clear localStorage |
| Order is `CANCELED` | Clear localStorage, redirect to `/menu/order` |
| User returns to `/menu/order` with `OPEN` order | Keep `{ orderId, version }`, show order summary modal |

---

## Key Differences from Option 1

| | Option 1 | Option 2 |
|---|---|---|
| State management | `useState` | `useState` |
| Order creation | On checkout | On entering `/menu/order` |
| Order updates | Single API call | On every item change via Server Action |
| Order summary | Full screen overlay | Modal |
| Persistence | None | `{ orderId, version }` in localStorage |
| Conflict handling | None | 409 conflict → rehydrate from Square |
| Square order state | Created as `OPEN` | Created as `DRAFT`, Square flips to `OPEN` on payment |
| Post payment | N/A | Dedicated `/menu/order/confirmation` page |
| Error handling | Minimal | Per action with UI feedback |
| Loading states | Minimal | Per action with UI feedback |
| Mobile navigation protection | `beforeunload` only | `beforeunload` + `visibilitychange` + custom dialog |
| Checkout branding | N/A | Customisable via Square Dashboard |