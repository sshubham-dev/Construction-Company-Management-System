import { useState } from "react";

const LedgerView = () => {
  const [ledgerId, setLedgerId] = useState("");
  const [data, setData] = useState([]);

  const fetchLedger = async () => {
    const res = await fetch(
      `/api/report/ledger/${ledgerId}?companyId=123`
    );
    const json = await res.json();
    setData(json);
  };

  return (
    <div>
      <input
        placeholder="Ledger ID"
        onChange={(e) => setLedgerId(e.target.value)}
      />

      <button onClick={fetchLedger}>Load</button>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Voucher</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>{row.voucherNo}</td>
              <td>{row.debit}</td>
              <td>{row.credit}</td>
              <td>{row.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LedgerView;