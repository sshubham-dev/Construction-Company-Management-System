import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateDeliveryNote = ({ onClose, editId = null }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [prOptions, setPrOptions] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);

  const [items, setItems] = useState([]);

  const [formMeta, setFormMeta] = useState({
    store: null,
    destination: null,
  });

  /* ======================
     LOAD OPEN PRs
  ====================== */
  useEffect(() => {
    if (!isEdit) {
      loadPRs();
    } else {
      loadDN();
    }
  }, []);

  const loadPRs = async () => {
    try {
      const res = await axios.get(
        "/api/v1/purchase-request/open-for-store"
      );
      console.log(res.data)
      setPrOptions(res.data);
    } catch {
      toast.error("Failed to load PRs");
    }
  };

  /* ======================
     LOAD EXISTING DN (EDIT)
  ====================== */
  const loadDN = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/delivery-note/${editId}`
      );

      setSelectedPR({
        _id: data.purchaseRequestId,
      });

      setFormMeta({
        store: data.store,
        destination: data.site,
      });

      setItems(data.items);
    } catch {
      toast.error("Failed to load DN");
    }
  };

  /* ======================
     SELECT PR
  ====================== */
  const selectPR = (pr) => {
    setSelectedPR(pr);

    setFormMeta({
      store: pr.store,
      destination: pr.site,
    });

    const mappedItems = pr.items.map((i) => ({
      itemId: i.itemId,
      item: i.item,
      unit: i.unit,

      requestedQty: Number(i.requestedQty),
      issuedQty: 0,

      acceptedQty: 0,
      rejectedQty: 0,

      status: "Issued",
      rejectionReason: "",
    }));

    setItems(mappedItems);
  };

  /* ======================
     UPDATE ISSUED QTY
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
     VALIDATION
  ====================== */
  const validate = () => {
    if (!selectedPR) {
      toast.error("Select Purchase Request");
      return false;
    }

    const valid = items.some((i) => i.issuedQty > 0);

    if (!valid) {
      toast.error("Enter issued quantity");
      return false;
    }

    return true;
  };

  /* ======================
     SAVE DN
  ====================== */
  const saveDN = async () => {
    if (!validate()) return;

    const payload = {
      purchaseRequestId: selectedPR._id,

      store: {
        id: formMeta?.store?.id,
        name: formMeta?.store?.name,
      },

      destination: {
        id: formMeta.destination.id,
        deliveryTo: "Site",
        name: formMeta.destination.name,
      },

      items: items
        .filter((i) => i.issuedQty > 0)
        .map((i) => ({
          itemId: i.itemId,
          item: i.item,
          unit: i.unit,

          requestedQty: i.requestedQty,
          issuedQty: i.issuedQty,

          acceptedQty: 0,
          rejectedQty: 0,

          status: "Issued",
        })),

      status: "Issued",
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(
          `/api/v1/delivery-note/${editId}`,
          payload
        );
        toast.success("Delivery Note updated");
      } else {
        await axios.post("/api/v1/delivery-note", payload);
        toast.success("Delivery Note created");
      }

      onClose && onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit DN" : "Create Delivery Note"}
      </h2>

      {/* PR SELECT */}
      {!isEdit && (
        <select
          onChange={(e) => {
            const pr = prOptions.find(
              (p) => p._id === e.target.value
            );
            selectPR(pr);
          }}
          className="border p-2 w-full"
        >
          <option value="">Select Purchase Request</option>
          {prOptions.map((pr) => (
            <option key={pr._id} value={pr._id}>
              {pr.prNumber} - {pr.site?.name}
            </option>
          ))}
        </select>
      )}

      {/* STORE + Destination */}
      {formMeta.store && (
        <div className="text-sm">
          <p>Store: {formMeta.store.name}</p>
          <p>Destination: {formMeta.destination.name}</p>
        </div>
      )}

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="border p-3 rounded bg-white">
          <p className="font-medium">{item.item}</p>
          <p className="text-xs text-gray-500">
            Requested: {item.requestedQty} {item.unit}
          </p>

          <input
            type="number"
            min="0"
            value={item.issuedQty}
            onChange={(e) =>
              updateIssuedQty(i, e.target.value)
            }
            className="border p-2 w-full mt-2"
          />
        </div>
      ))}

      {/* ACTION */}
      {items.length > 0 && (
        <button
          onClick={saveDN}
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          {loading
            ? "Processing..."
            : isEdit
            ? "Update DN"
            : "Issue Delivery Note"}
        </button>
      )}
    </div>
  );
};

export default CreateDeliveryNote;