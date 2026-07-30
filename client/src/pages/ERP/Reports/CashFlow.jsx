import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CashFlowDetails from "../Components/CashFlowDetails";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function CashFlow() {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState({
    inflow: 0,
    outflow: 0,
    netCashFlow: 0,
    inflowBreakup: {},
    outflowBreakup: {},
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/reports/cash-flow", {
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

  const chartData = [
    {
      name: "Inflow",
      amount: data.inflow,
    },
    {
      name: "Outflow",
      amount: data.outflow,
    },
  ];

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">Cash Flow Report</h1>

        <p className="text-sm text-gray-500">
          Track movement of cash in and out
        </p>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard title="Cash Inflow" value={data.inflow} color="green" />

        <SummaryCard title="Cash Outflow" value={data.outflow} color="red" />

        <SummaryCard
          title="Net Cash Flow"
          value={data.netCashFlow}
          color={data.netCashFlow >= 0 ? "green" : "red"}
        />
      </div>

      {/* CHART */}

      <div className="rounded-xl border bg-white py-4 px-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Cash Flow Overview</h2>

        <ResponsiveContainer
          width="100%"
          height={280}
          style={{ margin: "auto", overflow: "hidden" }}
        >
          <BarChart
            data={chartData}
            responsive
            margin={{
              top: 10,
              right: 0,
              bottom: 0,
              left: -16,
            }}
          >
            <XAxis dataKey="name" />

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

            <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MOBILE */}

      <div className="space-y-4 md:hidden">
        <FlowCard title="Cash Inflow" data={data.inflowBreakup} color="green" />

        <FlowCard title="Cash Outflow" data={data.outflowBreakup} color="red" />
      </div>

      {/* DESKTOP */}

      <div className="hidden grid-cols-2 gap-6 md:grid">
        <BreakupTable
          title="Cash Inflow"
          data={data.inflowBreakup}
          color="green"
        />

        <BreakupTable
          title="Cash Outflow"
          data={data.outflowBreakup}
          color="red"
        />
      </div>

      {/* NET RESULT */}

      <div
        className={`rounded-xl border p-6 text-center ${
          data.netCashFlow >= 0
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <h2 className="text-lg font-semibold">Net Cash Position</h2>

        <div
          className={`mt-2 text-3xl font-bold ${
            data.netCashFlow >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          ₹{data.netCashFlow.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col items-center">
      <p className="text-xs text-gray-500">{title}</p>

      <h2 className={`mt-2 text-lg font-bold ${colors[color]}`}>
        ₹{Number(value).toLocaleString()}
      </h2>
    </div>
  );
}

function BreakupTable({ title, data, color }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [details, setDetails] = useState([]);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchDetails = async (category) => {
    try {
      setDetailsLoading(true);
      setSelectedCategory(category);

      const res = await axios.get("/api/v1/reports/cash-flow-details", {
        params: {
          companyId: user.companyId,
          category,
        },
      });

      setDetails(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <h2
          className={`font-semibold ${
            color === "green" ? "text-green-700" : "text-red-700"
          }`}
        >
          {title}
        </h2>
      </div>

      <div className="divide-y">
        {Object.entries(data || {}).map(([name, amount]) => (
          <button
            key={name}
            onClick={() => fetchDetails(name)}
            className="flex w-full justify-between p-4 hover:bg-gray-50"
          >
            <span>{name}</span>

            <span
              className={`font-medium ${
                color === "green" ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{amount.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {selectedCategory && (
        <CashFlowDetails
          title={selectedCategory}
          data={details}
          loading={detailsLoading}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}

function FlowCard({ title, data, color }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [details, setDetails] = useState([]);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchDetails = async (category) => {
    try {
      setDetailsLoading(true);
      setSelectedCategory(category);

      const res = await axios.get("/api/v1/reports/cash-flow-details", {
        params: {
          companyId: user.companyId,
          category,
        },
      });

      setDetails(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3
        className={`mb-3 font-semibold ${
          color === "green" ? "text-green-700" : "text-red-700"
        }`}
      >
        {title}
      </h3>

      <div className="space-y-2">
        {Object.entries(data || {}).map(([name, amount]) => (
          <button
            key={name}
            onClick={() => fetchDetails(name)}
            className="flex w-full justify-between hover:bg-gray-50"
          >
            <span>{name}</span>

            <span
              className={`font-medium ${
                color === "green" ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{amount.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      {selectedCategory && (
        <CashFlowDetails
          title={selectedCategory}
          data={details}
          loading={detailsLoading}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
