import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const StoreInventoryScreen = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    try {
      const [storeRes, invRes] = await Promise.all([
        axios.get(`/api/v1/store/${storeId}`),
        axios.get(`/api/v1/store-inventory/${storeId}`),
      ]);

      setStore(storeRes.data);
      setInventory(invRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading inventory...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{store?.name}</h2>
          <p className="text-xs text-gray-500">Store Inventory</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Back
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Total Items"
          value={inventory.length}
        />
        <SummaryCard
          label="Stock Value"
          value={`₹${store?.currentStockValue || 0}`}
        />
      </div>

      {/* Inventory List */}
      {inventory.length === 0 ? (
        <div className="text-center text-sm text-gray-500 mt-10">
          No stock available in this store
        </div>
      ) : (
        <div className="space-y-2">
          {inventory.map((item) => (
            <InventoryCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreInventoryScreen;

/* =======================
   COMPONENTS
======================= */

const SummaryCard = ({ label, value }) => (
  <div className="border rounded p-3 bg-white">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

const InventoryCard = ({ item }) => {
  const stock = item.stockId;

  return (
    <div className="border rounded p-3 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{stock?.name}</p>
          <p className="text-xs text-gray-500">
            Unit: {stock?.unit || "-"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold">
            Qty: {item.quantity}
          </p>
          {item.reservedQuantity > 0 && (
            <p className="text-xs text-orange-600">
              Reserved: {item.reservedQuantity}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <Info label="Avg Rate" value={`₹${item.averageRate.toFixed(2)}`} />
        <Info label="Stock Value" value={`₹${item.stockValue.toFixed(2)}`} />
      </div>

      {item.lastMovementAt && (
        <p className="text-xs text-gray-400 mt-2">
          Last updated: {new Date(item.lastMovementAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
