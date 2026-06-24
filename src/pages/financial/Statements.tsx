// src/features/statements/pages/Statements.tsx

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Download } from "lucide-react";
import { useFinancialStatement } from "../../features/statements/hooks/useStatements";

const TEAL = "#3894A3";
// const NAVY = "#2F414F";

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number) => "₦" + (n ?? 0).toLocaleString("en-NG");
const fmtK = (n: number) =>
  n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`;

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#2F414F] rounded-lg px-4 py-2.5">
      <p className="text-white font-semibold text-[13px] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs my-0.5">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonStatCard({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`rounded-xl px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] animate-pulse ${dark ? "bg-[#304553]" : "bg-white"}`}>
      <div className={`h-2.5 w-28 rounded mb-3 ${dark ? "bg-white/20" : "bg-gray-200"}`} />
      <div className={`h-8 w-24 rounded mb-2 ${dark ? "bg-white/20" : "bg-gray-200"}`} />
      <div className={`h-2.5 w-20 rounded ${dark ? "bg-white/20" : "bg-gray-200"}`} />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl px-5 pt-5 pb-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-6 animate-pulse">
      <div className="h-3.5 w-48 bg-gray-200 rounded mb-4" />
      <div className="h-[300px] bg-gray-100 rounded-xl" />
    </div>
  );
}

function SkeletonTransaction() {
  return (
    <div className="flex items-center justify-between px-5 py-4 border rounded-[10px] bg-[#F1F9FB] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        <div>
          <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-2.5 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-3.5 w-16 bg-gray-200 rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Statements = () => {
  const { data, isLoading, isError, refetch } = useFinancialStatement();

  const kpis = data?.kpis;
  const chartData = data?.chart ?? [];
  const transactions = data?.recentTransactions ?? [];

  const stats = kpis
    ? [
        {
          label: "Gateway Collections (YTD)",
          value: fmt(kpis.gatewayCollections),
          sub: "Total collected via gateway",
          subColor: "text-emerald-400",
          highlight: true,
          valueColor: "text-white",
        },
        {
          label: "Total Rides (YTD)",
          value: kpis.totalRides.toLocaleString(),
          sub: "rides completed",
          subColor: "text-gray-400",
          highlight: false,
          valueColor: "text-[#2F414F]",
        },
        {
          label: `Driver Payouts (${kpis.driverPayouts.percentage}%)`,
          value: fmt(kpis.driverPayouts.amount),
          sub: `${kpis.driverPayouts.percentage}% disbursed`,
          subColor: "text-gray-400",
          highlight: false,
          valueColor: "text-[#00A63E]",
        },
        {
          label: `Platform Revenue (${kpis.platformRevenue.percentage}%)`,
          value: fmt(kpis.platformRevenue.amount),
          sub: `${kpis.platformRevenue.percentage}% commission`,
          subColor: "text-gray-400",
          highlight: false,
          valueColor: "text-[#3894A3]",
        },
      ]
    : [];

  return (
    <div className="bg-[#F1F9FB] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">
            Financial Statement
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gateway collections and driver disbursements
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-[#3894A3] text-white rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-[#2f7a88] transition-colors disabled:opacity-50"
          disabled={isLoading || isError}
          onClick={() => window.print()}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-white rounded-xl p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-6">
          <p className="text-sm text-gray-500 mb-2">Failed to load financial statement</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-[#3894A3] font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <SkeletonStatCard dark />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          stats.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${s.highlight ? "bg-[#304553]" : "bg-white"}`}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide mb-1 text-gray-400">
                {s.label}
              </p>
              <p className={`text-[30px] font-semibold leading-none mb-1 ${s.valueColor}`}>
                {s.value}
              </p>
              <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
            </div>
          ))
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <SkeletonChart />
      ) : !isError && (
        <div className="bg-white rounded-xl px-5 pt-5 pb-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-6">
          <p className="text-[13px] font-semibold text-[#2F414F] mb-4">
            Monthly Collections &amp; Disbursements
          </p>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">No chart data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                barSize={120}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5EDF0"
                  vertical={false}
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
                  tickFormatter={fmtK}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#F9FAFB" }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(value) => (
                    <span style={{ color: "#6B7280" }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="collections"
                  name="Collections"
                  fill={TEAL}
                  radius={[4, 4, 0, 0]}
                />
                {/* <Bar
                  dataKey="disbursements"
                  name="Disbursements"
                  fill={NAVY}
                  radius={[4, 4, 0, 0]}
                /> */}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      {!isError && (
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden pb-4">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#2F414F]">
              Recent Transactions
            </p>
            {!isLoading && (
              <span className="text-xs text-gray-400">
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 mx-6 mt-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTransaction key={i} />
              ))
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No recent transactions
              </p>
            ) : (
              transactions.map((txn) => {
                const isCredit = txn.type === "collection";
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border border-gray-100 rounded-[10px] bg-[#F1F9FB]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50" : "bg-red-50"}`}
                      >
                        {isCredit ? (
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {txn.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{fmtDate(txn.date)}</span>
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isCredit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                          >
                            {isCredit ? "Collection" : "Disbursement"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm font-bold whitespace-nowrap ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
                      {isCredit ? "+" : "−"}{fmt(txn.amount)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statements;