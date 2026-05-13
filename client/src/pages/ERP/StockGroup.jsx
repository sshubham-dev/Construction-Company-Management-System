import { useEffect, useState } from "react";
import axios from "axios";
import CreateStockGroup from "./Components/CreateStockGroup";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";

const StockGroup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================
     FETCH DATA
  ========================== */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/stock-group");
      setData(res.data.data);
    } catch {
      // toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FILTERED DATA
  ========================== */
  const filtered = data.filter((g) => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      status === "ALL" ? true : status === "ACTIVE" ? g.isActive : !g.isActive;

    return matchSearch && matchStatus;
  });

  /* =========================
     TOGGLE STATUS
  ========================== */
  const toggleStatus = async (id, isActive) => {
    try {
      await axios.put(`/api/v1/stock/group/${id}`, {
        isActive: !isActive,
      });

      toast.success("Status updated");
      fetchData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* =========================
     OPEN EDIT
  ========================== */
  const handleEdit = (id) => {
    setEditId(id);
    setOpenDrawer(true);
  };

  const handleCreate = () => {
    setEditId(null);
    setOpenDrawer(true);
  };

  const handleClose = () => {
    setOpenDrawer(false);
    fetchData();
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Stock Groups</h2>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create Group
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <input
          placeholder="Search group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Code</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  No data
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g._id} className="border-t">
                  <td className="p-2">{g.name}</td>
                  <td className="p-2">{g.code || "-"}</td>

                  <td className="p-2">{g.isConsumable ? "Consumable" : "Assets"}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        g.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {g.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(g._id)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(g._id, g.isActive)}
                      className="text-gray-600"
                    >
                      {g.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      {openDrawer && (
        <Modal isOpen={openDrawer} onClose={handleClose}>
          <CreateStockGroup onClose={handleClose} editId={editId} />
        </Modal>
      )}
    </div>
  );
};

export default StockGroup;
