import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import PaymentForm from "./PaymentForm";
import OrderIdValidator from "../OrderIdValidator";
import OrderSummary from "./OrderSummary";

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
      <div className="min-h-screen bg-[#fffef9] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-hot-pink text-center">
              <i className="fas fa-credit-card mr-2"></i>Complete Your Payment
            </h1>
            <p className="text-green-500 text-center text-sm mt-2">
              <i className="fas fa-lock mr-1"></i>
              Secure checkout powered by Square
            </p>
          </div>
        
          {/* Order Summary */}
          <OrderSummary lineItems={order.line_items} total={total} />
          
          {/* Payment Form */}
          <PaymentForm orderId={orderId} totalAmount={total} />
        </div>
      </div>
    </OrderIdValidator>
  );
}
