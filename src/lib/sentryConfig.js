/**
 * Sentry Configuration - Data Sanitization
 * 
 * Central utility for sanitizing sensitive data before sending to Sentry.
 * Prevents exposure of payment tokens, customer PII, and Square API keys.
 */

/**
 * beforeSend hook - Scrubs sensitive data from error events
 */
export function beforeSend(event, hint) {
  // Remove sensitive data from event contexts
  if (event.contexts) {
    // Remove any payment-related sensitive data
    if (event.contexts.payment) {
      delete event.contexts.payment.sourceId;
      delete event.contexts.payment.verificationToken;
      delete event.contexts.payment.contactDetails;
    }
    
    // Remove form data that might contain PII
    if (event.contexts.form) {
      delete event.contexts.form.contactDetails;
      delete event.contexts.form.email;
      delete event.contexts.form.phone;
      delete event.contexts.form.name;
    }
  }

  // Remove sensitive data from event extra data
  if (event.extra) {
    delete event.extra.sourceId;
    delete event.extra.verificationToken;
    delete event.extra.contactDetails;
    delete event.extra.specialInstructions;
    delete event.extra.ACCESS_TOKEN;
    delete event.extra.fulfillments;
    delete event.extra.customer_id;
  }

  // Sanitize request data
  if (event.request) {
    // Remove sensitive headers
    if (event.request.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers['Square-Access-Token'];
    }
    
    // Sanitize request body/data
    if (event.request.data) {
      const data = typeof event.request.data === 'string' 
        ? JSON.parse(event.request.data) 
        : event.request.data;
      
      if (data) {
        delete data.sourceId;
        delete data.verificationToken;
        delete data.contactDetails;
        delete data.specialInstructions;
      }
    }
  }

  // Filter CSP violations from payment page (optional - reduce noise)
  if (event.exception?.values?.[0]?.type === 'SecurityPolicyViolationEvent') {
    const url = event.request?.url || '';
    if (url.includes('/menu/order/payment')) {
      // Optionally filter payment page CSP violations
      // Uncomment to filter: return null;
      
      // Or tag them for easy filtering in dashboard
      event.tags = event.tags || {};
      event.tags.page_type = 'payment';
    }
  }

  return event;
}

/**
 * beforeBreadcrumb hook - Filters sensitive data from breadcrumbs
 */
export function beforeBreadcrumb(breadcrumb, hint) {
  // Remove sensitive data from UI interaction breadcrumbs
  if (breadcrumb.category === 'ui.input' || breadcrumb.category === 'ui.blur') {
    // Keep the action (blur, focus) but remove the value
    if (breadcrumb.message) {
      // Remove email, phone, name values from breadcrumb messages
      const sensitiveFields = ['email', 'phone', 'name', 'card'];
      const isSensitive = sensitiveFields.some(field => 
        breadcrumb.message.toLowerCase().includes(field)
      );
      
      if (isSensitive && breadcrumb.data) {
        delete breadcrumb.data.value;
      }
    }
  }

  // Remove sensitive data from console breadcrumbs
  if (breadcrumb.category === 'console') {
    if (breadcrumb.data?.arguments) {
      // Filter out arguments that might contain sensitive data
      breadcrumb.data.arguments = breadcrumb.data.arguments.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          const cleaned = { ...arg };
          delete cleaned.sourceId;
          delete cleaned.verificationToken;
          delete cleaned.contactDetails;
          delete cleaned.email;
          delete cleaned.phone;
          delete cleaned.name;
          return cleaned;
        }
        return arg;
      });
    }
  }

  // Remove sensitive data from fetch/xhr breadcrumbs
  if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
    if (breadcrumb.data) {
      delete breadcrumb.data.sourceId;
      delete breadcrumb.data.verificationToken;
      
      // Remove sensitive headers
      if (breadcrumb.data.headers) {
        delete breadcrumb.data.headers.Authorization;
        delete breadcrumb.data.headers['Square-Access-Token'];
      }
    }
  }

  return breadcrumb;
}
