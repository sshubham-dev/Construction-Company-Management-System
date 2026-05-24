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
  Truck,
  TrendingUp,
  TrendingDown,
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

      setQuotations(res.data.all || []);
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
     SELECT
  ===================================== */

  const selectVendor = async (quotationId) => {
    try {
      setSelecting(quotationId);

      await axios.post(`/api/v1/rfq/select-quotation/${quotationId}`);

      toast.success("Vendor selected successfully");

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

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* LEFT */}

        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="border rounded-xl p-2 mt-1 bg-white"
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
            className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Create Purchase Order
          </button>
        )}
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* NO QUOTATIONS */}

      {ranked.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
          No quotations submitted yet
        </div>
      ) : (
        <div className="space-y-5">
          {ranked.map((quotation, index) => {
            const rank = getRank(index);

            const isSelected = quotation.status === "SELECTED";

            const itemSubtotal = quotation.items.reduce(
              (sum, item) => sum + item.quantity * item.rate,
              0,
            );

            return (
              <div
                key={quotation._id}
                className={`rounded-2xl overflow-hidden border ${
                  isSelected
                    ? "border-green-500 ring-2 ring-green-100 bg-white"
                    : "bg-white"
                }`}
              >
                {/* HEADER */}

                <div className="p-5 border-b bg-gray-50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  {/* LEFT */}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/erp/procurement/quotation/${quotation._id}`)
                      }
                      className="border bg-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    {!isSelected && rfq.status !== "CLOSED" && (
                      <button
                        onClick={() => selectVendor(quotation._id)}
                        disabled={selecting === quotation._id}
                        className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 border-b">
                  <MiniCard
                    label="Final Total"
                    value={`₹${(quotation.totalAmount || 0).toLocaleString()}`}
                  />

                  <MiniCard label="Items" value={quotation.items?.length} />

                  <MiniCard label="Status" value={quotation.status} />

                  <MiniCard label="Supplier Rank" value={rank.label} />
                </div>

                {/* MOBILE ITEMS */}

                <div className="block lg:hidden p-4 space-y-4">
                  {quotation.items.map((item, itemIndex) => {
                    const amount = item.quantity * item.rate;

                    return (
                      <div key={itemIndex} className="border rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">
                              {item.itemId?.name}
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                              {item.itemId?.categoryId?.name}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Qty</p>

                            <p className="font-medium">{item.quantity}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <StatCard
                            label="Last Rate"
                            value={`₹${(
                              item.lastPurchaseRate || 0
                            ).toLocaleString()}`}
                          />

                          <StatCard
                            label="Quoted Rate"
                            value={`₹${item.rate?.toLocaleString()}`}
                          />

                          <StatCard
                            label="Difference"
                            value={`₹${Math.abs(
                              item.varianceAmount || 0,
                            ).toLocaleString()}`}
                            className={
                              item.varianceAmount > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          />

                          <StatCard
                            label="Variance"
                            value={`${item.variancePercentage}%`}
                            className={
                              item.variancePercentage > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <span className="text-sm text-gray-500">Amount</span>

                          <span className="font-bold">
                            ₹{amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE */}

                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3">Item</th>

                        <th className="text-left px-4 py-3">Qty</th>

                        <th className="text-left px-4 py-3">Last Rate</th>

                        <th className="text-left px-4 py-3">Quoted Rate</th>

                        <th className="text-left px-4 py-3">Difference</th>

                        <th className="text-left px-4 py-3">Variance %</th>

                        <th className="text-left px-4 py-3">Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {quotation.items.map((item, itemIndex) => {
                        const amount = item.quantity * item.rate;

                        return (
                          <tr
                            key={itemIndex}
                            className="border-b last:border-none"
                          >
                            {/* ITEM */}

                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium">
                                  {item.itemId?.name}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                  {item.itemId?.categoryId?.name}
                                </p>
                              </div>
                            </td>

                            {/* QTY */}

                            <td className="px-4 py-4">{item.quantity}</td>

                            {/* LAST RATE */}

                            <td className="px-4 py-4">
                              ₹{(item.lastPurchaseRate || 0).toLocaleString()}
                            </td>

                            {/* QUOTED RATE */}

                            <td className="px-4 py-4 font-medium">
                              ₹{item.rate?.toLocaleString()}
                            </td>

                            {/* DIFFERENCE */}

                            <td
                              className={`px-4 py-4 font-medium ${
                                item.varianceAmount > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {item.varianceAmount > 0 ? (
                                  <TrendingUp size={15} />
                                ) : (
                                  <TrendingDown size={15} />
                                )}
                                ₹
                                {Math.abs(
                                  item.varianceAmount || 0,
                                ).toLocaleString()}
                              </div>
                            </td>

                            {/* VARIANCE */}

                            <td
                              className={`px-4 py-4 font-medium ${
                                item.variancePercentage > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {item.variancePercentage}%
                            </td>

                            {/* AMOUNT */}

                            <td className="px-4 py-4 font-semibold">
                              ₹{amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* TOTAL */}

                <div className="p-5 border-t">
                  <div className="max-w-md ml-auto space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Item Total</span>

                      <span>₹{itemSubtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Truck size={14} />
                        Freight
                      </span>

                      <span>
                        ₹{(quotation.freightAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between text-lg font-bold">
                      <span>Final Total</span>

                      <span>
                        ₹{(quotation.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
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

      {/* COMPARISON MATRIX */}

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

                  <th className="text-left px-4 py-3">Final Total</th>

                  <th className="text-left px-4 py-3">Freight</th>

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
                      <td className="px-4 py-4 font-medium">
                        {q.supplierId?.name}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        ₹{(q.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        ₹{(q.freightAmount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${rank.bg}`}
                        >
                          {rank.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">{q.status}</td>

                      <td className="px-4 py-4">
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

const StatCard = ({ label, value, className = "" }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>

    <p className={`font-semibold mt-1 ${className}`}>{value}</p>
  </div>
);

export default RFQComparison;
