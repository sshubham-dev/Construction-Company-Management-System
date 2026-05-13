import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";

const CreatePO = () => {
  const [params] = useSearchParams();
  const quotationId = params.get("quotationId");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);

  const [form, setForm] = useState({
    supplierId: "",
    deliveryType: "STORE",
    storeId: "",
    siteId: "",
    items: [],
    paymentTerms: "",
    narration: "",
  });

  /* =========================
     LOAD DATA
  ========================== */
  useEffect(() => {
    loadMasters();
    if (quotationId) loadQuotation();
  }, [quotationId]);

  const loadMasters = async () => {
    const res = await axios.get("/api/v1/store");
    setStores(res.data);
  };

  const loadQuotation = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/quotation/${quotationId}/for-po`
      );

      setForm((p) => ({
        ...p,
        supplierId: data.supplierId,
        items: data.items.map((i) => ({
          itemId: i.itemId,
          name: i.name,
          unit: i.unit,
          quantity: i.quantity,
          rate: i.rate,
          amount: i.quantity * i.rate,
        })),
        paymentTerms: data.paymentTerms,
      }));
    } catch {
      toast.error("Failed to load quotation");
    }
  };

  /* =========================
     ITEM UPDATE
  ========================== */
  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;

    if (field === "quantity" || field === "rate") {
      updated[index].amount =
        Number(updated[index].quantity || 0) *
        Number(updated[index].rate || 0);
    }

    setForm({ ...form, items: updated });
  };

  /* =========================
     TOTAL
  ========================== */
  const totalAmount = form.items.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  );

  const tax = totalAmount * 0.18;
  const grandTotal = totalAmount + tax;

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (approve = false) => {
    try {
      if (!form.supplierId) return toast.error("Supplier required");
      if (!form.items.length) return toast.error("Items required");

      const payload = {
        ...form,
        totalAmount,
        status: approve ? "ORDERED" : "DRAFT",
      };

      setLoading(true);

      await axios.post("/api/v1/purchase-order", payload);

      toast.success("PO created");
      navigate("/erp/purchase-orders");

    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">

      <h2 className="text-lg font-semibold">Create Purchase Order</h2>

      {/* DELIVERY */}
      <div className="grid gap-2">
        <select
          value={form.deliveryType}
          onChange={(e) =>
            setForm({ ...form, deliveryType: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="STORE">Store</option>
          <option value="SITE">Site</option>
        </select>

        {form.deliveryType === "STORE" && (
          <select
            onChange={(e) =>
              setForm({ ...form, storeId: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option>Select Store</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ITEMS */}
      <div className="border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {form.items.map((i, idx) => (
              <tr key={idx} className="border-t">
                <td>{i.name}</td>

                <td>
                  <input
                    type="number"
                    value={i.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                    className="border p-1 w-20"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={i.rate}
                    onChange={(e) =>
                      updateItem(idx, "rate", e.target.value)
                    }
                    className="border p-1 w-20"
                  />
                </td>

                <td>₹ {i.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="text-right space-y-1">
        <div>Subtotal: ₹ {totalAmount.toFixed(2)}</div>
        <div>GST (18%): ₹ {tax.toFixed(2)}</div>
        <div className="font-semibold">
          Total: ₹ {grandTotal.toFixed(2)}
        </div>
      </div>

      {/* TERMS */}
      <textarea
        value={form.paymentTerms}
        onChange={(e) =>
          setForm({ ...form, paymentTerms: e.target.value })
        }
        placeholder="Payment Terms"
        className="border p-2 w-full rounded"
      />

      {/* ACTIONS */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => handleSubmit(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSubmit(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Approve & Order
        </button>
      </div>

    </div>
  );
};

export default CreatePO;