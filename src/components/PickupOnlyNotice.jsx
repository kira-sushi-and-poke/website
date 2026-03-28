export default function PickupOnlyNotice() {
  return (
    <div className="bg-yellow/10 border border-yellow rounded-lg p-3 flex items-start gap-2">
      <i className="fas fa-shopping-bag text-yellow text-sm mt-0.5"></i>
      <div className="text-xs text-gray-700">
        <p className="font-semibold text-gray-800 mb-1">Pickup Only</p>
        <p>
          We don't offer delivery at the moment, but we're hoping to add it soon! For now, you can collect your order from our location at 148 Front Street, Chester-le-Street.
        </p>
      </div>
    </div>
  );
}
