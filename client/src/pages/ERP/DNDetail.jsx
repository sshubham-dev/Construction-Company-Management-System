import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/Modal";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Truck,
  Package,
  Building2,
  User2,
  CalendarDays,
  FileText,
  Pencil,
  Printer,
  Send,
  ClipboardCheck,
  Boxes,
} from "lucide-react";
import ReceiveDNModal from "./Components/ReceiveDNModal";

axios.defaults.withCredentials = true;

const DNDetail = () => {
  const navigate = useNavigate();

  const { id, mode } = useParams();

  const isERP = mode === "erp";
  const isSite = mode === "site";

  const [loading, setLoading] = useState(true);

  const [dn, setDN] = useState(null);
  const [receiveModal, setReceiveModal] = useState(false);
  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    if (id) {
      fetchDN();
    }
  }, [id]);

  const fetchDN = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/v1/delivery-note/${id}`);

      setDN(res.data.data);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load DN");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     ISSUE
  ===================================== */

  const issueDN = async () => {
    try {
      await axios.put(`/api/v1/delivery-note/issue/${id}`);

      toast.success("DN issued successfully");

      fetchDN();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Failed");
    }
  };

  /* =====================================
     STATUS STYLE
  ===================================== */

  const statusStyle = useMemo(() => {
    switch (dn?.status) {
      case "DRAFT":
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: <Clock3 size={16} />,
        };

      case "ISSUED":
        return {
          bg: "bg-blue-100 text-blue-700",

          icon: <Truck size={16} />,
        };

      case "RECEIVED":
        return {
          bg: "bg-yellow-100 text-yellow-700",

          icon: <Package size={16} />,
        };

      case "VERIFIED":
        return {
          bg: "bg-green-100 text-green-700",

          icon: <CheckCircle2 size={16} />,
        };

      case "MISMATCH":
        return {
          bg: "bg-red-100 text-red-700",

          icon: <AlertTriangle size={16} />,
        };

      default:
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: null,
        };
    }
  }, [dn]);

  /* =====================================
     SUMMARY
  ===================================== */

  const summary = useMemo(() => {
    if (!dn) return {};

    return {
      totalItems: dn.items?.length || 0,

      totalIssued: dn.items?.reduce((a, i) => a + Number(i.issuedQty || 0), 0),

      totalAccepted: dn.items?.reduce(
        (a, i) => a + Number(i.acceptedQty || 0),
        0,
      ),

      totalRejected: dn.items?.reduce(
        (a, i) => a + Number(i.rejectedQty || 0),
        0,
      ),
    };
  }, [dn]);

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!dn) {
    return <div className="p-6">DN not found</div>;
  }

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="p-4 md:p-6 pb-24 space-y-5">
      {/* TOP BAR */}

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
              <h1 className="text-2xl font-bold">{dn.dnNo}</h1>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusStyle.bg}`}
              >
                {statusStyle.icon}

                {dn.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Linked PR: {dn.purchaseRequestId?.prNumber}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">
          {/* EDIT */}

          {isERP && dn.status === "DRAFT" && (
            <button
              onClick={() => navigate(`/erp/delivery-note/edit/${dn._id}`)}
              className="border px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Pencil size={15} />
              Edit
            </button>
          )}

          {/* ISSUE */}

          {dn.status === "DRAFT" && (
            <button
              onClick={issueDN}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Send size={15} />
              Issue DN
            </button>
          )}

          {/* RECEIVE */}

          {isSite && dn.status === "ISSUED" && (
            <button
              onClick={() => setReceiveModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <Package size={15} />
              Receive
            </button>
          )}

          {/* VERIFY */}

          {isERP && (dn.status === "RECEIVED" || dn.status === "MISMATCH") && (
            <button
              onClick={() => navigate(`/erp/delivery-note/${dn._id}/verify`)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <ClipboardCheck size={15} />
              Verify
            </button>
          )}

          {/* PDF */}

          <button className="border px-4 py-2 rounded-xl text-sm flex items-center gap-2">
            <Printer size={15} />
            Print
          </button>
        </div>
      </div>

      {/* FLOW */}

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* FROM */}

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building2 size={20} className="text-blue-700" />
            </div>

            <div>
              <p className="text-xs text-gray-500">From Store</p>

              <h3 className="font-semibold mt-1">{dn.fromStoreId?.name}</h3>

              <p className="text-xs text-gray-500 mt-1">Material Dispatch</p>
            </div>
          </div>

          {/* ARROW */}

          <div className="hidden md:flex justify-center">
            <Truck size={28} className="text-gray-400" />
          </div>

          {/* TO */}

          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <Package size={20} className="text-green-700" />
            </div>

            <div>
              <p className="text-xs text-gray-500">To Site</p>

              <h3 className="font-semibold mt-1">{dn.toStoreId?.name}</h3>

              <p className="text-xs text-gray-500 mt-1">Material Receipt</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard title="Items" value={summary.totalItems} />

        <SummaryCard title="Issued" value={summary.totalIssued} />

        <SummaryCard title="Accepted" value={summary.totalAccepted} />

        <SummaryCard title="Rejected" value={summary.totalRejected} />
      </div>

      {/* TIMELINE */}

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold text-lg mb-5">DN Timeline</h2>

        <div className="space-y-5">
          {/* CREATED */}

          <TimelineItem
            icon={<FileText size={16} />}
            title="DN Created"
            user={dn.createdBy?.name}
            date={dn.createdAt}
          />

          {/* ISSUED */}

          {dn.status !== "DRAFT" && (
            <TimelineItem
              icon={<Truck size={16} />}
              title="Material Issued"
              user={dn.issuedBy?.name}
              date={dn.issueDate}
            />
          )}

          {/* RECEIVED */}

          {(dn.status === "RECEIVED" ||
            dn.status === "VERIFIED" ||
            dn.status === "MISMATCH") && (
            <TimelineItem
              icon={<Package size={16} />}
              title="Material Received"
              user={dn.receivedBy?.name}
              date={dn.receivedDate}
            />
          )}

          {/* VERIFIED */}

          {(dn.status === "VERIFIED" || dn.status === "MISMATCH") && (
            <TimelineItem
              icon={
                dn.status === "VERIFIED" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )
              }
              title={
                dn.status === "VERIFIED"
                  ? "Verification Completed"
                  : "Mismatch Found"
              }
              user={dn.receivedBy?.name}
              date={dn.updatedAt}
            />
          )}
        </div>
      </div>

      {/* ITEMS */}

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-lg">Material Items</h2>
        </div>

        <div>
          {dn.items.map((item, index) => (
            <div key={index} className=" p-4 bg-white">
              {/* HEADER */}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.itemId?.name}</h3>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.itemId?.categoryId?.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Unit</p>

                  <p className="font-medium">{item.unit}</p>
                </div>
              </div>

              {/* BODY */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MiniMetric label="Requested" value={item.requestedQty} />

                <MiniMetric label="Issued" value={item.issuedQty} />

                <MiniMetric
                  label="Accepted"
                  value={item.acceptedQty}
                  color="text-green-600"
                />

                <MiniMetric
                  label="Rejected"
                  value={item.rejectedQty}
                  color="text-red-600"
                />
              </div>

              {/* REASON */}

              {item.rejectionReason && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs text-red-500">Rejection Reason</p>

                  <p className="text-sm text-red-700 mt-1">
                    {item.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* INFO */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INFO */}

        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-lg">Transfer Information</h2>

          <InfoRow
            icon={<CalendarDays size={15} />}
            label="Issue Date"
            value={moment(dn.issueDate).format("DD MMM YYYY")}
          />

          <InfoRow
            icon={<User2 size={15} />}
            label="Issued By"
            value={dn.issuedBy?.userName || "-"}
          />

          <InfoRow
            icon={<Boxes size={15} />}
            label="Delivery Status"
            value={dn.status}
          />

          <InfoRow
            icon={<Package size={15} />}
            label="Received By"
            value={dn.receivedBy?.name || "-"}
          />
        </div>

        {/* NARRATION */}

        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-4">Narration</h2>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 min-h-[120px] whitespace-pre-wrap">
            {dn.narration || "No remarks added"}
          </div>
        </div>
      </div>

      {/* ATTACHMENTS */}

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Attachments</h2>

          <button className="border px-3 py-2 rounded-xl text-sm">
            Upload
          </button>
        </div>

        {!dn.attachments?.length ? (
          <div className="text-sm text-gray-500 mt-5">No attachments</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {dn.attachments.map((a, i) => (
              <a
                key={i}
                href={a.public_url || a.url}
                target="_blank"
                rel="noreferrer"
                className="border rounded-xl p-4 text-sm hover:bg-gray-50"
              >
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>

      <Modal onClose={() => setReceiveModal(false)} isOpen={receiveModal}>
        <ReceiveDNModal onClose={() => setReceiveModal(false)} dn={dn}/>
      </Modal>
    </div>
  );
};

/* =====================================
   HELPERS
===================================== */

const SummaryCard = ({ title, value }) => (
  <div className="bg-white border rounded-2xl p-4">
    <p className="text-xs text-gray-500">{title}</p>

    <h2 className="text-2xl font-bold mt-1">{value}</h2>
  </div>
);

const TimelineItem = ({ icon, title, user, date }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
      {icon}
    </div>

    <div>
      <p className="font-medium">{title}</p>

      <p className="text-sm text-gray-500 mt-1">{user || "-"}</p>

      <p className="text-xs text-gray-400 mt-1">
        {moment(date).format("DD MMM YYYY hh:mm A")}
      </p>
    </div>
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

const MiniMetric = ({ label, value, color = "" }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className={`font-semibold mt-1 ${color}`}>{value}</p>
  </div>
);
export default DNDetail;
