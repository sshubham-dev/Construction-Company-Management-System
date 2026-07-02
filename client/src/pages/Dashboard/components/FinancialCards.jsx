import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function FinancialCards({ summary = {} }) {
  const cards = [
    {
      title: "Revenue",
      value: summary.revenue || 0,
      icon: ArrowTrendingUpIcon,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      subtitle: "Money received",
    },

    {
      title: "Expense",
      value: summary.expense || 0,
      icon: ArrowTrendingDownIcon,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      subtitle: "Money paid",
    },

    {
      title: "Profit",
      value: summary.profit || 0,
      icon: BanknotesIcon,
      color:
        (summary.profit || 0) >= 0
          ? "text-blue-600"
          : "text-red-600",
      bg:
        (summary.profit || 0) >= 0
          ? "bg-blue-50"
          : "bg-red-50",
      border:
        (summary.profit || 0) >= 0
          ? "border-blue-200"
          : "border-red-200",
      subtitle: `Margin ${summary.margin || 0}%`,
    },

    {
      title: "Available Balance",
      value: summary.balance?.total || 0,
      icon: WalletIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      subtitle: `Cash ${formatMoney(
        summary.balance?.cash || 0
      )} • Bank ${formatMoney(
        summary.balance?.bank || 0
      )}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`bg-white border ${card.border} rounded-xl shadow-sm p-5`}
          >
            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2
                  className={`mt-2 text-2xl font-bold ${card.color}`}
                >
                  {formatMoney(card.value)}
                </h2>

              </div>

              <div
                className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}
              >
                <Icon
                  className={`w-6 h-6 ${card.color}`}
                />
              </div>

            </div>

            <p className="text-xs text-gray-500 mt-4 leading-5">
              {card.subtitle}
            </p>

          </div>
        );
      })}
    </div>
  );
}