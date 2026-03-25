# Code Quality Improvements

This document tracks suggested improvements to enhance code maintainability, reduce duplication, and prevent bugs.

---

## High Priority (Quick Wins)

### 1. Extract Square API Version Constant
**Issue**: API version string `"2026-01-22"` is hardcoded 15+ times across the codebase.  
**Impact**: When Square updates their API version, we need to update 15+ files manually.  
**Solution**: Create a constants file with `SQUARE_API_VERSION = "2026-01-22"` and import it everywhere.

**Files affected**:
- `src/app/api/payments/route.js`
- `src/app/api/customers/route.js`
- `src/app/menu/order/actions.js`
- `src/app/api/webhooks/square/route.js`
- And 2-3 more files

**Effort**: 30 minutes  
**Risk**: Low - Search and replace operation

---

### 2. Remove Unused State Variables
**Issue**: `showContactForm` state exists in `PaymentForm.jsx` but is never used.  
**Impact**: Confusing for maintainers, adds unnecessary code.  
**Solution**: Remove the unused state variable.

**Files affected**:
- `src/app/menu/order/payment/PaymentForm.jsx`

**Effort**: 5 minutes  
**Risk**: None - variable is unused

---

### 3. Fix Name Splitting Logic
**Issue**: Current implementation splits name on first space only:
```javascript
const [firstName, ...lastNameParts] = contactDetails.name.split(' ');
const lastName = lastNameParts.join(' ');
```
This breaks on multi-word first names or single-word names.

**Impact**: Square customer records may have incorrect name data.  
**Solution**: Create a proper `splitName()` helper function with validation.

**Example**:
```javascript
function splitName(fullName) {
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  
  // Default: first word is first name, rest is last name
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}
```

**Files affected**:
- `src/app/api/payments/route.js`
- `src/app/menu/order/actions.js`

**Effort**: 20 minutes  
**Risk**: Low - improves robustness

---

## Medium Priority (DRY Violations)

### 4. Extract Pickup Time Generation to Shared Utility
**Issue**: Pickup time generation logic is duplicated in two files with 60+ lines of identical code:
- `src/app/menu/order/payment/PaymentForm.jsx` (lines 26-81)
- `src/app/menu/order/checkout/page.jsx` (lines 25-81)

**Impact**: Changes to business hours or time slot logic require updating multiple files.  
**Solution**: Create `src/lib/generatePickupTimes.js` utility function.

**Function signature**:
```javascript
/**
 * Generate pickup time options with 15-minute intervals
 * @param {number} minLeadTimeMinutes - Minimum lead time from now (default: 30)
 * @param {number} startHour - Start of day hour (default: 11)
 * @param {number} endHour - End of day hour (default: 19)
 * @returns {Array<{label: string, value: string}>} Array of time options
 */
export function generatePickupTimes(
  minLeadTimeMinutes = 30,
  startHour = 11,
  endHour = 19
) {
  // Implementation
}
```

**Files affected**:
- Create: `src/lib/generatePickupTimes.js`
- Update: `src/app/menu/order/payment/PaymentForm.jsx`
- Update: `src/app/menu/order/checkout/page.jsx`

**Effort**: 1 hour  
**Risk**: Low - pure function with existing logic

---

### 5. Create Shared Square API Fetch Helper
**Issue**: Every Square API call repeats the same headers and error handling:
```javascript
const response = await fetch(..., {
  method: 'POST',
  headers: {
    'Square-Version': '2026-01-22',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(...)
});
```

**Impact**: Inconsistent error handling, duplicate code, hard to add global API improvements (logging, retry logic).  
**Solution**: Create `src/lib/squareApi.js` with a `fetchSquare()` helper.

**Function signature**:
```javascript
/**
 * Make authenticated request to Square API
 * @param {string} endpoint - API endpoint (e.g., '/v2/payments')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
export async function fetchSquare(endpoint, options = {}) {
  const url = `https://connect.squareup.com${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Square-Version': SQUARE_API_VERSION,
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Square API error: ${error.errors?.[0]?.detail || response.statusText}`);
  }
  
  return response.json();
}
```

**Files affected**:
- Create: `src/lib/squareApi.js`
- Update: `src/app/api/payments/route.js`
- Update: `src/app/api/customers/route.js`
- Update: `src/app/menu/order/actions.js`
- Update: `src/app/api/webhooks/square/route.js`

**Effort**: 2 hours  
**Risk**: Medium - affects all Square API calls, needs thorough testing

---

### 6. Extract Validation Logic to Shared Utilities
**Issue**: Email and phone validation patterns are duplicated:
```javascript
// PaymentForm.jsx
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

// Similar patterns in other files
```

**Impact**: Inconsistent validation rules across the app.  
**Solution**: Create `src/lib/validation.js` with reusable validators.

