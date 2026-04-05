import { formatNextOpenDate } from "@/lib/formatTime";

export default function PickupOnlyNotice({ restaurantStatus }) {
  const nextOpenText = restaurantStatus?.nextOpenDate 
    ? formatNextOpenDate(restaurantStatus.nextOpenDate)
    : null;
  
  return (
    <div className="bg-yellow/10 border border-yellow rounded-lg p-3 flex items-start gap-2 flex-col">
      <div className="text-xs text-gray-700">
        <div className="flex items-center gap-2 my-1">
          <i className="fas fa-shopping-bag text-yellow text-sm"></i>
          <p className="font-semibold text-gray-800">Pickup Only</p>
        </div>
        <p>
          We're pickup-only for now (delivery coming soon!). Your freshly prepared order will typically be ready in 40 minutes to an hour. <em className="font-bold not-italic">On peak times, it may take longer than an hour</em>. Collect from 148 Front Street, Chester-le-Street.
        </p>
      </div>
      {nextOpenText && !restaurantStatus?.isOpen && (
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <i className="fas fa-calendar-alt text-yellow"></i>
            <span className="font-semibold">Earliest pickup: {nextOpenText}</span>
          </p>
        )}
    </div>
  );
}
