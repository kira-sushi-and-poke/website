"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import {
  SQUARE_API_VERSION,
  CURRENCY,
  FULFILLMENT_TYPE_PICKUP,
  FULFILLMENT_STATE_PROPOSED,
  FULFILLMENT_STATE_RESERVED,
  PICKUP_WINDOW_DURATION,
  PICKUP_NOTE,
  ORDER_STATE_DRAFT,
  ORDER_STATE_OPEN,
  PAYMENT_METHOD_CUSTOM,
  PAYMENT_METHOD_SQUARE_CHECKOUT,
  PAYMENT_STATUS_COMPLETED
} from "@/lib/constants";
import { fetchSquare } from "@/lib/squareApi";
import { splitName } from "@/lib/splitName";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.LOCATION_ID;
const API_ORDERS_URL = process.env.API_ORDERS_URL;
const API_PAYMENT_LINKS_URL = process.env.API_PAYMENT_LINKS_URL;
const API_CUSTOMERS_URL = process.env.API_CUSTOMERS_URL;
const API_PAYMENTS_URL = process.env.API_PAYMENTS_URL;
const SITE_URL = process.env.SITE_URL;

/**
 * Sanitize order data for client by removing sensitive information
 * Explicitly removes PII and internal business data
 */
function sanitizeOrderForClient(order) {
  if (!order) return order;
  
  // Extract fulfillment status and pickup time without PII
  const fulfillment = order.fulfillments?.[0];
  const fulfillmentStatus = fulfillment?.state || "PROPOSED";
  const pickupTime = fulfillment?.pickup_details?.pickup_at || null;
  
  // Check if order has successful payment
  // With autocomplete:true, successful payments create tenders with CARD type
  // Failed payments still attach tenders to the order
  const hasSuccessfulPayment = order.tenders?.some(
    tender => tender.type === "CARD" && tender.card_details?.status === "CAPTURED"
  ) ?? false;
  
  return {
    id: order.id,
    version: order.version,
    state: order.state,
    line_items: order.line_items,
    created_at: order.created_at,
    updated_at: order.updated_at,
    total_money: order.total_money,
    total_tax_money: order.total_tax_money,
    total_discount_money: order.total_discount_money,
    has_payment: hasSuccessfulPayment, // Only true if payment captured
    fulfillment_status: fulfillmentStatus, // Safe: just the state, no PII
    pickup_time: pickupTime, // Safe: just the timestamp
    // Explicitly exclude sensitive fields:
    // - customer_id: internal customer reference
    // - location_id: business location identifier
    // - fulfillments: contains PII (customer name, email, phone)
    // - tenders: payment method details (but we expose has_payment flag)
    // - refunds: payment refund data
    // - metadata: may contain sensitive information
    // - net_amounts: internal calculated fields
  };
}

/**
 * Creates a new draft order in Square
 * @returns {Promise<{success: boolean, orderId?: string, version?: number, error?: string}>}
 */
export async function createOrder() {
  try {
    const data = await fetchSquare(API_ORDERS_URL, {
      method: "POST",
      body: JSON.stringify({
        order: {
          location_id: LOCATION_ID,
          state: "DRAFT",
          line_items: [],
        },
        idempotency_key: crypto.randomUUID(),
      }),
    });

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
    const data = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
    });

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
    const currentOrderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
    });

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

    const requestBody = {
      order: {
        location_id: LOCATION_ID,
        version: version, // Use version from client state for conflict detection
        line_items: desiredItems,
      },
    };

    // Clear line items that should be removed
    if (itemsToRemove.length > 0) {
      requestBody.fields_to_clear = itemsToRemove.map(uid => `line_items[${uid}]`);
    }

    try {
      const data = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

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
      // Check if it's a 409 conflict error
      if (error.response?.status === 409 || error.data?.errors?.[0]?.code === "VERSION_MISMATCH") {
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
    const orderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
    });

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
    
    const data = await fetchSquare(API_PAYMENT_LINKS_URL, {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        order: orderPayload,
        checkout_options: {
          redirect_url: redirectUrl,
        },
      }),
    });

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
    
    throw new Error("Failed to initiate checkout. Please try again.");
  }
}

