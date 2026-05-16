import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Trophy,
  Medal,
  BadgeIndianRupee,
  CheckCircle2,
  ShoppingCart,
  FileSpreadsheet,
  Users,
  Package,
  Scale,
  Eye,
} from "lucide-react";

axios.defaults.withCredentials = true;

const RFQComparison = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [rfq, setRFQ] = useState(null);

  const [quotations, setQuotations] = useState([]);

  const [selecting, setSelecting] = useState("");

  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/api/v1/rfq/comparison/${id}`);

      setRFQ(res.data.rfq);

      setQuotations(res.data.quotations || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load comparison");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     SORT
  ===================================== */

  const ranked = useMemo(() => {
    return [...quotations].sort((a, b) => a.totalAmount - b.totalAmount);
  }, [quotations]);

  /* =====================================
     SELECT VENDOR
  ===================================== */

  const selectVendor = async (quotationId) => {
    try {
      setSelecting(quotationId);

      await axios.post(`/api/v1/rfq/select-quotation/${quotationId}`);

      toast.success("Vendor selected");

      fetchData();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSelecting("");
    }
  };

  /* =====================================
     RANK
  ===================================== */

  const getRank = (index) => {
    switch (index) {
      case 0:
        return {
          label: "L1",

          icon: <Trophy size={16} />,

          bg: "bg-green-100 text-green-700",
        };

      case 1:
        return {
          label: "L2",

          icon: <Medal size={16} />,

          bg: "bg-yellow-100 text-yellow-700",
        };

      case 2:
        return {
          label: "L3",

          icon: <Medal size={16} />,

          bg: "bg-orange-100 text-orange-700",
        };

      default:
        return {
          label: `L${index + 1}`,

          icon: null,

          bg: "bg-gray-100 text-gray-700",
        };
    }
  };

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
            <h1 className="text-2xl font-bold">RFQ Comparison</h1>

            <p className="text-sm text-gray-500 mt-1">
              {rfq.rfqNo}
              {" • "}
              {rfq.purchaseRequestId?.prNumber}
            </p>
          </div>
        </div>

        {/* ACTION */}

        {rfq.status === "CLOSED" && (
          <button
            onClick={() =>
              navigate(`/erp/procurement/po/create?rfq=${rfq._id}`)
            }
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            Create PO
          </button>
        )}
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI
          icon={<Users size={18} />}
          title="Suppliers"
          value={quotations.length}
        />

        <KPI
          icon={<Package size={18} />}
          title="Items"
          value={rfq.items?.length}
        />

        <KPI
          icon={<BadgeIndianRupee size={18} />}
          title="Estimated"
          value={`₹${(rfq.estimatedAmount || 0).toLocaleString()}`}
        />

        <KPI icon={<Scale size={18} />} title="Comparison" value="L1/L2" />
      </div>

      {/* NO QUOTATION */}

      {ranked.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
          No quotations submitted yet
        </div>
      ) : (
        <div className="space-y-5">
          {ranked.map((quotation, index) => {
            const rank = getRank(index);

            const isSelected = quotation.status === "SELECTED";

            return (
              <div
                key={quotation._id}
                className={`border rounded-2xl overflow-hidden ${
                  isSelected
                    ? "border-green-500 ring-2 ring-green-100"
                    : "bg-white"
                }`}
              >
                {/* HEADER */}

                <div className="p-5 border-b bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* LEFT */}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold">
                        {quotation.supplierId?.name}
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${rank.bg}`}
                      >
                        {rank.icon}

                        {rank.label}
                      </span>

                      {isSelected && (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          Selected
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Submitted:{" "}
                      {moment(quotation.createdAt).format("DD MMM YYYY")}
                    </p>
                  </div>

                  {/* RIGHT */}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        navigate(`/erp/procurement/quotation/${quotation._id}`)
                      }
                      className="border px-3 py-2 rounded-xl text-sm flex items-center gap-2"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    {!isSelected && (
                      <button
                        onClick={() => selectVendor(quotation._id)}
                        disabled={selecting === quotation._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 size={15} />

                        {selecting === quotation._id
                          ? "Selecting..."
                          : "Select Vendor"}
                      </button>
                    )}
                  </div>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b">
                  <MiniCard
                    label="Total Amount"
                    value={`₹${quotation.totalAmount?.toLocaleString()}`}
                  />

                  <MiniCard label="Items" value={quotation.items?.length} />

                  <MiniCard label="Status" value={quotation.status} />

                  <MiniCard label="Supplier Rank" value={rank.label} />
                </div>

                {/* ITEMS */}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3">Item</th>

                        <th className="text-left px-4 py-3">Qty</th>

                        <th className="text-left px-4 py-3">Rate</th>

                        <th className="text-left px-4 py-3">Amount</th>

                        <th className="text-left px-4 py-3">Variance</th>

                        <th className="text-left px-4 py-3">%</th>
                      </tr>
                    </thead>

                    <tbody>
                      {quotation.items.map((item, itemIndex) => (
                        <tr
                          key={itemIndex}
                          className="border-b last:border-none"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{item.itemId?.name}</p>

                              <p className="text-xs text-gray-500 mt-1">
                                {item.itemId?.categoryId?.name}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3">{item.quantity}</td>

                          <td className="px-4 py-3">
                            ₹{item.rate?.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 font-medium">
                            ₹{(item.quantity * item.rate).toLocaleString()}
                          </td>

                          <td
                            className={`px-4 py-3 ${
                              item.varianceAmount > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            ₹{item.varianceAmount?.toLocaleString()}
                          </td>

                          <td
                            className={`px-4 py-3 ${
                              item.variancePercentage > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.variancePercentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* REMARKS */}

                {quotation.remarks && (
                  <div className="p-5 border-t bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">
                      Supplier Remarks
                    </p>

                    <p className="text-sm whitespace-pre-wrap">
                      {quotation.remarks}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MATRIX */}

      {ranked.length > 0 && (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center gap-2">
            <FileSpreadsheet size={18} />

            <h2 className="font-semibold text-lg">Comparison Matrix</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3">Supplier</th>

                  <th className="text-left px-4 py-3">Total</th>

                  <th className="text-left px-4 py-3">Rank</th>

                  <th className="text-left px-4 py-3">Status</th>

                  <th className="text-left px-4 py-3">Submitted</th>
                </tr>
              </thead>

              <tbody>
                {ranked.map((q, index) => {
                  const rank = getRank(index);

                  return (
                    <tr key={q._id} className="border-b last:border-none">
                      <td className="px-4 py-3 font-medium">
                        {q.supplierId?.name}
                      </td>

                      <td className="px-4 py-3">
                        ₹{q.totalAmount?.toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${rank.bg}`}
                        >
                          {rank.label}
                        </span>
                      </td>

                      <td className="px-4 py-3">{q.status}</td>

                      <td className="px-4 py-3">
                        {moment(q.createdAt).format("DD MMM YYYY")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================
   HELPERS
===================================== */

const KPI = ({ icon, title, value }) => (
  <div className="bg-white border rounded-2xl p-4">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}

      <p className="text-xs">{title}</p>
    </div>

    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="font-semibold mt-1">{value}</p>
  </div>
);

export default RFQComparison;
