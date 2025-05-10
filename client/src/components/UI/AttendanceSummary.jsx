import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import dayjs from 'dayjs'; // for date comparison
axios.defaults.withCredentials = true;
const AttendanceSummary = () => {
  const [present, setPresent] = useState([]);
  const [absent, setAbsent] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get('/api/v1/attendance');
        const currentMonth = dayjs().month(); // 0-indexed
        const currentYear = dayjs().year();

        // Filter current month's attendance
        const currentMonthData = response.data.filter(attendance => {
          const date = dayjs(attendance.date); // assuming attendance has a `date` field
          return date.month() === currentMonth && date.year() === currentYear;
        });


        // Compute present and absent arrays
        setPresent(currentMonthData.filter(a => a.status === 'present'));
        setAbsent(currentMonthData.filter(a => a.status === 'absent'));
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <div className="overflow-x-auto h-full">
      <h2 className="text-xl font-bold mb-4 tracking-wider">Attendance Report 🗓️</h2>

      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="bg-green-100 p-4 rounded-xl text-center shadow">
          <h2 className="text-lg font-semibold">Present</h2>
          <p className="text-2xl text-green-700 font-bold">{present.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl text-center shadow">
          <h2 className="text-lg font-semibold">Absent</h2>
          <p className="text-2xl text-red-700 font-bold">{absent.length}</p>
        </div>
        {/* Add more summary boxes if needed */}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><span className="inline-block w-3 h-3 bg-green-300 mr-2"></span>Present</p>
        <p><span className="inline-block w-3 h-3 bg-red-300 mr-2"></span>Absent</p>
      </div>
    </div>
  );
};

export default AttendanceSummary