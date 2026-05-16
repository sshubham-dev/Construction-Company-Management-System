import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/Modal";
import CreateDeliveryNote from "../../components/CreateDeliveryNote";
import ConfirmDeliveryNote from "../../components/ConfirmDeliveryNote";
import { useSelector } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  FileText,
  Package,
  Building2,
  ArrowRight,
  Send,
} from "lucide-react";
import ReceiveDNModal from "./Components/ReceiveDNModal";

axios.defaults.withCredentials = true;

// const DeliveryNote = () => {
//   const navigate = useNavigate();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [createModal, setCreateModal] = useState(false);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     fetchDN();
//   }, []);

//   const fetchDN = async () => {
//     try {
//       const res = await axios.get("/api/v1/delivery-note");
//       setData(res.data.data || []);
//     } catch (err) {
//       console.log(err)
//       toast.error("Failed to load DN");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = data.filter((d) => {
//     return (
//       d.dnNumber?.toLowerCase().includes(search.toLowerCase()) &&
//       (status ? d.status === status : true)
//     );
//   });

//   const statusColor = (s) => {
//     switch (s) {
//       case "DRAFT":
//         return "bg-gray-100 text-gray-700";
//       case "ISSUED":
//         return "bg-blue-100 text-blue-700";
//       case "CANCELLED":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   return (
//     <div className="p-3 space-y-4 pb-24">

//       {/* FILTER */}
//       <div className="flex gap-2">
//         <input
//           placeholder="Search DN..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border p-2 rounded w-full"
//         />

//         <select
//           onChange={(e) => setStatus(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">All</option>
//           <option value="ISSUED">Issued</option>
//           <option value="CANCELLED">Cancelled</option>
//         </select>
//       </div>

//       {/* LIST */}
//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         filtered.map((d) => (
//           <div
//             key={d._id}
//             onClick={() => navigate(`/erp/dn/${d._id}`)}
//             className="border rounded-lg p-3 bg-white shadow-sm space-y-2 cursor-pointer"
//           >
//             <div className="flex justify-between">
//               <span className="font-medium">{d.dnNumber}</span>

//               <span className={`text-xs px-2 py-1 rounded ${statusColor(d.status)}`}>
//                 {d.status}
//               </span>
//             </div>

//             <div className="text-sm text-gray-600">
//               {d.store?.name} → {d.site?.name}
//             </div>

//             <div className="flex justify-between text-xs text-gray-500">
//               <span>{moment(d.date).format("DD MMM")}</span>
//               <span>{d.items?.length} items</span>
//             </div>
//           </div>
//         ))
//       )}

//       {/* FLOAT BTN */}
//       <button
//         onClick={() => setCreateModal(true)}
//         className="fixed bottom-20 md:bottom-5 right-5 bg-green-600 text-white w-14 h-14 rounded-full text-xl shadow-lg"
//       >
//         +
//       </button>
//       <Modal onClose={() => setCreateModal(false)} isOpen={createModal}>
//         <CreateDeliveryNote onClose={() => setCreateModal(false)}/>
//       </Modal>
//     </div>
//   );
// };

// export default DeliveryNote;