**Example**:
```javascript
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

export function validateEmail(email) {
  return email && EMAIL_REGEX.test(email);
}

export function validatePhone(phone) {
  return phone && PHONE_REGEX.test(phone) && phone.length >= 10;
}

export function validateContactDetails(details) {
  const errors = {};
  if (!details.name?.trim()) errors.name = 'Name is required';
  if (!validateEmail(details.email)) errors.email = 'Valid email is required';
  if (!validatePhone(details.phone)) errors.phone = 'Valid phone is required';
  return { isValid: Object.keys(errors).length === 0, errors };
}
```

**Files affected**:
- Create: `src/lib/validation.js`
- Update: `src/app/menu/order/payment/PaymentForm.jsx`
- Update: `src/app/api/payments/route.js`

**Effort**: 1 hour  
**Risk**: Low - improves consistency

---

## Low Priority (Future Enhancements)

### 7. Add Email Notifications in Webhook
**Issue**: When payment completes, no email is sent to customer or restaurant.  
**Impact**: Customers don't receive confirmation, restaurant may miss orders.  
**Solution**: Add email sending to webhook handler when payment status is `COMPLETED`.

**Requirements**:
- Send customer confirmation with order details and pickup time
- Send restaurant notification with order summary
- Use Resend, SendGrid, or similar service
- Add email templates

**Files affected**:
- Update: `src/app/api/webhooks/square/route.js`
- Create: Email templates
- Add: Email service configuration

**Effort**: 4-6 hours  
**Risk**: Medium - requires external service setup

---

### 8. Consider TypeScript Migration
**Issue**: JavaScript allows type-related bugs to slip through.  
**Impact**: Runtime errors from incorrect data types, poor IDE autocomplete.  
**Solution**: Migrate to TypeScript incrementally, starting with new files.

**Benefits**:
- Better IDE support and autocomplete
- Catch errors at compile time
- Self-documenting code with type definitions
- Easier refactoring

**Approach**:
1. Add `tsconfig.json` with `allowJs: true`
2. Rename new files to `.ts` / `.tsx`
3. Gradually add types to existing files
4. Enable stricter type checking over time

**Effort**: Ongoing (weeks)  
**Risk**: High - large breaking change, requires team buy-in

---

### 9. Extract Business Configuration
**Issue**: Business rules are hardcoded throughout the codebase:
- Pickup hours: 11 AM - 7 PM
- Time slot interval: 15 minutes
- Minimum lead time: 30 minutes
- Pickup window duration: PT15M
- Currency: GBP

**Impact**: Changes to business rules require code changes and redeployment.  
**Solution**: Create configuration file or environment variables.

**Example** (`src/config/business.js`):
```javascript
export const BUSINESS_CONFIG = {
  pickupHours: {
    start: 11, // 11 AM
    end: 19,   // 7 PM
  },
  pickupSlots: {
    intervalMinutes: 15,
    minLeadTimeMinutes: 30,
    windowDuration: 'PT15M',
  },
  currency: 'GBP',
  location: {
    timezone: 'Europe/London',
  },
};
```

**Files affected**:
- Create: `src/config/business.js`
- Update: `src/lib/generatePickupTimes.js` (if created)
- Update: `src/app/menu/order/payment/PaymentForm.jsx`
- Update: `src/app/api/payments/route.js`

**Effort**: 2 hours  
**Risk**: Low - improves maintainability

---

### 10. Remove or Update Unused Checkout Page
**Issue**: `src/app/menu/order/checkout/page.jsx` exists but is not in the navigation flow.  
**Current State**: Navigation goes directly from menu to payment page, skipping checkout.  
**Options**:
1. Delete the file entirely
2. Keep it for future use cases (e.g., delivery orders that need address collection)
3. Repurpose it for a different step

**Decision needed**: Clarify if checkout page will ever be used again.

**Files affected**:
- `src/app/menu/order/checkout/page.jsx` (delete or keep?)

**Effort**: 5 minutes to delete, or document its purpose  
**Risk**: None if deleting unused code

---

## Summary

**Quick Wins to Implement First**:
1. Extract Square API version constant (30 min)
2. Remove unused state variables (5 min)
3. Fix name splitting logic (20 min)
4. Extract pickup time generation utility (1 hour)

**Total effort for quick wins**: ~2 hours  
**Expected impact**: Significant reduction in maintenance burden and bug risk

**Next Phase (Medium Priority)**:
5. Create shared Square API fetch helper (2 hours)
6. Extract validation logic (1 hour)

**Future Considerations**:
7. Email notifications in webhook
8. TypeScript migration
9. Business configuration extraction
10. Cleanup unused checkout page

---

## Implementation Notes

- All changes should be tested thoroughly before deployment
- Consider creating a feature branch for each improvement
- Update tests if they exist
- Document any breaking changes
- Review with team before implementing Medium/Low priority items
