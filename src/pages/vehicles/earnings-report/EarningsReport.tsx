import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Download, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

// ─── Palette (matches Figma: dark navy + teal) ────────────────────────────────
const TEAL = "#3894A3";
const NAVY = "#2F414F";
const BG = "#F5F7FA";

// ─── Mock data ────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: "Jan", driverPayouts: 22000, platformRevenue: 18000 },
  { month: "Feb", driverPayouts: 30000, platformRevenue: 20000 },
  { month: "Mar", driverPayouts: 26000, platformRevenue: 18000 },
  { month: "Apr", driverPayouts: 38000, platformRevenue: 22000 },
  { month: "May", driverPayouts: 40000, platformRevenue: 20000 },
  { month: "Jun", driverPayouts: 42000, platformRevenue: 24000 },
];

const trendData = [
  { month: "Jan", total: 40000 },
  { month: "Feb", total: 48000 },
  { month: "Mar", total: 44000 },
  { month: "Apr", total: 62000 },
  { month: "May", total: 58000 },
  { month: "Jun", total: 66000 },
];

interface Driver {
  rank: number;
  name: string;
  logo: string;
  rating: number;
  rides: number;
  earnings: number;
  status: "Pending" | "Paid" | "Processing";
}

const driversData: Driver[] = [
  { rank: 1, name: "Grace Okafor",    logo: "GO", rating: 4.9, rides: 512, earnings: 6840,  status: "Pending"    },
  { rank: 2, name: "Emeka Nwosu",     logo: "EN", rating: 4.8, rides: 489, earnings: 6320,  status: "Pending"    },
  { rank: 3, name: "Fatima Bello",    logo: "FB", rating: 4.9, rides: 471, earnings: 6100,  status: "Processing" },
  { rank: 4, name: "Tunde Adeyemi",   logo: "TA", rating: 4.7, rides: 455, earnings: 5870,  status: "Paid"       },
  { rank: 5, name: "Chisom Eze",      logo: "CE", rating: 4.8, rides: 440, earnings: 5640,  status: "Pending"    },
  { rank: 6, name: "Sola Ogundimu",   logo: "SO", rating: 4.6, rides: 418, earnings: 5320,  status: "Paid"       },
  { rank: 7, name: "Ngozi Okonkwo",   logo: "NO", rating: 4.9, rides: 402, earnings: 5100,  status: "Pending"    },
  { rank: 8, name: "Yusuf Aliyu",     logo: "YA", rating: 4.7, rides: 388, earnings: 4980,  status: "Processing" },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG");

const fmtK = (n: number) =>
  n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`;

// ─── Custom tooltip for bar chart ────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: NAVY, border: "none", borderRadius: 8, padding: "10px 16px" }}>
      <p style={{ color: "#fff", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontSize: 12, margin: "2px 0" }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Custom tooltip for line chart ───────────────────────────────────────────
const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: NAVY, border: "none", borderRadius: 8, padding: "10px 16px" }}>
      <p style={{ color: "#fff", fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{label}</p>
      <p style={{ color: TEAL, fontSize: 12 }}>Total: {fmt(payload[0]?.value)}</p>
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Driver["status"] }) => {
  const styles: Record<Driver["status"], { bg: string; color: string }> = {
    Pending:    { bg: "#FFF4E0", color: "#D97706" },
    Paid:       { bg: "#ECFDF5", color: "#059669" },
    Processing: { bg: "#EEF2FF", color: "#4F46E5" },
  };
  const s = styles[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

// ─── Avatar initials ──────────────────────────────────────────────────────────
const Avatar = ({ initials, rank }: { initials: string; rank: number }) => {
  const colors = ["#2DB5A3", "#4F46E5", "#D97706", "#059669", "#DC2626", "#7C3AED", "#0891B2", "#BE185D"];
  const bg = colors[(rank - 1) % colors.length];
  return (
    <div
      style={{
        width: 36, height: 36, borderRadius: "50%",
        background: bg, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

// ─── TanStack column helper ───────────────────────────────────────────────────
const columnHelper = createColumnHelper<Driver>();

// ─── Main component ───────────────────────────────────────────────────────────
const EarningsReport = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "#",
        cell: (info) => (
          <span style={{
            width: 24, height: 24, borderRadius: "50%",
            background: info.getValue() === 1 ? TEAL : "#F3F4F6",
            color: info.getValue() === 1 ? "#fff" : "#6B7280",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700,
          }}>
            {info.getValue()}
          </span>
        ),
        size: 48,
      }),
      columnHelper.accessor("name", {
        header: "Driver",
        cell: (info) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={info.row.original.logo} rank={info.row.original.rank} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: NAVY }}>{info.getValue()}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                ★ {info.row.original.rating.toFixed(1)}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("rides", {
        header: "Rides",
        cell: (info) => (
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            {info.getValue().toLocaleString()}
          </span>
        ),
        size: 80,
      }),
      columnHelper.accessor("earnings", {
        header: "Earnings",
        cell: (info) => (
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
            {fmt(info.getValue())}
          </span>
        ),
        size: 110,
      }),
      columnHelper.accessor("status", {
        header: "Payout Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
        size: 120,
        enableSorting: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: driversData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ── Stats summary ───────────────────────────────────────────────────────────
  const stats = [
    { label: "Total Collected",  value: "₦331,000", sub: "↑ +15.3% YTD",  subColor: "#10B981", icon: "💰" },
    { label: "Driver Payouts",   value: "₦215,150", sub: "65% disbursed",  subColor: "#6B7280", icon: "🚗" },
    { label: "Platform Revenue", value: "₦115,850", sub: "35% commission", subColor: "#6B7280", icon: "📊" },
    { label: "This Month",       value: "₦67,000",  sub: "June 2024",      subColor: "#6B7280", icon: "📅" },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "24px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>Driver Payouts & Earnings</h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Manage driver disbursements and track platform revenue</p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: TEAL, color: "#fff",
            border: "none", borderRadius: 8,
            padding: "10px 18px", fontSize: 13, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 12, padding: "18px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${TEAL}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: "2px 0" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: s.subColor, margin: 0, fontWeight: 500 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 20, marginBottom: 24 }}>

        {/* Stacked Bar */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 20px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: "0 0 16px" }}>Monthly Payout Breakdown</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={130}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C7DAD4" vertical={true} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtK(v)} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => <span style={{ color: "#6B7280" }}>{value}</span>}
              />
              <Bar dataKey="driverPayouts"   name="Driver Payouts"   stackId="a" fill={TEAL}  radius={[0, 0, 0, 0]} />
              <Bar dataKey="platformRevenue" name="Platform Revenue" stackId="a" fill={NAVY}  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px 20px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0 }}>Collections Growth Trend</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10B981", fontSize: 11, fontWeight: 600 }}>
              <TrendingUp size={13} /> +18.4% overall
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C7DAD4" vertical={true} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtK(v)} />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone" dataKey="total"
                stroke={TEAL} strokeWidth={2.5}
                dot={{ fill: TEAL, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: TEAL, stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── TanStack Table — Top Earning Drivers ───────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Table header row */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, margin: 0 }}>Top Earning Drivers (Pending Payout)</p>

          {/* Search */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={13} style={{ position: "absolute", left: 10, color: "#9CA3AF" }} />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search drivers…"
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                border: "1px solid #E5E7EB", borderRadius: 8,
                fontSize: 12, color: NAVY, outline: "none",
                width: 180,
              }}
            />
          </div>
        </div>

        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ background: "#F9FAFB" }}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        width: header.column.getSize() !== 150 ? header.column.getSize() : undefined,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span style={{ color: "#D1D5DB" }}>
                            {header.column.getIsSorted() === "asc"  ? <ArrowUp size={11} style={{ color: TEAL }} /> :
                             header.column.getIsSorted() === "desc" ? <ArrowDown size={11} style={{ color: TEAL }} /> :
                             <ArrowUpDown size={11} />}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderTop: "1px solid #F3F4F6",
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${TEAL}08`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFAFA")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ padding: "12px 16px" }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: "32px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            Showing {table.getRowModel().rows.length} of {driversData.length} drivers
          </span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            Total pending: <strong style={{ color: NAVY }}>
              {fmt(driversData.filter(d => d.status === "Pending").reduce((s, d) => s + d.earnings, 0))}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default EarningsReport;