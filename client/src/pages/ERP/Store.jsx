import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal.jsx";
import CreateStore from "../../components/CreateStore.jsx";

const Store = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);  
  const [editStoreId, setEditStoreId] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get("/api/v1/store");
      setStores(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    setIsEditMode(true);
    setEditStoreId(id);
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
 <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Stores</h2>
        <button
          onClick={()=>setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
        >
          + New Store
        </button>
      </div>

      {/* Empty State */}
      {stores.length === 0 && (
        <div className="text-sm text-gray-500 border rounded p-4 bg-white">
          No stores created yet.
        </div>
      )}

      {/* Store Cards */}
      <div className="space-y-3">
        {stores.map((store) => (
          <div
            key={store._id}
            className="border rounded p-3 bg-white shadow-sm"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-xs text-gray-500">
                  {store.businessUnitId?.name || "No Business Unit"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Code: {store.code || "-"}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  store.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {store.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
              {store.managesConsumables && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  Consumables
                </span>
              )}
              {store.managesAssets && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  Assets
                </span>
              )}
              {store.allowInternalSalesToSites && (
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  Site Issue
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() =>
                  navigate(`/erp/inventory/store/${store._id}`)
                }
                className="text-blue-600 text-sm"
              >
                View
              </button>

              <button
                onClick={() => handleEdit(store._id)}
                className="text-green-600 text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateStore
          onClose={() => {
            setIsModalOpen(false);
            fetchStores();
          }}
        />
      </Modal>
      <Modal isOpen={isEditMode} onClose={() => setIsEditMode(false)}>
        <CreateStore
          onClose={() => {
            setIsEditMode(false);
            fetchStores();
          }}
          editId={editStoreId}
        />
      </Modal>
    </div>
  );
};

export default Store;
