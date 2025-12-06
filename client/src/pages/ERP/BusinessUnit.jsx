import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import CreateBusinessUnit from "../../components/CreateBusinessUnit";

const BusinessUnit = () => {
  const [units, setUnits] = useState([]);
  const [createModal, setModalOpen] = useState(false);
  const [editModal, setEditModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUnit, setFilteredUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    const res = await axios.get("/api/v1/business-unit");
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
    await axios.delete(`/api/v1/business-unit/${id}`);
    fetchUnits();
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Business Units</h1>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by ledger name..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2">Name</th>
            <th>Type</th>
            <th>Code</th>
            <th>Status</th>
            <th>Manager</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredUnit.map((u) => (
            <tr key={u._id} className="border-b">
              <td className="p-2">{u.name}</td>
              <td>{u.type}</td>
              <td>{u.code}</td>
              <td>{u.isActive ? "Active" : "Inactive"}</td>
              <td>{u.manager?.name || "-"}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => editBU(u._id)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBU(u._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Floating Button (Mobile) */}
      <div className="fixed bottom-[70px] right-6 sm:hidden z-[45]">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full shadow-lg text-2xl"
        >
          +
        </button>
      </div>

      {/* Add Expense Button (Desktop) */}
      <div className="hidden right-6 fixed bottom-[70px] sm:flex justify-end mt-6 z-[45]">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Ledger
        </button>
      </div>
      <Modal isOpen={createModal} onClose={() => setModalOpen(false)}>
        <CreateBusinessUnit onClose={()=>setModalOpen(false)} />
        {/* Create Business Unit Form Component */}
      </Modal>
      <Modal isOpen={editModal} onClose={() => setEditModalOpen(false)}>
        {/* Edit Business Unit Form Component */}
        <CreateBusinessUnit onClose={()=>setModalOpen(false)} editId={editingId} />
      </Modal>
    </div>
  );
};

export default BusinessUnit;
