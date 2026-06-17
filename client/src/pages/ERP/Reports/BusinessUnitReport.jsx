import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function BusinessUnitReport() {
  const { user } = useSelector(
    (state) => state.auth
  );

  const [data, setData] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "/api/v1/reports/business-unit",
        {
          params: {
            companyId: user.companyId,
          },
        }
      );

      setData(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = data.reduce(
    (sum, row) => sum + row.income,
    0
  );

  const totalExpense = data.reduce(
    (sum, row) => sum + row.expense,
    0
  );

  const totalProfit =
    totalIncome - totalExpense;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold">
          Business Unit Report
        </h1>

        <p className="text-sm text-gray-500">
          Income, expense and profitability by branch
        </p>
      </div>

      {/* Summary */}

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          title="Income"
          value={totalIncome}
          color="green"
        />

        <SummaryCard
          title="Expense"
          value={totalExpense}
          color="red"
        />

        <SummaryCard
          title="Profit"
          value={totalProfit}
          color={
            totalProfit >= 0
              ? "green"
              : "red"
          }
        />
      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                Business Unit
              </th>

              <th className="px-4 py-3 text-right">
                Income
              </th>

              <th className="px-4 py-3 text-right">
                Expense
              </th>

              <th className="px-4 py-3 text-right">
                Profit
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row.businessUnitId}
                className="border-t"
              >
                <td className="px-4 py-3 font-medium">
                  {row.name}
                </td>

                <td className="px-4 py-3 text-right text-green-600">
                  ₹
                  {row.income.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right text-red-600">
                  ₹
                  {row.expense.toLocaleString()}
                </td>

                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    row.profit >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  ₹
                  {row.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td className="px-4 py-3">
                Total
              </td>

              <td className="px-4 py-3 text-right text-green-600">
                ₹
                {totalIncome.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right text-red-600">
                ₹
                {totalExpense.toLocaleString()}
              </td>

              <td
                className={`px-4 py-3 text-right ${
                  totalProfit >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                ₹
                {totalProfit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div
            key={row.businessUnitId}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold">
              {row.name}
            </h3>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">
                  Income
                </p>

                <p className="font-medium text-green-600">
                  ₹
                  {row.income.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Expense
                </p>

                <p className="font-medium text-red-600">
                  ₹
                  {row.expense.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Profit
                </p>

                <p
                  className={`font-semibold ${
                    row.profit >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  ₹
                  {row.profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profit Highlight */}

      <div
        className={`rounded-xl border p-6 text-center ${
          totalProfit >= 0
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h2 className="text-lg font-semibold">
          Total Business Profit
        </h2>

        <div
          className={`mt-2 text-2xl font-bold md:text-4xl ${
            totalProfit >= 0
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          ₹
          {totalProfit.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color,
}) {
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">
        {title}
      </p>

      <h2
        className={`mt-2 text-lg font-bold ${colors[color]}`}
      >
        ₹{value.toLocaleString()}
      </h2>
    </div>
  );
}