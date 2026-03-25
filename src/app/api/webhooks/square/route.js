import { NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_ORDERS_URL = process.env.API_ORDERS_URL;

/**
 * Verify Square webhook signature
 */
function verifySignature(body, signature, signatureKey) {
  const hmac = crypto.createHmac("sha256", signatureKey);
  hmac.update(body);
  const hash = hmac.digest("base64");
  return hash === signature;
}

/**
 * POST /api/webhooks/square
 * Handle Square webhook events
 */
export async function POST(request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature");
    
    // Verify webhook signature
    if (!WEBHOOK_SIGNATURE_KEY) {
      console.error("SQUARE_WEBHOOK_SIGNATURE_KEY not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }
    
    if (!signature || !verifySignature(rawBody, signature, WEBHOOK_SIGNATURE_KEY)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    
    // Parse the event
    const event = JSON.parse(rawBody);
    
    console.log("Received Square webhook event:", event.type);
    
    // Handle payment.updated event
    if (event.type === "payment.updated") {
      const payment = event.data?.object?.payment;
      
      if (!payment) {
        console.error("No payment data in webhook");
        return NextResponse.json({ received: true });
      }
      
      // Only process completed payments
      if (payment.status === "COMPLETED") {
        console.log("Payment completed:", {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount_money,
          status: payment.status,
        });
        
        // Payment is complete - order stays in OPEN/RESERVED state
        // Restaurant will mark as PREPARED once food is ready
        // Restaurant will mark as COMPLETED once customer picks up
        
        // TODO: Send confirmation emails here
        // Implementation steps:
        // 1. Fetch order details from Square API using payment.order_id
        //    - Get fulfillments for pickup time and customer contact (email, phone, name)
        //    - Get line_items for order details
        // 2. Send customer confirmation email:
        //    - Order ID, items, total, pickup time
        //    - Customer name, phone (from fulfillments.pickup_details.recipient)
        // 3. Send restaurant notification email/SMS:
        //    - New order alert with same details
        // 4. Consider using: Resend, SendGrid, or Nodemailer
        // 5. Add environment variables: EMAIL_SERVICE_API_KEY, RESTAURANT_EMAIL
      }
      
      return NextResponse.json({ received: true });
    }
    
    // Handle other event types if needed
    console.log(`Unhandled webhook event type: ${event.type}`);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
