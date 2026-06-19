import { useMemo } from "react";
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
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Download,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { usePayoutsDashboard } from "../../../features/payouts/hooks/usePayouts";
import type { TopDriverPendingPayout } from "../../../features/payouts/types/payouts.types";

// ─── Palette ──────────────────────────────────────────────────────────────
const TEAL = "#3894A3";
const NAVY = "#2F414F";

// ─── Formatters ───────────────────────────────────────────────────────────
const fmt = (n: number) => "₦" + (n ?? 0).toLocaleString("en-NG");
const fmtK = (n: number) =>
  n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`;
const fmtPct = (n: number, withSign = false) => {
  const sign = withSign && n >= 0 ? "+" : "";
  return `${sign}${n}%`;
};

// ─── Tooltips ─────────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: NAVY,
        border: "none",
        borderRadius: 8,
        padding: "10px 16px",
      }}
    >
      <p
        style={{
          color: "#fff",
          fontWeight: 600,
          marginBottom: 6,
          fontSize: 13,
        }}
      >
        {label}
      </p>
      {payload
        .filter((p: any) => p.dataKey !== "total")
        .map((p: any) => (
          <p
            key={p.name}
            style={{ color: p.color, fontSize: 12, margin: "2px 0" }}
          >
            {p.name}: {fmt(p.value)}
          </p>
        ))}
    </div>
  );
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: NAVY,
        border: "none",
        borderRadius: 8,
        padding: "10px 16px",
      }}
    >
      <p
        style={{
          color: "#fff",
          fontWeight: 600,
          marginBottom: 4,
          fontSize: 13,
        }}
      >
        {label}
      </p>
      <p style={{ color: TEAL, fontSize: 12 }}>
        Total: {fmt(payload[0]?.value)}
      </p>
    </div>
  );
};

// ─── Avatar initials ──────────────────────────────────────────────────────
const Avatar = ({ name, rank }: { name: string; rank: number }) => {
  const colors = [
    "#2DB5A3",
    "#4F46E5",
    "#D97706",
    "#059669",
    "#DC2626",
    "#7C3AED",
    "#0891B2",
    "#BE185D",
  ];
  const bg = colors[(rank - 1) % colors.length];
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────
function SkeletonBlock({ height = 300 }: { height?: number }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      className="animate-pulse"
    >
      <div
        style={{
          height: 16,
          width: 160,
          background: "#F3F4F6",
          borderRadius: 6,
          marginBottom: 16,
        }}
      />
      <div style={{ height, background: "#F9FAFB", borderRadius: 8 }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      className="animate-pulse"
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#F3F4F6",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 10,
            width: "60%",
            background: "#F3F4F6",
            borderRadius: 4,
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 18,
            width: "50%",
            background: "#F3F4F6",
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            height: 10,
            width: "40%",
            background: "#F3F4F6",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "40px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 8px" }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          background: "none",
          border: "none",
          color: TEAL,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Try again
      </button>
    </div>
  );
}

// ─── TanStack column helper ────────────────────────────────────────────────
const columnHelper = createColumnHelper<TopDriverPendingPayout>();

// ─── Main component ────────────────────────────────────────────────────────
const EarningsReport = () => {
  const { data, isLoading, isError, refetch } = usePayoutsDashboard();

  const kpis = data?.kpis;
  const monthlyData = data?.charts?.monthlyPayoutBreakdown ?? [];
  const trendData = data?.charts?.collectionsGrowthTrend ?? [];
  const topDrivers = data?.topDriversPendingPayout ?? [];
  const gateway = data?.gatewaySummary;

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "#",
        cell: (info) => (
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: info.getValue() === 1 ? TEAL : "#F3F4F6",
              color: info.getValue() === 1 ? "#fff" : "#6B7280",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {info.getValue()}
          </span>
        ),
        size: 48,
      }),
      columnHelper.accessor("name", {
        header: "Driver",
        cell: (info) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={info.getValue()} rank={info.row.original.rank} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: NAVY }}>
                {info.getValue()}
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                ★ {info.row.original.rating.toFixed(1)} ·{" "}
                {info.row.original.location}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("ridesCount", {
        header: "Rides",
        cell: (info) => (
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            {info.getValue().toLocaleString()}
          </span>
        ),
        size: 80,
      }),
      columnHelper.accessor("pendingAmount", {
        header: "Pending Payout",
        cell: (info) => (
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
            {fmt(info.getValue())}
          </span>
        ),
        size: 130,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: topDrivers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ── Stats summary (driven by API) ─────────────────────────────────────────
  const stats = kpis
    ? [
        {
          label: "Total Collected",
          value: fmt(kpis.totalCollected.amount),
          sub: `↑ ${fmtPct(kpis.totalCollected.ytdGrowthPercentage, true)} YTD`,
          subColor: "#10B981",
          icon: "💰",
        },
        {
          label: "Driver Payouts",
          value: fmt(kpis.driverPayouts.amount),
          sub: `${kpis.driverPayouts.percentageDisbursed}% disbursed`,
          subColor: "#6B7280",
          icon: "🚗",
        },
        {
          label: "Platform Revenue",
          value: fmt(kpis.platformRevenue.amount),
          sub: `${kpis.platformRevenue.percentageCommission}% commission`,
          subColor: "#6B7280",
          icon: "📊",
        },
        {
          label: "This Month",
          value: fmt(kpis.currentMonthRevenue.amount),
          sub: `${kpis.currentMonthRevenue.month} ${kpis.currentMonthRevenue.year}`,
          subColor: "#6B7280",
          icon: "📅",
        },
      ]
    : [];

  // ── Trend % overall (first vs last point) ─────────────────────────────────
  const trendGrowthPct = useMemo(() => {
    if (trendData.length < 2) return null;
    const first = trendData[0].totalCollected;
    const last = trendData[trendData.length - 1].totalCollected;
    if (!first) return null;
    return (((last - first) / first) * 100).toFixed(1);
  }, [trendData]);

  return (
    <div style={{ background: "#F1F9FB", minHeight: "100vh", padding: "24px" }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>
            Driver Payouts & Earnings
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
            Manage driver disbursements and track platform revenue
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: TEAL,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {isError ? (
        <ErrorState
          message="Failed to load payouts dashboard"
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* ── Stat cards ─────────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : stats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "18px 20px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${TEAL}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          margin: 0,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: NAVY,
                          margin: "2px 0",
                        }}
                      >
                        {s.value}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: s.subColor,
                          margin: 0,
                          fontWeight: 500,
                        }}
                      >
                        {s.sub}
                      </p>
                    </div>
                  </div>
                ))}
          </div>

          {/* ── Charts row ─────────────────────────────────────────────────── */}
          <div style={{ display: "grid", gap: 20, marginBottom: 24 }}>
            {isLoading ? (
              <>
                <SkeletonBlock />
                <SkeletonBlock />
              </>
            ) : (
              <>
                {/* Stacked Bar */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "20px 20px 12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: NAVY,
                      margin: "0 0 16px",
                    }}
                  >
                    Monthly Payout Breakdown
                  </p>
                  {monthlyData.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#9CA3AF",
                        fontSize: 13,
                        padding: "40px 0",
                      }}
                    >
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                        barSize={130}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#C7DAD4"
                          vertical={true}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => fmtK(v)}
                        />
                        <Tooltip
                          content={<BarTooltip />}
                          cursor={{ fill: "#F9FAFB" }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                          formatter={(value) => (
                            <span style={{ color: "#6B7280" }}>{value}</span>
                          )}
                        />
                        <Bar
                          dataKey="driverPayout"
                          name="Driver Payouts"
                          stackId="a"
                          fill={TEAL}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="platformRevenue"
                          name="Platform Revenue"
                          stackId="a"
                          fill={NAVY}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Line Chart */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "20px 20px 12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: NAVY,
                        margin: 0,
                      }}
                    >
                      Collections Growth Trend
                    </p>
                    {trendGrowthPct !== null && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color:
                            Number(trendGrowthPct) >= 0 ? "#10B981" : "#DC2626",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <TrendingUp size={13} />
                        {Number(trendGrowthPct) >= 0 ? "+" : ""}
                        {trendGrowthPct}% overall
                      </div>
                    )}
                  </div>
                  {trendData.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#9CA3AF",
                        fontSize: 13,
                        padding: "40px 0",
                      }}
                    >
                      No data available
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={trendData}
                        margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#C7DAD4"
                          vertical={true}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => fmtK(v)}
                        />
                        <Tooltip content={<LineTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="totalCollected"
                          stroke={TEAL}
                          strokeWidth={2.5}
                          dot={{ fill: TEAL, r: 4, strokeWidth: 0 }}
                          activeDot={{
                            r: 6,
                            fill: TEAL,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── TanStack Table — Top Earning Drivers ───────────────────────── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #F3F4F6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: NAVY,
                  margin: 0,
                }}
              >
                Top Earning Drivers (Pending Payout)
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 520,
                }}
              >
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
                            cursor: header.column.getCanSort()
                              ? "pointer"
                              : "default",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                            width:
                              header.column.getSize() !== 150
                                ? header.column.getSize()
                                : undefined,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() && (
                              <span style={{ color: "#D1D5DB" }}>
                                {header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp size={11} style={{ color: TEAL }} />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown
                                    size={11}
                                    style={{ color: TEAL }}
                                  />
                                ) : (
                                  <ArrowUpDown size={11} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #F3F4F6" }}>
                        {columns.map((_, j) => (
                          <td key={j} style={{ padding: "12px 16px" }}>
                            <div
                              className="animate-pulse"
                              style={{
                                height: 14,
                                background: "#F3F4F6",
                                borderRadius: 4,
                                width: "70%",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontSize: 13,
                        }}
                      >
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, i) => (
                      <tr
                        key={row.id}
                        style={{
                          borderTop: "1px solid #F3F4F6",
                          background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = `${TEAL}08`)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0 ? "#fff" : "#FAFAFA")
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} style={{ padding: "12px 16px" }}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #F3F4F6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                Showing {table.getRowModel().rows.length} of {topDrivers.length}{" "}
                drivers
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                Total pending:{" "}
                <strong style={{ color: NAVY }}>
                  {fmt(topDrivers.reduce((s, d) => s + d.pendingAmount, 0))}
                </strong>
              </span>
            </div>
          </div>

          {/* ── Bottom payout summary cards ─────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {/* Pending Payouts */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Pending Payouts
                  </p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: NAVY,
                      margin: "8px 0 4px",
                    }}
                  >
                    {fmt(gateway?.pendingPayouts.amount ?? 0)}
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                    {gateway?.pendingPayouts.numberOfDrivers ?? 0} drivers
                    awaiting disbursement
                  </p>
                  <button
                    style={{
                      marginTop: 18,
                      width: "100%",
                      background: TEAL,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Disburse via Gateway
                  </button>
                </div>

                {/* Gateway Collections */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Gateway Collections
                  </p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: NAVY,
                      margin: "8px 0 4px",
                    }}
                  >
                    {gateway?.collections.percentage ?? 0}%
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                    {fmt(gateway?.collections.amount ?? 0)} collected
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      height: 6,
                      background: "#E5E7EB",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${gateway?.collections.percentage ?? 0}%`,
                        height: "100%",
                        background: TEAL,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>

                {/* Gateway Disbursed */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: 0,
                    }}
                  >
                    Gateway Disbursed
                  </p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      color: NAVY,
                      margin: "8px 0 4px",
                    }}
                  >
                    {gateway?.disbursed.percentage ?? 0}%
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                    {fmt(gateway?.disbursed.amount ?? 0)} paid to drivers
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      height: 6,
                      background: "#E5E7EB",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${gateway?.disbursed.percentage ?? 0}%`,
                        height: "100%",
                        background: "#22C55E",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EarningsReport;
