import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import moment from "moment";
import CreateLeave from "../../components/CreateLeave";
import Modal from "../../components/Modal";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import { FaCheckCircle } from "react-icons/fa";
import { BsXCircleFill } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
axios.defaults.withCredentials = true;

function AttendanceModal({ onClose, status }) {
  const icon =
    status === "present" ? (
      <FaCheckCircle className="text-green-500 text-5xl" />
    ) : (
      <BsXCircleFill className="text-red-500 text-5xl" />
    );

  const message =
    status === "present"
      ? { title: "🎉 Great Job!", text: "You’re Present. Keep it up!" }
      : {
          title: "🤭 Oops!",
          text: "You’ve Already marked the attendance!",
        };

  return (
    <div className="fixed top-[32px] inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
        <p className="text-gray-600 text-md mb-4">{message.text}</p>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}


export default function Attendance() {
  // const [onLeave, setOnLeave] = useState(false);
  const [present, setPresent] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [markAttendance, setMarkAttendance] = useState({
    date: moment().format("YYYY-MM-DD"),
    timeIn: moment().format("HH:mm"),
    status: "",
  });
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchPresent();
  }, []);

  const fetchPresent = async () => {
    try {
      const attendanceResponse = await axios.get("/api/v1/attendance");
      const data = attendanceResponse.data;

      if (Array.isArray(data)) {
        const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
        const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");

        const monthlyPresent = data.filter(
          (a) =>
            a.status.toLowerCase() === "present" &&
            dayjs(a.date).isBetween(startOfMonth, endOfMonth, null, "[]")
        );

        setPresent(monthlyPresent);
        console.log("This Month's Present Records:", monthlyPresent);
      } else {
        console.error("Invalid attendance data:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/v1/attendance", markAttendance);
      // console.log(response.data);
      setStatus(markAttendance.status.toLowerCase());
      setAttendanceMarked(true);
      fetchPresent();
      dispatch(fetchNotifications(user._id));
    } catch (error) {
      setStatus("Marked")
      AttendanceModal({ status: "Marked", onClose: () => setStatus(null) });
      console.error(error);
    }
  };

  const getProgressBarStyle = (progress) => ({
    width: `${progress}%`,
    backgroundColor:
      progress < 50 ? "red" : progress < 80 ? "yellow" : "limegreen",
  });

  const isAfter4PM = dayjs().hour() >= 16;

const workingDaysInMonth = (weeklyOffDay = 0, extraHolidays = []) => {
  const year = moment().year();
  const month = moment().month(); // 0-based
  const totalDays = moment({ year, month }).daysInMonth();

  // Define fixed national holidays (same every year)
  const fixedHolidays = [
    moment(`${year}-01-01`), // New Year
    moment(`${year}-01-26`), // Republic Day
    moment(`${year}-08-15`), // Independence Day
    moment(`${year}-10-02`), // Gandhi Jayanti
  ];

  // Merge extraHolidays (festivals) + fixed ones
  const holidays = [...fixedHolidays, ...extraHolidays];

  let workingDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = moment({ year, month, day });

    // Skip if it's the weekly off
    if (currentDate.day() === weeklyOffDay) continue;

    // Skip if it's in holidays list
    if (holidays.some(holiday => currentDate.isSame(holiday, "day"))) continue;

    workingDays++;
  }

  return workingDays;
};

// ✅ Example usage:
console.log("Working days (excluding Sunday):", workingDaysInMonth(0));
console.log("Working days (excluding Tuesday):", workingDaysInMonth(2));

return (
    <>
      {/* Attendance Card */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-2xl shadow-lg">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          Monthly Attendance
        </p>
        <p className="text-2xl font-bold">
          {present?.length}/{workingDaysInMonth()}
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={getProgressBarStyle((present?.length / workingDaysInMonth()) * 100)}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Attendance for the month. {present?.length} days attended out of {workingDaysInMonth()}.
        </div>

        {/* Buttons */}
        <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
          <button
            onClick={() =>
              setMarkAttendance({ ...markAttendance, status: "Present" })
            }
            disabled={attendanceMarked || isAfter4PM}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition 
              ${attendanceMarked || isAfter4PM
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow"}`}
          >
            {attendanceMarked ? "Marked ✔" : "Mark Attendance"}
          </button>

          <button
          type="button"
            onClick={() => setLeaveModal(true)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white shadow"
          >
            Leave 🏖
          </button>
        </form>
      </div>

      {/* ✅ Render modals outside */}
      {status && (
        <AttendanceModal status={status} onClose={() => setStatus(null)} />
      )}
      <Modal
        isOpen={leaveModal}
        onClose={() => setLeaveModal(false)}
        head="Create Leave"
      >
        <CreateLeave onClose={() => setLeaveModal(false)} />
      </Modal>
    </>
  );

}
