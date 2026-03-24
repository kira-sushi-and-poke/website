import { NextResponse } from "next/server";
import crypto from "crypto";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.LOCATION_ID;
const API_PAYMENTS_URL = process.env.API_PAYMENTS_URL;
const API_CUSTOMERS_URL = process.env.API_CUSTOMERS_URL;
const API_ORDERS_URL = process.env.API_ORDERS_URL;

/**
 * POST /api/payments
 * Process a payment with Square
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sourceId, orderId, amount, verificationToken, contactDetails, pickupTime } = body;
    
    // Validate required fields
    if (!sourceId || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create customer and attach to order if contact details provided
    if (contactDetails && contactDetails.email && contactDetails.name) {
      try {
        // Create customer in Square
        const customerResponse = await fetch(API_CUSTOMERS_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2026-01-22",
          },
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            given_name: contactDetails.name.split(" ")[0] || contactDetails.name,
            family_name: contactDetails.name.split(" ").slice(1).join(" ") || "",
            email_address: contactDetails.email,
            ...(contactDetails.phone && { phone_number: contactDetails.phone }),
          }),
        });
        
        const customerData = await customerResponse.json();
        
        if (customerResponse.ok && customerData.customer?.id) {
          const customerId = customerData.customer.id;
          
          // Fetch current order to get version
          const getOrderResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "Square-Version": "2026-01-22",
            },
          });
          
          if (getOrderResponse.ok) {
            const orderData = await getOrderResponse.json();
            const currentVersion = orderData.order?.version;
            
            // Update order with customer_id
            await fetch(`${API_ORDERS_URL}/${orderId}`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Square-Version": "2026-01-22",
              },
              body: JSON.stringify({
                order: {
                  location_id: LOCATION_ID,
                  version: currentVersion,
                  customer_id: customerId,
                },
              }),
            });
          }
        }
      } catch (customerError) {
        // Continue with payment even if customer creation fails
      }
    }
    
    // Move order to OPEN state before payment
    try {
      // First, fetch the current order to get the version
      const getOrderResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2026-01-22",
        },
      });
      
      if (!getOrderResponse.ok) {
        return NextResponse.json(
          { success: false, error: "Order not found. Please try again." },
          { status: 404 }
        );
      }
      
      const orderData = await getOrderResponse.json();
      const currentState = orderData.order?.state;
      const currentVersion = orderData.order?.version;
      
      // Only update if order is still in DRAFT state
      if (currentState === "DRAFT") {
        const orderUpdate = {
          location_id: LOCATION_ID,
          state: "OPEN",
          version: currentVersion,
          metadata: {
            placed_at: new Date().toISOString(),
            payment_method: "Custom Payment Form",
          },
        };
        
        // Add fulfillment details if pickup time provided
        if (pickupTime && contactDetails?.name) {
          orderUpdate.fulfillments = [{
            type: "PICKUP",
            state: "RESERVED",
            pickup_details: {
              recipient: {
                display_name: contactDetails.name,
                ...(contactDetails.email && { email_address: contactDetails.email }),
                ...(contactDetails.phone && { phone_number: contactDetails.phone }),
              },
              schedule_type: "SCHEDULED",
              pickup_at: pickupTime,
              pickup_window_duration: "PT15M",
              note: "Online order - pickup",
            },
          }];
        }
        
        const updateResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2026-01-22",
          },
          body: JSON.stringify({
            order: orderUpdate,
          }),
        });
        
        const updateData = await updateResponse.json();
        
        if (!updateResponse.ok) {
          return NextResponse.json(
            { success: false, error: "Failed to prepare order for payment. Please try again." },
            { status: 500 }
          );
        }
      } else if (currentState === "OPEN") {
        // Order already in correct state
      } else {
        return NextResponse.json(
          { success: false, error: `Order cannot be paid (state: ${currentState})` },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Failed to prepare order for payment. Please try again." },
        { status: 500 }
      );
    }
    
    // Process payment with Square
    const paymentResponse = await fetch(API_PAYMENTS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-01-22",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        source_id: sourceId,
        amount_money: {
          amount: amount,
          currency: "GBP",
        },
        location_id: LOCATION_ID,
        order_id: orderId,
        autocomplete: false,
        ...(verificationToken && {
          verification_token: verificationToken,
        }),
      }),
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentResponse.ok) {
      // Check if it's a card decline
      if (paymentData.errors) {
        const error = paymentData.errors[0];
        
        if (error.category === "PAYMENT_METHOD_ERROR" || 
            error.code === "CARD_DECLINED" ||
            error.code === "CVV_FAILURE" ||
            error.code === "VERIFY_CVV_FAILURE" ||
            error.code === "VERIFY_AVS_FAILURE") {
          return NextResponse.json(
            { 
              success: false, 
              error: "Card declined. Please check your card details or try a different payment method.",
              declineReason: error.detail || error.code,
            },
            { status: 402 }
          );
        }
        
        if (error.code === "INSUFFICIENT_FUNDS") {
          return NextResponse.json(
            { 
              success: false, 
              error: "Insufficient funds. Please try a different payment method.",
            },
            { status: 402 }
          );
        }
      }
      
      // Generic error
      return NextResponse.json(
        { success: false, error: "Payment processing failed. Please try again." },
        { status: 500 }
      );
    }
    
    const payment = paymentData.payment;
    
    // Check payment status
    // APPROVED = authorized but not captured (autocomplete: false)
    // COMPLETED = authorized and captured (autocomplete: true)
    if (payment.status !== "APPROVED" && payment.status !== "COMPLETED") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment was not approved. Please try again.",
          status: payment.status,
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      receiptUrl: payment.receipt_url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}
