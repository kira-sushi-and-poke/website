/**
 * Validation utilities for contact forms and user input
 */

// Validation regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export function validateEmail(email) {
  return email && EMAIL_REGEX.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export function validatePhone(phone) {
  return phone && PHONE_REGEX.test(phone) && phone.length >= 10;
}

/**
 * Validate contact details object
 * @param {object} details - Contact details object with name, email, phone, pickupTime
 * @returns {{isValid: boolean, errors: object}} Validation result with errors object
 */
export function validateContactDetails(details) {
  const errors = {};
  
  if (!details.name?.trim()) {
    errors.name = "Name is required";
  }
  
  if (!details.email?.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(details.email)) {
    errors.email = "Invalid email format";
  }
  
  if (!details.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!validatePhone(details.phone)) {
    errors.phone = "Invalid phone number";
  }
  
  if (details.pickupTime !== undefined && !details.pickupTime) {
    errors.pickupTime = "Pickup time is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
