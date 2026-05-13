import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyDeliveryNote = ({ dnId, onClose }) => {
  const [dn, setDn] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dnId) return;

    const fetchDN = async () => {
      try {
        const { data } = await axios.get(`/api/v1/delivery-note/${dnId}`);
        setDn(data);

        setItems(
          data.items.map((i) => ({
            itemId: i.itemId._id || i.itemId,
            name: i.itemId?.name,
            unit: i.unit,
            issuedQty: i.quantity,

            acceptedQty: i.quantity,
            rejectedQty: 0,
            rejectionReason: "",
          }))
        );
      } catch {
        toast.error("Failed to load DN");
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

    if (field === "acceptedQty") {
      const accepted = Number(value) || 0;
      const issued = updated[index].issuedQty;
      updated[index].rejectedQty = Math.max(issued - accepted, 0);
    }

    setItems(updated);
  };

  /* ======================
     VALIDATION
  ====================== */
  const validate = () => {
    for (const i of items) {
      const total =
        Number(i.acceptedQty) + Number(i.rejectedQty);

      if (total !== i.issuedQty) {
        toast.error(`${i.name}: mismatch qty`);
        return false;
      }

      if (i.rejectedQty > 0 && !i.rejectionReason) {
        toast.error(`${i.name}: reason required`);
        return false;
      }
    }
    return true;
  };

  /* ======================
     SUBMIT
  ====================== */
  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      await axios.post(`/api/v1/delivery-note/${dnId}/verify`, {
        items: items.map((i) => ({
          itemId: i.itemId,
          acceptedQty: Number(i.acceptedQty),
          rejectedQty: Number(i.rejectedQty),
          rejectionReason: i.rejectionReason,
        })),
      });

      toast.success("Verified");
      onClose();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!dn) return null;

  return (
    <div className="p-3 space-y-4 pb-20">

      <h2 className="text-lg font-semibold">Verify Delivery</h2>

      <div className="text-sm text-gray-600">
        <p><b>DN:</b> {dn.dnNumber}</p>
        <p>{dn.store?.name} → {dn.site?.name}</p>
      </div>

      {items.map((item, i) => (
        <div key={i} className="border rounded p-3 bg-white">

          <div className="flex justify-between">
            <span className="font-medium">{item.name}</span>
            <span className="text-xs">{item.unit}</span>
          </div>

          <div className="text-xs text-gray-500">
            Issued: {item.issuedQty}
          </div>

          <input
            type="number"
            value={item.acceptedQty}
            onChange={(e) =>
              updateItem(i, "acceptedQty", e.target.value)
            }
            className="border p-2 w-full mt-2 rounded"
          />

          {item.rejectedQty > 0 && (
            <textarea
              placeholder="Reason"
              value={item.rejectionReason}
              onChange={(e) =>
                updateItem(i, "rejectionReason", e.target.value)
              }
              className="border p-2 w-full mt-2 rounded"
            />
          )}
        </div>
      ))}

      <button
        onClick={submit}
        className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-3 rounded"
      >
        Confirm Delivery
      </button>
    </div>
  );
};

export default VerifyDeliveryNote;