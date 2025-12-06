import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/Modal";
import CreateLabourAttendance from "../components/CreateLabourAttendance";

const LabourAttendanceScreen = () => {
  const [attendances, setAttendances] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null)

  // Fetch attendance + contractors
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [attRes, contRes] = await Promise.all([
        axios.get("/api/v1/labour-attendance"),
        axios.get("/api/v1/contractor"),
      ]);
      setAttendances(attRes.data || []);
      setFiltered(attRes.data || []);
      setContractors(contRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle filters
  useEffect(() => {
    let data = [...attendances];

    if (search) {
      data = data.filter(
        (item) =>
          item.site?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.contractor?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterContractor) {
      data = data.filter((item) => item.contractor === filterContractor);
    }

    if (filterDate) {
      data = data.filter(
        (item) => moment(item.date).format("YYYY-MM-DD") === filterDate
      );
    }

    setFiltered(data);
  }, [search, filterContractor, filterDate, attendances]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/api/v1/labour-attendance/${id}`);
      toast.success("Deleted successfully");
      fetchAll();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };
  
  const handleEdit = async(id)=>{
    setEditId(id);
    setEditModal(true)
  }

  return (
    <div className="p-2 max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Labour Attendance
        </h2>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6 flex flex-col md:flex-row md:items-center md:justify-between md:space-y-0 gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 border rounded-lg px-3 bg-white w-full">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            placeholder="Search by site or contractor..."
            className="w-full py-2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

          {/* Contractor Filter */}
          <select
            value={filterContractor}
            onChange={(e) => setFilterContractor(e.target.value)}
            className="border rounded-lg p-2 w-full bg-white"
          >
            <option value="">All Contractors</option>
            <option value="Supply Labour">Supply Labour</option>
            {contractors.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded-lg p-2 w-full bg-white"
          />
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Site</th>
              <th className="text-left p-3">Contractor</th>
              <th className="text-center p-3">Skilled (M/F)</th>
              <th className="text-center p-3">Unskilled (M/F)</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((att) => (
                <tr key={att._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {moment(att.date).format("DD MMM YYYY")}
                  </td>
                  <td className="p-3">{att.site?.name}</td>
                  <td className="p-3">{att.contractor}</td>
                  <td className="text-center p-3">
                    {att.skilledMale}/{att.skilledFemale}
                  </td>
                  <td className="text-center p-3">
                    {att.unskilledMale}/{att.unskilledFemale}
                  </td>
                  <td className="text-center p-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(att._id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(att._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 pb-20">
        {" "}
        {/* extra bottom space for Add button */}
        {filtered.length > 0 ? (
          filtered.map((att) => (
            <div
              key={att._id}
              className="bg-white rounded-xl shadow p-4 border flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-base leading-tight">
                  {att.site?.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {moment(att.date).format("DD MMM YYYY")}
                </span>
              </div>

              <div className="text-sm text-gray-700">
                <span className="font-medium">Contractor:</span>{" "}
                {att.contractor?.name}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded-lg flex flex-col text-center">
                  <span className="text-gray-500 text-xs">Skilled (M/F)</span>
                  <span className="font-semibold text-gray-800">
                    {att.skilledMale}/{att.skilledFemale}
                  </span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg flex flex-col text-center">
                  <span className="text-gray-500 text-xs">Unskilled (M/F)</span>
                  <span className="font-semibold text-gray-800">
                    {att.unskilledMale}/{att.unskilledFemale}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-4 text-sm">
                <button
                  onClick={() =>
                    (window.location.href = `/attendance/edit/${att._id}`)
                  }
                  className="flex items-center gap-1 text-blue-600"
                >
                  <FiEdit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(att._id)}
                  className="flex items-center gap-1 text-red-600"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No attendance records found
          </p>
        )}
      </div>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={() => setShowModal(true)}
        className=" fixed bottom-16 mb-2 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center"
      >
        <FiPlus size={22} />
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        head="Add Labour Attendance"
      >
        <CreateLabourAttendance onClose={() => setShowModal(false)} />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Add Labour Attendance"
      >
        <CreateLabourAttendance onClose={() => setEditModal(false)} id={editId} />
      </Modal>
    </div>
  );
};

export default LabourAttendanceScreen;
