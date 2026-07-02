import { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiChevronRight, FiX } from "react-icons/fi";
import ProgressBar from "./ProgressBar";
import Section from "./Section";
import { useSelector } from "react-redux";

const EmployeeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [absentStaff, setAbsentStaff] = useState([]);
  const [showAbsentPanel, setShowAbsentPanel] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [user?._id]);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/v1/employee");
      if (Array.isArray(response.data)) {
        const activeEmployee = response.data.filter(
          (emp) => emp.status.toLowerCase() === "active",
        );
        setEmployees(activeEmployee);
      } else {
        console.error("Invalid employee data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch attendance (filtered for today's date)
  const fetchAttendance = async () => {
    try {
      const attendanceResponse = await axios.get("/api/v1/attendance/report");
      const data = attendanceResponse.data;

      if (Array.isArray(data)) {
        const today = new Date().toISOString().split("T")[0];

        // Filter only today's attendance records
        const todayAttendance = data.filter((a) => {
          if (!a.date) return false;
          const recordDate = new Date(a.date).toISOString().split("T")[0];
          return recordDate === today;
        });

        setAttendances(todayAttendance);
      } else {
        console.error("Invalid attendance data:", data);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  // Compare attendance with employee list to find absentees
  useEffect(() => {
    if (employees.length > 0) {
      const presentIds = attendances
        .filter((a) => a.status?.toLowerCase() === "present")
        .map((a) => a.user?.id);
      // console.log(attendances);
      // console.log(employees);

      // Employees who are not marked as present today
      const absent = employees.filter(
        (emp) => !presentIds.includes(emp?.userId),
      );
      setAbsentStaff(absent);
    }
  }, [employees, attendances]);

  // Calculate stats
  const totalStaff = employees.length;
  const presentStaff = attendances.filter(
    (a) => a.status?.toLowerCase() === "present",
  ).length;
  const progress = totalStaff > 0 ? (presentStaff / totalStaff) * 100 : 0;

  return (
    <div>
      {/* Attendance Overview */}
      <Section title="Attendance" className="md:col-span-1 relative">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
            <FiUsers className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Total Staff Present: {presentStaff}
              </span>
              <button
                onClick={() => setShowAbsentPanel(true)}
                className="text-xs text-gray-500 hover:text-blue-600 transition"
              >
                {absentStaff.length} absent
              </button>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>

        <div className="text-xs text-gray-500">Total Staff: {totalStaff}</div>
      </Section>

      {/* Right-side Panel for Absent Staff */}
      {showAbsentPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end z-50">
          <div className="w-80 bg-white dark:bg-gray-900 h-full shadow-lg p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Absent Staff
              </h2>
              <button
                onClick={() => setShowAbsentPanel(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {absentStaff.length > 0 ? (
              <ul className="space-y-3 overflow-y-auto">
                {absentStaff.map((s, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                        {s.name
                          ?.split(" ")
                          .map((x) => x[0])
                          .join("")}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {s.name}
                      </span>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-gray-400" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center mt-10">
                No one is absent today.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
