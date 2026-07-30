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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  HandCoins,
  BanknoteArrowUp,
  BanknoteArrowDown,
} from "lucide-react";

const getCurrentFY = () => {
  const today = new Date();

  const year =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  return {
    from: `${year}-04-01`,
    to: `${year + 1}-03-31`,
  };
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function ERP() {
  const fy = getCurrentFY();
  const [data, setData] = useState({
    kpi: {},
    revenueExpense: {},
    cashFlow: {},
    departments: [],
    topReceivables: [],
    topPayables: [],
    recentVouchers: [],
  });
  const [fromDate, setFromDate] = useState(fy.from);
  const [toDate, setToDate] = useState(fy.to);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  /* ======================
     FETCH DATA
  ====================== */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const summaryRes = await axios.get("/api/v1/reports/dashboard", {
        params: {
          companyId: user.companyId,
          fromDate,
          toDate,
        },
      });
      console.log(summaryRes.data);
      setData(summaryRes.data);
    } catch (err) {
      console.error(err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user.companyId, fromDate, toDate]);

  return (
    <div className="space-y-5 pb-5">
      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border px-2 py-1"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border px-2 py-1"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const fy = getCurrentFY();
                setFromDate(fy.from);
                setToDate(fy.to);
              }}
              className="rounded-lg border px-3 text-sm"
            >
              Current FY
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date();

                const from = `${today.getFullYear()}-01-01`;

                const to = today.toISOString().split("T")[0];

                setFromDate(from);
                setToDate(to);
              }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Current Year
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={<Banknote />}
          title="Cash"
          value={data?.kpi.cash}
          onClick={() => navigate("/erp/balance-sheet")}
        />

        <KPICard
          icon={<BanknoteArrowDown />}
          title="Receivable"
          value={data?.kpi.receivable}
          onClick={() => navigate("/erp/outstanding")}
        />

        <KPICard
          icon={<BanknoteArrowUp />}
          title="Payable"
          value={data?.kpi.payable}
          onClick={() => navigate("/erp/outstanding")}
        />

        <KPICard
          icon={<HandCoins />}
          title="Net Profit"
          value={data?.kpi.profit}
          onClick={() => navigate("/erp/profit-loss")}
        />
      </div>

      {/* Revenue Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between">
            <h2 className="font-semibold">Revenue vs Expense</h2>

            <button
              onClick={() => navigate("/erp/p&l")}
              className="text-sm text-blue-600"
            >
              View
            </button>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                {
                  name: "Revenue",
                  value: data?.revenueExpense.revenue,
                },
                {
                  name: "Expense",
                  value: data?.revenueExpense.expense,
                },
              ]}
              responsive
              margin={{
                top: 10,
                right: 0,
                bottom: 0,
                left: -18,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatMoney} />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between">
            <h2 className="font-semibold">Cash Flow</h2>

            <button
              onClick={() => navigate("/erp/cash-flow")}
              className="text-sm text-blue-600"
            >
              View
            </button>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                {
                  name: "Inflow",
                  value: data?.cashFlow.inflow,
                },
                {
                  name: "Outflow",
                  value: data?.cashFlow.outflow,
                },
              ]}
              responsive
              margin={{
                top: 10,
                right: 0,
                bottom: 0,
                left: -18,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatMoney} />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Receivables & Payables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Receivable */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">Top Receivables</div>

          {data?.topReceivables.map((item) => (
            <button
              key={item.ledgerId}
              onClick={() => navigate(`/erp/ledger-report/${item.ledgerId}`)}
              className="
          flex
          w-full
          justify-between
          p-4
          border-b
        "
            >
              <div>
                <div className="font-medium">{item.name}</div>

                <div className="text-xs text-gray-500">{item.phone}</div>
              </div>

              <div className="text-green-600">
                ₹{item.absoluteBalance.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
        {/* Payables */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">Top Payables</div>

          {data?.topPayables.map((item) => (
            <button
              key={item.ledgerId}
              onClick={() => navigate(`/erp/ledger-report/${item.ledgerId}`)}
              className="
          flex
          w-full
          justify-between
          p-4
          border-b
        "
            >
              <div>
                <div className="font-medium">{item.name}</div>

                <div className="text-xs text-gray-500">{item.phone}</div>
              </div>

              <div className="text-green-600">
                ₹{item.absoluteBalance.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Department */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Department Performance</h2>
        </div>

        <div className="divide-y">
          {data?.departments.map((dept) => (
            <div
              key={dept.costCenterId}
              className="
            flex
            w-full
            justify-between
            p-4
            hover:bg-gray-50
          "
            >
              <div
                className=" cursor-pointer"
                onClick={() =>
                  navigate(`/erp/cost-analysis/${dept.costCenterId}`)
                }
              >
                <div className="font-medium">{dept.name}</div>

                <div className="text-xs text-gray-500">
                  Income ₹{dept.income?.toLocaleString()}
                </div>
              </div>

              <div
                className={dept.profit >= 0 ? "text-green-600" : "text-red-600"}
              >
                ₹{dept.profit?.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Voucher */}
      {/* <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">Recent Activity</div>

        {data?.recentVouchers?.map((voucher, index) => (
          <div
            key={index}
            className="
          flex
          justify-between
          p-4
          border-b
          hover:bg-gray-50
        "
          >
            <div
              className=" cursor-pointer"
              onClick={() => navigate(`/erp/vouchers/${voucher._id}`)}
            >
              <div className="font-medium">{voucher.voucherNo}</div>

              <div className="text-xs text-gray-500">{voucher.narration}</div>
            </div>

            <div className="text-right">
              <div className="text-sm">{voucher.type}</div>

              <div className="text-xs text-gray-500">
                {new Date(voucher.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}

/* ======================
   COMPONENTS
====================== */

function KPICard({ title, value, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
      rounded-2xl
      border
      bg-white
      p-4
      shadow-sm
      transition
      hover:shadow-md
      text-left
      w-full
      "
    >
      <div className="flex items-center justify-between">{icon}</div>

      <p className="mt-3 text-xs text-gray-500">{title}</p>

      <h2 className="mt-1 text-xl font-bold">
        ₹ {value ? value.toLocaleString() : 0}
      </h2>
    </button>
  );
}
