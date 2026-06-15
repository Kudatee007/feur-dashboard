import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue"; // see note below if you don't have this
import {
  usePassengers,
  usePassengerDetail,
  useUpdatePassengerStatus,
} from "../../features/users/hooks/usePassengers";
import type {
  PassengerListItem,
  OperationalStatus,
} from "../../features/users/types/users.types";

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return `₦${(n ?? 0).toLocaleString()}`;
}

function initialsOf(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "#4F46E5",
  "#059669",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#B45309",
  "#BE185D",
  "#1D4ED8",
  "#047857",
  "#9D174D",
];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function relativeTime(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeStatus(status: string): OperationalStatus {
  const s = (status ?? "").toLowerCase();
  if (
    s === "active" ||
    s === "inactive" ||
    s === "suspended" ||
    s === "blocked"
  )
    return s;
  return "active";
}

const PAGE_SIZE = 8;

// ─── Skeleton ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-32 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-40 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-28 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3 w-8 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OperationalStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  suspended: "bg-orange-50 text-orange-700",
  blocked: "bg-red-50 text-red-700",
};

const STATUS_DOT: Record<OperationalStatus, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  suspended: "bg-orange-500",
  blocked: "bg-red-500",
};

function StatusBadge({ status }: { status: string }) {
  const s = normalizeStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[s]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
      {s}
    </span>
  );
}

function Avatar({
  id,
  name,
  size = "md",
}: {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "lg"
      ? "w-12 h-12 text-base"
      : size === "sm"
        ? "w-8 h-8 text-xs"
        : "w-9 h-9 text-sm";
  const parts = name.split(" ");
  const initials = initialsOf(parts[0] ?? "", parts[1] ?? "");
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: colorFor(id) }}
    >
      {initials}
    </div>
  );
}

// ─── Detail Modal ───────────────────────────────────────────────────────────

type TabType = "overview" | "ride-history" | "vehicles" | "payments";

function PassengerModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<TabType>("overview");
  const { data, isLoading, isError } = usePassengerDetail(id);
  const updateStatus = useUpdatePassengerStatus();

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "ride-history", label: "Ride History" },
    { key: "vehicles", label: "Vehicles" },
    { key: "payments", label: "Payments" },
  ];

  function handleToggleStatus() {
    if (!data) return;
    const current = normalizeStatus(data.passengerInfo.status);
    const next: OperationalStatus =
      current === "active" ? "suspended" : "active";
    updateStatus.mutate({ id, payload: { status: next } });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">
              Passenger Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3 animate-pulse">
            <div className="h-16 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        ) : isError || !data ? (
          <div className="p-8 text-center text-sm text-gray-400">
            Failed to load passenger details
          </div>
        ) : (
          <>
            {/* Info strip */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  id={data.passengerInfo.passengerId}
                  name={`${data.passengerInfo.firstName} ${data.passengerInfo.lastName}`}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {data.passengerInfo.firstName}{" "}
                      {data.passengerInfo.lastName}
                    </span>
                    <StatusBadge status={data.passengerInfo.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{data.passengerInfo.phoneNumber}</span>
                    <span>{data.passengerInfo.email}</span>
                    <span>{data.passengerInfo.location}</span>
                    <span>
                      Joined{" "}
                      {new Date(
                        data.passengerInfo.memberSince,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">🚗 Total Rides</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {data.kpis.totalRides}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">💳 Total Spent</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {fmtCurrency(data.kpis.totalSpent)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">🕐 Last Ride</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {relativeTime(data.kpis.lastRide)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 border-b border-gray-100">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {tab === "overview" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Passenger ID</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {data.passengerInfo.passengerId}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Account Status</p>
                    <StatusBadge status={data.passengerInfo.status} />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Member Since</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(
                        data.passengerInfo.memberSince,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {data.passengerInfo.location}
                    </p>
                  </div>
                </div>
              )}

              {tab === "ride-history" && (
                <div className="space-y-2.5">
                  {data.rideHistory.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No rides yet
                    </p>
                  ) : (
                    data.rideHistory.map((ride) => (
                      <div
                        key={ride.rideId}
                        className="bg-gray-50 rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {ride.rideId}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Driver: {ride.driverName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {ride.route.pickup} → {ride.route.dropoff}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(ride.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              {fmtCurrency(ride.fare)}
                            </p>
                            <p className="text-xs text-amber-500">
                              {ride.rating} ★
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "vehicles" && (
                <div className="space-y-2.5">
                  {data.vehicles.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No vehicles registered
                    </p>
                  ) : (
                    data.vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                          🚗
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {v.make} {v.model} {v.year}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Plate: {v.plateNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            Color: {v.color}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "payments" && (
                <div className="space-y-2">
                  {data.payments.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No payment records
                    </p>
                  ) : (
                    data.payments.map((p) => (
                      <div
                        key={p.paymentId}
                        className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.transactionRef}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.paymentMethod}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(p.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            {fmtCurrency(p.amount)}
                          </p>
                          <span className="text-xs text-emerald-600 mt-0.5">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={handleToggleStatus}
                disabled={updateStatus.isPending}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${normalizeStatus(data.passengerInfo.status) === "active" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
              >
                {updateStatus.isPending
                  ? "Updating..."
                  : normalizeStatus(data.passengerInfo.status) === "active"
                    ? "Suspend Account"
                    : "Reactivate Account"}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            {updateStatus.isError && (
              <p className="px-5 pb-3 text-xs text-red-500">
                Failed to update status. Try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Passengers() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => setPage(1), [debouncedSearch]);

  const { data, isLoading, isError, refetch, isFetching } = usePassengers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const kpis = data?.kpis;
  const passengers = data?.table?.passengers ?? [];
  const pagination = data?.table?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="min-h-screen font-sans">
      <div>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Passengers Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and monitor all registered passengers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Passengers", value: kpis?.totalPassengers },
            { label: "Active Users", value: kpis?.activeUsers },
            { label: "New This Month", value: kpis?.newThisMonth },
            {
              label: "Avg Rides/User",
              value: kpis?.avgRidesPerUser,
              isFloat: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {isLoading
                  ? "—"
                  : s.isFloat
                    ? (s.value ?? 0).toFixed(1)
                    : (s.value ?? 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700 shrink-0">
              All Passengers
            </p>

            <div className="flex w-64 sm:ml-auto relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search passengers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm font-medium text-gray-700">
                Failed to load passengers
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-[#3894A3] font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Desktop Table */}
          {!isError && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[
                      "Passenger ID",
                      "Name",
                      "Contact",
                      "Vehicle (Plate #)",
                      "Location",
                      "Status",
                      "Total Rides",
                      "Total Spent",
                      "Last Ride",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : passengers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-gray-400 text-sm"
                      >
                        No passengers found
                      </td>
                    </tr>
                  ) : (
                    passengers.map((p: PassengerListItem) => (
                      <tr
                        key={p.passengerId}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                          {p.passengerId}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              id={p.passengerId}
                              name={`${p.firstName} ${p.lastName}`}
                              size="sm"
                            />
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {p.firstName} {p.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-700">{p.email}</p>
                          <p className="text-gray-400 text-xs">
                            {p.phoneNumber}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-700 whitespace-nowrap">
                            {p.vehicle?.model ?? "—"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {p.vehicle?.plateNumber ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {p.location}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">
                          {p.totalRides}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">
                          {fmtCurrency(p.totalSpent)}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {relativeTime(p.lastRide)}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedId(p.passengerId)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!isError && (
            <div className="md:hidden divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  Loading...
                </div>
              ) : passengers.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400 text-sm">
                  No passengers found
                </div>
              ) : (
                passengers.map((p: PassengerListItem) => (
                  <div key={p.passengerId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          id={p.passengerId}
                          name={`${p.firstName} ${p.lastName}`}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.passengerId} · {p.location}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Rides</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {p.totalRides}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Spent</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {fmtCurrency(p.totalSpent)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Last Ride</p>
                        <p className="font-semibold text-gray-900 text-xs">
                          {relativeTime(p.lastRide)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {p.vehicle?.model ?? "—"} ·{" "}
                        {p.vehicle?.plateNumber ?? "—"}
                      </p>
                      <button
                        onClick={() => setSelectedId(p.passengerId)}
                        className="text-xs text-orange-600 font-medium hover:underline flex items-center gap-1"
                      >
                        View Details
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!isError && pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing{" "}
                {pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, pagination.total)} of{" "}
                {pagination.total} passengers
                {isFetching && !isLoading && (
                  <span className="ml-2 text-gray-300">· updating…</span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (idx > 0 && n - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-1 text-gray-400 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {n}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <PassengerModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
