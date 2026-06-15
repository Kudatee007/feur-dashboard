// src/features/users/pages/Drivers.tsx

import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useDrivers,
  useDriverDetail,
  useUpdateDriverStatus,
} from "../../features/users/hooks/useDrivers";
import type { DriverListItem, OperationalStatus } from "../../features/users/types/users.types";

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return n === 0 || !n ? "₦0" : `₦${n.toLocaleString()}`;
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

function initialsOf(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

const PAGE_SIZE = 10;

const ALL_FILTERS = [
  "All",
  "Active",
  "Inactive",
  "Approved",
  "Pending",
  "Suspended",
  "Blocked",
  "Disapproved",
] as const;
type FilterType = (typeof ALL_FILTERS)[number];

// ─── Status badge (full status set, list endpoint can return any of these) ──

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  approved: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  suspended: "bg-orange-50 text-orange-700",
  blocked: "bg-red-50 text-red-700",
  disapproved: "bg-red-100 text-red-800",
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  inactive: "bg-gray-400",
  approved: "bg-blue-500",
  pending: "bg-amber-500",
  suspended: "bg-orange-500",
  blocked: "bg-red-500",
  disapproved: "bg-red-700",
};

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[s] ?? "bg-gray-100 text-gray-500"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s] ?? "bg-gray-400"}`}
      />
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

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

// ─── Driver Detail Modal ────────────────────────────────────────────────────

type TabType = "overview" | "recent-rides" | "documents" | "earnings";

function DriverModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState<TabType>("overview");
  const { data, isLoading, isError } = useDriverDetail(id);
  const updateStatus = useUpdateDriverStatus();

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "recent-rides", label: "Recent Rides" },
    { key: "documents", label: "Documents" },
    { key: "earnings", label: "Earnings" },
  ];

  function setStatus(status: OperationalStatus) {
    updateStatus.mutate({ id, payload: { status } });
  }

  const currentStatus = (data?.driverInfo.status ?? "").toLowerCase();
  const isSuspended = currentStatus === "suspended";
  const isBlocked = currentStatus === "blocked";
  const isReactivatable = isSuspended || isBlocked;

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
              Driver Details
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
            Failed to load driver details
          </div>
        ) : (
          <>
            {/* Info strip */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-start gap-3">
                <Avatar
                  id={data.driverInfo.driverId}
                  name={`${data.driverInfo.firstName} ${data.driverInfo.lastName}`}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {data.driverInfo.firstName} {data.driverInfo.lastName}
                    </span>
                    <StatusBadge status={data.driverInfo.status} />
                    {data.driverInfo.verificationStatus === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>{data.driverInfo.phoneNumber}</span>
                    <span>{data.driverInfo.email}</span>
                    <span>{data.driverInfo.location}</span>
                    <span>
                      Joined{" "}
                      {new Date(data.driverInfo.joinedAt).toLocaleDateString()}
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
                  <p className="text-xs text-gray-400">⭐ Rating</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {data.kpis.rating ? `${data.kpis.rating} ★` : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">💰 Total Earnings</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">
                    {fmtCurrency(data.kpis.totalEarnings)}
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
                    <p className="text-xs text-gray-400 mb-1">Driver ID</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {data.driverInfo.driverId}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Account Status</p>
                    <StatusBadge status={data.driverInfo.status} />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">
                      Verification Status
                    </p>
                    <StatusBadge status={data.driverInfo.verificationStatus} />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Member Since</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(data.driverInfo.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {tab === "recent-rides" && (
                <div className="space-y-2.5">
                  {data.recentRides.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No rides yet
                    </p>
                  ) : (
                    data.recentRides.map((ride) => (
                      <div
                        key={ride.rideId}
                        className="bg-gray-50 rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {ride.rideCode}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Passenger: {ride.passengerName}
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

              {tab === "documents" && (
                <div className="space-y-2.5">
                  {data.documents.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No documents uploaded
                    </p>
                  ) : (
                    data.documents.map((doc, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-base shrink-0">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded:{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()} |
                            Expires: {doc.expiresAt}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${doc.status === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "earnings" && (
                <>
                  {data.earnings.weeklyBreakdown.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No earnings data
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400">This Month</p>
                          <p className="font-bold text-gray-900 text-sm mt-0.5">
                            {fmtCurrency(data.earnings.totalEarningsThisMonth)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400">Commission</p>
                          <p className="font-bold text-gray-900 text-sm mt-0.5">
                            {fmtCurrency(data.earnings.platformCommission)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400">Driver Payout</p>
                          <p className="font-bold text-emerald-600 text-sm mt-0.5">
                            {fmtCurrency(data.earnings.driverPayout)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {data.earnings.weeklyBreakdown.map((w, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {w.week}
                              </p>
                              <p className="text-xs text-gray-400">
                                {w.ridesCount} rides
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {fmtCurrency(w.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              {!isReactivatable ? (
                <>
                  <button
                    onClick={() => setStatus("suspended")}
                    disabled={updateStatus.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50"
                  >
                    Suspend Driver
                  </button>
                  <button
                    onClick={() => setStatus("blocked")}
                    disabled={updateStatus.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                  >
                    Block Driver
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStatus("active")}
                  disabled={updateStatus.isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                >
                  {updateStatus.isPending ? "Updating..." : "Reactivate Driver"}
                </button>
              )}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Drivers() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => setPage(1), [filter, debouncedSearch]);

  const { data, isLoading, isError, refetch, isFetching } = useDrivers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: filter === "All" ? undefined : filter.toLowerCase(),
  });

  const kpis = data?.kpis;
  const drivers = data?.table?.drivers ?? [];
  const pagination = data?.table?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const STAT_CARDS = [
    {
      label: "Active Drivers",
      value: kpis?.activeDrivers,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: "✓",
    },
    {
      label: "Inactive",
      value: kpis?.inactive,
      color: "text-gray-500",
      bg: "bg-gray-100",
      icon: "–",
    },
    {
      label: "Approved",
      value: kpis?.approved,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: "✓",
    },
    {
      label: "Pending",
      value: kpis?.pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: "⏳",
    },
    {
      label: "Suspended",
      value: kpis?.suspended,
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: "⊘",
    },
    {
      label: "Blocked",
      value: kpis?.blocked,
      color: "text-red-600",
      bg: "bg-red-50",
      icon: "✕",
    },
    {
      label: "Disapproved",
      value: kpis?.disapproved,
      color: "text-red-700",
      bg: "bg-red-100",
      icon: "✕",
    },
  ];

  return (
    <div className="bg-gray-50 font-sans">
      <div className="max-w-screen-xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            All Drivers Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Comprehensive driver tracking by status category
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full ${s.bg} ${s.color} text-xs flex items-center justify-center font-bold`}
                >
                  {s.icon}
                </span>
                <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "—" : (s.value ?? 0)}
              </p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              All Drivers by Status
            </p>

            <div className="relative">
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
                placeholder="Search drivers by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-400"
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

            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {ALL_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm font-medium text-gray-700">
                Failed to load drivers
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
                      "Driver ID",
                      "Name",
                      "Contact",
                      "Location",
                      "Status",
                      "Rides",
                      "Rating",
                      "Earnings",
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
                  ) : drivers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-12 text-center text-gray-400 text-sm"
                      >
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    drivers.map((d: DriverListItem) => (
                      <tr
                        key={d.driverId}
                        className="hover:bg-gray-50/70 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-500">
                          {d.driverId}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              id={d.driverId}
                              name={`${d.firstName} ${d.lastName}`}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900 whitespace-nowrap">
                                {d.firstName} {d.lastName}
                              </p>
                              {d.verificationStatus === "approved" && (
                                <p className="text-xs text-emerald-600 flex items-center gap-0.5">
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
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Verified
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-700">{d.email}</p>
                          <p className="text-gray-400 text-xs">
                            {d.phoneNumber}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                          {d.location}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">
                          {d.rides}
                        </td>
                        <td className="px-4 py-3.5">
                          {d.rating !== null ? (
                            <span className="flex items-center gap-1 text-gray-700 font-medium">
                              {d.rating}
                              <svg
                                className="w-3.5 h-3.5 text-amber-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">
                          {fmtCurrency(d.earnings)}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedId(d.driverId)}
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
              ) : drivers.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400 text-sm">
                  No drivers found
                </div>
              ) : (
                drivers.map((d: DriverListItem) => (
                  <div key={d.driverId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          id={d.driverId}
                          name={`${d.firstName} ${d.lastName}`}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {d.firstName} {d.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {d.driverId} · {d.location}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Rides</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {d.rides}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Rating</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {d.rating !== null ? `${d.rating} ★` : "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Earnings</p>
                        <p className="font-semibold text-gray-900 text-xs">
                          {fmtCurrency(d.earnings)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => setSelectedId(d.driverId)}
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
                {pagination.total} drivers
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
                        key={`e-${i}`}
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
        <DriverModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
