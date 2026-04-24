import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function ProfitLoss({ companyId }) {
  const [data, setData] = useState(null);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const fetchData = async () => {
    console.log("fetching profit loss with: ", {
      companyId,
    });
    const res = await axios.get(
      `/api/v1/reports/pnl?companyId=${user?.companyId}`
    );
    // const json = await res.json();
    console.log("profit loss: ", res.data);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Profit & Loss</h2>

      <div className="grid grid-cols-2 gap-6 mt-4">

        {/* INCOME */}
        <div>
          <h3 className="font-semibold text-green-600">Income</h3>
          {data.income.map((i, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{i.name}</span>
              <span>₹ {i.amount}</span>
            </div>
          ))}
          <b>Total: ₹ {data.totalIncome}</b>
        </div>

        {/* EXPENSE */}
        <div>
          <h3 className="font-semibold text-red-600">Expenses</h3>
          {data.expenses.map((e, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{e.name}</span>
              <span>₹ {e.amount}</span>
            </div>
          ))}
          <b>Total: ₹ {data.totalExpense}</b>
        </div>
      </div>

      <div className="mt-4 text-lg font-bold">
        Profit:{" "}
        <span style={{ color: data.profit >= 0 ? "green" : "red" }}>
          ₹ {data.profit}
        </span>
      </div>
    </div>
  );
}