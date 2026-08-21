"use server";

import crypto from "crypto";
import * as Sentry from '@sentry/nextjs';
import {
  CURRENCY,
  FULFILLMENT_TYPE_PICKUP,
  FULFILLMENT_STATE_PROPOSED,
  PICKUP_WINDOW_DURATION,
  ORDER_STATE_OPEN,
  PICKUP_ASAP,
  PICKUP_LEAD_TIME_MINUTES
} from "@/lib/constants";
import { fetchSquare } from "@/lib/squareApi";
import { getLocationData } from "@/lib/getLocationData";
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

const LOCATION_ID = process.env.LOCATION_ID;
const API_ORDERS_URL = process.env.API_ORDERS_URL;
const API_PAYMENT_LINKS_URL = process.env.API_PAYMENT_LINKS_URL;
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
  
  // Sanitize service charges - only expose name and amount, not UIDs or internal fields
  const sanitizedServiceCharges = order.service_charges?.map(charge => ({
    name: charge.name,
    amount_money: charge.amount_money,
  })) || [];
  
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
    total_service_charge_money: order.total_service_charge_money,
    service_charges: sanitizedServiceCharges,
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
      // Add breadcrumb for successful order creation
      if (process.env.NODE_ENV === 'production') {
        Sentry.addBreadcrumb({
          message: 'Order created',
          category: 'order',
          level: 'info',
          data: {
            order_id: data.order.id,
          }
        });
      }
      
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
    // Capture error in Sentry with safe context
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setTag('action', 'create_order');
        Sentry.captureException(error);
      });
    }
    
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
 * @param {Object} cart - Cart state: { variationId: number | Array<{quantity, modifiers}> }
 * @returns {Promise<{success: boolean, version?: number, order?: object, error?: string, isConflict?: boolean}>}
 */
export async function updateOrderItems(orderId, version, cart) {
  try {
    const currentOrderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "GET",
    });

    const existingLineItems = currentOrderData.order.line_items || [];

    const modifiersMatch = (a = [], b = []) => {
      const aIds = a.map(m => typeof m === 'string' ? m : m.catalog_object_id);
      const bIds = b.map(m => typeof m === 'string' ? m : m.catalog_object_id);
      return aIds.length === bIds.length && aIds.every(id => bIds.includes(id));
    };

    const findMatchingLineItem = (variationId, modifiers = []) => {
      return existingLineItems.find(item => 
        item.catalog_object_id === variationId &&
        modifiersMatch(item.modifiers || [], modifiers)
      );
    };

    const desiredItems = [];
    const processedLineItems = new Set();
    
    Object.entries(cart).forEach(([variationId, value]) => {
      if (typeof value === 'number' && value > 0) {
        const matchingItem = findMatchingLineItem(variationId, []);
        
        if (!matchingItem || parseInt(matchingItem.quantity) !== value) {
          const lineItem = {
            quantity: value.toString(),
          };
          
          if (matchingItem) {
            lineItem.uid = matchingItem.uid;
          } else {
            lineItem.catalog_object_id = variationId;
          }
          
          desiredItems.push(lineItem);
        }
        
        if (matchingItem) {
          processedLineItems.add(matchingItem.uid);
        }
      }
      else if (Array.isArray(value)) {
        value.forEach(entry => {
          if (entry.quantity > 0) {
            const matchingItem = findMatchingLineItem(variationId, entry.modifiers || []);
            
            if (!matchingItem || parseInt(matchingItem.quantity) !== entry.quantity) {
              const lineItem = {
                quantity: entry.quantity.toString(),
              };
              
              if (matchingItem) {
                lineItem.uid = matchingItem.uid;
                if (!modifiersMatch(matchingItem.modifiers || [], entry.modifiers || [])) {
                  if (entry.modifiers && entry.modifiers.length > 0) {
                    lineItem.modifiers = entry.modifiers.map(modId => ({
                      catalog_object_id: modId,
                      quantity: "1"
                    }));
                  }
                }
              } else {
                lineItem.catalog_object_id = variationId;
                if (entry.modifiers && entry.modifiers.length > 0) {
                  lineItem.modifiers = entry.modifiers.map(modId => ({
                    catalog_object_id: modId,
                    quantity: "1"
                  }));
                }
              }
              
              desiredItems.push(lineItem);
            }
            
            if (matchingItem) {
              processedLineItems.add(matchingItem.uid);
            }
          }
        });
      }
    });

    const itemsToRemove = existingLineItems
      .filter(item => !processedLineItems.has(item.uid))
      .map(item => item.uid);

    const requestBody = {
      idempotency_key: crypto.randomUUID(),
      order: {
        location_id: LOCATION_ID,
        version: version,
        line_items: desiredItems,
      },
    };

    if (itemsToRemove.length > 0) {
      requestBody.fields_to_clear = itemsToRemove.map(uid => `line_items[${uid}]`);
    }

    const data = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(requestBody),
    });

    if (data.order) {
      // Add breadcrumb for successful order update
      if (process.env.NODE_ENV === 'production') {
        Sentry.addBreadcrumb({
          message: 'Order items updated',
          category: 'order',
          level: 'info',
          data: {
            order_id: orderId,
            item_count: desiredItems.length,
          }
        });
      }
      
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
    // Capture error in  Sentry with safe context
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setTag('action', 'update_order_items');
        scope.setTag('order_id', orderId);
        scope.setContext('update_error', {
          is_conflict: error.response?.status === 409
        });
        Sentry.captureException(error);
      });
    }
    
    if (error.response?.status === 409 || error.data?.errors?.[0]?.code === "VERSION_MISMATCH") {
      return {
        success: false,
        error: "Version conflict - order was modified",
        isConflict: true,
      };
    }

    return {
      success: false,
      error: error.data?.errors?.[0]?.detail || error.message || "Failed to update order",
      isConflict: false,
    };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAME_TO_SQUARE = {
  Sunday: 'SUN', Monday: 'MON', Tuesday: 'TUE',
  Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT',
};


