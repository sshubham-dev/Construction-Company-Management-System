import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function FinancialTrend({ data = [] }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Revenue vs Expense</h2>

        <p className="text-sm text-gray-500 mt-1">
          Monthly financial performance.
        </p>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%" style={{ margin: "auto", overflow: "hidden" }}>
          <LineChart
            data={data}
            responsive
            margin={{
              top: 10,
              right: 0,
              bottom: 0,
              left: -18,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="period" tick={{ fontSize: 12 }} />

            <YAxis tickFormatter={formatMoney} tick={{ fontSize: 12 }} />

            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#dc2626"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
