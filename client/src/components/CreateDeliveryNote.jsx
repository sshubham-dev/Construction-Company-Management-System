import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CreateDeliveryNote = ({ onClose, editId = null }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);
  const [prOptions, setPrOptions] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    storeId: "",
    siteId: "",
  });

  /* ======================
     LOAD
  ====================== */
  useEffect(() => {
    if (isEdit) loadDN();
    else loadPRs();
  }, []);

  const loadPRs = async () => {
    try {
      const res = await axios.get("/api/v1/purchase-request/open-for-store");
      setPrOptions(res.data || []);
    } catch {
      toast.error("Failed to load PR");
    }
  };

  const loadDN = async () => {
    try {
      const { data } = await axios.get(`/api/v1/delivery-note/${editId}`);

      setSelectedPR(data.purchaseRequestId);

      setMeta({
        storeId: data.storeId,
        siteId: data.siteId,
      });

      setItems(
        data.items.map((i) => ({
          itemId: i.itemId,
          name: i.itemId?.name || i.name,
          unit: i.unit,
          requestedQty: i.requestedQty,
          issuedQty: i.issuedQty,
          prevIssued: i.issuedQty,
        }))
      );
    } catch {
      toast.error("Failed to load DN");
    }
  };

  /* ======================
     SELECT PR
  ====================== */
  const selectPR = (pr) => {
    setSelectedPR(pr);

    setMeta({
      storeId: pr.store?._id,
      siteId: pr.site?._id,
    });

    const mapped = pr.items.map((i) => ({
      itemId: i.itemId._id,
      name: i.itemId.name,
      unit: i.unit,
      requestedQty: i.requestedQty,
      issuedQty: 0,
      prevIssued: i.issuedQty || 0,
    }));

    setItems(mapped);
  };

  /* ======================
     UPDATE QTY
  ====================== */
  const updateQty = (index, value) => {
    const qty = Number(value);
    const updated = [...items];

    const maxAllowed =
      updated[index].requestedQty - (updated[index].prevIssued || 0);

    updated[index].issuedQty = Math.max(
      0,
      Math.min(qty, maxAllowed)
    );

    setItems(updated);
  };

  /* ======================
     VALIDATION
  ====================== */
  const validate = () => {
    if (!selectedPR) {
      toast.error("Select PR");
      return false;
    }

    if (!items.some((i) => i.issuedQty > 0)) {
      toast.error("Enter quantity");
      return false;
    }

    return true;
  };

  /* ======================
     SAVE
  ====================== */
  const saveDN = async () => {
    if (!validate()) return;

    const payload = {
      purchaseRequestId: selectedPR._id,
      storeId: meta.storeId,
      siteId: meta.siteId,

      items: items
        .filter((i) => i.issuedQty > 0)
        .map((i) => ({
          itemId: i.itemId,
          quantity: i.issuedQty,
        })),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`/api/v1/delivery-note/${editId}`, payload);
        toast.success("Updated");
      } else {
        await axios.post(`/api/v1/delivery-note`, payload);
        toast.success("Created");
      }

      onClose?.();
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
    <div className="p-3 space-y-4 pb-20">

      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit Delivery Note" : "Create Delivery Note"}
      </h2>

      {/* PR SELECT */}
      {!isEdit && (
        <select
          className="border p-2 w-full rounded"
          onChange={(e) => {
            const pr = prOptions.find((p) => p._id === e.target.value);
            selectPR(pr);
          }}
        >
          <option value="">Select PR</option>
          {prOptions.map((p) => (
            <option key={p._id} value={p._id}>
              {p.prNumber} - {p.site?.name}
            </option>
          ))}
        </select>
      )}

      {/* STORE INFO */}
      {selectedPR && (
        <div className="text-sm text-gray-600">
          <p>Store: {selectedPR.store?.name}</p>
          <p>Site: {selectedPR.site?.name}</p>
        </div>
      )}

      {/* ITEMS */}
      {items.map((item, i) => {
        const balance =
          item.requestedQty - (item.prevIssued || 0);

        const progress =
          ((item.prevIssued + item.issuedQty) /
            item.requestedQty) *
          100;

        return (
          <div key={i} className="border rounded p-3 bg-white">

            <div className="flex justify-between">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-gray-500">
                {item.unit}
              </span>
            </div>

            <div className="flex justify-between text-xs mt-1">
              <span>Req: {item.requestedQty}</span>
              <span>Prev: {item.prevIssued}</span>
              <span>Bal: {balance}</span>
            </div>

            {/* PROGRESS */}
            <div className="h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* INPUT */}
            <input
              type="number"
              value={item.issuedQty}
              onChange={(e) =>
                updateQty(i, e.target.value)
              }
              className="border p-2 w-full mt-2 rounded"
              placeholder={`Max ${balance}`}
            />
          </div>
        );
      })}

      {/* ACTION BUTTON */}
      {items.length > 0 && (
        <button
          onClick={saveDN}
          disabled={loading}
          className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-3 rounded-lg shadow"
        >
          {loading
            ? "Processing..."
            : isEdit
            ? "Update DN"
            : "Issue Materials"}
        </button>
      )}
    </div>
  );
};

