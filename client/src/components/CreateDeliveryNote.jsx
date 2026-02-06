import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";

const CreateDeliveryNote = ({ onClose }) => {
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prOptions, setPrOptions] = useState([]);

  /* ======================
     LOAD OPEN PRs
  ====================== */
  useEffect(() => {
    axios
      .get("/api/v1/purchase-request/open-for-store")
      .then((res) => setPrOptions(res.data))
      .catch(() => toast.error("Failed to load PRs"));
  }, []);

  /* ======================
     SELECT PR
  ====================== */
  const selectPR = (pr) => {
    if (!pr) return;

    setPurchaseRequest(pr);

    setItems(
      pr.items.map((i) => ({
        itemId: i.itemId,
        item: i.item,
        unit: i.unit,
        requestedQty: Number(i.requestedQty) || 0,
        issuedQty: 0, // ✅ store decides issued qty
        remarks: "",
      }))
    );
  };

  /* ======================
     UPDATE ISSUED QTY (SAFE)
  ====================== */
  const updateIssuedQty = (index, value) => {
    const qty = Number(value);
    const updated = [...items];

    if (isNaN(qty) || qty < 0) {
      updated[index].issuedQty = 0;
    } else {
      updated[index].issuedQty = Math.min(
        qty,
        updated[index].requestedQty
      );
    }

    setItems(updated);
  };

  /* ======================
     SAVE DN
  ====================== */
  const saveDN = async () => {
    try {
      if (!purchaseRequest) {
        return toast.error("Please select a Purchase Request");
      }

      const validItems = items.filter((i) => i.issuedQty > 0);

      if (validItems.length === 0) {
        return toast.error("Issued quantity must be greater than zero");
      }

      setLoading(true);

      await axios.post("/api/v1/delivery-note", {
        purchaseRequestId: purchaseRequest._id,
        site: purchaseRequest.site,
        store: purchaseRequest.store,
        items: validItems,
      });

      toast.success("Delivery Note issued successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create Delivery Note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Issue Delivery Note</h2>

      {/* PR SELECT */}
      <select
        onChange={(e) => {
          const selected = prOptions.find(
            (pr) => pr._id === e.target.value
          );
          selectPR(selected);
        }}
        className="border p-2 w-full mt-2"
      >
        <option value="">Select Purchase Request</option>
        {prOptions.map((pr) => (
          <option key={pr._id} value={pr._id}>
            {pr.prNumber} - {pr.site?.name}
          </option>
        ))}
      </select>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="border p-3 rounded bg-white">
          <p className="font-medium">{item.item}</p>
          <p className="text-xs text-gray-500">
            Requested: {item.requestedQty}
          </p>

          <input
            type="number"
            min="0"
            value={item.issuedQty}
            onChange={(e) => updateIssuedQty(i, e.target.value)}
            className="border p-2 w-full mt-2"
          />
        </div>
      ))}

      {items.length > 0 && (
        <button
          onClick={saveDN}
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          {loading ? "Issuing..." : "Issue Delivery Note"}
        </button>
      )}
    </div>
  );
};


export default CreateDeliveryNote;
