import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

import PurchaseHeader from "./purchaseInvoice/PurchaseHeader";
import PurchaseItems from "./purchaseInvoice/PurchaseItems";
import PurchaseCharges from "./purchaseInvoice/PurchaseCharges";
import PurchaseSummary from "./purchaseInvoice/PurchaseSummary";
import PurchaseFooter from "./purchaseInvoice/PurchaseFooter";

import {
  createPurchase,
  updatePurchase,
  getPurchase,
  postPurchase,
} from "../../../api/purchaseApi";
import axios from "axios";

const defaultForm = {
  supplierId: "",
  supplierInvoiceNo: "",
  invoiceDate: "",
  dueDate: "",
  paymentTerms: "",
  narration: "",

  source: "MANUAL",

  storeId: "",
  costCenterId: "",

  purchaseOrderId: null,
  grnId: null,

  items: [],

  charges: [],

  summary: {
    subTotal: 0,
    discount: 0,
    taxableAmount: 0,

    cgst: 0,
    cgstLedgerId: "",

    sgst: 0,
    sgstLedgerId: "",

    igst: 0,
    igstLedgerId: "",

    cess: 0,
    cessLedgerId: "",

    chargeTotal: 0,

    roundOff: 0,

    grandTotal: 0,
  },
};

const PurchaseInvoiceForm = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(defaultForm);
  const [lookups, setLookups] = useState({
    suppliers: [],
    costCenters: [],
    stockItems: [],
    stores: [],
    purchaseOrders: [],
    grns: [],
    chargeLedgers: [],
    gstConfig: [],
  });

  const readonly = mode === "view";

  useEffect(() => {
    loadLookups();
  }, []);
  const loadLookups = async () => {
    try {
      const [
        suppliers,
        costCenters,
        stockItems,
        stores,
        chargeLedgers,
        pos,
        grns,
        gstConfigRes,
      ] = await Promise.all([
        axios.get("/api/v1/ledger", {
          params: {
            companyId: user.companyId,
            ledgerType: "Supplier",
          },
        }),

        axios.get("/api/v1/cost-center", {
          params: {
            companyId: user.companyId,
            isActive: true,
          },
        }),

        axios.get("/api/v1/stock-item", {
          params: {
            companyId: user.companyId,
          },
        }),

        axios.get("/api/v1/store", {
          params: {
            companyId: user.companyId,
          },
        }),

        axios.get("/api/v1/ledger", {
          params: {
            companyId: user.companyId,
            ledgerGroup: "Purchase Charges",
          },
        }),

        axios.get("/api/v1/purchase-order", {
          params: {
            companyId: user.companyId,
            ledgerGroup: "Purchase Charges",
          },
        }),

        axios.get("/api/v1/grn", {
          params: {
            companyId: user.companyId,
            ledgerGroup: "Purchase Charges",
          },
        }),

        axios.get("/api/v1/gst-ledger", {
          params: {
            companyId: user.companyId,
          },
        }),
      ]);

      setLookups({
        suppliers: suppliers.data.data || [],
        costCenters: costCenters.data || [],
        stockItems: stockItems.data.data || [],
        stores: stores.data.data || [],
        purchaseOrders: pos.data.data || [],
        purchaseOrders: pos.data.data || [],
        chargeLedgers: chargeLedgers.data.data || [],
        gstConfig: gstConfigRes.data.data,
      });
    } catch (err) {
      console.log(err);
      toast.error("Unable to load master data");
    }
  };

  useEffect(() => {
    if (mode !== "create") {
      loadPurchase();
    }
  }, [id]);

  const company = user?.company;
  const selectedParty = "";

  const loadPurchase = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/v1/purchase-invoice/${id}`);

      const inv = data.data;

      setForm({
        supplierId: inv.supplierId || "",
        supplierInvoiceNo: inv.supplierInvoiceNo || "",

        invoiceDate: inv.invoiceDate ? inv.invoiceDate.slice(0, 10) : "",

        dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",

        paymentTerms: inv.paymentTerms || "",

        narration: inv.narration || "",

        source: inv.source || "MANUAL",

        storeId: inv.storeId || "",

        costCenterId: inv.costCenterId || "",

        purchaseOrderId: inv.purchaseOrderId || null,

        grnId: inv.grnId || null,

        items: inv.items || [],

        charges: inv.charges || [],

        summary: inv.summary || defaultForm.summary,
      });
    } catch (err) {
      console.log(err);
      toast.error("Unable to load purchase");
    } finally {
      setLoading(false);
    }
  };

  const recalculateSummary = (items, charges) => {
    const summary = {
      subTotal: 0,
      discount: 0,
      taxableAmount: 0,

      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,

      chargeTotal: 0,

      roundOff: 0,

      grandTotal: 0,
    };

    items.forEach((item) => {
      summary.subTotal += Number(item.quantity || 0) * Number(item.rate || 0);

      summary.discount += Number(item.discount || 0);

      summary.taxableAmount += Number(item.taxableAmount || 0);

      summary.cgst += Number(item.cgstAmount || 0);

      summary.sgst += Number(item.sgstAmount || 0);

      summary.igst += Number(item.igstAmount || 0);
    });

    charges.forEach((charge) => {
      summary.chargeTotal += Number(charge.amount || 0);

      summary.cgst += Number(charge.cgstAmount || 0);

      summary.sgst += Number(charge.sgstAmount || 0);

      summary.igst += Number(charge.igstAmount || 0);
    });

    const total =
      summary.taxableAmount +
      summary.cgst +
      summary.sgst +
      summary.igst +
      summary.chargeTotal;

    summary.roundOff = Number((Math.round(total) - total).toFixed(2));

    summary.grandTotal = Math.round(total);

    return summary;
  };

  const validateForm = () => {
    if (!form.supplierId) {
      toast.error("Supplier is required");
      return false;
    }

    if (!form.invoiceDate) {
      toast.error("Invoice Date is required");
      return false;
    }

    if (!form.storeId) {
      toast.error("Store is required");
      return false;
    }

    if (form.items.length === 0) {
      toast.error("Add at least one item");
      return false;
    }

    return true;
  };

  const saveDraft = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        summary: recalculateSummary(form.items, form.charges),
      };

      if (mode === "create") {
        await createPurchase(payload);
      } else {
        await updatePurchase(id, payload);
      }

      toast.success("Purchase saved");
      setForm(initialState);
      navigate("/erp/purchase-invoice");
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Unable to save purchase");
    } finally {
      setSaving(false);
    }
  };

  const saveAndPost = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        summary: recalculateSummary(form.items, form.charges),
      };

      let purchaseId = id;

      if (mode === "create") {
        const { data } = await createPurchase(payload);

        purchaseId = data.purchase._id;
      } else {
        await updatePurchase(id, payload);
      }

      await postPurchase(purchaseId);

      toast.success("Purchase Posted");

      navigate("/erp/purchase-invoice");
    } catch (err) {
      console.log(err);

      toast.error(err?.response?.data?.message || "Unable to post purchase");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (item) => {
    const items = [...form.items, item];

    setForm((prev) => ({
      ...prev,
      items,
      summary: recalculateSummary(items, prev.charges),
    }));
  };

  const updateItem = (index, item) => {
    const items = [...form.items];

    items[index] = item;

    setForm((prev) => ({
      ...prev,
      items,
      summary: recalculateSummary(items, prev.charges),
    }));
  };

  const deleteItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      items,
      summary: recalculateSummary(items, prev.charges),
    }));
  };

  const addCharge = () => {
    const charges = [
      ...form.charges,
      {
        ledgerId: "",
        name: "",
        amount: 0,

        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,

        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,

        affectsInventoryCost: false,
      },
    ];

    setForm((prev) => ({
      ...prev,
      charges,
      summary: recalculateSummary(prev.items, charges),
    }));
  };

  const updateCharge = (index, field, value) => {
    const charges = [...form.charges];

    const charge = {
      ...charges[index],
      [field]: value,
    };

    const taxable = Number(charge.amount || 0);

    charge.cgstAmount = taxable * (Number(charge.cgstRate || 0) / 100);

    charge.sgstAmount = taxable * (Number(charge.sgstRate || 0) / 100);

    charge.igstAmount = taxable * (Number(charge.igstRate || 0) / 100);

    charges[index] = charge;

    setForm((prev) => ({
      ...prev,
      charges,
      summary: recalculateSummary(prev.items, charges),
    }));
  };

  const deleteCharge = (index) => {
    const charges = form.charges.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      charges,
      summary: recalculateSummary(prev.items, charges),
    }));
  };

  const handleHeaderChange = (field, value) => {
    setForm((prev) => ({
      ...prev,

      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading Purchase...
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <PurchaseHeader
        form={form}
        onChange={handleHeaderChange}
        suppliers={lookups.suppliers}
        stores={lookups.stores}
        purchaseOrders={lookups.purchaseOrders}
        grns={lookups.grns}
        costCenters={lookups.costCenters}
        readonly={readonly}
      />

      <PurchaseItems
        items={form.items}
        stockItems={lookups.stockItems}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        readonly={readonly}
        companyState={company?.address?.state}
        // supplierState={selectedSupplier?.state}
      />

      <PurchaseCharges
        charges={form.charges}
        readonly={readonly}
        ledgers={lookups.chargeLedgers}
        onAddCharge={addCharge}
        onUpdateCharge={updateCharge}
        onDeleteCharge={deleteCharge}
      />

      <PurchaseSummary summary={form.summary} />

      <PurchaseFooter
        mode={mode}
        saving={saving}
        readonly={readonly}
        onCancel={() => navigate(-1)}
        onSave={saveDraft}
        onPost={saveAndPost}
      />
    </div>
  );
};

export default PurchaseInvoiceForm;