export default CreateDeliveryNote;


const deliveryItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  unit: {
    type: String,
    required: true,
  },

  requestedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  issuedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  acceptedQty: {
    type: Number,
    default: 0,
    min: 0,
  },

  rejectedQty: {
    type: Number,
    default: 0,
    min: 0,
  },

  rejectionReason: String,
});

deliveryItemSchema.pre("validate", function (next) {
  if (this.acceptedQty + this.rejectedQty !== this.issuedQty) {
    return next(new Error("Accepted + Rejected must equal Issued"));
  }

  if (this.acceptedQty > this.issuedQty) {
    return next(new Error("Accepted cannot exceed issued"));
  }

  next();
});

const deliveryNoteSchema = new mongoose.Schema(
  {
    dnNo: {
      type: String,
      unique: true,
      index: true,
    },

    /* =========================
       SOURCE
    ========================== */
    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* =========================
       DESTINATION
    ========================== */
    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // destination: {
    //   id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     refPath: "deliveryTo",
    //   },
    //   deliveryTo: {
    //     type: String,
    //     enum: ["Site", "Client"],
    //     required: true,
    //   },
    // },

    /* =========================
       LINKED PR (optional)
    ========================== */
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    /* =========================
       ACTORS
    ========================== */
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       ITEMS
    ========================== */
    items: [deliveryItemSchema],

    /* =========================
       DATES
    ========================== */
    issueDate: {
      type: Date,
      default: Date.now,
    },

    receivedDate: Date,

    /* =========================
       STATUS
    ========================== */
    status: {
      type: String,
      enum: [
        "DRAFT",
        "ISSUED",
        "RECEIVED",
        "VERIFIED", // ✅ remove space
        "MISMATCH",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    /* =========================
       ATTACHMENTS
    ========================== */
    attachments: [
      {
        url: String,
        public_url: String,
      },
    ],

    narration: String,
  },
  { timestamps: true },
);

deliveryNoteSchema.index({ fromStoreId: 1, toStoreId: 1 });
deliveryNoteSchema.virtual("statusAuto").get(function () {
  const totalIssued = this.items.reduce((a, i) => a + i.issuedQty, 0);

  const totalProcessed = this.items.reduce(
    (a, i) => a + i.acceptedQty + i.rejectedQty,
    0
  );

  if (totalProcessed === 0) return "ISSUED";
  if (totalProcessed < totalIssued) return "MISMATCH";
  return "VERIFIED";
});


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


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import CreateDeliveryNote from "../../components/CreateDeliveryNote";
import ConfirmDeliveryNote from "../../components/ConfirmDeliveryNote";
import { useSelector } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast from "react-hot-toast";

const DeliveryNote = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchDN();
  }, []);

  const fetchDN = async () => {
    try {
      const res = await axios.get("/api/v1/delivery-note");
      setData(res.data || []);
    } catch {
      toast.error("Failed to load DN");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((d) => {
    return (
      d.dnNumber?.toLowerCase().includes(search.toLowerCase()) &&
      (status ? d.status === status : true)
    );
  });

  const statusColor = (s) => {
    switch (s) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";
      case "ISSUED":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-3 space-y-4 pb-24">

      {/* FILTER */}
      <div className="flex gap-2">
        <input
          placeholder="Search DN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="ISSUED">Issued</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        filtered.map((d) => (
          <div
            key={d._id}
            onClick={() => navigate(`/erp/dn/${d._id}`)}
            className="border rounded-lg p-3 bg-white shadow-sm space-y-2 cursor-pointer"
          >
            <div className="flex justify-between">
              <span className="font-medium">{d.dnNumber}</span>

              <span className={`text-xs px-2 py-1 rounded ${statusColor(d.status)}`}>
                {d.status}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              {d.store?.name} → {d.site?.name}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{moment(d.date).format("DD MMM")}</span>
              <span>{d.items?.length} items</span>
            </div>
          </div>
        ))
      )}

      {/* FLOAT BTN */}
      <button
        onClick={() => navigate("/erp/dn/create")}
        className="fixed bottom-5 right-5 bg-green-600 text-white w-14 h-14 rounded-full text-xl shadow-lg"
      >
        +
      </button>
    </div>
  );
};

export default DeliveryNote;
