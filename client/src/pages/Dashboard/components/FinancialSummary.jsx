import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaWallet,
  FaPiggyBank,
  FaBuildingColumns,
} from "react-icons/fa6";
import FinancialCards from "./FinancialCards";
import { getCurrentMonth } from "../../../helper/dateFormater";
import FinancialFilter from "../../../components/UI/FinancialFilter";
import FinancialTrend from "./FinancialTrend";

export default function FinancialSummary() {
  const currentMonth = getCurrentMonth();
  const { user } = useSelector((state) => state.auth);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    balance: {
      cash: 0,
      bank: 0,
      total: 0,
    },
  });
  const [filter, setFilter] = useState({
    period: "month",
    fromDate: currentMonth.fromDate,
    toDate: currentMonth.toDate,
  });

  /* ======================
      FETCH DATA
   ====================== */
  const fetchFinancialSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/reports/financial-summary", {
        params: {
          companyId: user.companyId,
          fromDate: filter?.fromDate,
          toDate: filter.toDate,
        },
      });
      console.log("res.data:", res.data);
      setFinancialSummary(res.data.summary);
      setTrend(res.data.trend || []);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchFinancialSummary();
    }
  }, [user?.companyId, filter.fromDate, filter.toDate, filter.period]);

  // if(!loading) return;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Monthly Financial Summary</h2>

        <p className="text-sm text-gray-500">
          Current month financial overview
        </p>
      </div>

      <div className="space-y-6">
        <FinancialFilter filter={filter} setFilter={setFilter} />

        <FinancialCards summary={financialSummary} />

        <FinancialTrend data={trend} />
      </div>
    </div>
  );
}
