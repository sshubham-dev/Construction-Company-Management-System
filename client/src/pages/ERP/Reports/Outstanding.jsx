import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiDownload, FiPrinter, FiRefreshCw } from "react-icons/fi";
import { FiSearch, FiFilter } from "react-icons/fi";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiCheckCircle,
  FiDollarSign,
  FiLayers,
  FiChevronRight,
} from "react-icons/fi";
import OutstandingCharts from "../Components/OutstandingCharts";
import OutstandingAnalytics from "../Components/OutstandingAnalytics";

const Outstanding = () => {
  const [data, setData] = useState({
    totalBalance: 4285000,
    count: 16,

    rows: [],

    summary: {
      receivable: 2850000,
      payable: 1435000,
      receivableCount: 6,
      payableCount: 8,
      settledCount: 2,
      totalParties: 16,
    },

    charts: {
      partyWise: [
        {
          party: "Client",
          amount: 2850000,
        },
        {
          party: "Supplier",
          amount: 865000,
        },
        {
          party: "Contractor",
          amount: 420000,
        },
        {
          party: "Employee",
          amount: 150000,
        },
      ],

      balanceSummary: [
        {
          name: "Receivable",
          amount: 2850000,
        },
        {
          name: "Payable",
          amount: 1435000,
        },
      ],

      monthlyTrend: [
        {
          month: "Jan",
          receivable: 1200000,
          payable: 850000,
        },
        {
          month: "Feb",
          receivable: 1480000,
          payable: 930000,
        },
        {
          month: "Mar",
          receivable: 1720000,
          payable: 1100000,
        },
        {
          month: "Apr",
          receivable: 1960000,
          payable: 1240000,
        },
        {
          month: "May",
          receivable: 2350000,
          payable: 1320000,
        },
        {
          month: "Jun",
          receivable: 2600000,
          payable: 1380000,
        },
        {
          month: "Jul",
          receivable: 2850000,
          payable: 1435000,
        },
      ],
    },

    topReceivable: [
      {
        ledgerId: "1",
        name: "Rajesh Kumar",
        partyType: "Client",
        amount: 850000,
      },
      {
        ledgerId: "2",
        name: "Green Valley Residency",
        partyType: "Client",
        amount: 620000,
      },
      {
        ledgerId: "3",
        name: "Shivam Heights",
        partyType: "Client",
        amount: 480000,
      },
      {
        ledgerId: "4",
        name: "Anita Sharma",
        partyType: "Client",
        amount: 390000,
      },
      {
        ledgerId: "5",
        name: "Royal Plaza",
        partyType: "Client",
        amount: 275000,
      },
    ],

    topPayable: [
      {
        ledgerId: "6",
        name: "UltraTech Cement",
        partyType: "Supplier",
        amount: 520000,
      },
      {
        ledgerId: "7",
        name: "ABC Construction",
        partyType: "Contractor",
        amount: 340000,
      },
      {
        ledgerId: "8",
        name: "JK Cement",
        partyType: "Supplier",
        amount: 225000,
      },
      {
        ledgerId: "9",
        name: "Rahul Kumar",
        partyType: "Employee",
        amount: 95000,
      },
      {
        ledgerId: "10",
        name: "Steel India Pvt Ltd",
        partyType: "Supplier",
        amount: 78000,
      },
    ],

    insights: {
      largestReceivable: 850000,
      largestReceivableParty: "Rajesh Kumar",

      largestPayable: 520000,
      largestPayableParty: "UltraTech Cement",

      averageOutstanding: 267812,

      coverage: 199,

      highReceivableCount: 3,

      highPayableCount: 2,
    },
  });

  const [selectedParty, setSelectedParty] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [partyType, setPartyType] = useState("ALL");
  const [balanceType, setBalanceType] = useState("ALL");
  const [sortBy, setSortBy] = useState("BALANCE_DESC");
  const [search, setSearch] = useState("");

  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  /* ======================
     FETCH DATA
  ====================== */

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("/api/v1/reports/outstanding", {
        params: {
          companyId: user.companyId,
          partyType,
        },
      });

      const report = res.data;

      setData(report);
      setFiltered(report.rows || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchData();
  }, [partyType, user.companyId]);

  /* ======================
     SEARCH FILTER
  ====================== */

  useEffect(() => {
    const result = data.rows.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(result);
  }, [search, data]);

  /* */
  const onExport = () => {};
  const onPrint = () => {};
  const onRefresh = () => {
    console.log("Refetching data");
    fetchData();
    console.log("Data fetched");
  };

  /* ======================
     TOTAL
  ====================== */

  const total = filtered.reduce((sum, r) => sum + r.absoluteBalance, 0);

  /* ======================
     UI
  ====================== */

  return (
    <div className="space-y-6 p-3">
      {/* ================= HEADER ================= */}

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Receivables & Payables
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor receivables and payables from accounting vouchers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <FiPrinter />
              Print
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <FiDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ================= KPI ================= */}
      <OutstandingKPIs summary={data.summary} />

      {/* Tab */}
      <OutstandingTabs
        value={partyType}
        onChange={setPartyType}
        counts={{
          ALL: 126,
          CLIENT: 28,
          SUPPLIER: 54,
          CONTRACTOR: 22,
          EMPLOYEE: 22,
        }}
      />

      {/* ================= FILTER & Search BAR ================= */}
      <OutstandingFilters
        search={search}
        setSearch={setSearch}
        balanceType={balanceType}
        setBalanceType={setBalanceType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={() => {
          setSearch("");
          setBalanceType("ALL");
          setSortBy("BALANCE_DESC");
        }}
      />

      <OutstandingTable rows={data.rows} loading="false" />

      <OutstandingAnalytics />

      <OutstandingCharts charts={data.charts} />
    </div>
  );
};

