/**
 * Unified error handling utilities
 */

import * as Sentry from '@sentry/nextjs';
import toast from 'react-hot-toast';

/**
 * Handle API errors with consistent Sentry logging and user notifications
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Additional context for error logging (e.g., { component: 'PaymentForm', orderId: '123' })
 * @param {string} userMessage - User-friendly error message to display
 * @param {Object} toastOptions - Optional toast configuration
 */
export function handleApiError(error, context = {}, userMessage = "An error occurred. Please try again.", toastOptions = { duration: 10000 }) {
  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: context.tags || {},
      contexts: {
        ...context.contexts,
        error_context: context
      }
    });
  }
  
  // Show user-friendly toast notification
  toast.error(userMessage, toastOptions);
  
  // Also log to console in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', userMessage, error, context);
  }
}

/**
 * Add a breadcrumb to Sentry for tracking user actions
 * Safe to call - no-op if not in production
 * 
 * @param {string} message - Breadcrumb message
 * @param {Object} options - Additional options (category, level, data)
 */
export function addBreadcrumb(message, options = {}) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category: options.category || 'action',
      level: options.level || 'info',
      data: options.data || {}
    });
  }
}
