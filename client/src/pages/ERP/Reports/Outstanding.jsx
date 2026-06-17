import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Outstanding = () => {
  const [partyType, setPartyType] = useState("Client");
  const [data, setData] = useState({
    partyType: "",
    totalBalance: 0,
    count: 0,
    rows: [],
  });

  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Outstanding Report</h1>

        <p className="text-sm text-gray-500">
          Track balances of Clients, Suppliers, Contractors & Employees
        </p>
      </div>

      {/* TOGGLE */}
      <div className="mb-4 flex gap-2">
        {["Client", "Supplier", "Contractor", "Employee"].map((type) => (
          <button
            key={type}
            onClick={() => setPartyType(type)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              partyType === type ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border py-2 px-4"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Party Type</p>

          <h2 className="text-xl font-bold">{data.partyType}</h2>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Parties</p>

          <h2 className="text-xl font-bold">{data.count}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <SummaryCard
          title="Receivable"
          value={filtered
            .filter((r) => r.balanceType === "RECEIVABLE")
            .reduce((a, b) => a + b.absoluteBalance, 0)}
          color="green"
        />

        <SummaryCard
          title="Payable"
          value={filtered
            .filter((r) => r.balanceType === "PAYABLE")
            .reduce((a, b) => a + b.absoluteBalance, 0)}
          color="red"
        />

        <SummaryCard title="Total" value={total} />
      </div>
      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Desktop Header */}
              <thead className="hidden md:table-header-group bg-gray-50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row) => (
                  <React.Fragment key={row.ledgerId}>
                    {/* Desktop Row */}
                    <tr className="hidden md:table-row border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{row.name}</td>

                      <td className="px-4 py-3">{row.phone || "-"}</td>

                      <td className="px-4 py-3 text-right text-green-600">
                        ₹{row.debit.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right text-red-600">
                        ₹{row.credit.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-center">
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
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          row.balance > 0
                            ? "text-green-600"
                            : row.balance < 0
                              ? "text-red-600"
                              : ""
                        }`}
                      >
                        ₹{row.absoluteBalance.toLocaleString()}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Outstanding;

const SummaryCard = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "text-gray-800",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-xl border bg-white px-6 py-3 shadow-sm flex items-center flex-col">
      <p className="text-sm text-gray-500">{title}</p>

      <h3 className={`mt-2 text-2xl font-bold ${colors[color]} text-wrap`}>
        ₹{Number(value || 0).toLocaleString()}
      </h3>
    </div>
  );
};
