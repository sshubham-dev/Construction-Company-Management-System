import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ConfirmDeliveryNote = ({ dnId, onClose }) => {
  const [dn, setDn] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ======================
     LOAD DN
  ====================== */
  useEffect(() => {
    if (!dnId) return;

    const fetchDN = async () => {
      try {
        const res = await axios.get(`/api/v1/delivery-note/${dnId}`);
        setDn(res.data);

        setItems(
          res.data.items.map((i) => ({
            itemId: i.itemId,
            item: i.item,
            unit: i.unit,
            issuedQty: i.issuedQty,
            acceptedQty: 0,
            rejectedQty: 0,
            rejectionReason: "",
          }))
        );
      } catch (err) {
        toast.error("Failed to load Delivery Note");
      }
    };

    fetchDN();
  }, [dnId]);

  /* ======================
     UPDATE ITEM
  ====================== */
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto-calc rejected if accepted changes
    if (field === "acceptedQty") {
      const accepted = Number(value) || 0;
      const issued = updated[index].issuedQty;
      updated[index].rejectedQty = Math.max(issued - accepted, 0);
    }

    setItems(updated);
  };

  /* ======================
     VALIDATE BEFORE SUBMIT
  ====================== */
  const validateItems = () => {
    for (const item of items) {
      const accepted = Number(item.acceptedQty) || 0;
      const rejected = Number(item.rejectedQty) || 0;

      if (accepted + rejected !== item.issuedQty) {
        toast.error(
          `Accepted + Rejected must equal Issued for ${item.item}`
        );
        return false;
      }

      if (rejected > 0 && !item.rejectionReason) {
        toast.error(`Rejection reason required for ${item.item}`);
        return false;
      }
    }
    return true;
  };

  /* ======================
     SUBMIT CONFIRMATION
  ====================== */
  const confirmDN = async () => {
    if (!validateItems()) return;

    try {
      setLoading(true);

      await axios.put(`/api/v1/delivery-note/${dnId}`, {
        items: items.map((i) => ({
          itemId: i.itemId,
          acceptedQty: Number(i.acceptedQty),
          rejectedQty: Number(i.rejectedQty),
          rejectionReason: i.rejectionReason,
        })),
      });

      toast.success("Delivery Note verified successfully");
      onClose();
    } catch (err) {
      console.log(err)
      toast.error("Failed to confirm delivery");
    } finally {
      setLoading(false);
    }
  };

  if (!dn) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Confirm Delivery Note</h2>

      <div className="text-sm text-gray-600">
        <p><b>DN No:</b> {dn.deliveryNoteNo}</p>
        <p><b>Site:</b> {dn.site?.name}</p>
        <p><b>Store:</b> {dn.store?.name}</p>
      </div>

      {items.map((item, i) => (
        <div key={i} className="border p-3 rounded bg-white space-y-2">
          <p className="font-medium">{item.item}</p>
          <p className="text-xs text-gray-500">
            Issued Qty: {item.issuedQty} {item.unit}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <label htmlFor="acceptedQty">Accepted Qty:</label>
            <input
              type="number"
              min="0"
              max={item.issuedQty}
              value={item.acceptedQty}
              onChange={(e) =>
                updateItem(i, "acceptedQty", e.target.value)
              }
              className="border p-2 w-full"
              placeholder="Accepted Qty"
            />

            <label htmlFor="rejectedQty">Rejected Qty:</label>
            <input
              type="number"
              min="0"
              max={item.issuedQty}
              value={item.rejectedQty}
              onChange={(e) =>
                updateItem(i, "rejectedQty", e.target.value)
              }
              className="border p-2 w-full"
              placeholder="Rejected Qty"
            />
          </div>

          {item.rejectedQty > 0 && (
            <textarea
              value={item.rejectionReason}
              onChange={(e) =>
                updateItem(i, "rejectionReason", e.target.value)
              }
              className="border p-2 w-full"
              placeholder="Rejection reason"
            />
          )}
        </div>
      ))}

      <button
        onClick={confirmDN}
        disabled={loading}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        {loading ? "Confirming..." : "Confirm Delivery"}
      </button>
    </div>
  );
};

export default ConfirmDeliveryNote;
