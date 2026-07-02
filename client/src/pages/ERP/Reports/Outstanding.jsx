import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Outstanding = () => {
  const [data, setData] = useState({
    partyType: "",
    totalBalance: 0,
    count: 0,
    rows: [],
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
    fetchData();
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Receivables & Payables
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor ledger balances from posted accounting vouchers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchData}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>

          {/* <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Export
          </button> */}
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-12">
          {/* Search */}

          <div className="lg:col-span-4 sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Search
            </label>

            <input
              placeholder="Search Party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {/* Party */}

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Party
            </label>

            <select
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="Client">Client</option>
              <option value="Supplier">Supplier</option>
              <option value="Contractor">Contractor</option>
              <option value="Employee">Employee</option>
            </select>
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

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Sort
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="BALANCE_DESC">Highest Balance</option>
              <option value="BALANCE_ASC">Lowest Balance</option>
              <option value="NAME_ASC">Name A-Z</option>
              <option value="NAME_DESC">Name Z-A</option>
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end lg:col-span-2">
            <button
              onClick={() => {
                setSearch("");
                setPartyType("ALL");
                setBalanceType("ALL");
                setSortBy("BALANCE_DESC");
              }}
              className="w-full rounded-lg border bg-gray-50 px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ================= KPI ================= */}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          title="Receivable"
          value={filtered
            .filter((r) => r.balanceType === "RECEIVABLE")
            .reduce((a, b) => a + b.absoluteBalance, 0)}
          color="green"
          subtitle="Amount to Receive"
        />

        <SummaryCard
          title="Payable"
          value={filtered
            .filter((r) => r.balanceType === "PAYABLE")
            .reduce((a, b) => a + b.absoluteBalance, 0)}
          color="red"
          subtitle="Amount to Pay"
        />

        <SummaryCard
          title="Net Balance"
          value={
            filtered
              .filter((r) => r.balanceType === "RECEIVABLE")
              .reduce((a, b) => a + b.absoluteBalance, 0) -
            filtered
              .filter((r) => r.balanceType === "PAYABLE")
              .reduce((a, b) => a + b.absoluteBalance, 0)
          }
          color="blue"
          subtitle="Receivable - Payable"
        />

        <SummaryCard
          title="Total Parties"
          value={filtered.length}
          type="count"
          subtitle="Ledger Accounts"
        />

        <SummaryCard
          title="Receivable Parties"
          value={filtered.filter((r) => r.balanceType === "RECEIVABLE").length}
          color="green"
          type="count"
          subtitle="Ledger Count"
        />

        <SummaryCard
          title="Payable Parties"
          value={filtered.filter((r) => r.balanceType === "PAYABLE").length}
          color="red"
          type="count"
          subtitle="Ledger Count"
        />
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}

        <div className="flex flex-row gap-3 border-b bg-gray-50 px-5 py-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Outstanding Parties</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} Ledger Accounts
            </p>
          </div>

          <button className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-100">
            Export
          </button>
        </div>

        {/* TABLE */}
        {!loading && !error && (
          <div className="max-h-[650px] overflow-auto rounded-xl border bg-white shadow-sm">
            <div className="">
              <table className="w-full text-sm">
                {/* Desktop Header */}
                <thead className="sticky top-0 z-20 bg-gray-50">
                  <tr>
                    <th className="w-[320px] px-5 py-4 text-left font-semibold">
                      Party
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Debit
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Credit
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Outstanding
                    </th>

                    <th className="px-5 py-4 text-center font-semibold">
                      Status
                    </th>

                    <th className="w-20 px-5 py-4"></th>
                  </tr>
                </thead>

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="text-5xl">📄</div>

                        <h2 className="mt-4 text-lg font-semibold">
                          No Outstanding Found
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                          There are no ledger balances matching the selected
                          filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="text-5xl">📄</div>

                          <h2 className="mt-4 text-lg font-semibold">
                            No Outstanding Found
                          </h2>

                          <p className="mt-2 text-sm text-gray-500">
                            There are no ledger balances matching the selected
                            filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {filtered.map((row) => (
                    <React.Fragment key={row.ledgerId}>
                      {/* Desktop Row */}
                      <tr
                        key={row.ledgerId}
                        className="border-b hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                              {row.name?.charAt(0)}
                            </div>

                            <div>
                              <h3 className="font-semibold">{row.name}</h3>

                              <p className="mt-1 text-xs text-gray-500">
                                {partyType}

                                {row.phone && ` • ${row.phone}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="font-semibold text-green-600">
                            ₹{row.debit.toLocaleString("en-IN")}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="font-semibold text-red-600">
                            ₹{row.credit.toLocaleString("en-IN")}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div>
                            <div
                              className={`text-lg font-bold ${
                                row.balanceType === "RECEIVABLE"
                                  ? "text-green-600"
                                  : row.balanceType === "PAYABLE"
                                    ? "text-red-600"
                                    : "text-gray-500"
                              }`}
                            >
                              ₹{row.absoluteBalance.toLocaleString("en-IN")}
                            </div>

                            <div className="text-xs text-gray-500">
                              Current Balance
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold

${
  row.balanceType === "RECEIVABLE"
    ? "bg-green-100 text-green-700"
    : row.balanceType === "PAYABLE"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-600"
}`}
                          >
                            {row.balanceType}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedParty(row);
                              setDrawerOpen(true);
                            }}
                            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>
                        </td>
                      </tr>

                      {/* Mobile Card */}
                      <tr className="md:hidden border-b">
                        <td colSpan={6} className="p-3">
                          <div className="rounded-lg border bg-white p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{row.name}</h3>

                                <p className="text-xs text-gray-500">
                                  {row.phone || "No Phone"}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  row.balanceType === "RECEIVABLE"
                                    ? "bg-green-100 text-green-700"
                                    : row.balanceType === "PAYABLE"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {row.balanceType}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Debit</p>

                                <p className="font-semibold text-green-600">
                                  ₹{row.debit.toLocaleString()}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">Credit</p>

                                <p className="font-semibold text-red-600">
                                  ₹{row.credit.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 border-t pt-2">
                              <p className="text-xs text-gray-500">
                                Outstanding Balance
                              </p>

                              <p
                                className={`font-bold ${
                                  row.balance > 0
                                    ? "text-green-600"
                                    : row.balance < 0
                                      ? "text-red-600"
                                      : ""
                                }`}
                              >
                                ₹{row.absoluteBalance.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-between border-t bg-gray-50 px-5 py-4">
                <div className="text-sm text-gray-500">
                  Showing
                  <b className="mx-1">{filtered.length}</b>
                  Ledger Accounts
                </div>

                <div>
                  <span className="text-gray-500">Total Outstanding</span>

                  <span className="ml-3 text-xl font-bold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Outstanding;

const SummaryCard = ({
  title,
  value,
  subtitle,
  color = "gray",
  type = "currency",
}) => {
  const colors = {
    gray: "text-gray-800 bg-white border-gray-200",
    green: "text-green-600 bg-green-50 border-green-200",
    red: "text-red-600 bg-red-50 border-red-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <h2 className="mt-3 text-2xl font-bold">
        {type === "currency"
          ? `₹${Number(value || 0).toLocaleString("en-IN")}`
          : Number(value || 0).toLocaleString("en-IN")}
      </h2>

      <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};
