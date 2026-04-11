import { useEffect, useState } from "react";
import ReportLayout from "../Components/ReportLayout";
import { useDispatch, useSelector } from "react-redux";

export default function CashFlow({ companyId }) {
  const [data, setData] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  useEffect(() => {
    fetch(`/api/v1/report/cash-flow?companyId=${user.companyId}`)
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <ReportLayout title="Cash Flow">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Inflow</th>
            <th>Outflow</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.inflow}</td>
              <td>{r.outflow}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportLayout>
  );
}