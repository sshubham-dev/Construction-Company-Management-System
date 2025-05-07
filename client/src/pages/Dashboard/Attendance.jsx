import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import CreateLeave from '../../components/CreateLeave';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../features/notification/notificationSlice';
import { FaCheckCircle } from "react-icons/fa";
import { BsXCircleFill } from "react-icons/bs";
// import { CheckCircle, XCircle } from "react-icons/fa";
axios.defaults.withCredentials = true;

function AttendanceModal({ status, onClose }) {
  if (!status) return null;

  const isPresent = status === "present";
  const icon = isPresent ? <FaCheckCircle className="text-green-500 text-4xl" /> : <BsXCircleFill className="text-red-500 text-4xl" />;
  const message = isPresent
    ? { title: "🎉 Great Job!", text: "You’re Present. Keep it up!" }
    : { title: "😔 Maybe Tomorrow?", text: "You’re Absent. Hope to see you back soon!" };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center transition-opacity duration-300">
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

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month());
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const { user } = useSelector((state) => state.auth);
  const [markAttendance, setMarkAttendance] = useState({
    date: moment().format('YYYY-MM-DD'),
    timeIn: moment().format('HH:mm'),
    status: '',
  });
  const [activeTab, setActiveTab] = useState('attendance'); // State for active tab
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  // Fetch attendance and leave data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceResponse = await axios.get('/api/v1/attendance');
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
        const leaveResponse = await axios.get('/api/v1/leave');
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

    fetchAttendance();
    fetchLeave();
  }, []);

  // useEffect(() => {
  //   if (status) {
  //     const timer = setTimeout(() => setStatus(null), 4000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [status]);


  const handleStatusChange = (e) => {
    setAttendanceStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/attendance', markAttendance);
      // console.log(response.data);
      setStatus(markAttendance.status)
      setAttendanceMarked(true);
      dispatch(fetchNotifications(user._id));
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
    if (!record.date) return false; // Ensure date exists
    const recordDate = moment(record.date);
    return recordDate.year() === Number(year) && recordDate.month() === Number(month);
  });

  const filteredLeaves = leaves.filter(record => {
    if (!record.from) return false; // Ensure from date exists
    const recordDate = moment(record.from);
    return recordDate.year() === Number(year) && recordDate.month() === Number(month);
  });

  const handleReset = () => {
    setMonth(moment().month());  // Reset to the current month
    setYear(moment().year());    // Reset to the current year
  };

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
                    className={`py-2 px-3 rounded-lg font-semibold ${attendanceMarked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white transition duration-300`}
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
                cclassName={`py-2 px-4 font-semibold ${activeTab === 'attendance' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('leave')}
                className={`py-2 px-4 font-semibold ${activeTab === 'leave' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
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
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
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
          {status && (
            <AttendanceModal
              status='present'
              onClose={() => setStatus(null)}
            />
           )}
        </div>
      </section>
    </div>
  );
};

export default Attendance;



