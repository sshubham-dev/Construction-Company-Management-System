import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";

const StockAudit = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [items, setItems] = useState([]);
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [showOnlyDiff, setShowOnlyDiff] = useState(true);

  useEffect(() => {
    fetchStores();
    if (isEdit) loadAudit();
  }, []);

  const fetchStores = async () => {
    const res = await axios.get("/api/v1/store");
    setStores(res.data.map(s => ({ value: s._id, label: s.name })));
  };

  const loadInventory = async (storeId) => {
    const { data } = await axios.get(`/api/v1/store-inventory/${storeId}`);

    const mapped = data.map(i => ({
      stockId: i.stockId._id,
      name: i.stockId.name,
      unit: i.stockId.unit,
      systemQty: i.qty,
      physicalQty: i.qty,
      difference: 0,
      differenceType: "MATCH",
      rate: i.avgRate || 0,
      value: 0,
      remarks: "",
    }));

    setItems(mapped);
  };

  const loadAudit = async () => {
    const { data } = await axios.get(`/api/v1/stock-audit/${editId}`);

    setSelectedStore({ value: data.storeId, label: data.storeName });
    setItems(data.items);
    setComments(data.comments);
    setStatus(data.status);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    if (field === "physicalQty") {
      const physical = Number(value || 0);
      const system = updated[index].systemQty;
      const diff = physical - system;

      updated[index].physicalQty = physical;
      updated[index].difference = diff;
      updated[index].differenceType = diff > 0 ? "EXCESS" : diff < 0 ? "SHORTAGE" : "MATCH";
      updated[index].value = diff * updated[index].rate;
    }

    if (field === "remarks") {
      updated[index].remarks = value;
    }

    setItems(updated);
  };

  const filteredItems = showOnlyDiff
    ? items.filter(i => i.difference !== 0)
    : items;

  const totalDiff = items.reduce((s, i) => s + i.difference, 0);
  const totalValue = items.reduce((s, i) => s + i.value, 0);

  const handleSubmit = async (post = false) => {
    if (!selectedStore) return toast.error("Select store");

    const payload = {
      storeId: selectedStore.value,
      items,
      comments,
      status: post ? "POSTED" : "DRAFT",
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`/api/v1/stock-audit/${editId}`, payload);
      } else {
        await axios.post("/api/v1/stock-audit", payload);
      }

      toast.success(post ? "Audit posted" : "Saved as draft");
      onClose();
    } catch (err) {
      toast.error("Error saving audit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto space-y-4">

      {/* HEADER */}
      <div className="space-y-2">
        <Select
          placeholder="Select Store"
          value={selectedStore}
          onChange={(v) => {
            setSelectedStore(v);
            loadInventory(v.value);
          }}
          options={stores}
        />

        <div className="flex justify-between text-xs">
          <span>Status: {status}</span>
          <button
            onClick={() => setShowOnlyDiff(!showOnlyDiff)}
            className="text-blue-600"
          >
            {showOnlyDiff ? "Show All" : "Only Differences"}
          </button>
        </div>
      </div>

      {/* ITEMS */}
      <div className="space-y-2 max-h-[400px] overflow-auto">
        {filteredItems.map((item, i) => (
          <div
            key={i}
            className={`border p-2 rounded space-y-1 ${item.difference !== 0 ? "bg-yellow-50" : ""}`}
          >
            <div className="flex justify-between">
              <p className="font-medium text-sm">{item.name}</p>
              <span className="text-xs">{item.unit}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>System: {item.systemQty}</div>

              <input
                type="number"
                value={item.physicalQty}
                disabled={status === "POSTED"}
                onChange={(e) => updateItem(i, "physicalQty", e.target.value)}
                className="border p-1"
              />

              <div className={`font-medium ${item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : ""}`}>
                Diff: {item.difference}
              </div>

              <div className="text-xs">{item.differenceType}</div>

              <div>₹ {item.value.toFixed(2)}</div>

              <input
                placeholder="Remarks"
                value={item.remarks}
                disabled={status === "POSTED"}
                onChange={(e) => updateItem(i, "remarks", e.target.value)}
                className="border p-1 col-span-2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border p-3 text-sm">
        <p>Total Difference: {totalDiff}</p>
        <p>Total Value: ₹ {totalValue.toFixed(2)}</p>
      </div>

      {/* COMMENTS */}
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comments"
        className="border p-2 w-full"
        disabled={status === "POSTED"}
      />

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading || status === "POSTED"}
          className="flex-1 bg-gray-500 text-white py-2 rounded"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSubmit(true)}
          disabled={loading || status === "POSTED"}
          className="flex-1 bg-blue-600 text-white py-2 rounded"
        >
          Post Audit
        </button>
      </div>
    </div>
  );
};

export default StockAudit;
