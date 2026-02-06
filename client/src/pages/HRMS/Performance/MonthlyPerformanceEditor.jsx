import { useState } from "react";
import Header from "./Header";
import TargetSection from "./TargetSection";
import TaskChecklist from "./TaskChecklist";
import MetricsSection from "./MetricsSection";
import TrafficLightSection from "./TrafficLightSection";
import BonusSummary from "./BonusSummary";

const MonthlyPerformanceEditor = () => {
  const [locked, setLocked] = useState(false);

  const [performance, setPerformance] = useState({
    employee: "Rahul Singh",
    role: "Site Supervisor",
    month: "2025-01",

    targets: {
      siteWorks: [
        {
          name: "Plinth Work",
          deadline: "2025-01-15",
          status: "COMPLETED",
          bonus: 500,
        },
        {
          name: "Slab Casting",
          deadline: "2025-01-25",
          status: "PENDING",
          bonus: 0,
        },
      ],
      revenue: {
        target: 30000,
        achieved: 42000,
        bonus: 4200,
        status: "ACHIEVED",
      },
    },

    tasks: [
      {
        name: "Attendance",
        expected: 26,
        completed: 24,
        enabled: true,
      },
      {
        name: "Bill Submission",
        expected: 4,
        completed: 3,
        enabled: true,
      },
    ],

    metrics: {
      expected: 30,
      completed: 27,
      percentage: 90,
    },

    traffic: {
      color: "GREEN",
      bonus: 2000,
    },
  });

  return (
    <div className="space-y-6">
      <Header
        employee={performance.employee}
        role={performance.role}
        month={performance.month}
        locked={locked}
        onLock={() => setLocked(true)}
      />

      <TargetSection targets={performance.targets} />

      <TaskChecklist
        tasks={performance.tasks}
        locked={locked}
        onChange={(tasks) =>
          setPerformance({ ...performance, tasks })
        }
      />

      <MetricsSection metrics={performance.metrics} />

      <TrafficLightSection traffic={performance.traffic} />

      <BonusSummary
        targetBonus={performance.targets.revenue.bonus}
        trafficBonus={performance.traffic.bonus}
      />
    </div>
  );
};

export default MonthlyPerformanceEditor;
