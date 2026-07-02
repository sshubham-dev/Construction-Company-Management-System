import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

import DashboardFilter from "../Components/DashboardFilter";
import KPICards from "../Components/KPICards";
import DepartmentRevenue from "../Components/DepartmentRevenue";
import TrendChart from "../Components/TrendChart";
import TopCostCenters from "../Components/TopCostCenters";
import TopClients from "../Components/TopClients";
import { getCurrentMonth } from "../../../helper/dateFormater";

export default function CollectionReport() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState(null);

  const [filters, setFilters] = useState(getCurrentMonth);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/collection/dashboard", {
        params: {
          companyId: user.companyId,
          ...filters,
        },
      });

      setDashboard(res.data.data);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters]);

  if (loading)
    return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <DashboardFilter filters={filters} setFilters={setFilters} />

      <KPICards cards={dashboard.cards} />

      <div className="grid gap-6 xl:grid-cols-2">
        <DepartmentRevenue data={dashboard.departmentRevenue} />

        <TrendChart data={dashboard.trend} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopCostCenters data={dashboard.topCostCenters} />

        <TopClients data={dashboard.topClients} />
      </div>
    </div>
  );
}
