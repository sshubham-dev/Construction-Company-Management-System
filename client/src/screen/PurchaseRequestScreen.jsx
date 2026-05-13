import React, { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import moment from "moment";
import axios from "axios";

import toast from "react-hot-toast";

import { MdAdd, MdDelete, MdDownload } from "react-icons/md";

import { GrEdit } from "react-icons/gr";

import {
  ArrowLeft,
  Boxes,
  ClipboardList,
  Package,
  Truck,
  CircleAlert,
} from "lucide-react";

import { PDFDownloadLink } from "@react-pdf/renderer";

import Header from "../components/Header";
import Modal from "../components/Modal";

import CreatePurchaseRequest from "../components/CreatePurchaseRequest";

import Reject from "../components/UI/Reject";

import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";

import PurchaseRequestPdf from "../pdf/PurchaseRequestPdf";

axios.defaults.withCredentials = true;

const MODE = {
  SITE: "SITE",
  ERP: "ERP",
};

const PurchaseRequestScreen = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { id, approvalId, mode } = useParams();

  const [PurchaseRequest, setPurchaseRequest] = useState({});

  const [loading, setLoading] = useState(true);

  const [stockMap, setStockMap] = useState({});

  const [rejectModal, setRejectModal] = useState(false);

  const [rejectId, setRejectId] = useState("");

  const [addModal, setAddModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [editId, setEditId] = useState("");

  const [editItemId, setEditItemId] = useState("");

  /* ========================================
     FLAGS
  ======================================== */

  const isSiteMode = mode === MODE.SITE;

  const isERPMode = mode === MODE.ERP;

  const isApprovalPage = location.pathname.includes("/approval/");

  const editable =
    PurchaseRequest?.status === "DRAFT" ||
    PurchaseRequest?.status === "REQUESTED";

  /* ========================================
     FETCH
  ======================================== */

  useEffect(() => {
    if (id) {
      getPurchaseRequest(id);
    }
  }, [id]);

  const getPurchaseRequest = async (id) => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/v1/purchase-request/${id}`);

      const pr = res.data;

      setPurchaseRequest(pr);

      if (isERPMode) {
        await loadStock(pr.items || [], pr.store?._id || pr.store);
      }
    } catch (error) {
      console.log(error);

      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ========================================
     STOCK
  ======================================== */

  const loadStock = async (items, storeId) => {
    try {
      const map = {};

      await Promise.all(
        items.map(async (item) => {
          try {
            const res = await axios.get("/api/v1/stock-item", {
              params: {
                itemId: item.itemId?._id || item.itemId,

                storeId,
              },
            });

            map[item.itemId?._id] = res.data.data?.[0] || null;
          } catch {
            map[item.itemId?._id] = null;
          }
        }),
      );

      setStockMap(map);
    } catch (err) {
      console.log(err);
    }
  };

  /* ========================================
     SUMMARY
  ======================================== */

  const summary = useMemo(() => {
    return {
      totalItems: PurchaseRequest.items?.length || 0,

      requestedQty:
        PurchaseRequest.items?.reduce(
          (a, i) => a + Number(i.requestedQty || 0),
          0,
        ) || 0,

      issuedQty:
        PurchaseRequest.items?.reduce(
          (a, i) => a + Number(i.issuedQty || 0),
          0,
        ) || 0,

      pendingQty:
        PurchaseRequest.items?.reduce(
          (a, i) => a + Number(i.pendingQty || 0),
          0,
        ) || 0,
    };
  }, [PurchaseRequest]);

  /* ========================================
     CRUD
  ======================================== */

  const handleAdd = () => {
    setAddModal(true);

    setEditId(PurchaseRequest._id);
  };

  const handleEdit = (itemId) => {
    setEditModal(true);

    setEditId(PurchaseRequest._id);

    setEditItemId(itemId);
  };

  const deleteDetail = async (itemId) => {
    try {
      await axios.delete(
        `/api/v1/purchase-request/${PurchaseRequest._id}/item/${itemId}`,
      );

      toast.success("Item deleted");

      getPurchaseRequest(PurchaseRequest._id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ========================================
     APPROVAL
  ======================================== */

  const handleApprove = async (approvalId) => {
    try {
      const res = await axios.put(`/api/v1/approval/${approvalId}`);

      toast.success(res.data.message);

      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async (approvalId) => {
    setRejectId(approvalId);

    setRejectModal(true);
  };

  /* ========================================
     PROCUREMENT ENGINE
  ======================================== */

  const renderProcurementAction = (item) => {
    const mode = item.itemId?.procurementMode;

    const stock = stockMap[item.itemId?._id];

    const availableQty = stock?.quantity || 0;

    const canDN = availableQty >= item.pendingQty;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {(mode === "STORE_STOCK" || mode === "BOTH") && canDN && (
          <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">
            Create DN
          </button>
        )}

        {(mode === "DIRECT_PROCUREMENT" || mode === "BOTH") && (
          <button className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg">
            Create RFQ
          </button>
        )}

        {(mode === "STORE_STOCK" || mode === "BOTH") && !canDN && (
          <span className="text-xs text-red-500">Insufficient Stock</span>
        )}
      </div>
    );
  };

  /* ========================================
     LOADING
  ======================================== */

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  /* ========================================
     UI
  ======================================== */

  return (
    <div>
      <section className="mb-20 h-full w-full px-4 md:p-6 space-y-5">
        {/* ========================================
           TOP BAR
           ======================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 mb-3"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <Header
              category="Page"
              title={`${PurchaseRequest.site?.name || ""} Purchase Request`}
            />

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{PurchaseRequest.prNumber}</h1>

              <StatusBadge status={PurchaseRequest.status} />

              <ApprovalBadge status={PurchaseRequest.inchargeApprove} />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {PurchaseRequest.site?.name} → {PurchaseRequest.store?.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {editable && (
              <button
                onClick={() => handleAdd()}
                className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <MdAdd />
                Add Item
              </button>
            )}

            <PDFDownloadLink
              document={<PurchaseRequestPdf Work={PurchaseRequest} />}
              fileName={`PR-${PurchaseRequest?._id || "download"}.pdf`}
            >
              {({ loading }) => (
                <button className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center">
                  <MdDownload className="mr-2" />

                  {loading ? "Preparing..." : "Download"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* ========================================
           BASIC INFO
        ======================================== */}

        <div className="bg-white border rounded-2xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Info label="Category" value={PurchaseRequest.category} />

            <Info
              label="Requirement For"
              value={PurchaseRequest.requirementFor}
            />

            <Info
              label="Required Date"
              value={moment(PurchaseRequest.reqDate).format("DD MMM YYYY")}
            />

            <Info
              label="Created By"
              value={PurchaseRequest.createdBy?.name || "-"}
            />
          </div>
        </div>

        {/* ========================================
           KPI
        ======================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI
            title="Items"
            value={summary.totalItems}
            icon={<Package size={18} />}
          />

          <KPI
            title="Requested"
            value={summary.requestedQty}
            icon={<ClipboardList size={18} />}
          />

          <KPI
            title="Issued"
            value={summary.issuedQty}
            icon={<Truck size={18} />}
          />

          <KPI
            title="Pending"
            value={summary.pendingQty}
            icon={<CircleAlert size={18} />}
          />
        </div>

        {/* ========================================
           APPROVAL TIMELINE
        ======================================== */}

        <ApprovalTimeLine item={PurchaseRequest} module="purchaseRequest" />

        {/* ========================================
           ITEMS
        ======================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PurchaseRequest.items?.map((req, index) => {
            const stock = stockMap[req.itemId?._id];

            return (
              <div
                key={index}
                className="bg-white shadow-sm border rounded-2xl p-5"
              >
                {/* ITEM */}

                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {req.itemId?.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {req.itemId?.categoryId?.name}
                    </p>
                  </div>

                  {isERPMode && (
                    <ProcurementBadge mode={req.itemId?.procurementMode} />
                  )}
                </div>

                {/* QTY */}

                <div className="mt-5 space-y-3 text-sm">
                  <Row
                    label="Requested"
                    value={`${req.requestedQty} ${req.unit}`}
                  />

                  <Row label="Issued" value={`${req.issuedQty} ${req.unit}`} />

                  <Row
                    label="Pending"
                    value={`${req.pendingQty} ${req.unit}`}
                  />

                  {isERPMode && (
                    <Row
                      label="Store Stock"
                      value={stock?.quantity || 0}
                      icon={<Boxes size={14} />}
                    />
                  )}
                </div>

                {/* PROCUREMENT */}

                {isERPMode && renderProcurementAction(req)}

                {/* ACTIONS */}

                {editable && (
                  <div className="flex justify-between gap-3 mt-5">
                    <button
                      onClick={() => handleEdit(req._id)}
                      className="flex-1 border border-blue-200 text-blue-600 py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <GrEdit />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteDetail(req._id)}
                      className="flex-1 border border-red-200 text-red-600 py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <MdDelete />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================
           DELIVERY NOTES
        ======================================== */}

        {PurchaseRequest.deliveryNotes?.length > 0 && (
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">Delivery Notes</h2>

            <div className="space-y-3">
              {PurchaseRequest.deliveryNotes.map((dn) => (
                <div
                  key={dn._id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{dn.dnNo}</p>

                    <p className="text-sm text-gray-500">
                      {moment(dn.createdAt).format("DD MMM YYYY")}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/erp/delivery-note/${dn._id}`)}
                    className="text-blue-600 text-sm"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================
           NARRATION
        ======================================== */}

        {PurchaseRequest.narration && (
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Narration</h2>

            <p className="text-gray-600 whitespace-pre-wrap text-sm">
              {PurchaseRequest.narration}
            </p>
          </div>
        )}

        {/* ========================================
           APPROVAL FOOTER
        ======================================== */}

        {approvalId !== undefined && (
          <div className="fixed bottom-14 lg:bottom-0 left-0 bg-white right-0 border-t p-3 flex justify-around md:justify-center md:gap-6 z-50">
            <button
              onClick={() => handleApprove(approvalId)}
              className="bg-green-500 text-white px-6 py-2 rounded-full font-medium"
            >
              Approve
            </button>

            <button
              onClick={() => handleReject(approvalId)}
              className="bg-red-500 text-white px-6 py-2 rounded-full font-medium"
            >
              Reject
            </button>
          </div>
        )}

        {/* ========================================
           MODALS
        ======================================== */}

        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          head="Add Requirement"
        >
          <CreatePurchaseRequest
            onClose={() => setAddModal(false)}
            editId={editId}
          />
        </Modal>

        <Modal isOpen={editModal} onClose={() => setEditModal(false)}>
          <CreatePurchaseRequest
            onClose={() => setEditModal(false)}
            editId={editId}
          />
        </Modal>

        <Modal
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          head="Reject Reason"
        >
          <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
        </Modal>
      </section>
    </div>
  );
};

/* ========================================
   HELPERS
======================================== */

const KPI = ({ title, value, icon }) => (
  <div className="bg-white border rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{title}</p>

      {icon}
    </div>

    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const Row = ({ label, value, icon }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <span>{label}</span>
    </div>

    <span className="font-medium">{value}</span>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-medium mt-1">{value || "-"}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    DRAFT: "bg-gray-100 text-gray-700",

    REQUESTED: "bg-blue-100 text-blue-700",

    APPROVED: "bg-green-100 text-green-700",

    PARTIAL: "bg-yellow-100 text-yellow-700",

    DELIVERED: "bg-purple-100 text-purple-700",

    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const ApprovalBadge = ({ status }) => {
  const styles = {
    APPROVED: "bg-green-100 text-green-700",

    PENDING: "bg-yellow-100 text-yellow-700",

    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const ProcurementBadge = ({ mode }) => {
  const styles = {
    STORE_STOCK: "bg-blue-100 text-blue-700",

    DIRECT_PROCUREMENT: "bg-green-100 text-green-700",

    BOTH: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[mode]}`}
    >
      {mode}
    </span>
  );
};
export default PurchaseRequestScreen;
