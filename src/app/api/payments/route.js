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
    const { sourceId, orderId, amount, verificationToken, contactDetails } = body;
    
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
        console.error("Customer creation failed:", customerError);
        // Continue with payment even if customer creation fails
      }
    }
    
    // Calculate order to move it to OPEN state before payment
    try {
      const calculateResponse = await fetch(`${API_ORDERS_URL}/${orderId}/calculate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2026-01-22",
        },
        body: JSON.stringify({}),
      });
      
      if (!calculateResponse.ok) {
        console.error("Order calculation failed:", await calculateResponse.text());
      }
    } catch (calcError) {
      console.error("Order calculation error:", calcError);
      // Continue anyway - order might already be calculated
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
        autocomplete: true,
        ...(verificationToken && {
          verification_token: verificationToken,
        }),
      }),
    });
    
    const paymentData = await paymentResponse.json();
    
    if (!paymentResponse.ok) {
      console.error("Square payment error:", paymentData);
      
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
    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payment was not completed. Please try again.",
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
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, error: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}
