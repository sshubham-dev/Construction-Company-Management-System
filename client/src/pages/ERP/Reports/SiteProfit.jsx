import { useEffect, useState } from "react";
import ReportLayout from "../Components/ReportLayout";

export default function SiteProfit({ companyId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/v1/report/site-profit?companyId=${companyId}`)
      .then((r) => r.json())
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