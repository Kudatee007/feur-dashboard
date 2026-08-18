import { useHireBookingDetail } from "../../../features/daily-hire/hooks/useDailyHire";

const fmt = (n?: number) =>
  n != null ? `₦${n.toLocaleString("en-NG")}` : "—";

const STATUS_STYLES: Record<string, string> = {
  active:     "bg-emerald-50 text-emerald-700",
  scheduled:  "bg-blue-50 text-blue-700",
  completed:  "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-50 text-red-600",
};

const EXT_STATUS_STYLES: Record<string, string> = {
  Pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function BookingDetailModal({
  tripId,
  onClose,
}: {
  tripId: string;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useHireBookingDetail(tripId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Booking Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Full details for {data?.bookingCode ?? tripId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="p-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#3894A3] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {isError && (
          <div className="p-8 text-center text-sm text-gray-400">
            Failed to load booking details
          </div>
        )}

        {data && (
          <div className="p-5 space-y-4">
            {/* Booking ID + fare header */}
            <div className="flex items-start justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="font-bold text-gray-900 text-base">{data.bookingCode}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-medium px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full">
                    {data.packageLabel}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[data.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {data.statusLabel}
                  </span>
                  {data.extensions?.pending && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${EXT_STATUS_STYLES[data.extensions.pending.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {data.extensions.pending.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  {fmt(data.fare.totalFare ?? data.fare.baseFare)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.fare.extensionTotal ? "Total incl. extension" : "Base fare"}
                </p>
                {data.fare.extensionTotal ? (
                  <p className="text-xs text-gray-400">
                    {fmt(data.fare.baseFare)} + {fmt(data.fare.extensionTotal)} ext.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Passenger + Driver */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-100 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-xs text-gray-400">Passenger</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{data.passenger}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" />
                  </svg>
                  <p className="text-xs text-gray-400">Driver</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{data.driver}</p>
              </div>
            </div>

            {/* Pickup + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-100 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-xs text-gray-400">Pickup Location</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{data.pickupAddress}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400">Date</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">{data.date}</p>
              </div>
            </div>

            {/* Time window */}
            <div className="border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-400">Time Window</p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {data.timeWindow.start}
                <span className="mx-1.5 text-gray-400">→</span>
                {data.timeWindow.end}
                <span className="text-gray-400 font-normal ml-2 text-xs">
                  (Valid start window: {data.timeWindow.validStartWindow})
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Curfew: {data.timeWindow.curfew} unless extension approved
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-gray-900">Payment Breakdown</p>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Base Fare</span>
                  <span className="font-semibold text-gray-900">{fmt(data.fare.baseFare)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Platform Commission ({data.fare.platformCommissionPercent}%)
                  </span>
                  <span className="font-medium text-gray-700">{fmt(data.fare.platformCommission)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Driver Payout ({data.fare.driverPayoutPercent}%)
                  </span>
                  <span className="font-semibold text-emerald-600">{fmt(data.fare.driverPayout)}</span>
                </div>

                {/* Extension breakdown if present */}
                {data.fare.extensionTotal != null && data.fare.extensionTotal > 0 && (
                  <>
                    <div className="border-t border-dashed border-gray-200 pt-2.5 space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Extension — Driver Agreed ({Math.floor((data.extensions.totalCommittedMinutes ?? 0) / 60)}hr{" "}
                          {(data.extensions.totalCommittedMinutes ?? 0) % 60 > 0
                            ? `${(data.extensions.totalCommittedMinutes ?? 0) % 60} min`
                            : ""})
                        </span>
                        <span className="font-medium text-gray-700">{fmt(data.fare.extensionTotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Extension Commission (35%)</span>
                        <span className="font-medium text-gray-700">{fmt(data.fare.extensionCommission)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Driver Payout on Extension (65%)</span>
                        <span className="font-semibold text-emerald-600">{fmt(data.fare.extensionDriverPayout)}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between text-sm font-bold">
                      <span className="text-gray-900">Total Fare</span>
                      <span className="text-gray-900">{fmt(data.fare.totalFare)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Extension Request (pending) */}
            {data.extensions?.pending && (
              <div className={`border rounded-xl p-4 ${
                data.extensions.pending.status === "Approved" || data.extensions.pending.status === "approved"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Extension Request</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    data.extensions.pending.status === "Approved" || data.extensions.pending.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {data.extensions.pending.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  Duration: {Math.floor(data.extensions.pending.durationMinutes / 60)}hr
                  {data.extensions.pending.durationMinutes % 60 > 0
                    ? ` ${data.extensions.pending.durationMinutes % 60} min`
                    : ""}
                  {" "}· Fare: {fmt(data.extensions.pending.agreedPrice)}
                </p>
                <p className={`text-xs mt-1.5 ${
                  data.extensions.pending.status === "Approved" || data.extensions.pending.status === "approved"
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}>
                  {data.extensions.pending.status === "Approved" || data.extensions.pending.status === "approved"
                    ? "Driver agreed to extension. 35% commission applies. End time may push past 10 PM."
                    : "Awaiting driver response. No admin action required."}
                </p>
              </div>
            )}

            {/* Notes */}
            {data.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-700">
                  <strong>Notes:</strong> {data.notes}
                </p>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}