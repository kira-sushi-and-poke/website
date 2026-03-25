import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import PaymentForm from "./PaymentForm";

export default async function PaymentPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.orderId;
  
  if (!orderId) {
    redirect("/menu/order");
  }
  
  // Fetch order to verify it's valid
  const { success, order, error } = await getOrder(orderId);
  
  if (!success || !order) {
    redirect("/menu/order?error=order-not-found");
  }
  
  // Check if order has items
  if (!order.line_items || order.line_items.length === 0) {
    redirect("/menu/order?error=empty-order");
  }
  
  // Check order state
  if (order.state === "COMPLETED") {
    redirect(`/menu/order/confirmation?orderId=${orderId}`);
  }
  
  if (order.state === "CANCELED") {
    redirect("/menu/order?error=order-canceled");
  }
  
  // Check if already paid (OPEN with payment)
  if (order.state === "OPEN" && order.has_payment) {
    redirect(`/menu/order/confirmation?orderId=${orderId}`);
  }
  
  // Calculate total
  const total = order.line_items.reduce((sum, item) => {
    const itemTotal = parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity);
    return sum + itemTotal;
  }, 0);
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-6">Payment</h1>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {order.line_items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>£{(parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 font-semibold flex justify-between">
            <span>Total</span>
            <span>£{(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Form */}
      <PaymentForm orderId={orderId} totalAmount={total} />
    </div>
  );
}
