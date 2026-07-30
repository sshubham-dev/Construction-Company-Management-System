import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const money = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function TrendChart({ data }) {
  const [view, setView] = useState("amount");

  if (!data) return null;

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {/* Header */}

      <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Collection Trend</h2>

          <p className="text-sm text-gray-500">
            {data.type === "daily"
              ? "Daily Collection Trend"
              : "Monthly Collection Trend"}
          </p>
        </div>

        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setView("amount")}
            className={`px-4 py-2 text-sm ${
              view === "amount" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Amount
          </button>

          <button
            onClick={() => setView("transactions")}
            className={`px-4 py-2 text-sm ${
              view === "transactions" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Chart */}

      <div className="h-[340px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.data} responsive margin={{ top: 16, right: 8, left: -20, bottom: 6 }}>
            <defs>
              <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />

                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="label" />

            <YAxis tickFormatter={formatMoney} />

            <Tooltip
              formatter={(value) => [
                view === "amount" ? money(value) : value,

                view === "amount" ? "Collection" : "Transactions",
              ]}
            />

            <Area
              type="monotone"
              dataKey={view}
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#fillColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
