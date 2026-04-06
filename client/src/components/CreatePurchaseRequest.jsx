import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";

const CreatePurchaseRequest = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [sites, setSites] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [form, setForm] = useState({
    site: "",
    store: "",
    category: "",
    reqDate: "",
    requirementFor: "",
    remarks: "",
    items: [],
  });

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    loadMasters();
    if (isEdit) loadPR();
  }, [editId]);

  const loadMasters = async () => {
    try {
      const [siteRes, storeRes, catRes, stockRes] = await Promise.all([
        axios.get("/api/v1/site"),
        axios.get("/api/v1/store"),
        axios.get("/api/v1/stock-group"),
        axios.get("/api/v1/stock"),
      ]);

      setSites(siteRes.data);
      setStores(storeRes.data);
      setCategories(catRes.data);
      setStocks(stockRes.data);
    } catch {
      toast.error("Failed to load data");
    }
  };

  /* =========================
     LOAD EDIT DATA
  ========================== */
  const loadPR = async () => {
    try {
      const { data } = await axios.get(`/api/v1/purchase-request/${editId}`);

      setForm({
        site: data.site?._id || data.site,
        store: data.store?._id || data.store,
        category: data.category || "",
        reqDate: data.reqDate?.split("T")[0] || "",
        requirementFor: data.requirementFor || "",
        remarks: data.remarks || "",
        items: data.items.map((i) => ({
          itemId: i.itemId._id || i.itemId,
          name: i.itemId.name || "",
          unit: i.unit,
          requestedQty: i.requestedQty,
        })),
      });
    } catch {
      toast.error("Failed to load PR");
    }
  };

  /* =========================
     FILTER STOCK
  ========================== */
  const filteredStocks = form.category
    ? stocks.filter((s) => s.category === form.category)
    : stocks;

  /* =========================
     ITEM HANDLING
  ========================== */

  const addItem = () => {
    setForm((p) => ({
      ...p,
      items: [...p.items, { itemId: "", name: "", unit: "", requestedQty: 0 }],
    }));
  };

  const removeItem = (index) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const handleItemSelect = (index, selected) => {
    const stock = stocks.find((s) => s._id === selected.value);

    // prevent duplicate
    const exists = form.items.find((i) => i.itemId === stock._id);
    if (exists) {
      return toast.error("Item already added");
    }

    updateItem(index, "itemId", stock._id);
    updateItem(index, "name", stock.name);
    updateItem(index, "unit", stock.unit);
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (submit = false) => {
    if (!form.site) return toast.error("Site required");
    if (!form.store) return toast.error("Store required");
    if (!form.items.length) return toast.error("Add items");

    const payload = {
      site: form.site,
      store: form.store,
      category: form.category,
      reqDate: form.reqDate,
      requirementFor: form.requirementFor,
      remarks: form.remarks,
      items: form.items.map((i) => ({
        itemId: i.itemId,
        requestedQty: Number(i.requestedQty),
      })),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`/api/v1/purchase-request/${editId}`, payload);
        toast.success("PR updated");
      } else {
        const res = await axios.post("/api/v1/purchase-request", payload);

        toast.success(submit ? "PR submitted" : "PR saved");
      }

      onClose();
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
    <div className="mx-auto space-y-4">


      {/* HEADER */}
      <Select
        placeholder="Select Site"
        value={sites.find((s) => s._id === form.site) && {
          value: form.site,
          label: sites.find((s) => s._id === form.site)?.name,
        }}
        onChange={(v) => setForm({ ...form, site: v.value })}
        options={sites.map((s) => ({ value: s._id, label: s.name }))}
      />

      <Select
        placeholder="Select Store"
        value={stores.find((s) => s._id === form.store) && {
          value: form.store,
          label: stores.find((s) => s._id === form.store)?.name,
        }}
        onChange={(v) => setForm({ ...form, store: v.value })}
        options={stores.map((s) => ({ value: s._id, label: s.name }))}
      />

      <Select
        placeholder="Category"
        value={form.category ? { value: form.category, label: form.category } : null}
        onChange={(v) =>
          setForm({ ...form, category: v.value, items: [] })
        }
        options={categories.map((c) => ({
          value: c.name,
          label: c.name,
        }))}
      />

      <input
        type="date"
        value={form.reqDate}
        onChange={(e) => setForm({ ...form, reqDate: e.target.value })}
        className="border p-2 w-full rounded"
      />

      <input
        placeholder="Requirement For"
        value={form.requirementFor}
        onChange={(e) =>
          setForm({ ...form, requirementFor: e.target.value })
        }
        className="border p-2 w-full rounded"
      />

      {/* ITEMS */}
      <div className="space-y-2">
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          + Add Item
        </button>

        {form.items.map((item, i) => (
          <div key={i} className="border p-3 rounded space-y-2 bg-white">

            <Select
              placeholder="Select Item"
              value={
                item.itemId
                  ? { value: item.itemId, label: item.name }
                  : null
              }
              onChange={(v) => handleItemSelect(i, v)}
              options={filteredStocks.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Qty"
                value={item.requestedQty}
                onChange={(e) =>
                  updateItem(i, "requestedQty", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                value={item.unit}
                readOnly
                className="border p-2 bg-gray-100 rounded"
              />
            </div>

            <button
              onClick={() => removeItem(i)}
              className="text-red-600 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* REMARKS */}
      <textarea
        placeholder="Remarks"
        value={form.remarks}
        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        className="border p-2 w-full rounded"
      />

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSubmit(false)}
          className="flex-1 bg-gray-600 text-white py-2 rounded"
          disabled={loading}
        >
          Save Draft
        </button>

        {!isEdit && (
          <button
            onClick={() => handleSubmit()}
            className="flex-1 bg-green-600 text-white py-2 rounded"
            disabled={loading}
          >
            Submit PR
          </button>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default CreatePurchaseRequest;