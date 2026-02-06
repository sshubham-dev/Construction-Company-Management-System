import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../features/notification/notificationSlice';
import Select from 'react-select';

axios.defaults.withCredentials = true;

const units = ["NOS", "KG", "BAG", "MT", "LITERS", "SQMT", "CUM"];

const CreatePurchaseOrder = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [form, setForm] = useState({
    supplier: null,
    deliveryTo: "Store",
    deliveryFor: null,
    items: [],
    remarks: "",
  });

  /* =====================
     LOAD MASTER DATA
  ===================== */
  useEffect(() => {
    loadMasters();
    if (isEdit) loadPO();
  }, [editId]);

  const loadMasters = async () => {
    const [sup, store, stock] = await Promise.all([
      axios.get("/api/v1/supplier"),
      axios.get("/api/v1/store"),
      axios.get("/api/v1/stock"),
    ]);

    setSuppliers(sup.data);
    setStores(store.data);
    setStocks(stock.data);
  };

  const loadPO = async () => {
    const { data } = await axios.get(`/api/v1/purchase-order/${editId}`);
    setForm({
      supplier: {
        value: data.supplier.id,
        label: data.supplier.name,
      },
      deliveryTo: data.deliveryTo,
      deliveryFor: {
        value: data.deliveryFor.id,
        label: data.deliveryFor.name,
      },
      items: data.items,
      remarks: data.remarks || "",
    });
  };

  /* =====================
     ITEM HANDLING
  ===================== */
  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          itemId: null,
          item: "",
          unit: "",
          requestedQty: 0,
          rate: 0,
          gstRate: 18,
          amount: 0,
        },
      ],
    });
  };

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;

    if (["requestedQty", "rate"].includes(field)) {
      items[i].amount =
        Number(items[i].requestedQty || 0) *
        Number(items[i].rate || 0);
    }

    setForm({ ...form, items });
  };

  const removeItem = (i) => {
    const items = [...form.items];
    items.splice(i, 1);
    setForm({ ...form, items });
  };

  /* =====================
     SUBMIT
  ===================== */
  const submit = async () => {
    if (!form.supplier || !form.deliveryFor || !form.items.length) {
      return toast.error("Missing required fields");
    }

    const payload = {
      supplier: {
        id: form.supplier.value,
        name: form.supplier.label,
      },
      deliveryTo: form.deliveryTo,
      deliveryFor: {
        id: form.deliveryFor.value,
        name: form.deliveryFor.label,
      },
      items: form.items.map((i) => ({
        itemId: i.itemId,
        item: i.item,
        unit: i.unit,
        requestedQty: Number(i.requestedQty),
        rate: Number(i.rate),
        gstRate: Number(i.gstRate),
        amount: Number(i.amount),
      })),
      remarks: form.remarks,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`/api/v1/purchase-order/${editId}`, payload);
        toast.success("Purchase Order updated");
      } else {
        await axios.post("/api/v1/purchase-order", payload);
        toast.success("Purchase Order created");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
      </h2>

      {/* Supplier */}
      <Select
        placeholder="Select Supplier"
        value={form.supplier}
        onChange={(v) => setForm({ ...form, supplier: v })}
        options={suppliers.map((s) => ({
          value: s._id,
          label: s.name,
        }))}
      />

      {/* Delivery For */}
      <Select
        placeholder="Deliver To Store"
        value={form.deliveryFor}
        onChange={(v) => setForm({ ...form, deliveryFor: v })}
        options={stores.map((s) => ({
          value: s._id,
          label: s.name,
        }))}
      />

      {/* ITEMS */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Items</h3>
          <button
            onClick={addItem}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            + Add Item
          </button>
        </div>

        {form.items.map((item, i) => (
          <div key={i} className="border p-2 rounded mb-2">
            <Select
              placeholder="Select Item"
              value={
                item.itemId
                  ? { value: item.itemId, label: item.item }
                  : null
              }
              onChange={(v) =>
                updateItem(i, "itemId", v.value) ||
                updateItem(i, "item", v.label)
              }
              options={stocks.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
            />

            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="number"
                placeholder="Qty"
                value={item.requestedQty}
                onChange={(e) =>
                  updateItem(i, "requestedQty", e.target.value)
                }
                className="border p-1"
              />

              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) =>
                  updateItem(i, "rate", e.target.value)
                }
                className="border p-1"
              />

              <select
                value={item.unit}
                onChange={(e) =>
                  updateItem(i, "unit", e.target.value)
                }
                className="border p-1"
              >
                <option value="">Unit</option>
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>

              <input
                disabled
                value={item.amount || 0}
                className="border p-1 bg-gray-100"
              />
            </div>

            <button
              onClick={() => removeItem(i)}
              className="text-red-500 text-xs mt-1"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Remarks */}
      <textarea
        placeholder="Remarks"
        value={form.remarks}
        onChange={(e) =>
          setForm({ ...form, remarks: e.target.value })
        }
        className="border p-2 w-full"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        {loading ? "Saving..." : "Save Purchase Order"}
      </button>
      <Toaster/>
    </div>
  );
};

export default CreatePurchaseOrder;
