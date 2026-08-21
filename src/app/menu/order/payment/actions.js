
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
// NOTE: All of the below are assumed to be imported/defined elsewhere in your
// codebase exactly as in the original file — left untouched:
// validatePickupTime, getLocationData, toZonedTime, format, fetchSquare,
// splitName, Sentry, API_ORDERS_URL, API_CUSTOMERS_URL, API_PAYMENTS_URL,
// LOCATION_ID, CURRENCY, ORDER_STATE_DRAFT, ORDER_STATE_OPEN,
// PAYMENT_METHOD_CUSTOM, FULFILLMENT_TYPE_PICKUP, FULFILLMENT_STATE_PROPOSED,
// PICKUP_LEAD_TIME_MINUTES, PICKUP_WINDOW_DURATION, PICKUP_ASAP,
// PAYMENT_STATUS_COMPLETED

const DAY_NAME_TO_SQUARE = {
  Sunday: "SUN",
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
};

function logBreadcrumb(message, data) {
  if (process.env.NODE_ENV === "production") {
    Sentry.addBreadcrumb({ message, category: "payment", level: "info", data });
  }
}

function logSwallowedError(action, orderId, error) {
  // These errors don't block the payment, but we still want visibility
  // if they start happening a lot.
  if (process.env.NODE_ENV === "production") {
    Sentry.withScope((scope) => {
      scope.setTag("action", action);
      scope.setTag("order_id", orderId);
      scope.setLevel("warning");
      Sentry.captureException(error);
    });
  }
}

/**
 * Returns an error string if the restaurant is closed at pickupTime
 * (per an active mobile-location override), or null if it's fine / not
 * applicable. Never throws — a failure here should never block payment.
 */
async function checkOpeningHours(pickupTime, orderId) {
  if (pickupTime === PICKUP_ASAP) return null;

  try {
    const { mobileLocationData } = await getLocationData();
    if (mobileLocationData?.status !== "ACTIVE") return null;

    const pickupTimeUK = toZonedTime(new Date(pickupTime), "Europe/London");
    const pickupDaySquare = DAY_NAME_TO_SQUARE[format(pickupTimeUK, "EEEE")];

    const dayPeriods = (mobileLocationData.business_hours?.periods || [])
      .filter((p) => p.day_of_week === pickupDaySquare);

    if (dayPeriods.length === 0) {
      return "Restaurant is closed on the selected pickup date. Please choose a different time.";
    }

    const pickupMinutes = pickupTimeUK.getHours() * 60 + pickupTimeUK.getMinutes();

    const isWithinPeriod = dayPeriods.some((period) => {
      const [startHour, startMin] = period.start_local_time.substring(0, 5).split(":").map(Number);
      const [endHour, endMin] = period.end_local_time.substring(0, 5).split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return pickupMinutes >= startMinutes && pickupMinutes < endMinutes;
    });

    return isWithinPeriod
      ? null
      : "Pickup time falls outside opening hours. Please select a time during open hours.";
  } catch (error) {
    logSwallowedError("check_opening_hours", orderId, error);
    return null; // don't block payment if the hours check itself fails
  }
}

/**
 * Best-effort customer creation. Returns customerId or null — never throws.
 */
async function createSquareCustomer(contactDetails, orderId) {
  if (!contactDetails.email || !contactDetails.name) return null;

  try {
    logBreadcrumb("Creating customer record", { order_id: orderId });
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

    const customerId = customerData.customer?.id ?? null;
    if (customerId) logBreadcrumb("Customer created", { order_id: orderId });
    return customerId;
  } catch (error) {
    logSwallowedError("create_customer", orderId, error);
    return null;
  }
}

function buildServiceCharges(tipAmount, currentState, existingOrder) {
  if (tipAmount > 0) {
    const serviceCharge = {
      name: "Tip",
      amount_money: { amount: tipAmount, currency: CURRENCY },
      calculation_phase: "TOTAL_PHASE",
    };
    // Preserve UID on retry so we replace rather than duplicate the charge
    const existingUid = existingOrder?.service_charges?.[0]?.uid;
    if (currentState === ORDER_STATE_OPEN && existingUid) {
      serviceCharge.uid = existingUid;
    }
    return [serviceCharge];
  }

  if (currentState === ORDER_STATE_OPEN && existingOrder?.service_charges?.length > 0) {
    return []; // clear existing charges if tip was removed on retry
  }

  return undefined; // no change needed
}

function buildFulfillment(contactDetails, pickupTime, specialInstructions, currentState, existingOrder) {
  const isAsapOrder = pickupTime === PICKUP_ASAP;

  const fulfillment = {
    type: FULFILLMENT_TYPE_PICKUP,
    state: FULFILLMENT_STATE_PROPOSED,
    pickup_details: {
      recipient: {
        display_name: contactDetails.name,
        email_address: contactDetails.email,
        phone_number: contactDetails.phone,
      },
      schedule_type: isAsapOrder ? "ASAP" : "SCHEDULED",
      ...(isAsapOrder
        ? { prep_time_duration: `PT${PICKUP_LEAD_TIME_MINUTES}M` }
        : { pickup_at: pickupTime, pickup_window_duration: PICKUP_WINDOW_DURATION }),
      note: specialInstructions?.trim() || "No special instructions",
    },
  };

  const existingUid = existingOrder?.fulfillments?.[0]?.uid;
  if (currentState === ORDER_STATE_OPEN && existingUid) {
    fulfillment.uid = existingUid;
  }

  return fulfillment;
}

/**
 * Moves the order into OPEN state (if DRAFT) and attaches customer,
 * tip, and fulfillment details. Returns the updated order payload.
 * Throws on failure — caller maps to a user-facing error.
 */
