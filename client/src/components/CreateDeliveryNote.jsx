import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import { Package, Plus, Trash2, Save, Send } from "lucide-react";

axios.defaults.withCredentials = true;

// const CreateDeliveryNote = ({ onClose, editId = null }) => {
//   const isEdit = Boolean(editId);

//   const [loading, setLoading] = useState(false);
//   const [prOptions, setPrOptions] = useState([]);
//   const [selectedPR, setSelectedPR] = useState(null);
//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState({
//     storeId: "",
//     siteId: "",
//   });

//   /* ======================
//      LOAD
//   ====================== */
//   useEffect(() => {
//     if (isEdit) loadDN();
//     else loadPRs();
//   }, []);

//   const loadPRs = async () => {
//     try {
//       const res = await axios.get("/api/v1/purchase-request/open-for-store");
//       setPrOptions(res.data || []);
//     } catch {
//       toast.error("Failed to load PR");
//     }
//   };

//   const loadDN = async () => {
//     try {
//       const { data } = await axios.get(`/api/v1/delivery-note/${editId}`);

//       setSelectedPR(data.purchaseRequestId);

//       setMeta({
//         storeId: data.storeId,
//         siteId: data.siteId,
//       });

//       setItems(
//         data.items.map((i) => ({
//           itemId: i.itemId,
//           name: i.itemId?.name || i.name,
//           unit: i.unit,
//           requestedQty: i.requestedQty,
//           issuedQty: i.issuedQty,
//           prevIssued: i.issuedQty,
//         }))
//       );
//     } catch {
//       toast.error("Failed to load DN");
//     }
//   };

//   /* ======================
//      SELECT PR
//   ====================== */
//   const selectPR = (pr) => {
//     setSelectedPR(pr);

//     setMeta({
//       storeId: pr.store?._id,
//       siteId: pr.site?._id,
//     });

//     const mapped = pr.items.map((i) => ({
//       itemId: i.itemId._id,
//       name: i.itemId.name,
//       unit: i.unit,
//       requestedQty: i.requestedQty,
//       issuedQty: 0,
//       prevIssued: i.issuedQty || 0,
//     }));

//     setItems(mapped);
//   };

//   /* ======================
//      UPDATE QTY
//   ====================== */
//   const updateQty = (index, value) => {
//     const qty = Number(value);
//     const updated = [...items];

//     const maxAllowed =
//       updated[index].requestedQty - (updated[index].prevIssued || 0);

//     updated[index].issuedQty = Math.max(
//       0,
//       Math.min(qty, maxAllowed)
//     );

//     setItems(updated);
//   };

//   /* ======================
//      VALIDATION
//   ====================== */
//   const validate = () => {
//     if (!selectedPR) {
//       toast.error("Select PR");
//       return false;
//     }

//     if (!items.some((i) => i.issuedQty > 0)) {
//       toast.error("Enter quantity");
//       return false;
//     }

//     return true;
//   };

//   /* ======================
//      SAVE
//   ====================== */
//   const saveDN = async () => {
//     if (!validate()) return;

//     const payload = {
//       purchaseRequestId: selectedPR._id,
//       storeId: meta.storeId,
//       siteId: meta.siteId,

//       items: items
//         .filter((i) => i.issuedQty > 0)
//         .map((i) => ({
//           itemId: i.itemId,
//           quantity: i.issuedQty,
//         })),
//     };

//     try {
//       setLoading(true);

//       if (isEdit) {
//         await axios.put(`/api/v1/delivery-note/${editId}`, payload);
//         toast.success("Updated");
//       } else {
//         await axios.post(`/api/v1/delivery-note`, payload);
//         toast.success("Created");
//       }

//       onClose?.();
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ======================
//      UI
//   ====================== */
//   return (
//     <div className="p-3 space-y-4 pb-20">

//       <h2 className="text-lg font-semibold">
//         {isEdit ? "Edit Delivery Note" : "Create Delivery Note"}
//       </h2>

//       {/* PR SELECT */}
//       {!isEdit && (
//         <select
//           className="border p-2 w-full rounded"
//           onChange={(e) => {
//             const pr = prOptions.find((p) => p._id === e.target.value);
//             selectPR(pr);
//           }}
//         >
//           <option value="">Select PR</option>
//           {prOptions.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.prNumber} - {p.site?.name}
//             </option>
//           ))}
//         </select>
//       )}

