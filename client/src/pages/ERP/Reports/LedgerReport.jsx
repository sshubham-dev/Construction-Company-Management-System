import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

const LedgerReport = () => {
  const [ledgers, setLedgers] = useState([]);
  const [ledgerId, setLedgerId] = useState("");
  const [company, setCompany] = useState("");
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    const res = await axios.get("/api/v1/ledger", {
      params: { companyId: user.companyId },
    });
    console.log("ledger found: ", res.data);
    setLedgers(res.data || []);
  };

  useEffect(() => {
    fetchReport();
  }, [ledgerId, fromDate, toDate]);
  const fetchReport = async () => {
    if (!ledgerId) return;
    console.log("fetching report with: ", {
      ledgerId,
      fromDate,
      toDate,
    });

    const res = await axios.get("/api/v1/reports/ledger", {
      params: {
        ledgerId,
        companyId: user.companyId,
        fromDate,
        toDate,
      },
    });
    console.log("ledger report: ", res.data);
    setData(res.data || []);
  };

  const ledgerOptions = ledgers.map((l) => ({
    value: l._id,
    label: l.name,
  }));

  return (
    <div className="p-4 space-y-4">
      {/* FILTER */}
      <Select
        options={ledgerOptions}
        onChange={(e) => setLedgerId(e?.value)}
        placeholder="Select Ledger"
      />

      <div className="flex gap-2">
        <input
          type="date"
          onChange={(e) => setFromDate(e.target.value)}
          className="input"
        />
        <input
          type="date"
          onChange={(e) => setToDate(e.target.value)}
          className="input"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th>Date</th>
              <th>Voucher</th>
              <th>Type</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b">
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{row.voucherNo}</td>
                <td>{row.type}</td>
                <td>{row.debit}</td>
                <td>{row.credit}</td>
                <td>{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerReport;