async function updateOrderForPayment({
  orderId,
  orderData,
  currentState,
  currentVersion,
  customerId,
  tipAmount,
  contactDetails,
  pickupTime,
  specialInstructions,
}) {
  const orderUpdate = {
    location_id: LOCATION_ID,
    version: currentVersion,
    ...(customerId && { customer_id: customerId }),
  };

  if (currentState === ORDER_STATE_DRAFT) {
    orderUpdate.state = ORDER_STATE_OPEN;
    orderUpdate.metadata = {
      placed_at: new Date().toISOString(),
      payment_method: PAYMENT_METHOD_CUSTOM,
    };
  }

  const serviceCharges = buildServiceCharges(tipAmount, currentState, orderData.order);
  if (serviceCharges !== undefined) orderUpdate.service_charges = serviceCharges;

  orderUpdate.fulfillments = [
    buildFulfillment(contactDetails, pickupTime, specialInstructions, currentState, orderData.order),
  ];

  return fetchSquare(`${API_ORDERS_URL}/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ order: orderUpdate }),
  });
}

/** Maps a Square API error to a user-facing {error, declineReason?} shape. */
function mapSquareError(error) {
  const squareError = error.data?.errors?.[0];

  if (squareError) {
    if (
      squareError.category === "PAYMENT_METHOD_ERROR" ||
      ["CARD_DECLINED", "CVV_FAILURE", "VERIFY_CVV_FAILURE", "VERIFY_AVS_FAILURE"].includes(squareError.code)
    ) {
      return {
        error: "Card declined. Please check your card details or try a different payment method.",
        declineReason: squareError.code,
      };
    }
    if (squareError.code === "INSUFFICIENT_FUNDS") {
      return { error: "Insufficient funds. Please try a different payment method." };
    }
  }

  return { error: "Payment processing failed. Please try again." };
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
export async function processPayment(
  sourceId,
  orderId,
  amount,
  verificationToken,
  contactDetails,
  pickupTime,
  specialInstructions = "",
  tipAmount = 0
) {
  try {
    if (!sourceId || !orderId || !amount) {
      return { success: false, error: "Missing required fields" };
    }

    const pickupError = validatePickupTime(pickupTime);
    if (pickupError) {
      return { success: false, error: pickupError };
    }

    if (!contactDetails || !contactDetails.name || !contactDetails.email || !contactDetails.phone) {
      return { success: false, error: "Contact details are required" };
    }

    const hoursError = await checkOpeningHours(pickupTime, orderId);
    if (hoursError) {
      return { success: false, error: hoursError };
    }

    // Fetching the order and creating the customer record are independent —
    // run them concurrently instead of back-to-back.
    const [orderResult, customerResult] = await Promise.allSettled([
      fetchSquare(`${API_ORDERS_URL}/${orderId}`, { method: "GET" }),
      createSquareCustomer(contactDetails, orderId),
    ]);

    if (orderResult.status === "rejected") {
      const error = orderResult.reason;
      if (error.response?.status === 404) {
        return { success: false, error: "Order not found. Please try again." };
      }
      return { success: false, error: "Failed to retrieve order. Please try again." };
    }

    let orderData = orderResult.value;
    const customerId = customerResult.status === "fulfilled" ? customerResult.value : null;

    const currentState = orderData.order?.state;
    const currentVersion = orderData.order?.version;

    if (currentState !== ORDER_STATE_DRAFT && currentState !== ORDER_STATE_OPEN) {
      return { success: false, error: `Order cannot be paid (state: ${currentState})` };
    }

    try {
      orderData = await updateOrderForPayment({
        orderId,
        orderData,
        currentState,
        currentVersion,
        customerId,
        tipAmount,
        contactDetails,
        pickupTime,
        specialInstructions,
      });
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          success: false,
          error: "This order was just updated elsewhere. Please try again.",
        };
      }
      return { success: false, error: "Failed to prepare order for payment. Please try again." };
    }

    const orderTotal = orderData.order?.total_money?.amount;
    if (!orderTotal) {
      return { success: false, error: "Unable to determine order total. Please try again." };
    }

    try {
      logBreadcrumb("Submitting payment to Square", { order_id: orderId, amount: orderTotal });

      const paymentData = await fetchSquare(API_PAYMENTS_URL, {
        method: "POST",
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          source_id: sourceId,
          amount_money: { amount: orderTotal, currency: CURRENCY },
          location_id: LOCATION_ID,
          order_id: orderId,
          autocomplete: true,
          ...(verificationToken && { verification_token: verificationToken }),
        }),
      });

      const payment = paymentData.payment;

      if (payment.status !== PAYMENT_STATUS_COMPLETED) {
        return { success: false, error: "Payment was not completed. Please try again.", status: payment.status };
      }

      logBreadcrumb("Payment processed successfully", { order_id: orderId, payment_status: payment.status });

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        receiptUrl: payment.receipt_url,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        Sentry.withScope((scope) => {
          scope.setTag("action", "process_payment");
          scope.setTag("order_id", orderId);
          scope.setContext("payment_error", {
            code: error.data?.errors?.[0]?.code || "UNKNOWN",
            amount,
          });
          // Do NOT include: sourceId, verificationToken, contactDetails
          Sentry.captureException(error);
        });
      }
      return { success: false, ...mapSquareError(error) };
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      Sentry.withScope((scope) => {
        scope.setTag("action", "process_payment_validation");
        scope.setTag("order_id", orderId);
        scope.setContext("error_details", { message: error.message, amount });
        // Do NOT include: sourceId, verificationToken, contactDetails
        Sentry.captureException(error);
      });
    }
    return { success: false, error: "Payment processing failed. Please try again." };
  }
}