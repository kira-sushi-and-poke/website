"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.LOCATION_ID;
const API_ORDERS_URL = process.env.API_ORDERS_URL;
const API_PAYMENT_LINKS_URL = process.env.API_PAYMENT_LINKS_URL;
const SITE_URL = process.env.SITE_URL;

/**
 * Sanitize order data for client by removing sensitive information
 */
function sanitizeOrderForClient(order) {
  if (!order) return order;
  
  return {
    id: order.id,
    version: order.version,
    state: order.state,
    line_items: order.line_items,
    created_at: order.created_at,
    updated_at: order.updated_at,
    // Explicitly exclude location_id and other sensitive fields
  };
}

/**
 * Creates a new draft order in Square
 * @returns {Promise<{success: boolean, orderId?: string, version?: number, error?: string}>}
 */
export async function createOrder() {
  try {
    const response = await fetch(API_ORDERS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
      body: JSON.stringify({
        order: {
          location_id: LOCATION_ID,
          state: "DRAFT",
          line_items: [], // Start with empty cart
        },
        idempotency_key: crypto.randomUUID(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to create order",
      };
    }

    if (data.order) {
      return {
        success: true,
        orderId: data.order.id,
        version: data.order.version,
      };
    }

    return {
      success: false,
      error: "Failed to create order",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create order",
    };
  }
}

/**
 * Fetches an order from Square by ID
 * @param {string} orderId - The Square order ID
 * @returns {Promise<{success: boolean, order?: object, error?: string}>}
 */
export async function getOrder(orderId) {
  try {
    const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (data.order) {
      return {
        success: true,
        order: sanitizeOrderForClient(data.order),
      };
    }

    return {
      success: false,
      error: "Order not found",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch order",
    };
  }
}

/**
 * Updates line items in an order
 * @param {string} orderId - The Square order ID
 * @param {number} version - The current version of the order
 * @param {Object} cart - Cart state: { variationId: quantity }
 * @returns {Promise<{success: boolean, version?: number, order?: object, error?: string, isConflict?: boolean}>}
 */
export async function updateOrderItems(orderId, version, cart) {
  try {
    // First, fetch the current order to get existing line items with UIDs
    const getResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
    });

    if (!getResponse.ok) {
      return {
        success: false,
        error: "Failed to fetch current order",
        isConflict: false,
      };
    }

    const currentOrderData = await getResponse.json();
    const existingLineItems = currentOrderData.order.line_items || [];

    // Build map of catalog_object_id -> line item UID from existing order
    const existingItemsMap = new Map();
    existingLineItems.forEach(item => {
      if (item.catalog_object_id) {
        existingItemsMap.set(item.catalog_object_id, item.uid);
      }
    });

    // Convert cart to desired line items
    const desiredItems = Object.entries(cart)
      .filter(([variationId, quantity]) => quantity > 0)
      .map(([variationId, quantity]) => ({
        catalog_object_id: variationId,
        quantity: quantity.toString(),
        ...(existingItemsMap.has(variationId) && { uid: existingItemsMap.get(variationId) })
      }));

    // Identify items to remove (exist in order but not in cart)
    const itemsToRemove = existingLineItems
      .filter(item => {
        const catalogId = item.catalog_object_id;
        return catalogId && !cart[catalogId];
      })
      .map(item => item.uid);

    console.log("Updating order - desired items:", desiredItems);
    console.log("Items to remove:", itemsToRemove);

    const requestBody = {
      order: {
        location_id: LOCATION_ID,
        version: currentOrderData.order.version, // Use latest version
        line_items: desiredItems,
      },
    };

    // Clear line items that should be removed
    if (itemsToRemove.length > 0) {
      requestBody.fields_to_clear = itemsToRemove.map(uid => `line_items[${uid}]`);
    }

    const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square update order error:", data);
      // Check if it's a 409 conflict error
      if (response.status === 409 || data.errors?.[0]?.code === "VERSION_MISMATCH") {
        return {
          success: false,
          error: "Version conflict - order was modified",
          isConflict: true,
        };
      }

      return {
        success: false,
        error: "Failed to update order",
        isConflict: false,
      };
    }

    if (data.order) {
      return {
        success: true,
        version: data.order.version,
        order: sanitizeOrderForClient(data.order),
      };
    }

    return {
      success: false,
      error: "Failed to update order",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update order",
      isConflict: false,
    };
  }
}

/**
 * Creates a Square payment link and redirects to Square checkout
 * @param {string} orderId - The Square order ID
 * @returns {Promise<void>} - Redirects to Square checkout or throws error
 */
export async function checkout(orderId) {
  try {
    // First, get the current order to get its line_items
    const getResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
    });

    if (!getResponse.ok) {
      throw new Error("Failed to fetch order");
    }

    const orderData = await getResponse.json();
    const order = orderData.order;

    // Validate that order has line items
    if (!order.line_items || order.line_items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    // Strip read-only fields from line items (Square calculates these)
    const sanitizedLineItems = order.line_items.map(item => ({
      catalog_object_id: item.catalog_object_id,
      quantity: item.quantity,
      ...(item.note && { note: item.note }),
      ...(item.modifiers && { modifiers: item.modifiers.map(mod => ({
        catalog_object_id: mod.catalog_object_id,
        quantity: mod.quantity,
      })) }),
    }));

    // Now create the payment link with order details
    const redirectUrl = `${SITE_URL}/menu/order/confirmation?orderId=${orderId}`;
    
    const orderPayload = {
      location_id: LOCATION_ID,
      line_items: sanitizedLineItems,
      metadata: {
        placed_at: new Date().toISOString(),
        payment_method: "Square Checkout",
      },
    };
    
    // Add fulfillment details if pickup time provided
    if (customerInfo?.pickupTime && customerInfo?.name) {
      orderPayload.fulfillments = [{
        type: "PICKUP",
        state: "PROPOSED",
        pickup_details: {
          recipient: {
            display_name: customerInfo.name,
            ...(customerInfo.email && { email_address: customerInfo.email }),
            ...(customerInfo.phone && { phone_number: customerInfo.phone }),
          },
          schedule_type: "SCHEDULED",
          pickup_at: customerInfo.pickupTime,
          pickup_window_duration: "PT15M",
          note: "Online order - pickup",
        },
      }];
    }
    
    const response = await fetch(API_PAYMENT_LINKS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: orderPayload,
        checkout_options: {
          redirect_url: redirectUrl,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Square Payment Link Error:", data);
      throw new Error("Failed to create payment link. Please try again.");
    }

    if (data.payment_link && data.payment_link.url) {
      // Redirect to Square's hosted checkout page
      // Note: redirect() throws a special Next.js error - don't catch it
      redirect(data.payment_link.url);
    } else {
      throw new Error("Payment link URL not found");
    }
  } catch (error) {
    // Re-throw if it's a Next.js redirect (NEXT_REDIRECT)
    if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Checkout error:", error);
    throw new Error("Failed to initiate checkout. Please try again.");
  }
}