//       {/* STORE INFO */}
//       {selectedPR && (
//         <div className="text-sm text-gray-600">
//           <p>Store: {selectedPR.store?.name}</p>
//           <p>Site: {selectedPR.site?.name}</p>
//         </div>
//       )}

//       {/* ITEMS */}
//       {items.map((item, i) => {
//         const balance =
//           item.requestedQty - (item.prevIssued || 0);

//         const progress =
//           ((item.prevIssued + item.issuedQty) /
//             item.requestedQty) *
//           100;

//         return (
//           <div key={i} className="border rounded p-3 bg-white">

//             <div className="flex justify-between">
//               <span className="font-medium">{item.name}</span>
//               <span className="text-xs text-gray-500">
//                 {item.unit}
//               </span>
//             </div>

//             <div className="flex justify-between text-xs mt-1">
//               <span>Req: {item.requestedQty}</span>
//               <span>Prev: {item.prevIssued}</span>
//               <span>Bal: {balance}</span>
//             </div>

//             {/* PROGRESS */}
//             <div className="h-2 bg-gray-200 rounded mt-2">
//               <div
//                 className="h-2 bg-green-500 rounded"
//                 style={{ width: `${Math.min(progress, 100)}%` }}
//               />
//             </div>

//             {/* INPUT */}
//             <input
//               type="number"
//               value={item.issuedQty}
//               onChange={(e) =>
//                 updateQty(i, e.target.value)
//               }
//               className="border p-2 w-full mt-2 rounded"
//               placeholder={`Max ${balance}`}
//             />
//           </div>
//         );
//       })}

//       {/* ACTION BUTTON */}
//       {items.length > 0 && (
//         <button
//           onClick={saveDN}
//           disabled={loading}
//           className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-3 rounded-lg shadow"
//         >
//           {loading
//             ? "Processing..."
//             : isEdit
//             ? "Update DN"
//             : "Issue Materials"}
//         </button>
//       )}
//     </div>
//   );
// };

// export default CreateDeliveryNote;

