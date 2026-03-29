import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import ConfirmationClient from "./ConfirmationClient";
import OrderIdValidator from "../OrderIdValidator";
import Link from "next/link";
import { getMenuData } from "@/lib/getMenuData";
import { enrichLineItems } from "@/lib/enrichLineItems";

export const metadata = {
  title: "Order Confirmation | Kira Sushi & Poke",
  description: "Your order confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ConfirmationPage({ searchParams }) {
  // Await searchParams to handle Next.js 15+ async params
  const params = await searchParams;
  
  // Get orderId from query params
  const orderId = params?.orderId;

  // If no orderId, redirect to order page
  if (!orderId) {
    redirect("/menu/order");
  }

  // Fetch order from Square
  const { success, order, error } = await getOrder(orderId);

  // Handle fetch failure
  if (!success || !order) {
    return (
      <OrderIdValidator currentPath="/menu/order/confirmation">
        <div className="min-h-screen bg-[#fffef9] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center border-t-4 border-hot-pink">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-hot-pink text-6xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to Load Order
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t fetch your order details. Please contact support if you&apos;ve completed payment.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full inline-block">Order ID: {orderId}</p>
              <Link
                href="/contact"
                className="block w-full bg-hot-pink text-white py-3 px-4 rounded-lg hover:bg-hot-pink/90 transition-colors font-semibold"
              >
                Contact Support
              </Link>
              <Link
                href="/menu/order"
                className="block w-full border-2 border-hot-pink text-hot-pink py-3 px-4 rounded-lg hover:bg-hot-pink hover:text-white transition-colors font-semibold"
              >
                Back to Order
              </Link>
            </div>
          </div>
        </div>
      </OrderIdValidator>
    );
  }

  // Fetch menu data to enrich line items with displayName
  const menuResult = await getMenuData();
  const menuData = menuResult.success ? menuResult.data : [];
  
  // Enrich line items with displayName from menu data
  const enrichedOrder = {
    ...order,
    line_items: enrichLineItems(order.line_items, menuData)
  };

  // Handle different order states
  const orderState = order.state;

  // OPEN with payment - show as completed
  if (orderState === "OPEN") {
    // Check if order has completed payment
    const hasPaid = order.has_payment; // Safe flag from sanitizeOrderForClient
    
    if (hasPaid) {
      // Payment completed - show confirmation (order awaiting fulfillment)
      return (
        <OrderIdValidator currentPath="/menu/order/confirmation">
          <ConfirmationClient
            orderId={orderId}
            status="completed"
            order={enrichedOrder}
          />
        </OrderIdValidator>
      );
    } else {
      // No payment - user abandoned checkout
      redirect("/menu/order");
    }
  }

  // CANCELED - order was cancelled
  if (orderState === "CANCELED") {
    return (
      <OrderIdValidator currentPath="/menu/order/confirmation">
        <ConfirmationClient
          orderId={orderId}
          status="canceled"
          order={null}
        />
      </OrderIdValidator>
    );
  }

  // COMPLETED - successful payment
  if (orderState === "COMPLETED") {
    return (
      <OrderIdValidator currentPath="/menu/order/confirmation">
        <ConfirmationClient
          orderId={orderId}
          status="completed"
          order={enrichedOrder}
        />
      </OrderIdValidator>
    );
  }

  // DRAFT or other unexpected states
  redirect("/menu/order");
}
