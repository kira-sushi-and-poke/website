/**
 * Split a full name into first and last name components
 * @param {string} fullName - The full name to split
 * @returns {{firstName: string, lastName: string}} Object with firstName and lastName
 */
export function splitName(fullName) {
  const parts = fullName.trim().split(' ').filter(Boolean);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  // Multiple words: first is first name, rest is last name
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}
