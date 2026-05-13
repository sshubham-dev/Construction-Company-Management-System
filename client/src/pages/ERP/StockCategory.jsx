import { useEffect, useState } from "react";
import axios from "axios";
import CreateStockCategory from "./Components/CreateStockCategory";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";

const StockCategory = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [drawer, setDrawer] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================
     FETCH
  ========================== */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/v1/stock-category");
      console.log(res)
      setData(res.data.data);

    } catch(err) {
      console.log(err)
      // toast.error("Failed to load");
    }
  };

  /* =========================
     FILTER
  ========================== */
  const filtered = data.filter((c) => {
    const s = c.name.toLowerCase().includes(search.toLowerCase());

    const st =
      status === "ALL" ? true : status === "ACTIVE" ? c.isActive : !c.isActive;

    return s && st;
  });

  /* =========================
     ACTIONS
  ========================== */
  const toggleStatus = async (id, current) => {
    await axios.put(`/api/v1/stock/category/${id}`, {
      isActive: !current,
    });
    fetchData();
  };

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>

        <button
          onClick={() => {
            setEditId(null);
            setDrawer(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        <input
          placeholder="Search"
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      <table className="w-full border bg-white text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Parent</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c?.parentId?.name || "-"}</td>

              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    c.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-2 text-right space-x-2">
                <button
                  onClick={() => {
                    setEditId(c._id);
                    setDrawer(true);
                  }}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleStatus(c._id, c.isActive)}
                  className="text-gray-600"
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DRAWER */}
      {drawer && (
        <Modal
          onClose={() => {
            setDrawer(false);
            fetchData();
          }}
          isOpen={drawer}
          head={editId ? "Edit Category" : "Create Category"}
        >
          <CreateStockCategory
            editId={editId}
            onClose={() => {
              setDrawer(false);
              fetchData();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default StockCategory;