const CreateDeliveryNote = ({ editId, onClose }) => {
  const [loading, setLoading] = useState(false);

  const [prList, setPrList] = useState([]);

  const [selectedPR, setSelectedPR] = useState(null);

  const [form, setForm] = useState({
    purchaseRequestId: "",

    fromStoreId: "",

    toStoreId: "",

    narration: "",

    status: "DRAFT",

    items: [],
  });

  /* =====================================
     LOAD MASTER
  ===================================== */

  useEffect(() => {
    fetchPRs();

    if (editId) {
      fetchDN(editId);
    }
  }, [editId]);

  const fetchPRs = async () => {
    try {
      const res = await axios.get("/api/v1/purchase-request/open-pr");

      setPrList(res.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load PR");
    }
  };

  /* =====================================
     EDIT LOAD
  ===================================== */

  const fetchDN = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/v1/delivery-note/${id}`);

      const dn = res.data.data;

      setSelectedPR(dn.purchaseRequestId);

      setForm({
        purchaseRequestId: dn.purchaseRequestId?._id,

        fromStoreId: dn.fromStoreId?._id,

        toStoreId: dn.toStoreId?._id,

        narration: dn.narration || "",

        status: dn.status,

        items: dn.items.map((i) => ({
          itemId: i.itemId?._id,

          item: i.itemId,

          unit: i.unit,

          requestedQty: i.requestedQty,

          issuedQty: i.issuedQty,

          acceptedQty: i.acceptedQty,

          rejectedQty: i.rejectedQty,

          rejectionReason: i.rejectionReason || "",
        })),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     SELECT PR
  ===================================== */

  const handlePRSelect = (prId) => {
    const pr = prList.find((p) => p._id === prId);

    if (!pr) return;

    setSelectedPR(pr);

    setForm({
      purchaseRequestId: pr._id,

      fromStoreId: pr.store?._id,

      toStoreId: pr.site?._id,

      narration: pr.narration || "",

      status: "DRAFT",

      items: pr.items
        .filter((i) => i.pendingQty > 0)
        .map((i) => ({
          itemId: i.itemId?._id,

          item: i.itemId,

          unit: i.unit,

          requestedQty: i.requestedQty,

          issuedQty: i.pendingQty,

          acceptedQty: 0,

          rejectedQty: 0,

          rejectionReason: "",
        })),
    });
  };

  /* =====================================
     UPDATE ITEM
  ===================================== */

  const updateItem = (index, key, value) => {
    const updated = [...form.items];

    updated[index][key] = value;

    setForm({
      ...form,
      items: updated,
    });
  };

  /* =====================================
     DELETE ITEM
  ===================================== */

  const removeItem = (index) => {
    const updated = form.items.filter((_, i) => i !== index);

    setForm({
      ...form,
      items: updated,
    });
  };

  /* =====================================
     TOTALS
  ===================================== */

  const summary = useMemo(() => {
    return {
      totalItems: form.items.length,

      totalQty: form.items.reduce((a, i) => a + Number(i.issuedQty || 0), 0),
    };
  }, [form]);

  /* =====================================
     VALIDATE
  ===================================== */

  const validate = () => {
    if (!form.purchaseRequestId) {
      toast.error("Select PR");

      return false;
    }

    if (!form.items.length) {
      toast.error("Items required");

      return false;
    }

    for (const item of form.items) {
      if (Number(item.issuedQty) <= 0) {
        toast.error("Issued qty invalid");

        return false;
      }

      if (Number(item.issuedQty) > Number(item.requestedQty)) {
        toast.error("Issued qty exceeds requested");

        return false;
      }
    }

    return true;
  };

  /* =====================================
     SUBMIT DRAFT OR ISSUE
  ===================================== */

  const submit = async (status = "DRAFT") => {
    try {
      if (!validate()) return;

      setLoading(true);

      const payload = {
        ...form,

        status,

        items: form.items.map((i) => ({
          itemId: i.itemId,

          unit: i.unit,

          requestedQty: i.requestedQty,

          issuedQty: Number(i.issuedQty),
        })),
      };

      if (editId) {
        await axios.put(`/api/v1/delivery-note/${editId}`, payload);

        toast.success("DN updated");
      } else {
        await axios.post("/api/v1/delivery-note", payload);

        toast.success("DN created");
      }

      onClose();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {editId ? "Update Delivery Note" : "Create Delivery Note"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Store → Site material transfer
          </p>
        </div>

        <div className="bg-gray-100 px-4 py-2 rounded-xl">
          <p className="text-xs text-gray-500">Status</p>

          <p className="font-semibold text-sm">{form.status}</p>
        </div>
      </div>

      {/* PR */}

      {!editId && (
        <div>
          <label className="text-sm font-medium mb-1 block">
            Purchase Request
          </label>

          <Select
            options={prList.map((p) => ({
              value: p._id,

              label: `${p.prNumber} • ${p.site?.name}`,
            }))}
            onChange={(v) => handlePRSelect(v.value)}
            placeholder="Select PR"
          />
        </div>
      )}

      {/* INFO */}

      {selectedPR && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoCard title="PR No" value={selectedPR.prNumber} />

          <InfoCard title="From Store" value={selectedPR.store?.name} />

          <InfoCard title="To Site" value={selectedPR.site?.name} />

          <InfoCard title="Items" value={summary.totalItems} />
        </div>
      )}

      {/* ITEMS */}

      <div className="space-y-4">
        {form.items.map((item, index) => (
          <div key={index} className="border rounded-2xl p-4 bg-white">
            {/* TOP */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.item?.name}</h3>

                <p className="text-xs text-gray-500 mt-1">
                  {item.item?.categoryId?.name}
                </p>
              </div>

              <button
                onClick={() => removeItem(index)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* BODY */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Field
                label="Requested"
                value={`${item.requestedQty} ${item.unit}`}
                disabled
              />

              <Field
                label="Issue Qty"
                type="number"
                value={item.issuedQty}
                onChange={(e) => updateItem(index, "issuedQty", e.target.value)}
              />

              <Field label="Unit" value={item.unit} disabled />

              <Field
                label="Pending"
                value={item.requestedQty - item.issuedQty}
                disabled
              />
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard title="Total Items" value={summary.totalItems} />

        <SummaryCard title="Total Qty" value={summary.totalQty} />
      </div>

      {/* NARRATION */}

      <div>
        <label className="text-sm font-medium block mb-1">Narration</label>

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
          placeholder="Remarks..."
        />
      </div>

      {/* ACTIONS */}

      <div className="flex flex-wrap justify-end gap-3 pt-4">
        <button
          onClick={() => submit("DRAFT")}
          disabled={loading}
          className="px-5 py-2 rounded-xl border flex items-center gap-2"
        >
          <Save size={16} />
          Save Draft
        </button>

        <button
          onClick={() => submit("ISSUED")}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2"
        >
          <Send size={16} />
          Issue DN
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
      className="w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

export default CreateDeliveryNote;
