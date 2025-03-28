import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import CreateLeave from '../../components/CreateLeave';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
axios.defaults.withCredentials = true;

const AttendanceReport = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployee] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [filterModal, setFilterModal] = useState(false);
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month());
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [selectedName, setSelectedName] = useState(""); // Track selected name

  const [activeTab, setActiveTab] = useState('attendance'); // State for active tab
  // Fetch attendance and leave data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get('/api/v1/employee');
        setEmployee(response.data)
      } catch (error) {
        console.log(error)
      }
    };
    const fetchAttendance = async () => {
      try {
        const attendanceResponse = await axios.get('/api/v1/attendance/report');
        console.log('Attendance Response:', attendanceResponse.data);
        if (Array.isArray(attendanceResponse.data)) {
          setAttendances(attendanceResponse.data);
        } else {
          console.error('Invalid attendance data:', attendanceResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchLeave = async () => {
      try {
        const leaveResponse = await axios.get('/api/v1/leave/report');
        console.log('Leaves Response:', leaveResponse.data);

        if (Array.isArray(leaveResponse.data)) {
          setLeaves(leaveResponse.data);
        } else {
          console.error('Invalid leave data:', leaveResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEmployee()
    fetchAttendance();
    fetchLeave();
  }, []);


  const handleStatusChange = (e) => {
    setAttendanceStatus(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleNameChange = (e) => {
    setSelectedName(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const filteredAttendance = attendances.filter(record => {
    if (!record.date) return false;
    const recordDate = moment(record.date);
    return (
      recordDate.year() === Number(year) &&
      recordDate.month() === Number(month) &&
      (selectedName ? record?.user?.name === selectedName : true) // Apply name filter
    );
  });

  const filteredLeaves = leaves.filter(record => {
    if (!record.from) return false;
    const recordDate = moment(record.from);
    return (
      recordDate.year() === Number(year) &&
      recordDate.month() === Number(month) &&
      (selectedName ? record?.user?.name === selectedName : true) // Apply name filter
    );
  });

  const handleReset = () => {
    setMonth(moment().month());  // Reset to the current month
    setYear(moment().year());    // Reset to the current year
    setSelectedName("");         // Reset selected name
  };

  return (
    <div className='p-1'>
      <Header category="Page" title="Employee Attendance Report" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto scrollbar-hide w-full max-w-screen-xl mx-auto'>

          {/* Attendance Marking Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-end">
            <button
              onClick={() => setFilterModal(true)}
              className="py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-300"
            >
              Filter
            </button>
          </div>

          {/* Filter Modal */}
          {filterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Filter Attendance</h2>
                <div className="space-y-4">

                  <select
                    value={selectedName}
                    onChange={handleNameChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value=''>All Employee</option>
                    {employees.map((employee, index) => (
                      <option key={index} value={employee._id}>{employee.name}</option>
                    ))}
                  </select>

                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {moment().month(i).format("MMMM")}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min="2000"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  />

                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => { handleReset(); setFilterModal(false) }}
                    className="p-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setFilterModal(false)}
                    className="p-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs for Attendance and Leave */}
          <div className="mb-4">
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-2 px-4 font-semibold ${activeTab === 'attendance'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
                  }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('leave')}
                className={`py-2 px-4 font-semibold ${activeTab === 'leave'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
                  }`}
              >
                Leave
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          {activeTab === 'attendance' && (
            <div className="overflow-x-auto scrollbar-hide rounded-xl">
              <table className="w-full overflow-x-auto scrollbar-hide">
                <thead className="bg-gradient-to-r from-blue-400 to-purple-400">
                  <tr>
                    <th className="p-3 text-left text-white font-semibold">Name</th>
                    <th className="p-3 text-left text-white font-semibold">Date</th>
                    <th className="p-3 text-left text-white font-semibold">Time</th>
                    <th className="p-3 text-left text-white font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className='bg-gradient-to-br from-blue-50 to-purple-50'>
                  {filteredAttendance.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="p-3 text-gray-700">{record?.user.name}</td>
                      <td className="p-3 text-gray-700">{moment(record.date).format('DD MMM YYYY')}</td>
                      <td className="p-3 text-gray-700">{record.timeIn || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${record.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leave Table */}
          {activeTab === 'leave' && (
            <div className="overflow-x-auto scrollbar-hide rounded-xl">
              <table className="w-full overflow-x-auto scrollbar-hide">
                <thead className="bg-gradient-to-r from-blue-400 to-purple-400">
                  <tr>
                    <th className="p-3 text-left text-white font-semibold">Name</th>
                    <th className="p-3 text-left text-white font-semibold">From</th>
                    <th className="p-3 text-left text-white font-semibold">Reporting Date</th>
                    <th className="p-3 text-left text-white font-semibold">Reason</th>
                    <th className="p-3 text-left text-white font-semibold">Approval</th>
                    <th className="p-3 text-left text-white font-semibold">Reported At</th>
                  </tr>
                </thead>
                <tbody className='bg-gradient-to-br from-blue-50 to-purple-50'>
                  {filteredLeaves.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="p-3 text-gray-700">{record?.user.name}</td>
                      <td className="p-3 text-gray-700">{moment(record.from).format('DD MMM YYYY')}</td>
                      <td className="p-3 text-gray-700">{moment(record.reportingDate).format('DD MMM YYYY')}</td>
                      <td className="p-3 text-gray-700">{record.reason || 'N/A'}</td>
                      <td className="p-3 text-gray-700">{record.approval || 'N/A'}</td>
                      <td className="p-3 text-gray-700">{moment(record.reportedAt).format('DD MMM YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default AttendanceReport;