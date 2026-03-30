import { redirect } from "next/navigation";
import { getOrder } from "../actions";
import PaymentForm from "./PaymentForm";
import OrderIdValidator from "../OrderIdValidator";
import OrderSummary from "./OrderSummary";
import { getMenuData } from "@/lib/getMenuData";
import { getLocationData } from "@/lib/getLocationData";
import { checkRestaurantStatus } from "@/lib/checkRestaurantStatus";
import { enrichLineItems } from "@/lib/enrichLineItems";

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
  
  // Check restaurant status - redirect if closed
  const { openingHours, isFallback, mobileLocationData } = await getLocationData();
  const restaurantStatus = checkRestaurantStatus(openingHours, mobileLocationData, isFallback);
  
  if (!restaurantStatus.isOpen) {
    redirect("/menu/order"); // Redirects to page with closed modal
  }
  
  // Pass override periods to payment form for accurate pickup time generation
  const overridePeriods = restaurantStatus.overrideActive ? restaurantStatus.overridePeriods : [];
  
  // Fetch menu data to enrich line items with displayName
  const menuResult = await getMenuData();
  const menuData = menuResult.success ? menuResult.data : [];
  const enrichedLineItems = enrichLineItems(order.line_items, menuData);
  
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
            <h1 className="text-2xl md:text-3xl font-bold text-hot-pink text-center">
              <i className="fas fa-credit-card mr-2"></i>Almost There!
            </h1>
            <p className="text-gray-700 text-center text-base mt-2 mb-1">
              Complete your order and we'll have it ready for you to pickup
            </p>
            <p className="text-green-600 text-center text-sm">
              <i className="fas fa-lock mr-1"></i>
              Safe & secure checkout powered by Square
            </p>
          </div>
        
          {/* Order Summary */}
          <OrderSummary lineItems={enrichedLineItems} total={total} />
          
          {/* Payment Form */}
          <PaymentForm 
            orderId={orderId} 
            totalAmount={total} 
            openingHours={openingHours}
            overridePeriods={overridePeriods}
          />
        </div>
      </div>
    </OrderIdValidator>
  );
}
