import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function SiteProfitTrend({ data = [], loading = false }) {
  const demoData = [
    { period: "Jan", revenue: 1200000, expense: 850000 },
    { period: "Feb", revenue: 1500000, expense: 980000 },
    { period: "Mar", revenue: 1700000, expense: 1120000 },
    { period: "Apr", revenue: 1400000, expense: 920000 },
    { period: "May", revenue: 1850000, expense: 1260000 },
    { period: "Jun", revenue: 2100000, expense: 1450000 },
  ];

  const chartData = data.length > 0 ? data : demoData;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b">
        <h2 className="text-lg font-semibold">Revenue vs Expense Trend</h2>

        <p className="text-sm text-gray-500 mt-1">
          Financial trend for the selected period
        </p>
      </div>

      <div className="h-[220px] sm:h-[280px] lg:h-[320px] p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chart...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="period" />

              <YAxis tickFormatter={formatMoney} />

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
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#EA580C"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
