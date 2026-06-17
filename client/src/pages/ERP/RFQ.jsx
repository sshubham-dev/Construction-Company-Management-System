import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Send,
  XCircle,
  FileBarChart2,
  ShoppingCart,
  Clock3,
  CheckCircle2,
  Building2,
  Users,
  FileText,
  IndianRupee,
  CalendarDays,
  Package,
} from "lucide-react";
import Modal from "../../components/Modal";
import CreateRFQ from "./Components/CreateRFQ";
axios.defaults.withCredentials = true;

const RFQ = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [rfqs, setRFQs] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [procurementFilter, setProcurementFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/rfq");

      setRFQs(res.data.data || []);
    } catch (err) {
      console.log(err);

      // toast.error("Failed to load RFQ");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     FILTER
  ===================================== */

  const filtered = useMemo(() => {
    return rfqs.filter((r) => {
      const text = search.toLowerCase();

      const matchesSearch =
        r.rfqNo?.toLowerCase().includes(text) ||
        r.purchaseRequestId?.prNumber?.toLowerCase().includes(text) ||
        r.storeId?.name?.toLowerCase().includes(text);

      const matchesStatus = statusFilter ? r.status === statusFilter : true;

      const matchesProcurement = procurementFilter
        ? r.procurementType === procurementFilter
        : true;

      let matchesDate = true;

      const rfqDate = moment(r.createdAt);

      switch (dateFilter) {
        case "TODAY":
          matchesDate = rfqDate.isSame(moment(), "day");
          break;

        case "THIS_WEEK":
          matchesDate = rfqDate.isSame(moment(), "week");
          break;

        case "THIS_MONTH":
          matchesDate = rfqDate.isSame(moment(), "month");
          break;

        default:
          matchesDate = true;
      }

      return (
        matchesSearch && matchesStatus && matchesProcurement && matchesDate
      );
    });
  }, [rfqs, search, statusFilter, procurementFilter, dateFilter]);

  /* =====================================
     KPI
  ===================================== */

  const stats = useMemo(() => {
    return {
      total: rfqs.length,

      draft: rfqs.filter((r) => r.status === "DRAFT").length,

      sent: rfqs.filter((r) => r.status === "SENT").length,

      closed: rfqs.filter((r) => r.status === "CLOSED").length,
    };
  }, [rfqs]);

  /* =====================================
     ACTIONS
  ===================================== */

  const sendRFQ = async (id) => {
    try {
      const res = await axios.put(`/api/v1/rfq/send/${id}`);

      toast.success("RFQ sent successfully");

      fetchRFQs();

      /* =========================
       SHOW SHARE LINKS
    ========================== */

      console.log(res.data.data.suppliers);
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const closeRFQ = async (id) => {
    try {
      await axios.post(`/api/v1/rfq/${id}/close`);

      toast.success("RFQ closed");

      fetchRFQs();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    }
  };

  const handleEdit = async (id) => {
    setCreateModal(true);
    setEditId(id);
  };

  /* =====================================
     STATUS STYLE
  ===================================== */

  const getStatusStyle = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: <Clock3 size={14} />,
        };

      case "SENT":
        return {
          bg: "bg-blue-100 text-blue-700",

          icon: <Send size={14} />,
        };

      case "CLOSED":
        return {
          bg: "bg-green-100 text-green-700",

          icon: <CheckCircle2 size={14} />,
        };

      default:
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: null,
        };
    }
  };

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="p-4 md:p-6 space-y-5 pb-24">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">RFQ Management</h1>

          <p className="text-sm text-gray-500 mt-1">
            Procurement quotation workflow
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Create RFQ
        </button>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI title="Total RFQ" value={stats.total} />

        <KPI title="Draft" value={stats.draft} />

        <KPI title="Sent" value={stats.sent} />

        <KPI title="Closed" value={stats.closed} />
      </div>

      {/* FILTER */}

      <div className="bg-white border rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={16} />

          <p className="font-medium text-sm">Filters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* SEARCH */}

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search RFQ..."
              className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm"
            />
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Status</option>

            <option value="DRAFT">Draft</option>

            <option value="SENT">Sent</option>

            <option value="CLOSED">Closed</option>
          </select>

          {/* PROCUREMENT */}

          <select
            value={procurementFilter}
            onChange={(e) => setProcurementFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Procurement</option>

            <option value="SITE_PROCUREMENT">Site Procurement</option>

            <option value="STORE_PROCUREMENT">Store Procurement</option>

            <option value="EMERGENCY_PROCUREMENT">Emergency Procurement</option>
          </select>

          {/* DATE */}

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Dates</option>

            <option value="TODAY">Today</option>

            <option value="THIS_WEEK">This Week</option>

            <option value="THIS_MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* LIST */}

      {loading ? (
        <div className="text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          No RFQ found
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rfq) => {
            const style = getStatusStyle(rfq.status);

            const quotationCount = rfq.quotations?.length || 0;

            return (
              <div
                key={rfq._id}
                className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
              >
                {/* TOP */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold">{rfq.rfqNo}</h2>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${style.bg}`}
                      >
                        {style.icon}

                        {rfq.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      PR: {rfq.purchaseRequestId?.prNumber}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    {moment(rfq.createdAt).format("DD MMM YYYY")}
                  </div>
                </div>

                {/* BODY */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoCard
                    icon={<Building2 size={16} />}
                    title="Store"
                    value={rfq.storeId?.name || "-"}
                  />

                  <InfoCard
                    icon={<Package size={16} />}
                    title="Items"
                    value={rfq.items?.length || 0}
                  />

                  <InfoCard
                    icon={<Users size={16} />}
                    title="Suppliers"
                    value={rfq.suppliers?.length || 0}
                  />

                  <InfoCard
                    icon={<FileText size={16} />}
                    title="Quotations"
                    value={quotationCount}
                  />
                </div>

                {/* EXTRA */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <MiniCard
                    label="Estimated"
                    value={`₹${(rfq.estimatedAmount || 0).toLocaleString()}`}
                  />

                  <MiniCard
                    label="Procurement"
                    value={rfq.procurementType?.replaceAll("_", " ") || "-"}
                  />

                  <MiniCard
                    label="Deadline"
                    value={
                      rfq.quotationDeadline
                        ? moment(rfq.quotationDeadline).format("DD MMM YYYY")
                        : "-"
                    }
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2 pt-2">
                  {/* VIEW */}

                  <ActionBtn
                    icon={<Eye size={15} />}
                    text="View"
                    onClick={() => navigate(`/erp/procurement/rfq/${rfq._id}`)}
                  />

                  {/* COMPARE */}

                  {rfq.status !== "CLOSED" && (
                    <ActionBtn
                      icon={<FileBarChart2 size={15} />}
                      text="Compare"
                      onClick={() =>
                        navigate(`/erp/procurement/rfq/${rfq._id}/comparison`)
                      }
                    />
                  )}

                  {/* EDIT */}

                  {rfq.status === "DRAFT" && (
                    <ActionBtn
                      icon={<FileText size={15} />}
                      text="Edit"
                      onClick={() => handleEdit(rfq._id)}
                    />
                  )}

                  {/* SEND */}

                  {rfq.status === "DRAFT" && (
                    <ActionBtn
                      icon={<Send size={15} />}
                      text="Send"
                      onClick={() => sendRFQ(rfq._id)}
                    />
                  )}

                  {/* CLOSE */}

                  {rfq.status === "SENT" && (
                    <ActionBtn
                      icon={<XCircle size={15} />}
                      text="Close"
                      onClick={() => closeRFQ(rfq._id)}
                    />
                  )}

                  {/* CREATE PO */}

                  {rfq.status === "CLOSED" && (
                    <ActionBtn
                      icon={<ShoppingCart size={15} />}
                      text="Send Po"
                      onClick={() =>
                        navigate(`/erp/procurement/po/create?rfq=${rfq._id}`)
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal onClose={() => setCreateModal(false)} isOpen={createModal}>
        <CreateRFQ onClose={() => setCreateModal(false)} editId={editId} />
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

const InfoCard = ({ icon, title, value }) => (
  <div className="border rounded-xl p-4 bg-gray-50">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}

      <p className="text-xs">{title}</p>
    </div>

    <p className="font-semibold mt-2">{value}</p>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-medium mt-1">{value}</p>
  </div>
);

const ActionBtn = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="border px-3 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50"
  >
    {icon}
    {text}
  </button>
);

export default RFQ;
