import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AccountSummary() {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await axios.get("/api/v1/reports/summary", {
      params: {
        companyId: user.companyId,
      },
    });

    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Summary Report</h1>

        <p className="text-sm text-gray-500">Financial overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card title="Revenue" value={data?.revenue} color="green" />

        <Card title="Expense" value={data?.expenses} color="red" />

        <Card
          title="Profit"
          value={data?.profit}
          color={data?.profit >= 0 ? "green" : "red"}
        />

        <Card title="Net Worth" value={data?.netWorth} color="blue" />

        <Card title="Cash" value={data?.cash} color="blue" />

        <Card title="Bank" value={data?.bank} color="blue" />

        <Card title="Receivable" value={data?.receivable} color="orange" />

        <Card title="Payable" value={data?.payable} color="orange" />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Financial Position</h2>

        <div className="space-y-3">
          <Row label="Revenue" value={data?.revenue} />

          <Row label="Expenses" value={data?.expenses} />

          <Row label="Profit" value={data?.profit} />

          <hr />

          <Row label="Cash" value={data?.cash} />

          <Row label="Bank" value={data?.bank} />

          <Row label="Receivable" value={data?.receivable} />

          <Row label="Payable" value={data?.payable} />

          <hr />

          <Row label="Net Worth" value={data?.netWorth} bold />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>

      <h2 className={`mt-2 text-lg font-bold ${colors[color]}`}>
        ₹{Number(value).toLocaleString()}
      </h2>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : ""}>{label}</span>

      <span className={bold ? "font-semibold" : ""}>
        ₹{Number(value).toLocaleString()}
      </span>
    </div>
  );
}
