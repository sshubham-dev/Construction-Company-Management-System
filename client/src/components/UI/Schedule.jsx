import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import moment from "moment";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ListChecks,
} from "lucide-react";

axios.defaults.withCredentials = true;

export default function Schedule() {
  const { user } = useSelector((state) => state.auth);
  const [showProject, setShowProject] = useState(false);
  const [showQuality, setShowQuality] = useState(false);

  const [projectSchedule, setProjectSchedule] = useState([]);
  const [qualitySchedule, setQualitySchedule] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const projectRes = await axios.get(`/api/v1/project-schedule/monthly`);
        setProjectSchedule(projectRes.data);
        // console.log("Project Schedule:", projectRes.data);

        const qualityRes = await axios.get(`/api/v1/quality-schedule/monthly`);
        setQualitySchedule(qualityRes.data);
        // console.log('Quality:', qualityRes.data)
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };

    fetchSchedules();
  }, []);

  // 🔹 Compute Summaries
  const calculateSummary = (data, dateKey) => {
    const today = moment();
    let missed = 0,
      upcoming = 0,
      pending = 0;

    data.forEach((task) => {
      const date = moment(task[dateKey]);
      if (date.isBefore(today, "day")) {
        missed++;
      } else if (date.isSame(today, "day") || date.isAfter(today, "day")) {
        upcoming++;
      }
      if (task.status !== "Green") {
        pending++;
      }
    });

    return { missed, upcoming, pending };
  };

  const projectSummary = calculateSummary(projectSchedule, "planned");
  const qualitySummary = calculateSummary(qualitySchedule, "checkingDate");

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="text-green-600" size={16} />;
      case "Partially Completed":
        return <CheckCircle className="text-green-300" size={16} />;
      case "Started":
        return <AlertTriangle className="text-yellow-600" size={16} />;
      case "Pending":
        return <XCircle className="text-red-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔹 For Site Incharge / Supervisor → Show Project Schedule */}
      {(user?.department === "Site Incharge" ||
        user?.department === "Site Supervisor") && (
        <ScheduleCard
          title="Project Schedule"
          data={projectSchedule}
          type="project"
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* 🔹 For Quality Engineer → Show Quality Schedule */}
      {user?.department === "Quality Engineer" && (
        <ScheduleCard
          title="Quality Schedule"
          data={qualitySchedule}
          type="quality"
          getStatusIcon={getStatusIcon}
        />
      )}

      {/* 🔹 For CEO/Admin/Account Head → Show Both */}
      {["Ceo", "Admin", "Account Head", "Marketing"].includes(
        user?.department
      ) && (
        <div className="space-y-3">
          {/* Project Summary */}
          <div
            className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-white/80 transition"
            onClick={() => setShowProject(true)}
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">Project Schedule</p>
              <ListChecks size={20} className="text-indigo-500" />
            </div>
            <p className="text-md font-bold mt-1">
              {projectSummary.missed} Missed • {projectSummary.upcoming}{" "}
              Upcoming • {projectSummary.pending} Pending
            </p>
          </div>

          {/* Quality Summary */}
          <div
            className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-white/80 transition"
            onClick={() => setShowQuality(true)}
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">Quality Schedule</p>
              <ListChecks size={20} className="text-purple-500" />
            </div>
            <p className="text-md font-bold mt-1">
              {qualitySummary.missed} Missed • {qualitySummary.upcoming}{" "}
              Upcoming • {qualitySummary.pending} Pending
            </p>
          </div>
        </div>
      )}

      {/* 🔹 For Account Head/Marketing → Show Both */}

      {showProject && (
        <SidePanel
          title="Project Schedule"
          type="project"
          onClose={() => setShowProject(false)}
          data={projectSchedule}
          getStatusIcon={getStatusIcon}
        />
      )}

      {showQuality && (
        <SidePanel
          title="Quality Schedule"
          type="quality"
          onClose={() => setShowQuality(false)}
          data={qualitySchedule}
          getStatusIcon={getStatusIcon}
        />
      )}
    </div>
  );
}

// 🔹 Reusable Card Component
function ScheduleCard({ title, data, type, getStatusIcon }) {
  return (
    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
      <h2 className="font-bold text-lg mb-4 text-gray-700">{title}</h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No schedules this month.</p>
      ) : (
        data.map((task, i) => (
          <div
            key={i}
            className="flex items-start gap-3 mb-3 pb-2 border-b last:border-none"
          >
            {getStatusIcon(task.status)}
            <div>
              <div className="font-medium text-sm text-gray-900">
                {task.work || task.workDetail}
              </div>
              <div className="text-xs text-gray-700">
                Site: {task.site?.name}
              </div>
              <div className="text-xs text-gray-500">
                {type === "project" && (
                  <>
                    {(() => {
                      const lastReplanDate = Array.isArray(task?.rePlannedDates)
                        ? task.rePlannedDates.at(-1)?.date
                        : null;
                      const plannedDate = lastReplanDate || task?.planned;
                      return plannedDate ? (
                        <>
                          <span>
                            Planned Date:{" "}
                            {moment(plannedDate).format("DD-MM-YYYY")}
                          </span>
                          {task.actual && (
                            <>
                              <span>
                                Completed At:{" "}
                                {moment(task?.actual).format("DD-MM-YYYY")}
                              </span>
                            </>
                          )}
                        </>
                      ) : null;
                    })()}
                  </>
                )}

                {type === "quality" && task.checkingDate && (
                  <>
                    <span>
                      Checking: {moment(task.checkingDate).format("DD-MM-YYYY")}
                    </span>
                    {task.checkedAt && (
                      <>
                        <span>
                          Checked At:{" "}
                          {moment(task.checkedAt).format("DD-MM-YYYY")}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// 🔹 Reusable Side Panel
function SidePanel({ title, onClose, data, getStatusIcon, type }) {
  return (
    <div>
      <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
        <div className="bg-white w-80 h-full p-4 overflow-y-auto shadow-lg">
          <h2 className="font-semibold text-lg mb-4">{title}</h2>
          {data.map((task, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-gray-50 mb-2 flex justify-between items-center"
            >
              <div>
                <span className="font-bold text-sm text-gray-900">
                  {task.work || task.workDetail}
                </span>
                <div className="text-xs text-gray-700">
                  Site: {task.site?.name}
                </div>
                <div className="text-xs text-gray-500 flex flex-col">
                  {type === "project" && (
                    <>
                      {(() => {
                        const lastReplanDate = Array.isArray(
                          task?.rePlannedDates
                        )
                          ? task.rePlannedDates.at(-1)?.date
                          : null;
                        const plannedDate = lastReplanDate || task?.planned;
                        return plannedDate ? (
                          <>
                            <span>
                              Planned Date:{" "}
                              {moment(plannedDate).format("DD-MM-YYYY")}
                            </span>
                            {task.actual && (
                              <>
                                <span>
                                  Completed At:{" "}
                                  {moment(task?.actual).format("DD-MM-YYYY")}
                                </span>
                              </>
                            )}
                          </>
                        ) : null;
                      })()}
                    </>
                  )}
                  {type === "quality" && task.checkingDate && (
                    <>
                      <span>
                        Checking:{" "}
                        {moment(task.checkingDate).format("DD-MM-YYYY")}
                      </span>
                      {task.checkedAt && (
                        <>
                          <span>
                            Checked At:{" "}
                            {moment(task.checkedAt).format("DD-MM-YYYY")}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              {getStatusIcon(task.status)}
            </div>
          ))}
          <button
            onClick={onClose}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
