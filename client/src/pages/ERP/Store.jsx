import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal";
import CreateStore from "./Components/CreateStore";
import toast from "react-hot-toast";

const Store = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =========================
     FETCH
  ========================== */
  const fetchStores = async () => {
    try {
      const res = await axios.get("/api/v1/store");
      setStores(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  /* =========================
     FILTER
  ========================== */
  const filtered = Array.isArray(stores)
    ? stores?.filter((s) => {
        return (
          s.name.toLowerCase().includes(search.toLowerCase()) &&
          (typeFilter ? s.type === typeFilter : true) &&
          (statusFilter
            ? statusFilter === "ACTIVE"
              ? s.isActive
              : !s.isActive
            : true)
        );
      })
    : [];

  /* =========================
     TOGGLE ACTIVE
  ========================== */
  const toggleStatus = async (id, current) => {
    try {
      await axios.put(`/api/v1/store/${id}`, {
        isActive: !current,
      });

      fetchStores();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* =========================
     UI
  ========================== */
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Stores</h2>

        <button
          onClick={() => {
            setEditId(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          + Create Store
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap">
        <input
          placeholder="Search store..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option value="WAREHOUSE">Warehouse</option>
          <option value="SITE">Site</option>
        </select>

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="border p-4 text-sm text-gray-500 bg-white rounded">
          No stores found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((store) => (
            <div
              key={store._id}
              className="border rounded p-4 bg-white shadow-sm"
            >
              {/* TOP */}
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{store.name}</p>

                  <p className="text-xs text-gray-500">
                    {store.businessUnitId?.name}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Code: {store.code}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* TYPE */}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      store.type === "WAREHOUSE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {store.type}
                  </span>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      store.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* PEOPLE */}
              <div className="mt-3 text-xs text-gray-600">
                <p>Head: {store.storeHead?.name}</p>
                <p>Incharge: {store.storeIncharge?.name}</p>
              </div>

              {/* ADDRESS */}
              {store.address?.city && (
                <div className="mt-2 text-xs text-gray-500">
                  {store.address.city}, {store.address.state}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-between mt-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditId(store._id);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(store._id, store.isActive)}
                    className="text-gray-600 text-sm"
                  >
                    {store.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                {/* <button
                  onClick={() =>
                    window.open(`/erp/store/${store._id}`, "_blank")
                  }
                  className="text-green-600 text-sm"
                >
                  View
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head={editId ? "Edit Store" : "Create Store"}
      >
        <CreateStore
          editId={editId}
          onClose={() => {
            setIsModalOpen(false);
            fetchStores();
          }}
        />
      </Modal>
    </div>
  );
};

export default Store;
