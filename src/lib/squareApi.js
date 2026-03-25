"use server";

import { SQUARE_API_VERSION } from "./constants";

/**
 * Make authenticated request to Square API
 * @param {string} endpoint - API endpoint path (e.g., '/v2/payments') or full URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} When the API request fails
 */
export async function fetchSquare(endpoint, options = {}) {
  // If endpoint is a full URL, use it directly; otherwise prepend base URL
  const baseUrl = process.env.API_BASE_URL || "https://connect.squareup.com";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Square-Version": SQUARE_API_VERSION,
      "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    const errorDetail = data.errors?.[0]?.detail || data.errors?.[0]?.code || response.statusText;
    const error = new Error(`Square API error: ${errorDetail}`);
    error.response = response;
    error.data = data;
    throw error;
  }
  
  return data;
}
