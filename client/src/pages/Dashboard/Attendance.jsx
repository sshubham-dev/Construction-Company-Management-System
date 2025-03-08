import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import CreateLeave from '../../components/CreateLeave';
import Header from '../../components/Header';
import Modal from '../../components/Modal';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month());
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [markAttendance, setMarkAttendance] = useState({
    date: moment().format('YYYY-MM-DD'),
    timeIn: moment().format('HH:mm'),
    status: '',
  });
  const [activeTab, setActiveTab] = useState('attendance'); // State for active tab
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  // Fetch attendance and leave data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaveResponse = await axios.get('/api/v1/leave');
        const attendanceResponse = await axios.get('/api/v1/attendance');
        console.log('Attendance:', attendanceResponse.data);
        console.log('Leaves:', leaveResponse.data);

        setAttendances(attendanceResponse.data || []);
        setLeaves(leaveResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Re-fetch data when year or month changes


  const handleStatusChange = (e) => {
    setAttendanceStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/attendance', markAttendance);
      console.log(response.data);
      setAttendanceMarked(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const filteredAttendance = attendances.filter(record => {
    const recordDate = moment(record.date);
    return recordDate.year() === Number(year) && recordDate.month() === Number(month);
  });

  const filteredLeaves = leaves.filter(record => {
    const recordDate = moment(record.from);
    return recordDate.year() === Number(year) && recordDate.month() === Number(month);
  });


  return (
    <div className='p-1'>
      <Header category="Page" title="Attendance Dashboard" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto scrollbar-hide w-full max-w-screen-xl mx-auto'>

          {/* Attendance Marking Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-2 items-center justify-between">
            <form onSubmit={handleSubmit} className="flex gap-4">
              {attendanceMarked !== true && (
                <>
                  <select
                    value={attendanceStatus}
                    onChange={handleStatusChange}
                    className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                  <button
                    onClick={() => setMarkAttendance({ ...markAttendance, status: attendanceStatus })}
                    className={`py-2 px-3 rounded-lg font-semibold ${attendanceMarked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      } text-white transition duration-300`}
                  >
                    Mark Attendance
                  </button>
                </>
              )}
            </form>
            <div className="flex gap-4">
              <button
                onClick={() => setFilterModal(true)}
                className="py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-300"
              >
                Filter
              </button>
              <button
                onClick={() => setLeaveModal(true)}
                className="py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-300"
              >
                Mark Leave
              </button>
            </div>
          </div>

          {/* Filter Modal */}
          {filterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Filter Attendance</h2>
                <div className="space-y-4">
                  <select
                    value={year}
                    onChange={handleYearChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value={moment().year()}>Current Year</option>
                    <option value={moment().year() - 1}>Previous Year</option>
                    <option value={moment().year() + 1}>Next Year</option>
                  </select>
                  <select
                    value={month}
                    onChange={handleMonthChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value={moment().month()}>Current Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {moment().month(i).format('MMMM')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() => setFilterModal(false)}
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
                    <th className="p-3 text-left text-white font-semibold">Date</th>
                    <th className="p-3 text-left text-white font-semibold">Time</th>
                    <th className="p-3 text-left text-white font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className='bg-gradient-to-br from-blue-50 to-purple-50'>
                  {filteredAttendance.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
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

          {/* Leave Modal */}
          <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} head='Create Leave'>
            <CreateLeave onClose={() => setLeaveModal(false)} />
          </Modal>
          <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Create Leave'>
            <CreateLeave onClose={() => setEditModal(false)} isEdit={editId} />
          </Modal>
        </div>
      </section>
    </div>
  );
};

export default Attendance;