/**
 * Creates a customer in Square and attaches them to an order
 * @param {string} orderId - The Square order ID
 * @param {string} name - Customer"s full name
 * @param {string} email - Customer"s email address
 * @param {string} phone - Customer's phone number
 * @returns {Promise<{success: boolean, version?: number, error?: string}>}
 */
export async function createCustomer(orderId, name, email, phone) {
  try {
    // Validate required fields
    if (!orderId || !name || !email || !phone) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }
    
    // Create customer in Square
    const { firstName, lastName } = splitName(name);
    const customerData = await fetchSquare(API_CUSTOMERS_URL, {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        given_name: firstName,
        family_name: lastName,
        email_address: email,
        phone_number: phone,
      }),
    });
    
    const customerId = customerData.customer?.id;
    
    if (!customerId) {
      return {
        success: false,
        error: "Failed to create customer. Please try again.",
      };
    }
    
    // Fetch the current order to get its version
    const orderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
    });
    
    const currentVersion = orderData.order?.version;
    
    // Update order with customer_id
    const updatedOrderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({
        order: {
          location_id: LOCATION_ID,
          version: currentVersion,
          customer_id: customerId,
        },
      }),
    });
    
    return {
      success: true,
      version: updatedOrderData.order?.version,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create customer or update order. Please try again.",
    };
  }
}

/**
 * Process a payment with Square
 * @param {string} sourceId - Square payment source token
 * @param {string} orderId - The Square order ID  
 * @param {number} amount - Payment amount in cents (order total only, excluding tip)
 * @param {string} verificationToken - Card verification token (optional)
 * @param {object} contactDetails - Customer contact details (name, email, phone)
 * @param {string} pickupTime - ISO string pickup time
 * @param {string} specialInstructions - Optional special instructions from customer
 * @param {number} tipAmount - Tip amount in cents (optional, defaults to 0)
 * @returns {Promise<{success: boolean, paymentId?: string, status?: string, receiptUrl?: string, error?: string, declineReason?: string}>}
 */
