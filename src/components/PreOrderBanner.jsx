import { format } from 'date-fns';

export default function PreOrderBanner({ restaurantStatus }) {
  // Only show when closed
  if (restaurantStatus?.isOpen) return null;

  // Format next open date if available
  const nextOpenText = restaurantStatus?.nextOpenDate 
    ? format(new Date(restaurantStatus.nextOpenDate), 'EEEE, MMMM d \'at\' h:mm a')
    : null;

  return (
    <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <i className="fas fa-moon text-yellow-600 text-2xl"></i>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-yellow-900 mb-1">We're currently closed</h4>
          <p className="text-sm text-yellow-800">
            No worries! You can still add items to your cart. You'll be able to schedule your pickup time at checkout.
          </p>
          {nextOpenText && (
            <p className="text-sm text-yellow-700 mt-2 font-semibold">
              <i className="fas fa-calendar-alt mr-1"></i>
              Next open: {nextOpenText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
