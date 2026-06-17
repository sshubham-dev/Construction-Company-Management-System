import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function ProfitLoss({ companyId }) {
  const [data, setData] = useState({
    incomeRows: [],
    expenseRows: [],
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const fetchData = async () => {
    console.log("fetching profit loss with: ", {
      companyId,
    });
    const res = await axios.get(
      `/api/v1/reports/pnl?companyId=${user?.companyId}`,
    );
    // const json = await res.json();
    console.log("profit loss: ", res.data);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);


  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Profit & Loss</h2>

        <p className="text-sm text-gray-500">
          Revenue, expenses and profitability
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <SummaryCard title="Revenue" value={data.totalIncome} color="green" />

        <SummaryCard title="Expense" value={data.totalExpense} color="red" />

        <SummaryCard
          title="Net Profit"
          value={data.netProfit}
          color={data.netProfit >= 0 ? "green" : "red"}
        />

        <SummaryCard
          title="Margin"
          value={`${((data.netProfit / (data.totalIncome || 1)) * 100).toFixed(
            2,
          )}%`}
        />
      </div>

      {/* Income + Expense */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {/* Income */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-green-700">Income</h2>
          </div>

          <div className="divide-y">
            {data.incomeRows.map((row) => (
              <div
                key={row.group}
                className="flex items-start justify-between gap-4 p-4"
              >
                <span className="text-sm break-words">{row.group}</span>

                <span className="whitespace-nowrap font-medium text-green-600">
                  ₹{row.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-red-700">Expenses</h2>
          </div>

          <div className="divide-y">
            {data.expenseRows.map((row) => (
              <div
                key={row.group}
                className="flex items-start justify-between gap-4 p-4"
              >
                <span className="text-sm break-words">{row.group}</span>

                <span className="whitespace-nowrap font-medium text-red-600">
                  ₹{row.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Profit Highlight */}
      <div
        className={`rounded-xl border p-6 text-center ${
          data.netProfit >= 0
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h2 className="text-lg font-semibold">Net Profit</h2>

        <div
          className={`mt-2 text-2xl md:text-4xl font-bold ${
            data.netProfit >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          ₹{data.netProfit.toLocaleString()}
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Margin {((data.netProfit / (data.totalIncome || 1)) * 100).toFixed(2)}
          %
        </p>
      </div>
    </div>
  );
}

const SummaryCard = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "text-gray-700",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className=" rounded-xl border bg-white px-6 py-6 shadow-sm md:p-5 flex items-center flex-col">
      <p className="text-xs md:text-sm text-gray-500">{title}</p>

      <h2 className={`mt-2 text-lg md:text-2xl font-bold ${colors[color]}`}>
        {typeof value === "string"
          ? value
          : `₹${Number(value).toLocaleString()}`}
      </h2>
    </div>
  );
};
