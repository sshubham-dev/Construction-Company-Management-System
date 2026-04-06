import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";

axios.defaults.withCredentials = true;

const units = ["NOS", "KG", "BAG", "MT", "LITERS", "SQMT", "CUM"];

const CreatePurchaseOrder = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [sites, setSites] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [prs, setPRs] = useState([]);

  const [selectedPR, setSelectedPR] = useState(null);

  const [form, setForm] = useState({
    supplier: null,
    deliveryTo: "Store",
    deliveryFor: null,
    category: null,
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
    try {
      const [sup, store, stock, site] = await Promise.all([
        axios.get("/api/v1/supplier"),
        axios.get("/api/v1/store"),
        axios.get("/api/v1/stock"),
        axios.get("/api/v1/site"),
      ]);

      setSuppliers(sup.data);
      setStores(store.data);
      setStocks(stock.data);
      setSites(site.data);
    } catch {
      toast.error("Failed to load master data");
    }
  };

  const loadPO = async () => {
    try {
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
        category: null,
        items: data.items,
        remarks: data.remarks || "",
      });
    } catch {
      toast.error("Failed to load PO");
    }
  };

  /* =====================
     CATEGORY FILTER
  ===================== */
  const filteredStocks = form.category
    ? stocks.filter((s) => s.category === form.category.value)
    : stocks;

  /* =====================
     LOAD PR WHEN SITE SELECTED
  ===================== */
  useEffect(() => {
    if (form.deliveryTo === "Site" && form.deliveryFor) {
      loadPRs(form.deliveryFor.value);
    }
  }, [form.deliveryFor]);

  const loadPRs = async (siteId) => {
    try {
      const { data } = await axios.get(
        `/api/v1/purchase-request/site/${siteId}`,
      );
      setPRs(data);
    } catch {
      toast.error("Failed to load PR");
    }
  };

  /* =====================
     PR SELECT
  ===================== */
  const handlePRSelect = (selected) => {
    const pr = prs.find((p) => p._id === selected.value);

    setSelectedPR(selected);

    const items = pr.items.map((i) => ({
      itemId: i.itemId,
      item: i.item,
      unit: i.unit,
      requestedQty: i.requestedQty,
      rate: 0,
      gstRate: 0,
      amount: 0,
    }));

    setForm({
      ...form,
      items,
      purchaseRequestId: pr._id,
    });
  };

  const isPRMode = form.deliveryTo === "Site" && selectedPR;

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
          // rate: 0,
          // gstRate: 0,
          // amount: 0,
        },
      ],
    });
  };

  const removeItem = (i) => {
    const items = [...form.items];
    items.splice(i, 1);
    setForm({ ...form, items });
  };

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;

    const qty = Number(items[i].requestedQty || 0);
    // const rate = Number(items[i].rate || 0);
    // const gst = Number(items[i].gstRate || 0);

    // const amount = qty * rate;
    // const gstAmount = (amount * gst) / 100;

    // items[i].amount = amount;
    // items[i].total = amount + gstAmount;

    setForm({ ...form, items });
  };

  const handleItemSelect = (i, selected) => {
    const stock = stocks.find((s) => s._id === selected.value);

    updateItem(i, "itemId", stock._id);
    updateItem(i, "item", stock.name);
    updateItem(i, "unit", stock.unit);
    // updateItem(i, "rate", stock.purchasePrice || 0);
    // updateItem(i, "gstRate", stock.gstRate || 0);
  };

  /* =====================
     TOTAL
  ===================== */
  const totalBeforeTax = form.items.reduce((s, i) => s + (i.amount || 0), 0);

  const totalTax = form.items.reduce(
    (s, i) => s + ((i.amount || 0) * (i.gstRate || 0)) / 100,
    0,
  );

  const total = totalBeforeTax + totalTax;

  /* =====================
     SUBMIT
  ===================== */
  const submit = async () => {
    if (!form.supplier || !form.deliveryFor || !form.items.length) {
      return toast.error("Missing required fields");
    }

    const payload = {
      purchaseRequestId: form.purchaseRequestId || null,

      supplier: {
        id: form.supplier.value,
        name: form.supplier.label,
      },

      deliveryFor: {
        id: form.deliveryFor.value,
        deliveryForModel: form.deliveryTo,
        name: form.deliveryFor.label,
      },

      items: form.items.map((i) => ({
        itemId: i.itemId,
        item: i.item,
        unit: i.unit,
        requestedQty: Number(i.requestedQty),
        // rate: Number(i.rate),
        // gstRate: Number(i.gstRate),
        // amount: Number(i.amount),
      })),

      remarks: form.remarks,
    };

    try {
      setLoading(true);

      if (editId !== undefined) {
        await axios.put(`/api/v1/purchase-order/${editId}`, payload);
        toast.success("PO updated");
      } else {
        console.log(payload);
        await axios.post("/api/v1/purchase-order", payload);
        toast.success("PO created");
      }

      onClose && onClose();
    } catch (err) {
      console.log(err);
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
      {/* CATEGORY */}
      <Select
        placeholder="Material Category"
        value={form.category}
        onChange={(v) => setForm({ ...form, category: v })}
        options={[
          { value: "raw", label: "Raw" },
          { value: "cement", label: "Cement" },
          { value: "electrical", label: "Electrical" },
          { value: "plumbing", label: "Plumbing" },
        ]}
      />

      <Select
        placeholder="Supplier"
        value={form.supplier}
        onChange={(v) => setForm({ ...form, supplier: v })}
        options={suppliers.map((s) => ({
          value: s._id,
          label: s.name,
        }))}
      />

      <select
        value={form.deliveryTo}
        onChange={(e) =>
          setForm({
            ...form,
            deliveryTo: e.target.value,
            deliveryFor: null,
            items: [],
            purchaseRequestId: null,
          })
        }
        className="border p-2 w-full"
      >
        <option value="Store">Store</option>
        <option value="Site">Site</option>
      </select>

      <Select
        placeholder="Destination"
        value={form.deliveryFor}
        onChange={(v) => setForm({ ...form, deliveryFor: v, items: [] })}
        options={
          form.deliveryTo === "Store"
            ? stores.map((s) => ({
                value: s._id,
                label: s.name,
              }))
            : sites.map((s) => ({
                value: s._id,
                label: s.name,
              }))
        }
      />

      {/* PR SELECT */}
      {form.deliveryTo === "Site" && (
        <Select
          placeholder="Select PR"
          value={selectedPR}
          onChange={handlePRSelect}
          options={prs.map((p) => ({
            value: p._id,
            label: p.prNumber,
          }))}
        />
      )}

      {/* ITEMS */}
      <div>
        <button onClick={addItem}>+ Add Item</button>

        {form.items.map((item, i) => (
          <div key={i} className="border p-2 mt-2">
            {!isPRMode && (
              <Select
                placeholder="Item"
                onChange={(v) => handleItemSelect(i, v)}
                options={filteredStocks.map((s) => ({
                  value: s._id,
                  label: s.name,
                }))}
              />
            )}

            <input
              type="number"
              value={item.requestedQty}
              disabled={isPRMode}
              onChange={(e) => updateItem(i, "requestedQty", e.target.value)}
            />

            {/* <input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(i, "rate", e.target.value)}
            />

            <input
              type="number"
              value={item.gstRate}
              onChange={(e) => updateItem(i, "gstRate", e.target.value)}
            /> */}

            <input value={item.unit} readOnly />
            {/* <input value={item.amount || 0} readOnly /> */}

            <button onClick={() => removeItem(i)}>Remove</button>
          </div>
        ))}
      </div>

      {/* <div>
        <p>Total: {totalBeforeTax}</p>
        <p>GST: {totalTax}</p>
        <h3>Grand Total: {total}</h3>
      </div> */}

      <textarea
        value={form.remarks}
        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Saving..." : "Save PO"}
      </button>


    </div>
  );
};

export default CreatePurchaseOrder;
