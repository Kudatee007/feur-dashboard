import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useDailyHireDashboard,
} from "../../features/daily-hire/hooks/useDailyHire";
import BookingDetailModal from "./components/BookingDetailModal";
import type { HireBooking } from "../../features/daily-hire/types/dailyHire.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number) =>
  n != null ? `₦${n.toLocaleString("en-NG")}` : "—";

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700",
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-50 text-red-600",
};

const EXT_STATUS_STYLES: Record<string, string> = {
  Pending:  "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
};

type StatusFilter = "all" | "active" | "scheduled" | "completed" | "cancelled";
type PackageFilter = "all" | "half_day" | "full_day";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "All Bookings" },
  { key: "active",    label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PACKAGE_TABS: { key: PackageFilter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "half_day", label: "Half Day" },
  { key: "full_day", label: "Full Day" },
];

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({
  label,
  startWindow,
  mustEndBy,
  commissionPercent,
  extensions,
  extensionNote,
  accent,
}: {
  label: string;
  startWindow: string;
  mustEndBy: string;
  commissionPercent: number;
  extensions: string[];
  extensionNote: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <h3 className={`text-sm font-bold ${accent}`}>{label}</h3>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div className="space-y-2 text-sm">
        {[
          { label: "Start Window", value: startWindow },
          { label: "Must End By",  value: mustEndBy },
          { label: "Commission",   value: `${commissionPercent}%` },
          { label: "Extensions",   value: extensions.join(" / ") },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{row.label}</span>
            <span className="font-semibold text-gray-900 text-xs">{row.value}</span>
          </div>
        ))}
      </div>

      {extensionNote && (
        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
          {extensionNote}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 bg-gray-100 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DailyHire() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [packageFilter, setPackageFilter] = useState<PackageFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => setPage(1), [statusFilter, packageFilter, debouncedSearch]);

  const { data, isLoading, isError, refetch, isFetching } = useDailyHireDashboard({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
    package: packageFilter === "all" ? undefined : packageFilter,
    search: debouncedSearch || undefined,
  });

  const packages = data?.packages;
  const kpis = data?.kpis;
  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Daily Hire Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage half-day and full-day driver hire bookings
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 h-44 animate-pulse" />
            ))
          ) : packages ? (
            <>
              <PackageCard
                {...packages.half_day}
                accent="text-[#3894A3]"
              />
              <PackageCard
                {...packages.full_day}
                accent="text-gray-700"
              />
            </>
          ) : null}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 h-24 animate-pulse" />
            ))
          ) : kpis ? (
            [
              { label: "Active Hires",       value: kpis.activeHires,       color: "text-emerald-600" },
              { label: "Scheduled",          value: kpis.scheduledHires,    color: "text-blue-600" },
              { label: "Completed (all)",    value: kpis.completedHires,    color: "text-gray-600" },
              { label: "Extension Requests", value: kpis.extensionRequests, color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))
          ) : null}
        </div>

        {/* Booking Log */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Booking Log</p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status filters */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-xs text-gray-400 mr-1 shrink-0">Status:</span>
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setStatusFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      statusFilter === t.key
                        ? t.key === "all" ? "bg-[#3894A3] text-white" :
                          t.key === "active" ? "bg-emerald-500 text-white" :
                          t.key === "scheduled" ? "bg-blue-500 text-white" :
                          t.key === "completed" ? "bg-gray-500 text-white" :
                          "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Package filters + search */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs text-gray-400 shrink-0">Package:</span>
                {PACKAGE_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setPackageFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      packageFilter === t.key
                        ? "bg-[#2F414F] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                {/* Search */}
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3894A3] w-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-gray-500">Failed to load bookings</p>
              <button onClick={() => refetch()} className="text-xs text-[#3894A3] font-medium hover:underline">
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          {!isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["ID", "Package", "Passenger", "Driver", "Pickup", "Date", "Time Window", "Fare", "Status", "Extension", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b: HireBooking) => (
                      <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-[#3894A3] font-mono text-xs font-semibold">
                            {b.id}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.package === "half_day" ? "bg-teal-50 text-teal-700" : "bg-indigo-50 text-indigo-700"}`}>
                            {b.packageLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                          {b.passengerName}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {b.driverName}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap max-w-32 truncate">
                          {b.pickup}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {b.scheduledDate ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Scheduled
                              </span>
                              <p className="text-xs text-gray-500">{b.scheduledDate}</p>
                            </div>
                          ) : (
                            b.date
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                          {b.timeWindow}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {fmt(b.fare)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {b.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {b.extension ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium text-gray-700">{b.extension.label}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${EXT_STATUS_STYLES[b.extension.status] ?? "bg-gray-100 text-gray-500"}`}>
                                {b.extension.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedTripId(b.tripId)}
                            className="flex items-center gap-1 text-xs text-[#3894A3] hover:text-[#2d7a8a] font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isError && pagination && pagination.totalPages > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {pagination.total === 0 ? 0 : (page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
                {isFetching && !isLoading && <span className="ml-2 text-gray-300">· updating…</span>}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === pagination.totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {n}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedTripId && (
        <BookingDetailModal
          tripId={selectedTripId}
          onClose={() => setSelectedTripId(null)}
        />
      )}
    </div>
  );
}