// ─── Pickup Time Validation ───────────────────────────────────────────────────

/**
 * Validates pickup time (presence, lead time, date validity) and checks
 * restaurant opening hours including mobile location overrides.
 * ASAP orders pass immediately — Square handles timing.
 * Returns an error string or null.
 * @param {string} pickupTime - ISO string or PICKUP_ASAP constant
 * @returns {Promise<string|null>}
 */
async function validatePickupTimeAndHours(pickupTime) {
  if (!pickupTime) return "Pickup time is required";

  if (pickupTime === PICKUP_ASAP) return null;

  const pickupDate = new Date(pickupTime);
  if (isNaN(pickupDate.getTime())) return "Invalid pickup time";

  const minTime = new Date(Date.now() + PICKUP_LEAD_TIME_MINUTES * 60000);
  if (pickupDate.getTime() < minTime.getTime()) {
    return `Pickup time must be at least ${PICKUP_LEAD_TIME_MINUTES} minutes from now`;
  }

  const { mobileLocationData } = await getLocationData();
  if (mobileLocationData?.status !== 'ACTIVE') return null;

  const pickupTimeUK    = toZonedTime(pickupDate, 'Europe/London');
  const pickupDaySquare = DAY_NAME_TO_SQUARE[format(pickupTimeUK, 'EEEE')];
  const mobilePeriods   = mobileLocationData.business_hours?.periods || [];
  const dayPeriods      = mobilePeriods.filter(p => p.day_of_week === pickupDaySquare);

  if (dayPeriods.length === 0) {
    return "Restaurant is closed on the selected pickup date. Please choose a different time.";
  }

  const pickupMinutes = pickupTimeUK.getHours() * 60 + pickupTimeUK.getMinutes();
  const isOpen = dayPeriods.some(({ start_local_time, end_local_time }) => {
    const [startH, startM] = start_local_time.substring(0, 5).split(':').map(Number);
    const [endH, endM]     = end_local_time.substring(0, 5).split(':').map(Number);
    return pickupMinutes >= startH * 60 + startM && pickupMinutes < endH * 60 + endM;
  });

  return isOpen
    ? null
    : "Pickup time falls outside opening hours. Please select a time during open hours.";
}


// ─── Order Helpers ────────────────────────────────────────────────────────────

/**
 * Strips read-only fields Square calculates server-side.
 * @param {object[]} lineItems
 * @returns {object[]}
 */
function sanitizeLineItems(lineItems) {
  return lineItems.map(item => ({
    catalog_object_id: item.catalog_object_id,
    quantity: item.quantity,
    ...(item.note && { note: item.note }),
    ...(item.modifiers && {
      modifiers: item.modifiers.map(mod => ({
        catalog_object_id: mod.catalog_object_id,
        quantity: mod.quantity,
      })),
    }),
  }));
}

/**
 * Builds the service_charges array for the order payload.
 * Returns null to omit the field entirely, [] to clear existing charges.
 * @param {number} tipAmount
 * @param {string} currentState
 * @param {object} existingOrder
 * @returns {object[]|null}
 */
function buildServiceCharges(tipAmount, currentState, existingOrder) {
  if (tipAmount > 0) {
    return [{
      name: "Tip",
      amount_money: { amount: tipAmount, currency: CURRENCY },
      calculation_phase: "TOTAL_PHASE",
      ...(currentState === ORDER_STATE_OPEN && existingOrder?.service_charges?.[0]?.uid && {
        uid: existingOrder.service_charges[0].uid,
      }),
    }];
  }

  // Clear existing charges when tip is removed on an open order
  if (currentState === ORDER_STATE_OPEN && existingOrder?.service_charges?.length > 0) {
    return [];
  }

  return null;
}