export default Outstanding;

const colorMap = {
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

const formatAmount = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;

  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;

  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const KPIItem = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  currency = true,
}) => {
  const theme = colorMap[color];

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className={`mt-2 text-2xl font-bold ${theme.text}`}>
            {currency ? formatAmount(value) : value}
          </h2>

          {subtitle && <p className="mt-2 text-xs text-gray-500">{subtitle}</p>}
        </div>

        {icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl
              ${theme.icon}
            `}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

const OutstandingKPIs = ({ summary }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <KPIItem
        title="Receivable"
        value={summary.receivable}
        subtitle="Amount to Receive"
        color="green"
        icon={<FiTrendingUp className="text-green-700" size={22} />}
      />

      <KPIItem
        title="Payable"
        value={summary.payable}
        subtitle="Amount to Pay"
        color="red"
        icon={<FiTrendingDown className="text-red-700" size={22} />}
      />

      <KPIItem
        title="Total Outstanding"
        value={summary.receivable + summary.payable}
        subtitle="Receivable + Payable"
        color="blue"
        icon={<FiDollarSign className="text-blue-700" size={22} />}
      />

      <KPIItem
        title="Receivable Parties"
        value={summary.receivableCount}
        subtitle="Ledger Accounts"
        currency={false}
        color="green"
        icon={<FiUsers className="text-green-700" size={22} />}
      />

      <KPIItem
        title="Payable Parties"
        value={summary.payableCount}
        subtitle="Ledger Accounts"
        currency={false}
        color="red"
        icon={<FiLayers className="text-red-700" size={22} />}
      />

      <KPIItem
        title="Settled Parties"
        value={summary.settledCount}
        subtitle="Zero Balance"
        currency={false}
        color="amber"
        icon={<FiCheckCircle className="text-amber-700" size={22} />}
      />
    </div>
  );
};

const tabs = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Clients",
    value: "CLIENT",
  },
  {
    label: "Suppliers",
    value: "SUPPLIER",
  },
  {
    label: "Contractors",
    value: "CONTRACTOR",
  },
  {
    label: "Employees",
    value: "EMPLOYEE",
  },
];

const OutstandingTabs = ({ value, onChange, counts = {} }) => {
  return (
    <div className="">
      <div className="flex flex-wrap justify-evenly">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 my-1.5 text-sm font-medium border transition-all ${
              value === tab.value
                ? "bg-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100 bg-white"
            }`}
          >
            {tab.label}

            <span
              className={`rounded-full px-2 py-0.5 text-xs
               ${value === tab.value ? "bg-blue-500" : "bg-gray-200"}`}
            >
              {counts?.[tab.value] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const OutstandingFilters = ({
  search,
  setSearch,
  balanceType,
  setBalanceType,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Search */}

        <div className="lg:col-span-5">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Search
          </label>

          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone..."
              className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Balance */}

        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Balance
          </label>

          <select
            value={balanceType}
            onChange={(e) => setBalanceType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>

            <option value="RECEIVABLE">Receivable</option>

            <option value="PAYABLE">Payable</option>

            <option value="SETTLED">Settled</option>
          </select>
        </div>

        {/* Sort */}

        <div className="lg:col-span-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Sort By
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="BALANCE_DESC">Highest Outstanding</option>

            <option value="BALANCE_ASC">Lowest Outstanding</option>

            <option value="NAME_ASC">Name A-Z</option>

            <option value="NAME_DESC">Name Z-A</option>
          </select>
        </div>

        {/* Reset */}

        <div className="flex items-end lg:col-span-2">
          <button
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            <FiFilter />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const OutstandingTable = ({ rows = [], loading = false, onView }) => {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        Loading outstanding...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">Outstanding Ledger Balances</h2>

          <p className="text-sm text-gray-500">{rows.length} Parties Found</p>
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="border-b">
              <th className="px-5 py-3 text-left">Party</th>

              <th className="px-5 py-3 text-left">Type</th>

              <th className="px-5 py-3 text-right">Debit</th>

              <th className="px-5 py-3 text-right">Credit</th>

              <th className="px-5 py-3 text-right">Outstanding</th>

              <th className="px-5 py-3 text-center">Status</th>

              <th className="px-5 py-3 text-center"></th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-gray-500">
                  No Outstanding Found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <OutstandingRow key={row.ledgerId} row={row} onView={onView} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}

      <div className="space-y-4 p-4 lg:hidden">
        {rows.map((row) => (
          <OutstandingMobileCard key={row.ledgerId} row={row} onView={onView} />
        ))}
      </div>
    </div>
  );
};

const badgeColor = {
  RECEIVABLE: "bg-green-100 text-green-700",
  PAYABLE: "bg-red-100 text-red-700",
  SETTLED: "bg-gray-100 text-gray-600",
};

function OutstandingRow({ row, onView }) {
  return (
    <tr className="border-b hover:bg-blue-50 transition">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {row.name?.charAt(0)}
          </div>

          <div>
            <p className="font-medium">{row.name}</p>

            <p className="text-xs text-gray-500">{row.phone || "-"}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">{row.partyType}</td>

      <td className="px-5 py-4 text-right">₹{formatAmount(row.debit)}</td>

      <td className="px-5 py-4 text-right">₹{formatAmount(row.credit)}</td>

      <td className="px-5 py-4 text-right">
        <div className="font-semibold">
          ₹{formatAmount(row.absoluteBalance)}
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColor[row.balanceType]}`}
        >
          {row.balanceType}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <button
          onClick={() => onView(row)}
          className="rounded-lg border p-2 hover:bg-gray-100"
        >
          <FiChevronRight />
        </button>
      </td>
    </tr>
  );
}

function OutstandingMobileCard({ row, onView }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{row.name}</h3>

          <p className="text-sm text-gray-500">{row.partyType}</p>
        </div>

        <button onClick={() => onView(row)} className="rounded-lg border p-2">
          <FiChevronRight />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Debit</p>

          <p>₹{Number(row.debit).toLocaleString("en-IN")}</p>
        </div>

        <div>
          <p className="text-gray-500">Credit</p>

          <p>₹{Number(row.credit).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-500 text-sm">Outstanding</p>

        <p className="text-lg font-semibold">
          ₹{Number(row.absoluteBalance).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
