import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Send,
  XCircle,
  FileBarChart2,
  ShoppingCart,
  Building2,
  Package,
  Users,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Clock3,
  IndianRupee,
  FileText,
  Eye,
  Mail,
} from "lucide-react";
import Modal from "../../components/Modal";
import CreateRFQ from "./Components/CreateRFQ";

axios.defaults.withCredentials = true;

const RFQDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [rfq, setRFQ] = useState(null);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    fetchRFQ();
  }, [id]);

  const fetchRFQ = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/v1/rfq/${id}`);
      console.log(res.data.data);
      setRFQ(res.data.data);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     ACTIONS
  ===================================== */

  const sendRFQ = async () => {
    try {
      const res = await axios.put(`/api/v1/rfq/send/${id}`);

      toast.success("RFQ sent successfully");

      fetchRFQ();

      /* =========================
       SHOW SHARE LINKS
    ========================== */

      console.log(res.data.data.suppliers);
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const closeRFQ = async () => {
    try {
      await axios.post(`/api/v1/rfq/close/${id}`);

      toast.success("RFQ closed");

      fetchRFQ();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    setModal(true);
  };

  /* =====================================
     STATUS STYLE
  ===================================== */

  const statusStyle = useMemo(() => {
    switch (rfq?.status) {
      case "DRAFT":
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: <Clock3 size={15} />,
        };

      case "SENT":
        return {
          bg: "bg-blue-100 text-blue-700",

          icon: <Send size={15} />,
        };

      case "CLOSED":
        return {
          bg: "bg-green-100 text-green-700",

          icon: <CheckCircle2 size={15} />,
        };

      default:
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: null,
        };
    }
  }, [rfq]);

  /* =====================================
     KPI
  ===================================== */

  const stats = useMemo(() => {
    if (!rfq) return {};

    return {
      items: rfq.items?.length || 0,

      suppliers: rfq.suppliers?.length || 0,

      quotations: rfq.quotations?.length || 0,

      estimated: rfq.estimatedAmount || 0,
    };
  }, [rfq]);

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!rfq) {
    return <div className="p-6">RFQ not found</div>;
  }

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="p-4 md:p-6 space-y-5 pb-24">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* LEFT */}

        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border rounded-xl p-2 mt-1"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{rfq.rfqNo}</h1>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusStyle.bg}`}
              >
                {statusStyle.icon}

                {rfq.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              PR: {rfq.purchaseRequestId?.prNumber}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">
          {/* EDIT */}

          {rfq.status === "DRAFT" && (
            <button
              onClick={() => handleEdit(rfq._id)}
              className="border px-4 py-2 rounded-xl text-sm"
            >
              Edit
            </button>
          )}

          {/* SEND */}

          {rfq.status === "DRAFT" && (
            <button
              onClick={sendRFQ}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Send size={15} />
              Send RFQ
            </button>
          )}

          {/* CLOSE */}

          {rfq.status === "SENT" && (
            <button
              onClick={closeRFQ}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <XCircle size={15} />
              Close RFQ
            </button>
          )}

          {/* COMPARE */}

          <button
            onClick={() =>
              navigate(`/erp/procurement/rfq/${rfq._id}/comparison`)
            }
            className="border px-4 py-2 rounded-xl text-sm flex items-center gap-2"
          >
            <FileBarChart2 size={15} />
            Compare
          </button>

          {/* CREATE PO */}

          {/* {rfq.status === "CLOSED" && (
            <button
              onClick={() =>
                navigate(`/erp/procurement/po/create?rfq=${rfq._id}`)
              }
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <ShoppingCart size={15} />
              Create PO
            </button>
          )} */}
        </div>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI title="Items" value={stats.items} />

        <KPI title="Suppliers" value={stats.suppliers} />

        <KPI title="Quotations" value={stats.quotations} />

        <KPI
          title="Estimated"
          value={`₹${stats.estimated?.toLocaleString()}`}
        />
      </div>

      {/* SUMMARY */}

      <div className="bg-white border rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <InfoRow
            icon={<Building2 size={16} />}
            label="Store"
            value={rfq.storeId?.name}
          />

          <InfoRow
            icon={<CalendarDays size={16} />}
            label="Deadline"
            value={
              rfq.quotationDeadline
                ? moment(rfq.quotationDeadline).format("DD MMM YYYY")
                : "-"
            }
          />

          <InfoRow
            icon={<ClipboardList size={16} />}
            label="Procurement Type"
            value={rfq.procurementType?.replaceAll("_", " ") || "-"}
          />
        </div>
      </div>

      {/* PROCUREMENT ITEMS */}

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2">
          <Package size={18} />

          <h2 className="font-semibold text-lg">Procurement Items</h2>
        </div>

        <div className="space-y-4 p-4">
          {rfq.items.map((item, index) => (
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
                <MiniCard label="Qty" value={item.quantity} />

                <MiniCard
                  label="Last Rate"
                  value={`₹${item.lastPurchaseRate || 0}`}
                />

                <MiniCard
                  label="Estimated"
                  value={`₹${(
                    (item.quantity || 0) * (item.lastPurchaseRate || 0)
                  ).toLocaleString()}`}
                />

                <MiniCard label="Remarks" value={item.remarks || "-"} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUPPLIERS */}

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2">
          <Users size={18} />

          <h2 className="font-semibold text-lg">Suppliers</h2>
        </div>

        <div className="space-y-4 p-4">
          {rfq.suppliers.map((supplier, index) => {
            const quotation = rfq.quotations?.find(
              (q) => q.supplierId === supplier.supplierId?._id,
            );
            // console.log(supplier);

            return (
              <div key={index} className="border rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* LEFT */}

                  <div>
                    <h3 className="font-semibold">
                      {supplier.supplierId?.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Token Expires:{" "}
                      {moment(supplier.expiresAt).format("DD MMM YYYY")}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div className="flex items-center px-3 gap-3 flex-wrap">
                    {quotation ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        Quotation Submitted
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        Pending
                      </span>
                    )}

                    <div className="flex flex-wrap gap-3 ">
                      {/* COPY LINK */}

                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/vendor/rfq/${supplier.accessToken}`;

                          navigator.clipboard.writeText(link);

                          toast.success("RFQ link copied");
                        }}
                        className="border px-3 py-1 rounded-xl text-sm"
                      >
                        Copy Link
                      </button>

                      {/* COPY MESSAGE */}

                      <button
                        onClick={() => {
                          const message = `Hello ${supplier.supplierId?.name},

You are invited to submit quotation for RFQ ${rfq.rfqNo}.

Please submit quotation using the link below:

${window.location.origin}/vendor/rfq/${supplier.accessToken}

Regards,
Bhuvi Procurement Team`;

                          navigator.clipboard.writeText(message);

                          toast.success("Message copied");
                        }}
                        className="border px-3 py-1 rounded-xl text-sm"
                      >
                        Copy Message
                      </button>

                      {/* WHATSAPP */}

                      <a
                        href={`https://wa.me/91${supplier.supplierId?.mailingDetails?.phone}?text=${encodeURIComponent(
                          `Hello ${supplier.supplierId?.name},

You are invited to submit quotation for RFQ ${rfq.rfqNo}.

Please submit quotation using the link below:

${window.location.origin}/vendor/rfq/${supplier.accessToken}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-600 text-white px-3 py-1 rounded-xl text-sm flex items-center gap-2"
                      >
                        <Mail size={14} /> Whatsapp
                      </a>
                    </div>
                  </div>
                </div>

                {/* QUOTATION */}

                {quotation && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <MiniCard
                      label="Total Amount"
                      value={`₹${quotation.totalAmount?.toLocaleString()}`}
                    />

                    <MiniCard label="Status" value={quotation.status} />

                    <MiniCard
                      label="Submitted"
                      value={moment(quotation.createdAt).format("DD MMM YYYY")}
                    />

                    <MiniCard label="Items" value={quotation.items?.length} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* NARRATION */}

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} />

          <h2 className="font-semibold text-lg">Remarks</h2>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm whitespace-pre-wrap min-h-[120px]">
          {rfq.narration || "No remarks"}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <CreateRFQ editId={editId} onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
};

/* =====================================
   HELPERS
===================================== */

const KPI = ({ title, value }) => (
  <div className="bg-white border rounded-2xl p-4">
    <p className="text-xs text-gray-500">{title}</p>

    <h2 className="text-2xl font-bold mt-1">{value}</h2>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-500 mt-1">{icon}</div>

    <div>
      <p className="text-xs text-gray-500">{label}</p>

      <p className="font-medium mt-1">{value}</p>
    </div>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-medium mt-1">{value}</p>
  </div>
);

export default RFQDetail;
