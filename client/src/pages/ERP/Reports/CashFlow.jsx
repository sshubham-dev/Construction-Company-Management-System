import { useEffect, useState } from "react";
import ReportLayout from "../Components/ReportLayout";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function CashFlow({ companyId }) {
  const [data, setData] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  useEffect(() => {
    axios.get(`/api/v1/reports/cash-flow?companyId=${user.companyId}`)
      .then((res) => res.data())
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