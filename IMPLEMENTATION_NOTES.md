# Implementation Notes for Points 1-4

## What Was Implemented

### 1. Two Menu Views ✅
- **Created `/menu/view`** - Read-only browsing menu (no cart, no ordering)
- **Created `/menu/order`** - Orderable menu with quantity controls and cart management

### 2. Order Initialization Logic ✅
- **Created `/menu/order/page.jsx`** with complete order initialization flow:
  - Checks `localStorage` for existing order `{ orderId, version }`
  - If found, fetches order from Square to check current state
  - Handles `DRAFT`, `OPEN`, `COMPLETED`, and `CANCELED` states
  - Rehydrates cart from line items when resuming an order
  - Creates new draft order if none exists or previous order was completed/canceled
  - Stores order ID and version in localStorage

### 3. Cart State Management ✅
- **Implemented `useState` in `/menu/order/page.jsx`**:
  - Single state object: `{ variationId: quantity }`
  - `addItem(variationId)` and `removeItem(variationId)` functions
  - Props passed down to MenuList and MenuItem components
  - No Context API needed - order summary will be a modal in same component tree

### 4. Quantity Controls ✅
- **Updated `MenuItem.jsx`** and **`MenuList.jsx`** to support order mode:
  - Added `+` / `−` buttons on each menu item
  - Buttons disabled per-item while `updateOrderItems()` is in flight
  - Shows loading spinner during updates
  - Optimistic UI updates with rollback on failure
  - Handles 409 version conflicts by re-fetching order
  - Displays item subtotal when quantity > 0
  - Square is the source of truth

### 5. Server Actions Created ✅
- **Created `/menu/order/actions.js`** with three server actions:
  - `createOrder()` - Creates a DRAFT order in Square
  - `getOrder(orderId)` - Fetches order from Square by ID
  - `updateOrderItems(orderId, version, cart)` - Updates line items with version conflict handling
  - **Uses direct Square REST API calls with fetch** (no SDK needed)

## Required Setup (Not Yet Done)

### 1. Environment Variables
Add to `.env.local`:
```env
ACCESS_TOKEN=your_access_token_here
LOCATION_ID=your_location_id_here
API_ORDERS_URL=https://connect.squareup.com/v2/orders
```

### 2. Menu Data Structure
The `menu.json` file needs to include `variationId` for each item to map to Square Catalog objects.

Example:
```json
{
  "name": "The Kira Roll",
  "variationId": "SQUARE_VARIATION_ID_HERE",
  "category": "sushi",
  ...
}
```

You'll need to:
1. Create items in Square Catalog
2. Get the variation IDs from Square
3. Add them to menu.json

## Testing Checklist

Before testing, ensure:
- [ ] Environment variables configured in `.env.local`
- [ ] Menu items have `variationId` fields
- [ ] Square API endpoints are accessible

## What's Next (Points 5-9)

The following points from the checkout plan still need to be implemented:
- Point 5: Accidental navigation protection
- Point 6: Order summary modal
- Point 7: Checkout flow with Square payment links
- Point 8: Square payment page (handled by Square)
- Point 9: Confirmation page at `/menu/order/confirmation`

## Architecture Notes

- **Direct Square REST API** calls using native `fetch` (no SDK dependency)
- Server Actions handle all Square API communication
- Client components manage UI state and user interactions
- Order state synced between localStorage and Square
- Version-based optimistic concurrency control prevents race conditions
- Error handling includes rollback mechanisms for failed updates
