import { useEffect, useState } from "react";
import ReportLayout from "../Components/ReportLayout";

export default function CashFlow({ companyId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/v1/report/cash-flow?companyId=${companyId}`)
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