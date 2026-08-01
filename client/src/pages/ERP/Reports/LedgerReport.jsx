import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const getCurrentFY = () => {
  const today = new Date();

  const year =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  return {
    from: `${year}-04-01`,
    to: `${year + 1}-03-31`,
  };
};

const LedgerReport = () => {
  const [ledgers, setLedgers] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const fy = getCurrentFY();
  const [ledgerId, setLedgerId] = useState(id || "");
  const [company, setCompany] = useState("");
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [data, setData] = useState({
    ledger: null,
    summary: null,
    transactions: [],
  });
  const [fromDate, setFromDate] = useState(fy.from);
  const [toDate, setToDate] = useState(fy.to);

  useEffect(() => {
    if (id) {
      setLedgerId(id);
    }
  }, [id]);

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    const res = await axios.get("/api/v1/ledger", {
      params: { companyId: user.companyId },
    });
    console.log("ledger found: ", res.data);
    setLedgers(res.data.data || []);
  };

  useEffect(() => {
    if (!ledgerId) return;

    fetchReport();
  }, [ledgerId, fromDate, toDate]);

  const fetchReport = async () => {
    if (!ledgerId) return;

    try {
      const res = await axios.get("/api/v1/reports/ledger", {
        params: {
          ledgerId,
          companyId: user.companyId,
          fromDate,
          toDate,
        },
      });

      setData(res.data);
      console.log("ledger report: ", res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const ledgerOptions = ledgers.map((l) => ({
    value: l._id,
    label: l.name,
  }));

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        {id && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border p-2 hover:bg-gray-100"
          >
            <FiArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ledger Report</h1>
          <p className="text-sm text-gray-500">
            View ledger transactions and running balance
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            options={ledgerOptions}
            value={ledgerOptions.find((l) => l.value === ledgerId) || null}
            onChange={(e) => setLedgerId(e?.value)}
            placeholder="Select Ledger"
            isDisabled={id}
          />

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

      {/* Summary */}
      {data?.summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Opening Balance"
            value={data.summary.openingBalance}
          />

          <SummaryCard
            title="Debit"
            value={data.summary.totalDebit}
            color="green"
          />

          <SummaryCard
            title="Credit"
            value={data.summary.totalCredit}
            color="red"
          />

          <SummaryCard
            title="Closing Balance"
            value={data.summary.closingBalance}
            color={data.summary.closingBalance >= 0 ? "green" : "red"}
          />
        </div>
      )}

      {/* Ledger Name */}
      {data?.ledger && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">{data.ledger.name}</h2>
        </div>
      )}

      {/* Transactions */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group sticky top-0 bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Voucher</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Cost Center</th>
                <th className="px-4 py-3 text-left">Narration</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {data?.transactions?.length > 0 ? (
                data.transactions.map((row, i) => (
                  <React.Fragment key={i}>
                    {/* Desktop Row */}
                    <tr
                      className="hidden md:table-row border-b hover:bg-gray-50"
                      onClick={() =>
                        navigate(`/erp/${row?.voucherType}/${row.id}`)
                      }
                    >
                      <td className="px-4 py-3">
                        {new Date(row.date).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 font-medium">{row.voucherNo}</td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {row.voucherType}
                        </span>
                      </td>

                      <td className="px-4 py-3">{row.costCenter}</td>

                      <td className="px-4 py-3">{row.narration}</td>

                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {row.debit ? `₹${row.debit.toLocaleString()}` : "-"}
                      </td>

                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {row.credit ? `₹${row.credit.toLocaleString()}` : "-"}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          row.balance >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        ₹{row.balance?.toLocaleString()}
                      </td>
                    </tr>

                    {/* Mobile Card */}
                    <tr className="md:hidden border-b">
                      <td
                        colSpan={8}
                        className="p-3"
                        onClick={() =>
                          navigate(`/erp/${row?.voucherType}/${row.id}`)
                        }
                      >
                        <div className="rounded-lg border bg-white p-3 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{row.voucherNo}</h3>

                              <p className="text-xs text-gray-500">
                                {new Date(row.date).toLocaleDateString()}
                              </p>
                            </div>

                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                              {row.voucherType}
                            </span>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">
                                Cost Center
                              </p>

                              <p className="text-sm font-medium">
                                {row.costCenter || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Narration</p>

                              <p className="text-sm">{row.narration || "-"}</p>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Debit</p>

                              <p className="font-semibold text-green-600">
                                {row.debit
                                  ? `₹${row.debit.toLocaleString()}`
                                  : "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Credit</p>

                              <p className="font-semibold text-red-600">
                                {row.credit
                                  ? `₹${row.credit.toLocaleString()}`
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 border-t pt-2">
                            <p className="text-xs text-gray-500">
                              Running Balance
                            </p>

                            <p
                              className={`font-bold ${
                                row.balance >= 0
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              ₹{row.balance?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerReport;

const SummaryCard = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "text-gray-800",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`mt-2 text-2xl font-bold ${colors[color]}`}>
        ₹{Number(value || 0).toLocaleString()}
      </h2>
    </div>
  );
};
