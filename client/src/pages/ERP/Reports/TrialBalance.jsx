import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function TrialBalance() {
  const [data, setData] = useState({
    rows: [],
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: false,
  });
  const [loading, setloading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [showZero, setShowZero] = useState(false);

  const fetchData = async () => {
    setloading(true);
    try {
      const res = await axios.get("/api/v1/reports/trial-balance", {
        params: {
          companyId: user.companyId,
          fromDate,
          toDate,
        },
      });

      setData(res.data);
      setloading(false);
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.companyId, fromDate, toDate]);

  const filteredRows = data.rows.filter((row) => {
    const match =
      row.ledgerName?.toLowerCase().includes(search.toLowerCase()) ||
      row.group?.toLowerCase().includes(search.toLowerCase());

    const nonZero = showZero || row.debit !== 0 || row.credit !== 0;

    return match && nonZero;
  });

  return (
    <div className="space-y-6 py-4">
      {/* Head */}
      <div className="p-3">
        <h1 className="text-2xl font-bold">Trial Balance</h1>

        <p className="text-sm text-gray-500">
          Verify debit and credit balances
        </p>
      </div>

      {/* Search & Date Filter */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search ledger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 px-4"
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border p-2"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border p-2"
          />

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white text-wrap">
            Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Debit"
          value={data.totalDebit}
          color="green"
        />

        <SummaryCard
          title="Total Credit"
          value={data.totalCredit}
          color="red"
        />

        <SummaryCard
          title="Difference"
          value={Math.abs(data.totalDebit - data.totalCredit)}
          color={data.totalDebit === data.totalCredit ? "green" : "red"}
        />
        <SummaryCard title="Ledgers" value={filteredRows.length} />
      </div>

      <div
        className={`rounded-xl border p-4 font-medium ${
          data.isBalanced
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {data.isBalanced
          ? "✓ Trial Balance Matched"
          : "⚠ Trial Balance Not Balanced"}
      </div>

      {/* Show Zero Balance */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showZero}
          onChange={(e) => setShowZero(e.target.checked)}
        />

        <label className="text-sm">Show Zero Balance Ledgers</label>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr className="border-b">
                <th className="px-3 py-3 text-left">Ledger</th>

                <th className="px-3 py-3 text-right">Debit</th>

                <th className="px-3 py-3 text-right">Credit</th>

                <th className="px-3 py-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => {
                const balance = row.debit - row.credit;

                return (
                  <React.Fragment key={row.ledgerId}>
                    {/* Desktop */}
                    <tr className="hidden md:table-row border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{row.ledgerName}</span>

                          <span className="text-xs text-gray-500">
                            {row.group}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-right text-green-600">
                        ₹{row.debit.toLocaleString()}
                      </td>

                      <td className="px-3 py-3 text-right text-red-600">
                        ₹{row.credit.toLocaleString()}
                      </td>

                      <td
                        className={`px-3 py-3 text-right font-semibold ${
                          balance >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        ₹{Math.abs(balance).toLocaleString()}
                        <span className="ml-1 text-xs">
                          {balance >= 0 ? "Dr" : "Cr"}
                        </span>
                      </td>
                    </tr>

                    {/* Mobile */}
                    <tr className="md:hidden border-b">
                      <td colSpan={4} className="p-3">
                        <div className="rounded-lg border bg-white p-3">
                          <div className="mb-2">
                            <div className="font-medium">{row.ledgerName}</div>

                            <div className="text-xs text-gray-500">
                              {row.group}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Debit</p>

                              <p className="font-medium text-green-600">
                                ₹{row.debit.toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500">Credit</p>

                              <p className="font-medium text-red-600">
                                ₹{row.credit.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 border-t pt-2">
                            <p className="text-gray-500 text-xs">Balance</p>

                            <p
                              className={`font-semibold ${
                                balance >= 0 ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              ₹{Math.abs(balance).toLocaleString()}
                              <span className="ml-1 text-xs">
                                {balance >= 0 ? "Dr" : "Cr"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>

            <tfoot className="hidden md:table-footer-group bg-gray-50 font-semibold">
              <tr>
                <td colSpan="2" className="px-4 py-3">
                  Total
                </td>

                <td className="px-4 py-3 text-right text-green-600">
                  ₹{data.totalDebit.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right text-red-600">
                  ₹{data.totalCredit.toLocaleString()}
                </td>

                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="md:hidden mt-4 rounded-xl border bg-white p-4">
        <div className="flex justify-between">
          <span>Total Debit</span>
          <span className="text-green-600 font-semibold">
            ₹{data.totalDebit.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between mt-2">
          <span>Total Credit</span>
          <span className="text-red-600 font-semibold">
            ₹{data.totalCredit.toLocaleString()}
          </span>
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
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`mt-2 text-2xl font-bold ${colors[color]}`}>
        ₹{Number(value).toLocaleString()}
      </h2>
    </div>
  );
};
