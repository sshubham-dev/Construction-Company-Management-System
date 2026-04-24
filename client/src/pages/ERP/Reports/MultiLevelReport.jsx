import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function MultiLevelReport() {
  const [data, setData] = useState({});
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  useEffect(() => {
    axios.get(`/api/v1/reports/multi?companyId=${user.companyId}`)
      .then((res) => res.data())
      .then(setData);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Branch + Site Report</h2>

      {Object.entries(data).map(([buId, sites]) => (
        <div key={buId} style={{ marginBottom: 20 }}>
          <h3>Business Unit: {buId}</h3>

          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Site</th>
                <th>Revenue</th>
                <th>Expense</th>
                <th>Profit</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(sites).map(([ccId, val]) => (
                <tr key={ccId}>
                  <td>{ccId}</td>
                  <td>{val.revenue}</td>
                  <td>{val.expense}</td>
                  <td>{val.revenue - val.expense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}