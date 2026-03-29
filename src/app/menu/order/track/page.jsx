import TrackOrderClient from "./TrackOrderClient";
import { getOrder } from "../actions";
import OrderIdValidator from "../OrderIdValidator";
import { getMenuData } from "@/lib/getMenuData";
import { enrichLineItems } from "@/lib/enrichLineItems";

export const metadata = {
  title: "Track Order | Kira Sushi & Poke",
  description: "Track your order status",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TrackOrderPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.orderId;
  
  // If orderId is in URL, fetch server-side
  let orderData = null;
  if (orderId) {
    const { success, order } = await getOrder(orderId);
    if (success && order) {
      // Fetch menu data to enrich line items with displayName
      const menuResult = await getMenuData();
      const menuData = menuResult.success ? menuResult.data : [];
      
      // Enrich line items with displayName from menu data
      const enrichedOrder = {
        ...order,
        line_items: enrichLineItems(order.line_items, menuData)
      };
      
      orderData = { orderId, order: enrichedOrder };
    } else {
      // Order not found, but pass orderId so client can show appropriate error
      orderData = { orderId, error: "not_found" };
    }
  }
  
  return (
    <OrderIdValidator currentPath="/menu/order/track">
      <TrackOrderClient initialData={orderData} />
    </OrderIdValidator>
  );
}
