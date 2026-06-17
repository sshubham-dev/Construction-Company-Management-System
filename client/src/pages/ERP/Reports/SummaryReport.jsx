import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function SummaryReport() {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState({
    income: 0,
    expense: 0,
    profit: 0,
    cash: 0,
    bank: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/reports/summary", {
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Business Summary</h1>

        <p className="text-sm text-gray-500">
          Quick overview of company performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <SummaryCard title="Revenue" value={data.income} color="green" />

        <SummaryCard title="Expense" value={data.expense} color="red" />

        <SummaryCard
          title="Profit"
          value={data.profit}
          color={data.profit >= 0 ? "green" : "red"}
        />

        <SummaryCard title="Cash" value={data.cash} color="blue" />

        <SummaryCard title="Bank" value={data.bank} color="purple" />
      </div>

      {/* Profit Highlight */}
      <div
        className={`rounded-xl border p-6 text-center ${
          data.profit >= 0
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h2 className="text-lg font-semibold">Net Profit</h2>

        <div
          className={`mt-2 text-3xl md:text-5xl font-bold ${
            data.profit >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          ₹{data.profit.toLocaleString()}
        </div>
      </div>

      {/* Financial Position */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Revenue vs Expense</h3>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Revenue</span>
                <span>₹{data.income.toLocaleString()}</span>
              </div>

              <div className="h-3 rounded bg-gray-100">
                <div
                  className="h-3 rounded bg-green-500"
                  style={{
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Expense</span>
                <span>₹{data.expense.toLocaleString()}</span>
              </div>

              <div className="h-3 rounded bg-gray-100">
                <div
                  className="h-3 rounded bg-red-500"
                  style={{
                    width: `${(data.expense / (data.income || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">Available Funds</h3>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Cash-in-Hand</span>

              <span className="font-medium text-blue-600">
                ₹{data.cash.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Bank Balance</span>

              <span className="font-medium text-purple-600">
                ₹{data.bank.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total Funds</span>

              <span>₹{(data.cash + data.bank).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "text-gray-700",
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs md:text-sm text-gray-500">{title}</p>

      <h2 className={`mt-2 text-lg md:text-2xl font-bold ${colors[color]}`}>
        ₹{Number(value).toLocaleString()}
      </h2>
    </div>
  );
};
