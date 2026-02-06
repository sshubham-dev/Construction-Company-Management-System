import { useState } from "react";
import MonthlyPerformance from "./MonthlyPerformance";
import TaskTemplate from "./Performance/TaskTemplate";
import TrafficLightRuleForm from "./Performance/TrafficLightRuleForm";


export default function TrafficLight() {
  const [page, setPage] = useState("tasks");

  return (
    <div className="overflow-x-auto">
      <nav className="px-4 py-3 flex gap-5">
        <button className="border-b-2 border-b-blue-300" onClick={() => setPage("dashboard")}>Dashboard</button>
        {/* <button onClick={() => setPage("mytask")}>My Task</button> */}
        <button className="border-b-2 border-b-blue-300" onClick={() => setPage("monthly")}>Monthly</button>
        {/* <button onClick={() => setPage("tasks")}>Tasks</button> */}
        <button onClick={() => setPage("template")}>Template</button>
        <button onClick={() => setPage("setup")}>Task</button>
        <button onClick={() => setPage("rule")}>Rule</button>
      </nav>

<div>
      {page === "setup" && <TaskTemplate />}
      {/* {page === "tasks" && <AssignTrafficLight />} */}
      {/* {page === "mytask" && <MyTasksPage />} */}
      {/* {page === "monthly" && <TaskLogTable/>} */}
      {page === "rule" && <TrafficLightRuleForm/>}
      {page === "monthly" && <MonthlyPerformance />}
      {/* {page === "template" && <TrafficTemplate />} */}
</div>
    </div>
  );
}