export async function processPayment(sourceId, orderId, amount, verificationToken, contactDetails, pickupTime, specialInstructions = "", tipAmount = 0) {
  try {
    // Validate required fields
    if (!sourceId || !orderId || !amount) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }
    
    // Validate pickup time is provided
    if (!pickupTime) {
      return {
        success: false,
        error: "Pickup time is required",
      };
    }
    
    // Validate contact details are provided
    if (!contactDetails || !contactDetails.name || !contactDetails.email || !contactDetails.phone) {
      return {
        success: false,
        error: "Contact details are required",
      };
    }
    
    // Fetch current order once to get version and state
    let orderData;
    try {
      orderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
        method: "GET",
      });
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: "Order not found. Please try again.",
        };
      }
      return {
        success: false,
        error: "Failed to retrieve order. Please try again.",
      };
    }
    
    const currentState = orderData.order?.state;
    const currentVersion = orderData.order?.version;
    
    // Check if order can be paid
    if (currentState !== ORDER_STATE_DRAFT && currentState !== ORDER_STATE_OPEN) {
      return {
        success: false,
        error: `Order cannot be paid (state: ${currentState})`,
      };
    }
    
    // Create customer and prepare order update in parallel (when possible)
    let customerId = null;
    
    // Create customer in background - don't block payment on this
    if (contactDetails.email && contactDetails.name) {
      try {
        const { firstName, lastName } = splitName(contactDetails.name);
        const customerData = await fetchSquare(API_CUSTOMERS_URL, {
          method: "POST",
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            given_name: firstName,
            family_name: lastName,
            email_address: contactDetails.email,
            ...(contactDetails.phone && { phone_number: contactDetails.phone }),
          }),
        });
        
        customerId = customerData.customer?.id;
      } catch (customerError) {
        // Continue with payment even if customer creation fails
      }
    }
    
    // Update order if DRAFT (needs state change) or OPEN (allow retry with updated details)
    if (currentState === ORDER_STATE_DRAFT || currentState === ORDER_STATE_OPEN) {
      try {
        const orderUpdate = {
          location_id: LOCATION_ID,
          version: currentVersion,
        };
        
        // Add customer_id if we created a customer
        if (customerId) {
          orderUpdate.customer_id = customerId;
        }
        
        // Update state if transitioning from DRAFT to OPEN
        if (currentState === ORDER_STATE_DRAFT) {
          orderUpdate.state = ORDER_STATE_OPEN;
          orderUpdate.metadata = {
            placed_at: new Date().toISOString(),
            payment_method: PAYMENT_METHOD_CUSTOM,
          };
        }
        
        // Build fulfillment object (for both DRAFT and OPEN)
        const fulfillmentNote = specialInstructions || "No special instructions";
        const fulfillment = {
          type: FULFILLMENT_TYPE_PICKUP,
          state: FULFILLMENT_STATE_PROPOSED,
          pickup_details: {
            recipient: {
              display_name: contactDetails.name,
              email_address: contactDetails.email,
              phone_number: contactDetails.phone,
            },
            schedule_type: "SCHEDULED",
            pickup_at: pickupTime,
            pickup_window_duration: PICKUP_WINDOW_DURATION,
            note: fulfillmentNote,
          },
        };
        
        // If updating existing OPEN order, include fulfillment UID
        if (currentState === ORDER_STATE_OPEN && orderData.order?.fulfillments?.[0]?.uid) {
          fulfillment.uid = orderData.order.fulfillments[0].uid;
        }
        
        orderUpdate.fulfillments = [fulfillment];
        
        await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({
            order: orderUpdate,
          }),
        });
      } catch (error) {
        return {
          success: false,
          error: "Failed to prepare order for payment. Please try again.",
        };
      }
    }
    
    // Process payment with Square
    try {
      // Calculate total payment amount (order total + tip)
      const totalPaymentAmount = amount + tipAmount;
      
      const paymentData = await fetchSquare(API_PAYMENTS_URL, {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          source_id: sourceId,
          amount_money: {
            amount: totalPaymentAmount,
            currency: CURRENCY,
          },
          location_id: LOCATION_ID,
          order_id: orderId,
          autocomplete: true,
          // Add tip separately if provided
          ...(tipAmount > 0 && {
            tip_money: {
              amount: tipAmount,
              currency: CURRENCY,
            },
          }),
          ...(verificationToken && {
            verification_token: verificationToken,
          }),
        }),
      });
      
      const payment = paymentData.payment;
      
      if (payment.status !== PAYMENT_STATUS_COMPLETED) {
        return {
          success: false,
          error: "Payment was not completed. Please try again.",
          status: payment.status,
        };
      }
      
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        receiptUrl: payment.receipt_url,
      };
    } catch (error) {
      // Check if it's a payment error with specific error codes
      if (error.data?.errors) {
        const squareError = error.data.errors[0];
        
        if (squareError.category === "PAYMENT_METHOD_ERROR" || 
            squareError.code === "CARD_DECLINED" ||
            squareError.code === "CVV_FAILURE" ||
            squareError.code === "VERIFY_CVV_FAILURE" ||
            squareError.code === "VERIFY_AVS_FAILURE") {
          return {
            success: false,
            error: "Card declined. Please check your card details or try a different payment method.",
            declineReason: squareError.code, // Only return error code, not detail
          };
        }
        
        if (squareError.code === "INSUFFICIENT_FUNDS") {
          return {
            success: false,
            error: "Insufficient funds. Please try a different payment method.",
          };
        }
      }
      
      // Generic error
      return {
        success: false,
        error: "Payment processing failed. Please try again.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: "Payment processing failed. Please try again.",
    };
  }
}
