import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";


export default function TrialBalance({ companyId }) {
  const [data, setData] = useState(null);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const fetchData = async () => {
    
    const res = await axios.get(
      `/api/v1/reports/trial-balance?companyId=${user.companyId}`
    );
    const json = await res.data;
    setData(json);
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Trial Balance</h2>

      {!data.isBalanced && (
        <p style={{ color: "red" }}>
          ⚠ Not Balanced (Check vouchers)
        </p>
      )}

      {data.isBalanced && (
        <p style={{ color: "green" }}>
          ✔ Balanced
        </p>
      )}

      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Ledger</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>

        <tbody>
          {data.data.map((row) => (
            <tr key={row.ledgerId}>
              <td>{row.name}</td>
              <td>₹ {row.debit}</td>
              <td>₹ {row.credit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 font-bold">
        <p>Total Debit: ₹ {data.totalDebit}</p>
        <p>Total Credit: ₹ {data.totalCredit}</p>
      </div>
    </div>
  );
}