/**
 * Builds the fulfillment object for the order payload.
 * @param {string} pickupTime
 * @param {string|undefined} specialInstructions
 * @param {string} currentState
 * @param {object} existingOrder
 * @returns {object}
 */
function buildFulfillment(pickupTime, specialInstructions, currentState, existingOrder) {
  const isAsapOrder = pickupTime === PICKUP_ASAP;

  const fulfillment = {
    type: FULFILLMENT_TYPE_PICKUP,
    state: FULFILLMENT_STATE_PROPOSED,
    pickup_details: {
      schedule_type: isAsapOrder ? "ASAP" : "SCHEDULED",
      ...(isAsapOrder
        ? { prep_time_duration: `PT${PICKUP_LEAD_TIME_MINUTES}M` }
        : { pickup_at: pickupTime, pickup_window_duration: PICKUP_WINDOW_DURATION }
      ),
      note: specialInstructions?.trim() || "No special instructions",
    },
  };

  if (currentState === ORDER_STATE_OPEN && existingOrder?.fulfillments?.[0]?.uid) {
    fulfillment.uid = existingOrder.fulfillments[0].uid;
  }

  return fulfillment;
}

/**
 * Assembles the full order payload for the payment link request.
 * @param {object} params
 * @returns {object}
 */
function buildOrderPayload({ sanitizedLineItems, serviceCharges, fulfillment }) {
  return {
    location_id: LOCATION_ID,
    line_items: sanitizedLineItems,
    metadata: {
      placed_at: new Date().toISOString(),
      payment_method: "Square Checkout",
    },
    ...(serviceCharges !== null && { service_charges: serviceCharges }),
    ...(fulfillment && { fulfillments: [fulfillment] }),
  };
}


// ─── Payment Link ─────────────────────────────────────────────────────────────

/**
 * Posts to Square to create a hosted payment link.
 * Returns the checkout URL and the new Square order ID from payment_link.order_id.
 * Square appends the new orderId as a query param on the redirect URL automatically,
 * so the confirmation URL needs no orderId baked in.
 * @param {object} orderPayload
 * @returns {Promise<{ squareCheckoutUrl: string, orderId: string }>}
 */
async function createPaymentLink(orderPayload) {
  const data = await fetchSquare(API_PAYMENT_LINKS_URL, {
    method: "POST",
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      order: orderPayload,
      checkout_options: { redirect_url: `${SITE_URL}/menu/order/confirmation` },
    }),
  });

  if (!data.payment_link?.url) {
    throw new Error("Payment link URL not found");
  }

  return {
    squareCheckoutUrl: data.payment_link.url,
    orderId: data.payment_link.order_id,
  };
}


// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Validates pickup time, builds the order payload, and creates a Square
 * payment link. Returns the checkout URL and new order ID to the client so
 * it can update session storage before redirecting to Square.
 *
 * @param {string} draftOrderId
 * @param {string} pickupTime
 * @param {number} tipAmount
 * @param {string} [specialInstructions]
 * @returns {Promise<{
 *   success: boolean,
 *   error: string | null,
 *   squareCheckoutUrl: string | null,
 *   orderId: string | null,
 * }>}
 */
export async function checkout(draftOrderId, pickupTime, tipAmount, specialInstructions) {
  try {
    const pickupError = await validatePickupTimeAndHours(pickupTime);
    if (pickupError) {
      return { success: false, error: pickupError, squareCheckoutUrl: null, orderId: null };
    }

    const orderData    = await fetchSquare(`${API_ORDERS_URL}/${draftOrderId}`, { method: "GET" });
    const { order }    = orderData;
    const currentState = order?.state;

    if (!order.line_items?.length) {
      return { success: false, error: "Cannot checkout with an empty cart", squareCheckoutUrl: null, orderId: null };
    }

    const sanitizedLineItems = sanitizeLineItems(order.line_items);
    const serviceCharges     = buildServiceCharges(tipAmount, currentState, order);
    const fulfillment        = buildFulfillment(pickupTime, specialInstructions, currentState, order);
    const orderPayload       = buildOrderPayload({ sanitizedLineItems, serviceCharges, fulfillment });

    const { squareCheckoutUrl, orderId } = await createPaymentLink(orderPayload);

    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb({
        message: 'Checkout initiated',
        category: 'order',
        level: 'info',
        data: { draft_order_id: draftOrderId, new_order_id: orderId },
      });
    }

    return { success: true, error: null, squareCheckoutUrl, orderId };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope(scope => {
        scope.setTag('action', 'checkout');
        scope.setTag('order_id', draftOrderId);
        Sentry.captureException(error);
      });
    }

    return {
      success: false,
      error: "Failed to initiate checkout. Please try again.",
      squareCheckoutUrl: null,
      orderId: null,
    };
  }
}
