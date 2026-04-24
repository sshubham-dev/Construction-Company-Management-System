import { useEffect, useState } from "react";
import ReportLayout from "../Components/ReportLayout";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

export default function SiteProfit({ companyId }) {
  const [data, setData] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  useEffect(() => {
    axios.get(`/api/v1/reports/site-profit?companyId=${user.companyId}`)
      .then((res) => res.data())
      .then(setData);
  }, []);

  return (
    <ReportLayout title="Site Profit">
      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>Revenue</th>
            <th>Expense</th>
            <th>Profit</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s) => (
            <tr key={s.siteId}>
              <td>{s.name}</td>
              <td>{s.revenue}</td>
              <td>{s.expense}</td>
              <td>{s.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportLayout>
  );
}