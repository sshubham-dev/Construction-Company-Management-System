import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import Select from "react-select";

import {
  ArrowLeft,
  Save,
  FileText,
  Users,
  CalendarDays,
  Package,
  ClipboardList,
} from "lucide-react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

axios.defaults.withCredentials = true;

const CreateRFQ = ({ editId, onClose }) => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const prId = searchParams.get("pr");
  const { user } = useSelector((state) => state.auth);
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [prs, setPRs] = useState([]);

  const [suppliers, setSuppliers] = useState([]);

  const [selectedPR, setSelectedPR] = useState(null);

  const [form, setForm] = useState({
    purchaseRequestId: "",

    suppliers: [],

    quotationDeadline: "",

    procurementType: "SITE_PROCUREMENT",

    paymentTerms: "As per agreement",

    narration: "",
  });

  /* =====================================
     LOAD
  ===================================== */

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (prId && prs.length) {
      const found = prs.find((p) => p._id === prId);

      if (found) {
        setSelectedPR(found);

        setForm((prev) => ({
          ...prev,

          purchaseRequestId: found._id,
        }));
      }
    }
  }, [prId, prs]);

  const loadInitial = async () => {
    try {
      const [prRes, supplierRes] = await Promise.all([
        axios.get("/api/v1/purchase-request/open-rfq"),
        axios.get(
          `/api/v1/ledger?ledgerType=Supplier&companyId=${user.companyId}`,
        ),
      ]);

      setPRs(prRes.data.data || []);

      setSuppliers(supplierRes.data.data || []);

      if (editId) {
        fetchRFQ(editId);
      }
    } catch (err) {
      console.log(err);

      // toast.error("Failed to load data");
    }
  };

  /* =====================================
     FETCH RFQ
  ===================================== */

  const fetchRFQ = async (id) => {
    try {
      const res = await axios.get(`/api/v1/rfq/${id}`);

      const data = res.data.data;

      setForm({
        purchaseRequestId: data.purchaseRequestId?._id,

        suppliers: data.suppliers.map((s) => s.supplierId?._id),

        quotationDeadline: data.quotationDeadline?.split("T")[0],

        procurementType: data.procurementType,

        paymentTerms: data.paymentTerms,

        narration: data.narration || "",
      });

      setSelectedPR(data.purchaseRequestId);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load RFQ");
    }
  };

  /* =====================================
     PR CHANGE
  ===================================== */

  const handlePRChange = (option) => {
    const pr = prs.find((p) => p._id === option.value);

    setSelectedPR(pr);

    setForm({
      ...form,

      purchaseRequestId: pr._id,
    });
  };

  /* =====================================
     PROCUREMENT ITEMS
  ===================================== */

  const procurementItems = useMemo(() => {
    if (!selectedPR) return [];

    return (
      selectedPR.items?.filter((i) =>
        ["MATERIAL", "SERVICE"].includes(i.itemId?.itemType),
      ) || []
    );
  }, [selectedPR]);

  /* =====================================
     ESTIMATION
  ===================================== */

  const estimatedAmount = useMemo(() => {
    return procurementItems.reduce(
      (sum, i) =>
        sum + (i.pendingQty || 0) * (i.itemId?.defaultPurchaseRate || 0),
      0,
    );
  }, [procurementItems]);

  /* =====================================
     SUBMIT
  ===================================== */

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (!form.purchaseRequestId) {
        return toast.error("Select PR");
      }

      if (!form.suppliers.length) {
        return toast.error("Select suppliers");
      }

      setLoading(true);

      const payload = {
        ...form,
      };

      if (isEdit) {
        await axios.put(`/api/v1/rfq/${editId}`, payload);

        toast.success("RFQ updated");
      } else {
        await axios.post("/api/v1/rfq", payload);

        toast.success("RFQ created");
      }

      onClose();
    } catch (err) {
      console.log(err);
      onClose();
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  /* =====================================
     OPTIONS
  ===================================== */

  const prOptions = prs.map((p) => ({
    label: `${p.prNumber} - ${p.site?.name}`,
    value: p._id,
  }));

  const supplierOptions = suppliers.map((s) => ({
    label: s.name,
    value: s._id,
  }));

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="space-y-5 pb-8">
      {/* HEADER */}

      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="border rounded-xl p-2">
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit RFQ" : "Create RFQ"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Procurement quotation workflow
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* BASIC */}

        <div className="bg-white border rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <FileText size={18} />

            <h2 className="font-semibold text-lg">RFQ Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PR */}

            <div>
              <label className="text-sm font-medium block mb-2">
                Purchase Request
              </label>

              <Select
                options={prOptions}
                value={prOptions.find(
                  (o) => o.value === form.purchaseRequestId,
                )}
                onChange={handlePRChange}
                isDisabled={isEdit}
              />
            </div>

            {/* DEADLINE */}

            <div>
              <label className="text-sm font-medium block mb-2">
                Quotation Deadline
              </label>

              <input
                type="date"
                value={form.quotationDeadline}
                onChange={(e) =>
                  setForm({
                    ...form,

                    quotationDeadline: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* TYPE */}

            <div>
              <label className="text-sm font-medium block mb-2">
                Type
              </label>

              <select
                value={form.procurementType}
                onChange={(e) =>
                  setForm({
                    ...form,

                    procurementType: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              >
                <option value="SITE_PROCUREMENT">Site</option>

                <option value="STORE_PROCUREMENT">Store</option>

                <option value="EMERGENCY_PROCUREMENT">Emergency</option>
              </select>
            </div>

            {/* TERMS */}

            <div>
              <label className="text-sm font-medium block mb-2">
                Payment Terms
              </label>

              <input
                value={form.paymentTerms}
                onChange={(e) =>
                  setForm({
                    ...form,

                    paymentTerms: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* SUPPLIERS */}

        <div className="bg-white border rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Users size={18} />

            <h2 className="font-semibold text-lg">Suppliers</h2>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Select Suppliers
            </label>

            <Select
              isMulti
              options={supplierOptions}
              value={supplierOptions.filter((s) =>
                form.suppliers.includes(s.value),
              )}
              onChange={(selected) =>
                setForm({
                  ...form,

                  suppliers: selected.map((s) => s.value),
                })
              }
            />
          </div>
        </div>

        {/* PROCUREMENT ITEMS */}

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} />

              <h2 className="font-semibold text-lg">Procurement Items</h2>
            </div>

            <div className="text-sm text-gray-500">
              Estimated: ₹{estimatedAmount.toLocaleString()}
            </div>
          </div>

          {!procurementItems.length ? (
            <div className="p-10 text-center text-gray-500">
              No procurement items found
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {procurementItems.map((item, index) => (
                <div key={index} className="border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.itemId?.name}</h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {item.itemId?.categoryId?.name}
                      </p>
                    </div>

                    <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm">
                      {item.unit}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <MiniCard label="Requested" value={item.requestedQty} />

                    <MiniCard label="Pending" value={item.pendingQty} />

                    <MiniCard
                      label="Last Rate"
                      value={`₹${item.itemId?.defaultPurchaseRate || 0}`}
                    />

                    <MiniCard
                      label="Estimated"
                      value={`₹${(
                        (item.pendingQty || 0) *
                        (item.itemId?.defaultPurchaseRate || 0)
                      ).toLocaleString()}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NARRATION */}

        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} />

            <h2 className="font-semibold text-lg">Remarks</h2>
          </div>

          <textarea
            rows={4}
            value={form.narration}
            onChange={(e) =>
              setForm({
                ...form,

                narration: e.target.value,
              })
            }
            placeholder="Additional procurement remarks..."
            className="w-full border rounded-xl px-4 py-3 text-sm"
          />
        </div>

        {/* ACTION */}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-5 py-3 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Save size={16} />

            {loading ? "Saving..." : isEdit ? "Update RFQ" : "Create RFQ"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* =====================================
   HELPERS
===================================== */

const MiniCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-semibold mt-1">{value}</p>
  </div>
);

export default CreateRFQ;
