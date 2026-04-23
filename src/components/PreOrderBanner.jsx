import { formatNextOpenDate } from '@/lib/formatTime';
import { CONTACT_INFO } from '@/lib/constants';

export default function PreOrderBanner({ restaurantStatus }) {
  // Only show when closed
  if (restaurantStatus?.isOpen) return null;

  const { nextOpenDate, overrideActive } = restaurantStatus;
  
  // Check if "closed until further notice" (no next open date + override active)
  const isClosedIndefinitely = !nextOpenDate && overrideActive;

  // Format next open date if available
  const nextOpenText = nextOpenDate 
    ? formatNextOpenDate(nextOpenDate)
    : null;

  // Show special message for "closed until further notice"
  if (isClosedIndefinitely) {
    return (
      <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 md:p-6 mb-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="shrink-0">
            <i className="fas fa-store-slash text-red-600 text-2xl md:text-3xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 mb-2 text-base md:text-lg">Temporarily Closed</h4>
            <p className="text-sm md:text-base text-red-800 mb-3">
              We're currently closed until further notice. We apologize for any inconvenience.
            </p>
            <p className="text-sm md:text-base text-red-800 mb-3">
              For updates on when we'll reopen, please follow us on social media:
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <a
                href={CONTACT_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-semibold"
              >
                <i className="fab fa-facebook-f"></i>
                Facebook
              </a>
              <a
                href={CONTACT_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-colors text-sm md:text-base font-semibold"
              >
                <i className="fab fa-instagram"></i>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show normal pre-order banner when temporarily closed but has reopening date
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
              Earliest pickup: {nextOpenText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
