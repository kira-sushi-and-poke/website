import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import PaymentForm from "./PaymentForm";
import OrderIdValidator from "../OrderIdValidator";

export const metadata = {
  title: "Pay Order | Kira Sushi & Poke",
  description: "Complete your payment for your order",
  robots: {
    index: false,
    follow: false,
  },
};

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
    <OrderIdValidator currentPath="/menu/order/payment">
      <div className="min-h-screen bg-[#fffef9] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-hot-pink">
            <div className="flex items-center justify-center mb-3">
              <i className="fas fa-credit-card text-hot-pink text-5xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-hot-pink mb-2 text-center">Complete Your Payment</h1>
            <p className="text-green-500 text-center flex items-center justify-center">
              <i className="fas fa-lock mr-2"></i>
              Secure checkout powered by Square
            </p>
          </div>
        
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-yellow">
            <h2 className="text-2xl font-bold text-hot-pink mb-4 flex items-center">
              <i className="fas fa-shopping-cart mr-2"></i>
              Order Summary
            </h2>
            <div className="space-y-3">
              {order.line_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">
                    {item.name} <span className="text-hot-pink font-semibold">×{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900">£{(parseFloat(item.base_price_money?.amount || 0) * parseInt(item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
              <div className="bg-yellow/10 border border-yellow rounded-lg p-3 mb-3 flex items-start gap-2">
                <i className="fas fa-shopping-bag text-yellow text-sm mt-0.5"></i>
                <p className="text-xs text-gray-700">
                  <strong>Pickup only:</strong> We currently only offer pickup orders. Delivery is not available at this time.
                </p>
              </div>
              <div className="border-t-2 border-hot-pink pt-4 mt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-hot-pink">£{(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          <PaymentForm orderId={orderId} totalAmount={total} />
        </div>
      </div>
    </OrderIdValidator>
  );
}
