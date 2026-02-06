import { useEffect, useState } from "react";
import { useNavigate }  from "react-router-dom";
import axios from "axios";
import Modal from "../../components/Modal";
import CreateBusinessUnit from "../../components/CreateBusinessUnit";

const BusinessUnit = () => {
  const [units, setUnits] = useState([]);
  const [createModal, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUnit, setFilteredUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editModal, setEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    const res = await axios.get("/api/v1/business-unit");
    console.log(res.data)
    setUnits(res.data);
    setFilteredUnits(res.data);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = units.filter((u) =>
      u.name.toLowerCase().includes(keyword)
    );
    setFilteredUnits(filtered);
  };

  const editBU = (id) => {
    setEditingId(id);
    setEditModalOpen(true);
  };

  const deleteBU = async (id) => {
    if (!window.confirm("Delete this business unit?")) return;
    await axios.patch(`/api/v1/business-unit/deactivate/${id}`);
    fetchUnits();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Business Units</h2>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by ledger name..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="space-y-3 sm:hidden">
        {units.map((bu) => (
          <div key={bu._id} className="border rounded p-3 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{bu.name}</p>
                <p className="text-sm text-gray-500">
                  {bu.code} • {bu.type}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  bu.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {bu.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-sm mt-2">Manager: {bu.manager?.name || "-"}</p>

            <div className="flex gap-4 mt-3 text-sm">
              <button onClick={() => navigate(`/erp/business_unit/${bu._id}`)} className="text-blue-600">
                View
              </button>
              <button onClick={() => editBU(bu._id)} className="text-green-600">
                Edit
              </button>
            </div>
          </div>
        ))}

        {units.length === 0 && (
          <p className="text-gray-500 text-center">No Business Units created</p>
        )}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Manager</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((bu, index) => (
              <tr key={index}>
                <td className="border p-2">{bu.code}</td>
                <td className="border p-2">{bu.name}</td>
                <td className="border p-2">{bu.type}</td>
                <td className="border p-2">{bu.manager?.name || "-"}</td>
                <td className="border p-2">
                  {bu.isActive ? "Active" : "Inactive"}
                </td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => navigate(`/erp/business_unit/${bu._id}`)}
                    className="text-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => editBU(bu._id)}
                    className="text-green-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Button (Mobile) */}
      <div className="fixed bottom-[70px] right-6 sm:hidden z-[45]">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg text-2xl"
        >
          +
        </button>
      </div>

      {/* Add  Button (Desktop) */}
      <div className="hidden right-6 fixed bottom-[70px] sm:flex justify-end mt-6 z-[45]">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Business Unit
        </button>
      </div>
      <Modal isOpen={createModal} onClose={() => setModalOpen(false)}>
        <CreateBusinessUnit onClose={() => setModalOpen(false)} />
        {/* Create Business Unit Form Component */}
      </Modal>
      <Modal isOpen={editModal} onClose={() => setEditModalOpen(false)}>
        {/* Edit Business Unit Form Component */}
        <CreateBusinessUnit
          onClose={() => setEditModalOpen(false)}
          editId={editingId}
        />
      </Modal>
    </div>
  );
};

export default BusinessUnit;
