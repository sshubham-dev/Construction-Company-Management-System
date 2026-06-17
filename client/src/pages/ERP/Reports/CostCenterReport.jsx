import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CostCenterReport() {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/reports/cost-center", {
        params: {
          companyId: user.companyId,
        },
      });

      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = data.reduce((s, r) => s + r.income, 0);

  const totalExpense = data.reduce((s, r) => s + r.expense, 0);

  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Cost Center Report</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard title="Income" value={totalIncome} color="green" />

        <SummaryCard title="Expense" value={totalExpense} color="red" />

        <SummaryCard
          title="Profit"
          value={totalProfit}
          color={totalProfit >= 0 ? "green" : "red"}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Cost Center</th>

              <th className="p-3 text-right">Income</th>

              <th className="p-3 text-right">Expense</th>

              <th className="p-3 text-right">Profit</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.costCenterId} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{row.name}</div>

                  <div className="text-xs text-gray-500">{row.type}</div>
                </td>

                <td className="p-3 text-right text-green-600">
                  ₹{row.income.toLocaleString()}
                </td>

                <td className="p-3 text-right text-red-600">
                  ₹{row.expense.toLocaleString()}
                </td>

                <td
                  className={`p-3 text-right font-semibold ${
                    row.profit >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  ₹{row.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {data.map((row) => (
          <div
            key={row.costCenterId}
            className="rounded-xl border bg-white p-4"
          >
            <div className="font-medium">{row.name}</div>

            <div className="mb-3 text-xs text-gray-500">{row.type}</div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Income</div>

                <div className="font-medium text-green-600">
                  ₹{row.income.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Expense</div>

                <div className="font-medium text-red-600">
                  ₹{row.expense.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Profit</div>

                <div
                  className={`font-semibold ${
                    row.profit >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  ₹{row.profit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>

      <div
        className={`text-lg font-bold ${
          color === "green" ? "text-green-600" : "text-red-600"
        }`}
      >
        ₹{value.toLocaleString()}
      </div>
    </div>
  );
}
