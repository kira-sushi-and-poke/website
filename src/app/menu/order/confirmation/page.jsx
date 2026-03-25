import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import ConfirmationClient from "./ConfirmationClient";

export const metadata = {
  title: "Order Confirmation | Sushi Restaurant",
  description: "Your order confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ConfirmationPage({ searchParams }) {
  // Await searchParams to handle Next.js 15+ async params
  const params = await Promise.resolve(searchParams);
  
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Order
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t fetch your order details. Please contact support if you&apos;ve completed payment.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Order ID: {orderId}</p>
            <a
              href="/contact"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/menu/order"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Menu
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle different order states
  const orderState = order.state;

  // OPEN with payment - show as completed
  if (orderState === "OPEN") {
    // Check if order has completed payment
    const hasPaid = order.has_payment; // Safe flag from sanitizeOrderForClient
    
    if (hasPaid) {
      // Payment completed - show confirmation (order awaiting fulfillment)
      return (
        <ConfirmationClient
          orderId={orderId}
          status="completed"
          order={order}
        />
      );
    } else {
      // No payment - user abandoned checkout
      redirect("/menu/order");
    }
  }

  // CANCELED - order was cancelled
  if (orderState === "CANCELED") {
    return (
      <ConfirmationClient
        orderId={orderId}
        status="canceled"
        order={null}
      />
    );
  }

  // COMPLETED - successful payment
  if (orderState === "COMPLETED") {
    return (
      <ConfirmationClient
        orderId={orderId}
        status="completed"
        order={order}
      />
    );
  }

  // DRAFT or other unexpected states
  redirect("/menu/order");
}
