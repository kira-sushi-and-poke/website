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
import { validatePickupTime } from "@/lib/validation";
import { getLocationData } from "@/lib/getLocationData";
import { checkRestaurantStatus } from "@/lib/checkRestaurantStatus";
import { toZonedTime } from 'date-fns-tz';
import { format, startOfDay, isSameDay } from 'date-fns';

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
 * Process a payment with Square
 * @param {string} sourceId - Square payment source token
 * @param {string} orderId - The Square order ID  
 * @param {number} amount - Base order amount in cents (before tip)
 * @param {string} verificationToken - Card verification token (optional)
 * @param {object} contactDetails - Customer contact details (name, email, phone)
 * @param {string} pickupTime - ISO string pickup time
 * @param {string} specialInstructions - Optional special instructions from customer
 * @param {number} tipAmount - Tip amount in cents (optional, defaults to 0) - added to order as service charge
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
    
    // Validate pickup time is provided and valid (at least 45 minutes from now)
    const pickupError = validatePickupTime(pickupTime);
    if (pickupError) {
      return {
        success: false,
        error: pickupError,
      };
    }
    
    // Validate restaurant will be open at pickup time (considering mobile overrides)
    try {
      const { openingHours, mobileLocationData } = await getLocationData();
      const pickupTimeUTC = new Date(pickupTime);
      const pickupTimeUK = toZonedTime(pickupTimeUTC, 'Europe/London');
      const pickupDayName = format(pickupTimeUK, 'EEEE'); // "Monday", "Tuesday", etc.
      
      // Check if mobile override is active
      if (mobileLocationData?.status === 'ACTIVE') {
        const mobilePeriods = mobileLocationData.business_hours?.periods || [];
        
        // Map day name to Square format
        const dayMap = {
          'Sunday': 'SUN', 'Monday': 'MON', 'Tuesday': 'TUE',
          'Wednesday': 'WED', 'Thursday': 'THU', 'Friday': 'FRI', 'Saturday': 'SAT'
        };
        const pickupDaySquare = dayMap[pickupDayName];
        
        // Check if there are periods for the pickup day
        const dayPeriods = mobilePeriods.filter(p => p.day_of_week === pickupDaySquare);
        
        if (dayPeriods.length === 0) {
          // No periods for this day = closed
          return {
            success: false,
            error: "Restaurant is closed on the selected pickup date. Please choose a different time.",
          };
        }
        
        // Check if pickup time falls within any of the day's periods
        const pickupHour = pickupTimeUK.getHours();
        const pickupMinute = pickupTimeUK.getMinutes();
        const pickupMinutes = pickupHour * 60 + pickupMinute;
        
        let isWithinPeriod = false;
        for (const period of dayPeriods) {
          const [startHour, startMin] = period.start_local_time.substring(0, 5).split(':').map(Number);
          const [endHour, endMin] = period.end_local_time.substring(0, 5).split(':').map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          
          if (pickupMinutes >= startMinutes && pickupMinutes < endMinutes) {
            isWithinPeriod = true;
            break;
          }
        }
        
        if (!isWithinPeriod) {
          return {
            success: false,
            error: "Pickup time falls outside opening hours. Please select a time during open hours.",
          };
        }
      }
    } catch (error) {
      // Continue - don't block payment if validation fails
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
        
        // Add tip as a service charge if provided
        if (tipAmount > 0) {
          const serviceCharge = {
            name: "Tip",
            amount_money: {
              amount: tipAmount,
              currency: CURRENCY,
            },
            calculation_phase: "TOTAL_PHASE",
          };
          
          // If updating existing OPEN order, preserve service charge UID to replace instead of duplicate
          if (currentState === ORDER_STATE_OPEN && orderData.order?.service_charges?.[0]?.uid) {
            serviceCharge.uid = orderData.order.service_charges[0].uid;
          }
          
          orderUpdate.service_charges = [serviceCharge];
        } else if (currentState === ORDER_STATE_OPEN && orderData.order?.service_charges?.length > 0) {
          // Clear existing service charges if tip is 0 on retry
          orderUpdate.service_charges = [];
        }
        
        // Build fulfillment object (for both DRAFT and OPEN)
        const fulfillmentNote = specialInstructions?.trim() || "No special instructions";
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
        
        // Update the order and get the new total
        const updatedOrderData = await fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({
            order: orderUpdate,
          }),
        });
        
        // Use the actual order total from Square (includes tip)
        orderData = updatedOrderData;
      } catch (error) {
        return {
          success: false,
          error: "Failed to prepare order for payment. Please try again.",
        };
      }
    }
    
    // Process payment with Square
    try {
      // Use the order's actual total (which now includes the tip as a service charge)
      const orderTotal = orderData.order?.total_money?.amount;
      
      if (!orderTotal) {
        return {
          success: false,
          error: "Unable to determine order total. Please try again.",
        };
      }
      
      const paymentData = await fetchSquare(API_PAYMENTS_URL, {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          source_id: sourceId,
          amount_money: {
            amount: orderTotal,
            currency: CURRENCY,
          },
          location_id: LOCATION_ID,
          order_id: orderId,
          autocomplete: true,
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