const DeliveryNote = () => {
  const navigate = useNavigate();
  const { mode } = useParams();

  const isERP = mode === "erp";
  const isSite = mode === "site";
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("");

  const [createModal, setCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [receiveModal, setReceiveModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
    fromStore: "",
    toStore: "",
  });
  const [dn, setDN] = useState(null);

  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    fetchDN();
  }, []);

  const fetchDN = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/v1/delivery-note");
      // console.log(re
      // s.data.data)

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load DN");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     FILTER
  ===================================== */

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const text = search.toLowerCase();

      const matchesSearch =
        d.dnNo?.toLowerCase().includes(text) ||
        d.purchaseRequestId?.prNumber?.toLowerCase().includes(text) ||
        d.fromStoreId?.name?.toLowerCase().includes(text) ||
        d.toStoreId?.name?.toLowerCase().includes(text);

      const matchesStatus = statusFilter ? d.status === statusFilter : true;

      const issueDate = moment(d.issueDate);

      let matchesDate = true;

      switch (dateFilter) {
        case "TODAY":
          matchesDate = issueDate.isSame(moment(), "day");
          break;

        case "THIS_WEEK":
          matchesDate = issueDate.isSame(moment(), "week");
          break;

        case "THIS_MONTH":
          matchesDate = issueDate.isSame(moment(), "month");
          break;

        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, statusFilter, dateFilter]);

  /* =====================================
     KPI
  ===================================== */

  const stats = useMemo(() => {
    return {
      total: data.length,

      issued: data.filter((d) => d.status === "ISSUED").length,

      received: data.filter((d) => d.status === "RECEIVED").length,

      verified: data.filter((d) => d.status === "VERIFIED").length,
    };
  }, [data]);

  /* =====================================
     STATUS
  ===================================== */

  const getStatusStyle = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: <Clock3 size={14} />,
        };

      case "ISSUED":
        return {
          bg: "bg-blue-100 text-blue-700",

          icon: <Truck size={14} />,
        };

      case "RECEIVED":
        return {
          bg: "bg-yellow-100 text-yellow-700",

          icon: <Package size={14} />,
        };

      case "VERIFIED":
        return {
          bg: "bg-green-100 text-green-700",

          icon: <CheckCircle2 size={14} />,
        };

      case "MISMATCH":
        return {
          bg: "bg-red-100 text-red-700",

          icon: <AlertTriangle size={14} />,
        };

      default:
        return {
          bg: "bg-gray-100 text-gray-700",

          icon: null,
        };
    }
  };

  /* =====================================
     ISSUE
  ===================================== */

  const issueDN = async (id) => {
    try {
      await axios.put(`/api/v1/delivery-note/issue/${id}`);

      toast.success("DN Issued");

      fetchDN();
    } catch (err) {
      console.log(err);

      toast.error("Failed");
    }
  };

  /* =====================================
     VERIFY
  ===================================== */

  const gotoVerify = (id) => {
    navigate(`/erp/delivery-note/verify/${id}`);
  };

  /* =====================================
     UI
  ===================================== */

  return (
    <div className="p-4 md:p-6 space-y-5 pb-24">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Delivery Notes</h1>

          <p className="text-sm text-gray-500 mt-1">
            Store → Site material transfer management
          </p>
        </div>

        {isERP && (
          <button
            onClick={() => setCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 justify-center"
          >
            <Plus size={18} />
            Create DN
          </button>
        )}
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI title="Total DN" value={stats.total} />

        <KPI title="Issued" value={stats.issued} />

        <KPI title="Received" value={stats.received} />

        <KPI title="Verified" value={stats.verified} />
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
              placeholder="Search DN..."
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

            <option value="ISSUED">Issued</option>

            <option value="RECEIVED">Received</option>

            <option value="VERIFIED">Verified</option>

            <option value="MISMATCH">Mismatch</option>
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
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 text-sm">
          No delivery notes found
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d, index) => {
            const style = getStatusStyle(d.status);

            const editable = d.status === "DRAFT";
            const showVerify =
              isERP && (d.status === "RECEIVED" || d.status === "MISMATCH");
            const showReceive = isSite && d.status === "ISSUED";
            const totalQty = d.items?.reduce(
              (a, i) => a + Number(i.issuedQty || 0),
              0,
            );

            return (
              <div
                key={index}
                className="bg-white border rounded-2xl p-5 shadow-sm space-y-4"
              >
                {/* TOP */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-lg">{d.dnNo}</h2>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${style.bg}`}
                      >
                        {style.icon}

                        {d.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      PR: {d.purchaseRequestId?.prNumber}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    {moment(d.issueDate).format("DD MMM YYYY")}
                  </div>
                </div>

                {/* FLOW */}

                <div className="flex items-center gap-3 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} />

                    <span className="font-medium">{d.fromStoreId?.name}</span>
                  </div>

                  <ArrowRight size={15} className="text-gray-400" />

                  <div className="flex items-center gap-2">
                    <Package size={15} />

                    <span className="font-medium">{d.toStoreId?.name}</span>
                  </div>
                </div>

                {/* KPI */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniCard label="Items" value={d.items?.length} />

                  <MiniCard label="Issued Qty" value={totalQty} />

                  <MiniCard
                    label="Received"
                    value={
                      d.receivedDate
                        ? moment(d.receivedDate).format("DD MMM")
                        : "-"
                    }
                  />

                  <MiniCard
                    label="Created By"
                    value={d.issuedBy?.name || "-"}
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {/* VIEW */}

                  <ActionBtn
                    icon={<Eye size={15} />}
                    text="View"
                    onClick={() => navigate(`/${mode}/inventory/dn/${d._id}`)}
                  />

                  {/* ERP EDIT */}

                  {isERP && d.status === "DRAFT" && (
                    <ActionBtn
                      icon={<Pencil size={15} />}
                      text="Edit"
                      onClick={() => {
                        setEditId(d._id);
                        setEditModal(true);
                      }}
                    />
                  )}

                  {/* ERP ISSUE */}

                  {isERP && d.status === "DRAFT" && (
                    <ActionBtn
                      icon={<Send size={15} />}
                      text="Issue"
                      onClick={() => issueDN(d._id)}
                    />
                  )}

                  {/* SITE RECEIVE */}

                  {isSite && d.status === "ISSUED" && (
                    <ActionBtn
                      icon={<Package size={15} />}
                      text="Receive"
                      onClick={() => {
                        setReceiveModal(true);
                        setDN(d)
                      }}
                    />
                  )}

                  {/* ERP VERIFY */}

                  {isERP &&
                    (d.status === "RECEIVED" || d.status === "MISMATCH") && (
                      <ActionBtn
                        icon={<CheckCircle2 size={15} />}
                        text="Verify"
                        onClick={() =>
                          navigate(`/erp/inventory/dn/${d._id}/verify`)
                        }
                      />
                    )}

                  {/* PDF */}
                  <ActionBtn icon={<FileText size={15} />} text="PDF" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE */}

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}>
        <CreateDeliveryNote
          onClose={() => {
            setCreateModal(false);

            fetchDN();
          }}
        />
      </Modal>

      {/* EDIT */}

      <Modal isOpen={editModal} onClose={() => setEditModal(false)}>
        <CreateDeliveryNote
          editId={editId}
          onClose={() => {
            setEditModal(false);

            fetchDN();
          }}
        />
      </Modal>

      <Modal onClose={() => setReceiveModal(false)} isOpen={receiveModal}>
        <ReceiveDNModal onClose={() => setReceiveModal(false)} dn={dn} />
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

const MiniCard = ({ label, value }) => (
  <div className="border rounded-xl p-3 bg-gray-50">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-semibold mt-1">{value}</p>
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

export default DeliveryNote;
