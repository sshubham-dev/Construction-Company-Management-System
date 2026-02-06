import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMonthlyPerformanceById,
  lockMonthlyPerformance,
} from "../components/MonthlyPerformance/monthlyPerformance.api";

import Header from "../components/MonthlyPerformance/Header";
import TargetsSection from "../components/MonthlyPerformance/TargetsSection";
import TasksSection from "../components/MonthlyPerformance/TasksSection";
import MetricsSection from "../components/MonthlyPerformance/MetricsSection";
import TrafficLightSection from "../components/MonthlyPerformance/TrafficLightSection";

const MonthlyPerformanceScreen = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getMonthlyPerformanceById(id).then((res) =>
      setData(res.data)
    );
  }, [id]);

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header data={data} onLock={() => lockMonthlyPerformance(id)} />
      <TargetsSection targets={data.targets} />
      <TasksSection tasks={data.tasks} />
      <MetricsSection metrics={data.metrics} />
      <TrafficLightSection result={data.trafficLightResult} />
    </div>
  );
};

export default MonthlyPerformanceScreen;
