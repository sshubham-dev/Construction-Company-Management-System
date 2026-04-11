import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ERP({ companyId }) {
  const [summary, setSummary] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  /* ======================
     FETCH DATA
  ====================== */

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [summaryRes, clientRes, supplierRes] = await Promise.all([
        fetch(`/api/v1/report/summary?companyId=${user.companyId}`),
        fetch(`/api/v1/report/outstanding?companyId=${user.companyId}&type=CLIENT`),
        fetch(`/api/v1/report/outstanding?companyId=${user.companyId}&type=SUPPLIER`),
      ]);

      const summaryData = await summaryRes.json();
      const clients = await clientRes.json();
      const suppliers = await supplierRes.json();

      const receivable = clients.reduce((s, c) => s + c.balance, 0);
      const payable = suppliers.reduce((s, c) => s + c.balance, 0);

      setSummary({
        revenue: summaryData.revenue || 0,
        expenses: summaryData.expenses || 0,
        receivable,
        payable,
        profit:
          (summaryData.revenue || 0) - (summaryData.expenses || 0),
      });

      // 🔥 simple chart mapping
      setRevenueData(summaryData.monthlyRevenue || []);
      setExpenseData(summaryData.expenseBreakdown || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [companyId]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-5 pb-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 p-2">
        <KPI
          title="Revenue"
          value={`₹ ${summary.revenue?.toLocaleString()}`}
          positive
        />
        <KPI
          title="Expenses"
          value={`₹ ${summary.expenses?.toLocaleString()}`}
        />
        <KPI
          title="Profit"
          value={`₹ ${summary.profit?.toLocaleString()}`}
          positive={summary.profit >= 0}
        />
        <KPI
          title="Receivable"
          value={`₹ ${summary.receivable?.toLocaleString()}`}
        />
        <KPI
          title="Payable"
          value={`₹ ${summary.payable?.toLocaleString()}`}
        />
      </div>

      {/* Revenue Chart */}
      <div className="p-2">
        <Card title="Revenue Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis hide />
              <Tooltip />
              <Line dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Expense Chart */}
      <div className="p-2">
        <Card title="Expense Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expenseData}>
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ======================
   COMPONENTS
====================== */

function KPI({ title, value, positive }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-lg font-bold">{value}</h3>
      <p className={positive ? "text-green-600" : "text-red-600"}>
        {positive ? "Good" : "Attention"}
      </p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      {children}
    </div>
  );
}