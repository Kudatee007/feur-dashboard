import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useDashboardMetrics,
  useDashboardCharts,
  useDashboardLists,
} from "../../features/dashboard/hooks/useDashboard";
import type { RideStatusItem } from "../../features/dashboard/types/dashboard.types";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl ml-3" />
      </div>
    </div>
  );
}

function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
      <div className="bg-gray-100 rounded-xl" style={{ height }} />
    </div>
  );
}

// ─── Animated counter

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// ─── Stat card

interface StatCardProps {
  label: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  sub: string;
  trend?: { value: number; positive: boolean };
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({
  label,
  rawValue,
  prefix = "",
  suffix = "",
  sub,
  trend,
  icon,
  iconBg,
}: StatCardProps) {
  const count = useCountUp(rawValue);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {prefix}
            {count.toLocaleString()}
            {suffix}
          </p>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d={
                    trend.positive
                      ? "M7 17l9.2-9.2M17 17V7H7"
                      : "M17 7l-9.2 9.2M7 7v10h10"
                  }
                />
              </svg>
              <span>
                {trend.positive ? "+" : ""}
                {trend.value}% vs last week
              </span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div
          className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0 ml-3`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Activity icon

function ActivityIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; icon: React.ReactNode }> = {
    driver: {
      bg: "bg-teal-100",
      icon: (
        <svg
          className="w-4 h-4 text-[#3894A3]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    passenger: {
      bg: "bg-blue-100",
      icon: (
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    trip: {
      bg: "bg-emerald-100",
      icon: (
        <svg
          className="w-4 h-4 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
          />
        </svg>
      ),
    },
    dispute: {
      bg: "bg-red-100",
      icon: (
        <svg
          className="w-4 h-4 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
  };
  const c = configs[type] ?? configs.trip;
  return (
    <div
      className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}
    >
      {c.icon}
    </div>
  );
}

// ─── Chart tooltip 

function ChartTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold text-gray-900">
          {prefix}
          {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ─── Relative time ────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Status colour ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  completed: "#3894A3",
  inprogress: "#0ea5e9",
  "in progress": "#0ea5e9",
  cancelled: "#ef4444",
  disputed: "#f59e0b",
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status.toLowerCase().replace(/\s+/g, "")] ?? "#94a3b8";
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">
        {message ?? "Failed to load data"}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-[#3894A3] font-medium hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics();

  console.log("metrics:", metrics); // ← check this in console

  const {
    data: charts,
    isLoading: chartsLoading,
    isError: chartsError,
    refetch: refetchCharts,
  } = useDashboardCharts();

  const {
    data: lists,
    isLoading: listsLoading,
    isError: listsError,
    refetch: refetchLists,
  } = useDashboardLists();

  // ── Stat cards driven by API ──────────────────────────────────────────────

  const statCards: StatCardProps[] = metrics
    ? [
        {
          label: "Active Passengers",
          rawValue: metrics.activePassengers?.total,
          sub: `${metrics.activePassengers?.online} online now`,
          trend: {
            value: metrics.activePassengers?.growth,
            positive: metrics.activePassengers?.growth >= 0,
          },
          iconBg: "bg-teal-50",
          icon: (
            <svg
              className="w-6 h-6 text-[#3894A3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
        {
          label: "Active Drivers",
          rawValue: metrics.activeDrivers?.total,
          sub: `${metrics.activeDrivers?.online} online now`,
          trend: {
            value: metrics.activeDrivers?.growth,
            positive: metrics.activeDrivers?.growth >= 0,
          },
          iconBg: "bg-blue-50",
          icon: (
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM13 16l2-5h3l2 5H13z"
              />
            </svg>
          ),
        },
        {
          label: "Rides Today",
          rawValue: metrics.ridesToday?.total,
          sub: `${metrics.ridesToday?.inProgress} in progress`,
          trend: {
            value: metrics.ridesToday?.growth,
            positive: metrics.ridesToday?.growth >= 0,
          },
          iconBg: "bg-indigo-50",
          icon: (
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          ),
        },
        {
          label: "Revenue (Today)",
          rawValue: metrics.revenueToday?.total,
          prefix: "₦",
          sub: `₦${metrics.revenueToday?.commission?.toLocaleString()} commission`,
          trend: {
            value: metrics.revenueToday?.growth,
            positive: metrics.revenueToday?.growth >= 0,
          },
          iconBg: "bg-emerald-50",
          icon: (
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "Pending Payouts",
          rawValue: metrics.pendingPayouts?.total,
          prefix: "₦",
          sub: `${metrics.pendingPayouts?.driverCount} drivers`,
          iconBg: "bg-amber-50",
          icon: (
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "Completed Rides",
          rawValue: metrics.completedRides?.today,
          sub: "Today",
          iconBg: "bg-teal-50",
          icon: (
            <svg
              className="w-6 h-6 text-[#3894A3]"
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
          ),
        },
        {
          label: "Cancelled Rides",
          rawValue: metrics.cancelledRides?.total,
          sub: `${metrics.cancelledRides?.rate}% rate`,
          iconBg: "bg-red-50",
          icon: (
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          label: "Active Disputes",
          rawValue: metrics.activeDisputes?.total,
          sub: "Need attention",
          iconBg: "bg-orange-50",
          icon: (
            <svg
              className="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
        },
        {
          label: "Gateway Success",
           rawValue: metrics.gatewaySuccess?.rate ?? 0,  
          suffix: "%",
          sub: `${metrics.gatewaySuccess?.successful}/${metrics.gatewaySuccess?.total} successful`,
          iconBg: "bg-emerald-50",
          icon: (
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
        },
        {
          label: "Avg Response Time",
           rawValue: metrics.avgResponseTime?.minutes ?? 0, 
          suffix: " min",
          sub: "Driver pickup",
          iconBg: "bg-teal-50",
          icon: (
            <svg
              className="w-6 h-6 text-[#3894A3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
      ]
    : [];

  // ── Chart data mapped to Recharts keys ────────────────────────────────────

  const weeklyRidesData =
    charts?.weeklyRides?.map((d) => ({ day: d.day, rides: d.count })) ?? [];
  const monthlyRevenueData =
    charts?.monthlyRevenue?.map((d) => ({
      month: d.month,
      revenue: d.revenue,
    })) ?? [];
  const peakHoursData =
    charts?.peakHours?.map((d) => ({ hour: d.hour, rides: d.count })) ?? [];
  const rideStatusData = (charts?.rideStatus ?? []).map(
    (d: RideStatusItem) => ({
      name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
      value: d.percentage,
      color: getStatusColor(d.status),
    }),
  );

  const topLocations = lists?.topLocations ?? [];
  const maxCount = topLocations[0]?.count ?? 1;
  const recentActivity = lists?.recentActivity ?? [];

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor your platform's performance and key metrics
          </p>
        </div>

        {/* ── Stat cards ─────────────────────────────────────────────────────── */}
        {metricsError ? (
          <ErrorState
            message="Failed to load metrics"
            onRetry={refetchMetrics}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {metricsLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : statCards.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
        )}

        {/* ── Charts row 1 ───────────────────────────────────────────────────── */}
        {chartsError ? (
          <ErrorState message="Failed to load charts" onRetry={refetchCharts} />
        ) : chartsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Weekly Rides */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Weekly Rides</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    This week
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyRidesData} barSize={42}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f0fdf4" }}
                    />
                    <Bar dataKey="rides" fill="#3894A3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">
                    Monthly Revenue Trend
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    This year
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<ChartTooltip prefix="₦" />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3894A3"
                      strokeWidth={2.5}
                      dot={{ fill: "#3894A3", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Charts row 2 ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              {/* Peak Hours */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Peak Hours</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    Today
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={peakHoursData} barSize={26}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f0fdf4" }}
                    />
                    <Bar dataKey="rides" fill="#3894A3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ride Status Pie */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Ride Status
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={rideStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {rideStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {rideStatusData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Bottom row ────────────────────────────────────────────────────── */}
        {listsError ? (
          <ErrorState
            message="Failed to load activity"
            onRetry={refetchLists}
          />
        ) : listsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SkeletonChart height={280} />
            <SkeletonChart height={280} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Locations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">
                Top Locations
              </h2>
              {topLocations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No location data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {topLocations.map((loc) => (
                    <div key={loc.address} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-[#3894A3]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {loc.address}
                          </p>
                          <p className="text-xs text-gray-500 ml-2 shrink-0">
                            {loc.count} rides
                          </p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3894A3] rounded-full transition-all duration-700"
                            style={{
                              width: `${(loc.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-xs text-[#3894A3] font-medium hover:underline">
                  View all
                </button>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ActivityIcon type={item.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        {item.data?.name && (
                          <p className="text-xs text-gray-400">
                            {String(item.data.name)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {relativeTime(item.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
