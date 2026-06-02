import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const weeklyRides = [
  { day: "Mon", rides: 234 }, { day: "Tue", rides: 312 }, { day: "Wed", rides: 278 },
  { day: "Thu", rides: 389 }, { day: "Fri", rides: 420 }, { day: "Sat", rides: 510 },
  { day: "Sun", rides: 380 },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 48500 },
  { month: "Mar", revenue: 51200 }, { month: "Apr", revenue: 63400 },
  { month: "May", revenue: 58900 }, { month: "Jun", revenue: 71200 },
];

const peakHours = [
  { hour: "6am", rides: 45 }, { hour: "9am", rides: 132 }, { hour: "12pm", rides: 98 },
  { hour: "3pm", rides: 115 }, { hour: "6pm", rides: 178 }, { hour: "9pm", rides: 128 },
  { hour: "12am", rides: 62 },
];

const rideStatusData = [
  { name: "Completed", value: 93, color: "#3894A3" },
  { name: "In Progress", value: 4, color: "#0ea5e9" },
  { name: "Cancelled", value: 3, color: "#ef4444" },
  { name: "Disputed", value: 1, color: "#f59e0b" },
];

const topLocations = [
  { city: "Lagos", rides: 432, revenue: "₦7,840" },
  { city: "Abuja", rides: 198, revenue: "₦3,560" },
  { city: "Port Harcourt", rides: 134, revenue: "₦2,340" },
  { city: "Kano", rides: 89, revenue: "₦1,520" },
  { city: "Ibadan", rides: 39, revenue: "₦680" },
];

const recentActivity = [
  { id: 1, type: "driver_verified", title: "New driver verified", subtitle: "Michael Okonkwo", time: "2 minutes ago", icon: "driver" },
  { id: 2, type: "passenger_registered", title: "Passenger registered", subtitle: "Sarah Johnson", time: "15 minutes ago", icon: "passenger" },
  { id: 3, type: "ride_completed", title: "Ride completed", subtitle: "Trip #28493", time: "32 minutes ago", icon: "ride" },
  { id: 4, type: "driver_application", title: "New driver application", subtitle: "David Mensah", time: "1 hour ago", icon: "application" },
  { id: 5, type: "passenger_registered", title: "Passenger registered", subtitle: "Grace Osei", time: "1 hour ago", icon: "passenger" },
  { id: 6, type: "ride_disputed", title: "Ride disputed", subtitle: "Trip #28490", time: "2 hours ago", icon: "dispute" },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
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

// ─── Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  rawValue: number;
  sub: string;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  iconBg: string;
  prefix?: string;
}

function StatCard({ label, value, rawValue, sub, trend, icon, iconBg, prefix = "" }: StatCardProps) {
  const count = useCountUp(rawValue);
  const displayValue = typeof value === "string" && value.startsWith("₦")
    ? `₦${count.toLocaleString()}`
    : typeof value === "string" && value.endsWith("%")
    ? `${(count / 10).toFixed(1)}%`
    : count.toLocaleString();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{prefix}{displayValue}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={trend.positive ? "M7 17l9.2-9.2M17 17V7H7" : "M17 7l-9.2 9.2M7 7v10h10"} />
              </svg>
              <span>{trend.value} vs last week</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; icon: React.ReactNode }> = {
    driver: { bg: "bg-teal-100", icon: <svg className="w-4 h-4 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    passenger: { bg: "bg-blue-100", icon: <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ride: { bg: "bg-emerald-100", icon: <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z" /></svg> },
    application: { bg: "bg-amber-100", icon: <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    dispute: { bg: "bg-red-100", icon: <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
  };
  const c = configs[type] ?? configs.ride;
  return <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>{c.icon}</div>;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold text-gray-900">{prefix}{p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  const stats = [
    {
      label: "Active Passengers", value: "2,847", rawValue: 2847, sub: "156 online now",
      trend: { value: "+12.5%", positive: true },
      iconBg: "bg-teal-50",
      icon: <svg className="w-6 h-6 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Active Drivers", value: "1,245", rawValue: 1245, sub: "423 online now",
      trend: { value: "+8.2%", positive: true },
      iconBg: "bg-blue-50",
      icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM13 16l2-5h3l2 5H13z" /></svg>,
    },
    {
      label: "Rides Today", value: "892", rawValue: 892, sub: "34 in progress",
      trend: { value: "+15.3%", positive: true },
      iconBg: "bg-indigo-50",
      icon: <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>,
    },
    {
      label: "Revenue (Today)", value: "₦18,492", rawValue: 18492, sub: "₦6,470 commission",
      trend: { value: "-2.4%", positive: false },
      iconBg: "bg-emerald-50",
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Pending Payouts", value: "₦12,480", rawValue: 12480, sub: "248 drivers",
      iconBg: "bg-amber-50",
      icon: <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Completed Rides", value: "856", rawValue: 856, sub: "Today",
      iconBg: "bg-red-50",
      icon: <svg className="w-6 h-6 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Cancelled Rides", value: "23", rawValue: 23, sub: "2.6% rate",
      iconBg: "bg-red-50",
      icon: <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Active Disputes", value: "7", rawValue: 7, sub: "Need attention",
      iconBg: "bg-orange-50",
      icon: <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      label: "Gateway Success", value: "984", rawValue: 984, sub: "876/890 successful",
      iconBg: "bg-emerald-50",
      icon: <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    },
    {
      label: "Avg Response Time", value: "23", rawValue: 23, sub: "Driver pickup",
      iconBg: "bg-teal-50",
      icon: <svg className="w-6 h-6 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor your platform's performance and key metrics</p>
        </div>

        {/* Stat Cards — 2 cols mobile, 3 tablet, 5 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>

        {/* Charts Row 1 — Weekly Rides & Monthly Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Weekly Rides */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Weekly Rides</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">This week</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyRides} barSize={42}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f0fdf4" }} />
                <Bar dataKey="rides" fill="#3894A3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Monthly Revenue Trend</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Jan – Jun</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip prefix="₦" />} />
                <Line type="monotone" dataKey="revenue" stroke="#3894A3" strokeWidth={2.5} dot={{ fill: "#3894A3", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 — Peak Hours & Ride Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Peak Hours — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Peak Hours</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Today</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={peakHours} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f0fdf4" }} />
                <Bar dataKey="rides" fill="#3894A3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ride Status Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Ride Status</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={rideStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {rideStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {rideStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row — Top Locations & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top Locations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Top Locations</h2>
            <div className="space-y-3">
              {topLocations.map((loc, i) => (
                <div key={loc.city} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#3894A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">{loc.city}</p>
                      <p className="text-xs text-gray-500">{loc.revenue} revenue</p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${(loc.rides / topLocations[0].rides) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{loc.rides} rides</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-xs text-[#3894A3] font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <ActivityIcon type={activity.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}