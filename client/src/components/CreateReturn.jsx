import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import moment from "moment";
import Select from "react-select";

axios.defaults.withCredentials = true;

const ReturnFormModal = ({ onClose, editId = null }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [sites, setSites] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [form, setForm] = useState({
    site: null,
    materialType: "New",
    date: "",
    returnDate: "",
    items: [],
  });

  /* ======================
     LOAD MASTER
  ====================== */
  useEffect(() => {
    loadSites();
    if (isEdit) loadReturn();
  }, []);

  const loadSites = async () => {
    const res = await axios.get("/api/v1/site");
    setSites(res.data);
  };

  /* ======================
     LOAD INVOICES
  ====================== */
  const loadInvoices = async (siteId) => {
    const res = await axios.get(
      `/api/v1/sales-invoice?site=${siteId}`
    );
    setInvoices(res.data);
  };

  /* ======================
     LOAD RETURN (EDIT)
  ====================== */
  const loadReturn = async () => {
    const { data } = await axios.get(`/api/v1/return/${editId}`);

    setForm({
      site: {
        value: data.site.id,
        label: data.site.name,
      },
      materialType: data.materialType,
      date: data.date?.split("T")[0],
      returnDate: data.returnDate?.split("T")[0],
      items: data.returnable,
    });

    setSelectedInvoice({
      value: data.salesInvoice.id,
      label: data.salesInvoice.invoiceNo,
    });
  };

  /* ======================
     SELECT INVOICE
  ====================== */
  const handleInvoiceSelect = async (selected) => {
    setSelectedInvoice(selected);

    const { data } = await axios.get(
      `/api/v1/sales-invoice/${selected.value}`
    );

    const items = data.items.map((i) => ({
      item: i.item,
      unit: i.unit,
      quantity: 0,
      receivedQuantity: 0,
      remarks: "",
      rate: i.rate || 0,
      amount: 0,
    }));

    setForm({
      ...form,
      items,
    });
  };

  /* ======================
     UPDATE ITEM
  ====================== */
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;

    const qty = Number(items[i].quantity || 0);
    const rate = Number(items[i].rate || 0);

    items[i].amount = qty * rate;

    setForm({ ...form, items });
  };

  /* ======================
     VALIDATION
  ====================== */
  const validate = () => {
    if (!form.site || !selectedInvoice) {
      toast.error("Select site & invoice");
      return false;
    }

    const valid = form.items.some((i) => i.quantity > 0);

    if (!valid) {
      toast.error("Enter return quantity");
      return false;
    }

    return true;
  };

  /* ======================
     SUBMIT
  ====================== */
  const submit = async () => {
    if (!validate()) return;

    const payload = {
      site: {
        id: form.site.value,
        name: form.site.label,
      },

      salesInvoice: {
        id: selectedInvoice.value,
        invoiceNo: selectedInvoice.label,
      },

      materialType: form.materialType,
      date: form.date,
      returnDate: form.returnDate,

      returnable: form.items
        .filter((i) => i.quantity > 0)
        .map((i) => ({
          item: i.item,
          quantity: Number(i.quantity),
          unit: i.unit,
          rate: i.rate,
          amount: i.amount,
          remarks: i.remarks,
        })),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`/api/v1/return/${editId}`, payload);
        toast.success("Return updated");
      } else {
        await axios.post("/api/v1/return", payload);
        toast.success("Return created");
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

      {/* SITE */}
      <Select
        placeholder="Select Site"
        value={form.site}
        onChange={(v) => {
          setForm({ ...form, site: v });
          loadInvoices(v.value);
        }}
        options={sites.map((s) => ({
          value: s._id,
          label: s.name,
        }))}
      />

      {/* INVOICE */}
      <Select
        placeholder="Select Sales Invoice"
        value={selectedInvoice}
        onChange={handleInvoiceSelect}
        options={invoices.map((inv) => ({
          value: inv._id,
          label: inv.invoiceNo,
        }))}
      />

      {/* TYPE */}
      <select
        value={form.materialType}
        onChange={(e) =>
          setForm({ ...form, materialType: e.target.value })
        }
        className="border p-2 w-full"
      >
        <option value="New">New</option>
        <option value="Used">Used</option>
        <option value="Scrap">Scrap</option>
      </select>

      {/* DATES */}
      <input
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
      />

      <input
        type="date"
        value={form.returnDate}
        onChange={(e) =>
          setForm({ ...form, returnDate: e.target.value })
        }
      />

      {/* ITEMS */}
      {form.items.map((item, i) => (
        <div key={i} className="border p-3">
          <p>{item.item}</p>
          <p className="text-xs">{item.unit}</p>

          <input
            type="number"
            placeholder="Return Qty"
            value={item.quantity}
            onChange={(e) =>
              updateItem(i, "quantity", e.target.value)
            }
          />

          <input
            placeholder="Remarks"
            value={item.remarks}
            onChange={(e) =>
              updateItem(i, "remarks", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white w-full py-2"
      >
        {loading ? "Saving..." : "Submit Return"}
      </button>
    </div>
  );
};


export default ReturnFormModal;
