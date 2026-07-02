import React from "react";
import {
  BanknotesIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-left hover:border-blue-500 hover:shadow-md transition-all cursor-default">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>

          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>

        <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default function SiteProfitCards({ summary}) {
  const margin = summary?.margin || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <SummaryCard
        title="Revenue"
        value={formatMoney(summary?.revenue)}
        subtitle="Total Revenue"
        icon={BanknotesIcon}
        color="text-blue-600"
      />

      <SummaryCard
        title="Expense"
        value={formatMoney(summary?.expense)}
        subtitle="Total Expense"
        icon={ArrowTrendingDownIcon}
        color="text-orange-600"
      />

      <SummaryCard
        title="Net Profit"
        value={formatMoney(summary?.profit)}
        subtitle={summary?.profit >= 0 ? "Profitable" : "Loss"}
        icon={ArrowTrendingUpIcon}
        color={summary?.profit >= 0 ? "text-green-600" : "text-red-600"}
      />

      <SummaryCard
        title="Profit Margin"
        value={`${margin.toFixed(2)} %`}
        subtitle="Overall Margin"
        icon={ChartBarIcon}
        color={margin >= 0 ? "text-green-600" : "text-red-600"}
      />
    </div>
  );
}
