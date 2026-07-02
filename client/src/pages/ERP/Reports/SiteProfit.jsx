import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getCurrentMonth } from "../../../helper/dateFormater";
// import SiteProfitFilter from "./SiteProfit/SiteProfitFilter";
import SiteProfitCards from "./SiteProfit/SiteProfitCards";
import SiteProfitTable from "./SiteProfit/SiteProfitTable";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SiteProfitTrend from "./SiteProfit/SiteProfitTrend";
import FinancialFilter from "../../../components/UI/FinancialFilter";

export default function SiteProfit() {
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [siteProfit, setSiteProfit] = useState([]);
  const [siteTrend, setSiteTrend] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    expense: 0,
    profit: 0,
    margin: 0,
    totalSites: 0,
    profitableSites: 0,
    lossMakingSites: 0,
  });
  const [siteProfitLoading, setSiteProfitLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const currentMonth = getCurrentMonth();
  const [filter, setFilter] = useState({
    period: "month",
    fromDate: currentMonth.fromDate,
    toDate: currentMonth.toDate,
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/cost-center", {
        params: {
          companyId: user.companyId,
          type: "SITE",
        },
      });

      setSites(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSiteProfit = async () => {
    try {
      setSiteProfitLoading(true);

      const res = await axios.get("/api/v1/reports/site-profit", {
        params: {
          companyId: user.companyId,
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        },
      });
      console.log(res.data.sites);
      setSummary(res.data.summary);
      setSiteProfit(res.data.sites || []);
      setSiteTrend(res.data.trend || []);
    } catch (err) {
      console.log(err);
    } finally {
      setSiteProfitLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.companyId) return;

    fetchData();
  }, [user?.companyId]);

  useEffect(() => {
    if (!user?.companyId) return;

    fetchSiteProfit();
  }, [user?.companyId, filter.fromDate, filter.toDate, filter.period]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Site Profit & Loss</h1>

          <p className="text-gray-500 mt-1">
            Analyze financial performance of all construction sites.
          </p>
        </div>

        {/* <div className="mt-4 md:mt-0 flex gap-3">
          <button disabled className="bg-gray-200 px-4 py-2 rounded-lg">
            Export Excel
          </button>

          <button disabled className="bg-gray-200 px-4 py-2 rounded-lg">
            Export PDF
          </button>
        </div> */}
      </div>

      {/* Filter */}
      {/* <SiteProfitFilter filter={filter} setFilter={setFilter} onRefresh={fetchSiteProfit} /> */}
      <FinancialFilter
        filter={filter}
        setFilter={setFilter}
        onRefresh={fetchSiteProfit}
      />

      {/* KPI */}
      <SiteProfitCards summary={summary} />

      {/* Charts */}

      <SiteProfitTrend data={siteTrend} loading={siteProfitLoading} />

      {/* Table */}
      <SiteProfitTable data={siteProfit} loading={siteProfitLoading} />
    </div>
  );
}
