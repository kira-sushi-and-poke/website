import { NextResponse } from "next/server";
import crypto from "crypto";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const LOCATION_ID = process.env.LOCATION_ID;
const API_CUSTOMERS_URL = process.env.API_CUSTOMERS_URL;
const API_ORDERS_URL = process.env.API_ORDERS_URL;

/**
 * POST /api/customers
 * Creates a customer in Square and attaches them to an order
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, name, email, phone } = body;
    
    // Validate required fields
    if (!orderId || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
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
        given_name: name.split(" ")[0] || name,
        family_name: name.split(" ").slice(1).join(" ") || "",
        email_address: email,
        phone_number: phone,
      }),
    });
    
    const customerData = await customerResponse.json();
    
    if (!customerResponse.ok) {
      console.error("Square customer creation error:", customerData);
      return NextResponse.json(
        { success: false, error: "Failed to create customer. Please try again." },
        { status: 500 }
      );
    }
    
    const customerId = customerData.customer?.id;
    
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Failed to create customer. Please try again." },
        { status: 500 }
      );
    }
    
    // Fetch the current order to get its version
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
        { success: false, error: "Failed to update order with customer details" },
        { status: 500 }
      );
    }
    
    const orderData = await getOrderResponse.json();
    const currentVersion = orderData.order?.version;
    
    // Update order with customer_id
    const updateOrderResponse = await fetch(`${API_ORDERS_URL}/${orderId}`, {
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
    
    const updatedOrderData = await updateOrderResponse.json();
    
    if (!updateOrderResponse.ok) {
      console.error("Square order update error:", updatedOrderData);
      return NextResponse.json(
        { success: false, error: "Failed to update order with customer details" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      version: updatedOrderData.order?.version,
    });
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
