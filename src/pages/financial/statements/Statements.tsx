import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";

const TEAL = "#3894A3";

const monthlyData = [
  { month: "Jan", driverPayouts: 22000 },
  { month: "Feb", driverPayouts: 30000 },
  { month: "Mar", driverPayouts: 26000 },
  { month: "Apr", driverPayouts: 38000 },
  { month: "May", driverPayouts: 40000 },
  { month: "Jun", driverPayouts: 42000 },
];

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
const fmtK = (n: number) =>
  n >= 1000 ? `₦${(n / 1000).toFixed(0)}k` : `₦${n}`;

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

const Statements = () => {
  const stats = [
    {
      label: "Gateway Collections (YTD)",
      value: "₦331,000",
      sub: "↑ +15.3% YTD",
      subColor: "text-emerald-400",
      highlight: true,
      payout: false,
      revenue: false,
    },
    {
      label: "Total Rides (YTD)",
      value: "17,370",
      sub: "rides completed",
      subColor: "text-gray-400",
      highlight: false,
      payout: false,
      revenue: false,
    },
    {
      label: "Driver Payouts (65%)",
      value: "₦215,150",
      sub: "65% disbursed",
      subColor: "text-gray-400",
      highlight: false,
      payout: true,
      revenue: false,
    },
    {
      label: "Platform Revenue (35%)",
      value: "₦115,850",
      sub: "35% commission",
      subColor: "text-gray-400",
      highlight: false,
      payout: false,
      revenue: true,
    },
  ];

  const transactions = [
    {
      id: 1,
      title: "Passenger gateway payments",
      date: "2024-11-19",
      amount: 4520,
      type: "credit",
    },
    {
      id: 2,
      title: "Driver disbursements (Gateway)",
      date: "2024-11-19",
      amount: 3842,
      type: "debit",
    },
    {
      id: 3,
      title: "Passenger gateway payments",
      date: "2024-11-18",
      amount: 5280,
      type: "credit",
    },
    {
      id: 4,
      title: "Driver disbursements (Gateway)",
      date: "2024-11-18",
      amount: 4488,
      type: "debit",
    },
    {
      id: 5,
      title: "Passenger gateway payments",
      date: "2024-11-17",
      amount: 4890,
      type: "credit",
    },
  ];

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
        <button className="flex items-center gap-2 bg-[#3894A3] text-white rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-[#2f7a88] transition-colors">
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${
              s.highlight ? "bg-[#304553]" : "bg-white"
            }`}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1 text-gray-400">
              {s.label}
            </p>
            <p
              className={`text-[30px] font-semibold leading-none mb-1 ${
                s.highlight
                  ? "text-white"
                  : s.payout
                    ? "text-[#00A63E]"
                    : s.revenue
                      ? "text-[#3894A3]"
                      : "text-[#2F414F]"
              }`}
            >
              {s.value}
            </p>
            <p className={`text-xs ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl px-5 pt-5 pb-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] mb-6">
        <p className="text-[13px] font-semibold text-[#2F414F] mb-4">
          Monthly Collections &amp; Disbursements
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyData}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            barSize={120}
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
            <Bar
              dataKey="driverPayouts"
              name="Driver Payouts"
              fill={TEAL}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden pb-4">
        <div className="px-5 py-4">
          <p className="text-[13px] font-semibold text-[#2F414F]">
            Recent Transactions
          </p>
        </div>
        <div className="flex flex-col gap-3 mx-6 divide-y divide-gray-100">
          {transactions.map((transaction) => {
            const isCredit = transaction.type === "credit";
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border rounded-[10px] bg-[#F1F9FB]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EEF7F9] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        stroke={TEAL}
                        strokeWidth="2"
                      />
                      <path d="M2 10h20" stroke={TEAL} strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {transaction.title}
                    </p>
                    <span className="text-xs text-gray-400">
                      {transaction.date}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-sm font-bold ${isCredit ? "text-emerald-600" : "text-red-500"}`}
                >
                  {isCredit ? "+" : ""}₦{transaction.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statements;
