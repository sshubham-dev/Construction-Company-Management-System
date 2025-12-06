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
import { FiMenu } from "react-icons/fi";
import { FaHome, FaProjectDiagram, FaTasks, FaUsers } from "react-icons/fa";

export default function ERP() {
  // Dummy Data
  const revenueData = [
    { month: "Jan", value: 80 },
    { month: "Feb", value: 95 },
    { month: "Mar", value: 70 },
    { month: "Apr", value: 100 },
    { month: "May", value: 50 },
    { month: "Jun", value: 90 },
    { month: "Jul", value: 120 },
  ];

  const expenseData = [
    { name: "Materials", value: 30 },
    { name: "Labor", value: 40 },
    { name: "Subcontractors", value: 20 },
    { name: "Overhead", value: 25 },
  ];

  const projects = [
    { name: "Project A", value: 80 },
    { name: "Project B", value: 40 },
    { name: "Project C", value: 60 },
    { name: "Project D", value: 30 },
  ];

  return (
      <div className="space-y-5 pb-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 p-2">
          <KPI
            title="Total Revenue"
            value="$1,250,000"
            change="+12%"
            positive
          />
          <KPI title="Total Expenses" value="$950,000" change="+8%" positive />
          <KPI title="Profit Margin" value="24%" change="-2%" />
          <KPI title="Outstanding Receivables" value="$150,000" change="-5%" />
          <KPI title="Payables" value="$80,000" change="+3%" positive />
        </div>

        {/* Financial Trends */}
        <div className="p-2">
          <Card
            title="Monthly Revenue Trend"
            subtitle="Last 12 Months +15%"
            value="$125,000"
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <div className="p-2">
          <Card
            title="Expense Breakdown"
            subtitle="Current Year +10%"
            value="$95,000"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expenseData}>
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Project Profitability */}
        <div className="p-2">
          <Card
            title="Project Profitability"
            subtitle="Current Year +5%"
            value="$30,000"
          >
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium">{proj.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${proj.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="p-2">
          <h2 className="text-md font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600">
              Create Invoice
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600">
              Record Payment
            </button>
            <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">
              Add Journal Entry
            </button>
          </div>
        </div>

      </div>
  );
}

// Components
function KPI({ title, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-lg font-bold">{value}</h3>
      <p className={`text-sm ${positive ? "text-green-600" : "text-red-600"}`}>
        {change}
      </p>
    </div>
  );
}

function Card({ title, subtitle, value, children }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-lg font-bold">{value}</h3>
      <p className="text-sm text-gray-400 mb-3">{subtitle}</p>
      {children}
    </div>
  );
}
