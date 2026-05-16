import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import toast from "react-hot-toast";

import { CheckCircle2, AlertTriangle, Package } from "lucide-react";

axios.defaults.withCredentials = true;

const ReceiveDNModal = ({ dn, onClose }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    narration: "",

    items: [],
  });

  /* =====================================
     LOAD DN
  ===================================== */

  useEffect(() => {
    if (!dn) return;

    setForm({
      narration: dn.narration || "",

      items: dn.items.map((i) => ({
        _id: i._id,

        itemId: i.itemId?._id,

        item: i.itemId,

        unit: i.unit,

        issuedQty: i.issuedQty,

        acceptedQty: i.issuedQty,

        rejectedQty: 0,

        rejectionReason: "",
      })),
    });
  }, [dn]);

  /* =====================================
     UPDATE ITEM
  ===================================== */

  const updateItem = (index, key, value) => {
    const updated = [...form.items];

    updated[index][key] = value;

    /* =========================
         AUTO REJECT CALC
      ========================== */

    if (key === "acceptedQty") {
      const accepted = Number(value || 0);

      const issued = Number(updated[index].issuedQty || 0);

      updated[index].rejectedQty = issued - accepted;
    }

    setForm({
      ...form,
      items: updated,
    });
  };

  /* =====================================
     VALIDATE
  ===================================== */

  const validate = () => {
    for (const item of form.items) {
      const accepted = Number(item.acceptedQty || 0);

      const rejected = Number(item.rejectedQty || 0);

      const issued = Number(item.issuedQty || 0);

      if (accepted < 0) {
        toast.error("Accepted qty invalid");

        return false;
      }

      if (accepted > issued) {
        toast.error("Accepted qty exceeds issued qty");

        return false;
      }

      if (accepted + rejected !== issued) {
        toast.error("Accepted + rejected must equal issued");

        return false;
      }

      if (rejected > 0 && !item.rejectionReason) {
        toast.error("Rejection reason required");

        return false;
      }
    }

    return true;
  };

  /* =====================================
     SUBMIT
  ===================================== */

  const submit = async () => {
    try {
      if (!validate()) return;

      setLoading(true);

      await axios.put(`/api/v1/delivery-note/receive/${dn._id}`, {
        narration: form.narration,

        items: form.items.map((i) => ({
          _id: i._id,

          acceptedQty: Number(i.acceptedQty),

          rejectedQty: Number(i.rejectedQty),

          rejectionReason: i.rejectionReason,
        })),
      });

      toast.success("Material received successfully");

      onClose();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     SUMMARY
  ===================================== */

  const summary = useMemo(() => {
    return {
      totalIssued: form.items.reduce((a, i) => a + Number(i.issuedQty || 0), 0),

      totalAccepted: form.items.reduce(
        (a, i) => a + Number(i.acceptedQty || 0),
        0,
      ),

      totalRejected: form.items.reduce(
        (a, i) => a + Number(i.rejectedQty || 0),
        0,
      ),
    };
  }, [form]);

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div>
        <h2 className="text-2xl font-bold">Receive Material</h2>

        <p className="text-sm text-gray-500 mt-1">
          Verify received material quantities
        </p>
      </div>

      {/* DN INFO */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard title="DN No" value={dn.dnNo} />

        <InfoCard title="PR" value={dn.purchaseRequestId?.prNumber} />

        <InfoCard title="From" value={dn.fromStoreId?.name} />

        <InfoCard title="Items" value={dn.items?.length} />
      </div>

      {/* ITEMS */}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {form.items.map((item, index) => (
          <div key={index} className="border rounded-2xl p-4 bg-white">
            {/* HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.item?.name}</h3>

                <p className="text-xs text-gray-500 mt-1">
                  {item.item?.categoryId?.name}
                </p>
              </div>

              <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm">
                {item.unit}
              </div>
            </div>

            {/* BODY */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              {/* ISSUED */}

              <Field label="Issued Qty" value={item.issuedQty} disabled />

              {/* ACCEPTED */}

              <Field
                label="Accepted Qty"
                type="number"
                value={item.acceptedQty}
                onChange={(e) =>
                  updateItem(index, "acceptedQty", e.target.value)
                }
              />

              {/* REJECTED */}

              <Field label="Rejected Qty" value={item.rejectedQty} disabled />
            </div>

            {/* REASON */}

            {Number(item.rejectedQty) > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium block mb-2 text-red-600">
                  Rejection Reason
                </label>

                <textarea
                  rows={3}
                  value={item.rejectionReason}
                  onChange={(e) =>
                    updateItem(index, "rejectionReason", e.target.value)
                  }
                  className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Explain damage / shortage / issue..."
                />
              </div>
            )}

            {/* STATUS */}

            <div className="mt-4">
              {Number(item.rejectedQty) > 0 ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                  <AlertTriangle size={16} />
                  Material mismatch detected
                </div>
              ) : (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 size={16} />
                  Material accepted successfully
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard title="Issued" value={summary.totalIssued} />

        <SummaryCard title="Accepted" value={summary.totalAccepted} />

        <SummaryCard title="Rejected" value={summary.totalRejected} />
      </div>

      {/* NARRATION */}

      <div>
        <label className="text-sm font-medium block mb-2">Remarks</label>

        <textarea
          rows={4}
          value={form.narration}
          onChange={(e) =>
            setForm({
              ...form,
              narration: e.target.value,
            })
          }
          className="w-full border rounded-xl px-4 py-3 text-sm"
          placeholder="Additional remarks..."
        />
      </div>

      {/* ACTION */}

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="border px-5 py-2 rounded-xl">
          Cancel
        </button>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-green-600 text-white px-5 py-2 rounded-xl flex items-center gap-2"
        >
          <Package size={16} />
          Confirm Receive
        </button>
      </div>
    </div>
  );
};

/* =====================================
   HELPERS
===================================== */

const InfoCard = ({ title, value }) => (
  <div className="border rounded-xl p-4 bg-gray-50">
    <p className="text-xs text-gray-500">{title}</p>

    <p className="font-semibold mt-1">{value}</p>
  </div>
);

const SummaryCard = ({ title, value }) => (
  <div className="bg-gray-100 rounded-xl p-4">
    <p className="text-xs text-gray-500">{title}</p>

    <h2 className="text-2xl font-bold mt-1">{value}</h2>
  </div>
);

const Field = ({ label, disabled, ...props }) => (
  <div>
    <label className="text-xs text-gray-500 block mb-1">{label}</label>

    <input
      {...props}
      disabled={disabled}
      className="w-full border rounded-xl px-4 py-3 text-sm"
    />
  </div>
);

export default ReceiveDNModal;
