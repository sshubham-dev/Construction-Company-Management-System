import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

export default function BalanceSheet() {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState({
    assets: [],
    liabilities: [],
    totalAssets: 0,
    totalLiabilities: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/reports/balance-sheet", {
        params: {
          companyId: user.companyId,
        },
      });

      setData(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const netWorth = data.totalAssets - data.totalLiabilities;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Balance Sheet</h1>

        <p className="text-sm text-gray-500">
          Assets and liabilities as of today
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <SummaryCard title="Assets" value={data.totalAssets} color="green" />

        <SummaryCard
          title="Liabilities"
          value={data.totalLiabilities}
          color="red"
        />

        <SummaryCard
          title="Net Worth"
          value={netWorth}
          color={netWorth >= 0 ? "green" : "red"}
        />
      </div>

      {/* Assets + Liabilities */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 ">
        {/* Assets */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm h-fit">
          <div className="border-b bg-green-50 p-4">
            <h2 className="font-semibold text-green-700">Assets</h2>
          </div>

          <div className="divide-y">
            {data.assets.map((row) => (
              <div
                key={row.group}
                className="flex items-start justify-between gap-4 p-4"
              >
                <span className="text-sm break-words">{row.group}</span>

                <span className="whitespace-nowrap font-medium text-green-600">
                  ₹ {row.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t bg-green-50 p-4 font-semibold">
            <span>Total Assets</span>

            <span className="text-green-700">
              ₹ {loading ? "Loading..." : data.totalAssets.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Liabilities */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm h-fit">
          <div className="border-b bg-red-50 p-4">
            <h2 className="font-semibold text-red-700">Liabilities</h2>
          </div>

          <div className="divide-y">
            {data.liabilities.map((row) => (
              <div
                key={row.group}
                className="flex items-start justify-between gap-4 p-4"
              >
                <span className="text-sm break-words">{row.group}</span>

                <span className="whitespace-nowrap font-medium text-red-600">
                  ₹ {row.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t bg-red-50 p-4 font-semibold">
            <span>Total Liabilities</span>

            <span className="text-red-700">
              ₹{" "}
              {loading ? "Loading..." : data.totalLiabilities.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Net Worth */}
      <div
        className={`rounded-xl border p-6 text-center ${
          netWorth >= 0
            ? "border-blue-200 bg-blue-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h2 className="text-lg font-semibold">Net Worth</h2>

        <div
          className={`mt-2 text-2xl md:text-4xl font-bold ${
            netWorth >= 0 ? "text-blue-700" : "text-red-700"
          }`}
        >
          ₹ {loading ? "Loading..." : netWorth.toLocaleString()}
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
  };

  return (
    <div className="rounded-xl border bg-white px-3 py-4 shadow-sm flex items-center flex-col">
      <p className="text-xs text-gray-500 md:text-sm">{title}</p>

      <h2 className={`mt-2 text-lg md:text-2xl font-bold ${colors[color]}`}>
        ₹ {value ? Number(value).toLocaleString() : 0}
      </h2>
    </div>
  );
};
