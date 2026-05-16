import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import {
  Search,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Truck,
  Boxes,
  ShoppingCart,
  CheckCheck,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import Modal from "../../components/Modal";
import CreatePurchaseRequest from "../../components/CreatePurchaseRequest";

axios.defaults.withCredentials = true;

const MODE = {
  SITE: "SITE",
  ERP: "ERP",
};

const PurchaseRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useParams();
  const isSiteMode = mode === MODE.SITE;

  const isERPMode = mode === MODE.ERP;

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [approvalFilter, setApprovalFilter] = useState("");

  const [procurementFilter, setProcurementFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [createModal, setCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [editId, setEditId] = useState("");

  /* ========================================
     FETCH
  ======================================== */

  const fetchPR = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/purchase-request");

      setData(res.data || []);
    } catch (err) {
      console.log(err);

      // toast.error("Failed to load PR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPR();
  }, []);

  /* ========================================
     PROCUREMENT TYPE
  ======================================== */

  const getProcurementType = (items = []) => {
    const modes = items.map((i) => i.itemId?.procurementMode);

    const unique = [...new Set(modes)];

    if (unique.length === 1) {
      if (unique[0] === "STORE_STOCK") {
        return "INTERNAL";
      }

      if (unique[0] === "DIRECT_PROCUREMENT") {
        return "PROCUREMENT";
      }
    }

    return "HYBRID";
  };

  /* ========================================
     FILTERED
  ======================================== */

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const text = search.toLowerCase();

      const procurement = getProcurementType(r.items);

      const matchesSearch =
        r.prNumber?.toLowerCase().includes(text) ||
        r.site?.name?.toLowerCase().includes(text) ||
        r.store?.name?.toLowerCase().includes(text) ||
        r.category?.toLowerCase().includes(text);

      const matchesStatus = statusFilter ? r.status === statusFilter : true;

      const matchesApproval = approvalFilter
        ? r.inchargeApprove === approvalFilter
        : true;

      const matchesProcurement = procurementFilter
        ? procurement === procurementFilter
        : true;
      const reqDate = moment(r.reqDate);
      const today = moment();

      let matchesDate = true;

      switch (dateFilter) {
        case "TODAY":
          matchesDate = reqDate.isSame(today, "day");
          break;

        case "YESTERDAY":
          matchesDate = reqDate.isSame(moment().subtract(1, "day"), "day");
          break;

        case "THIS_WEEK":
          matchesDate = reqDate.isSame(today, "week");
          break;

        case "THIS_MONTH":
          matchesDate = reqDate.isSame(today, "month");
          break;

        case "LAST_MONTH":
          matchesDate = reqDate.isSame(moment().subtract(1, "month"), "month");
          break;

        case "CUSTOM":
          if (startDate && endDate) {
            matchesDate = reqDate.isBetween(
              moment(startDate).startOf("day"),
              moment(endDate).endOf("day"),
              null,
              "[]",
            );
          }
          break;

        default:
          matchesDate = true;
      }
      return (
        matchesSearch &&
        matchesStatus &&
        matchesApproval &&
        matchesProcurement &&
        matchesDate
      );
    });
  }, [
    data,
    search,
    statusFilter,
    approvalFilter,
    procurementFilter,
    dateFilter,
    startDate,
    endDate,
  ]);

  /* ========================================
     DELETE
  ======================================== */

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/purchase-request/${id}`);

      toast.success("PR deleted");

      setData((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSubmit = async (id) => {
    try {
      await axios.put(`/api/v1/purchase-request/submit/${id}`);
      toast.success("PR Submited");
    } catch (error) {
      console.log(error);
    }
  };

  /* ========================================
     KPI
  ======================================== */

  const stats = useMemo(() => {
    return {
      total: data.length,

      pending: data.filter((d) => d.status === "REQUESTED").length,

      approved: data.filter((d) => d.status === "APPROVED").length,

      delivered: data.filter((d) => d.status === "DELIVERED").length,
    };
  }, [data]);

  /* ========================================
     STATUS COLORS
  ======================================== */

  const statusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-700";

      case "REQUESTED":
        return "bg-blue-100 text-blue-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";

      case "DELIVERED":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-red-100 text-red-700";
    }
  };

  const approvalColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /* ========================================
     UI
  ======================================== */

  return (
    <div className="p-4 md:p-4 space-y-5 pb-24">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {isSiteMode ? "Site Purchase Requests" : "Procurement Requests"}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {isSiteMode
              ? "Track material requests and delivery status"
              : "Manage procurement and fulfillment workflow"}
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          New PR
        </button>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI title="Total PR" value={stats.total} />

        <KPI title="Pending" value={stats.pending} />

        <KPI title="Approved" value={stats.approved} />

        <KPI title="Delivered" value={stats.delivered} />
      </div>

      {/* FILTERS */}

      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={16} />

          <p className="font-medium text-sm">Filters</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* SEARCH */}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PR..."
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>

            <option value="DRAFT">Draft</option>

            <option value="REQUESTED">Requested</option>

            <option value="APPROVED">Approved</option>

            <option value="PARTIAL">Partial</option>

            <option value="DELIVERED">Delivered</option>
          </select>

          {/* APPROVAL */}

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Approval</option>

            <option value="PENDING">Pending</option>

            <option value="APPROVED">Approved</option>

            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Dates</option>

            <option value="TODAY">Today</option>

            <option value="YESTERDAY">Yesterday</option>

            <option value="THIS_WEEK">This Week</option>

            <option value="THIS_MONTH">This Month</option>

            <option value="LAST_MONTH">Last Month</option>

            <option value="CUSTOM">Custom Range</option>
          </select>

          {dateFilter === "CUSTOM" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </>
          )}

          {/* ERP ONLY */}

          {isERPMode && (
            <select
              value={procurementFilter}
              onChange={(e) => setProcurementFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Procurement Type</option>

              <option value="INTERNAL">Internal</option>

              <option value="PROCUREMENT">Procurement</option>

              <option value="HYBRID">Hybrid</option>
            </select>
          )}
        </div>
      </div>

      {/* LIST */}

      {loading ? (
        <div className="text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">
          No purchase requests found
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, index) => {
            const totalQty = r.items?.reduce((a, i) => a + i.requestedQty, 0);

            const pendingQty = r.items?.reduce((a, i) => a + i.pendingQty, 0);

            const procurement = getProcurementType(r.items);

            const editable = r.status === "DRAFT" || r.status === "REQUESTED";

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
              >
                {/* TOP */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-lg">{r.prNumber}</h2>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor(
                          r.status,
                        )}`}
                      >
                        {r.status}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${approvalColor(
                          r.inchargeApprove,
                        )}`}
                      >
                        {r.inchargeApprove}
                      </span>

                      {isERPMode && <ProcurementBadge type={procurement} />}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {r?.site?.name} → {r?.store?.name}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {r.category} • {r.requirementFor}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    {moment(r.reqDate).format("DD MMM YYYY")}
                  </div>
                </div>

                {/* KPI */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <MiniCard label="Items" value={r.items?.length || 0} />

                  <MiniCard label="Requested" value={totalQty} />

                  <MiniCard label="Pending" value={pendingQty} />

                  <MiniCard label="DN" value={r.deliveryNotes?.length || 0} />
                </div>

                {/* DELIVERY */}

                <div className="flex items-center gap-2 text-sm">
                  <Truck size={15} className="text-gray-500" />

                  <span className="text-gray-500">Delivery:</span>

                  <span className="font-medium">
                    {r.deliveryStatus || "PENDING"}
                  </span>
                </div>

                {/* ERP PROCUREMENT */}

                {isERPMode && (
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingCart size={15} className="text-gray-500" />

                    <span className="text-gray-500">Procurement:</span>

                    <span className="font-medium">{procurement}</span>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <ActionBtn
                    icon={<Eye size={15} />}
                    text="View"
                    onClick={() =>
                      navigate(
                        isSiteMode
                          ? `/purchase-request/SITE/${r._id}`
                          : `/purchase-request/ERP/${r._id}`,
                      )
                    }
                  />

                  {editable && (
                    <ActionBtn
                      icon={<Pencil size={15} />}
                      text="Edit"
                      onClick={() => {
                        setEditId(r._id);

                        setEditModal(true);
                      }}
                    />
                  )}

                  {r.status !== "REQUESTED" && (
                    <ActionBtn
                      icon={<CheckCheck size={15} />}
                      text="Submit"
                      onClick={() => handleSubmit(r._id)}
                    />
                  )}

                  {/* ERP ONLY */}

                  {/* {isERPMode && (
                    <>
                      <ActionBtn icon={<Boxes size={15} />} text="Create DN" />

                      <ActionBtn
                        icon={<FileText size={15} />}
                        text="Create RFQ"
                      />
                    </>
                  )} */}

                  {editable && (
                    <ActionBtn
                      icon={<Trash2 size={15} />}
                      text="Delete"
                      danger
                      onClick={() => handleDelete(r._id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}>
        <CreatePurchaseRequest
          onClose={() => {
            setCreateModal(false);
            fetchPR();
          }}
        />
      </Modal>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)}>
        <CreatePurchaseRequest
          editId={editId}
          onClose={() => {
            setEditModal(false);
            fetchPR();
          }}
        />
      </Modal>
    </div>
  );
};

export default PurchaseRequest;

/* ========================================
   HELPERS
======================================== */

const KPI = ({ title, value }) => (
  <div className="bg-white border rounded-xl p-4">
    <p className="text-xs text-gray-500">{title}</p>

    <h2 className="text-2xl font-bold mt-1">{value}</h2>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="border rounded-lg p-3 bg-gray-50">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-semibold mt-1">{value}</p>
  </div>
);

const ActionBtn = ({ icon, text, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
      danger ? "text-red-600 border-red-200" : ""
    }`}
  >
    {icon}
    {text}
  </button>
);

const ProcurementBadge = ({ type }) => {
  const styles = {
    INTERNAL: "bg-blue-100 text-blue-700",

    PROCUREMENT: "bg-green-100 text-green-700",

    HYBRID: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[type]}`}>
      {type}
    </span>
  );
};
