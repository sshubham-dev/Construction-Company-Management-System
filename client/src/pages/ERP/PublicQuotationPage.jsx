import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";

import { useParams, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Building2,
  CalendarDays,
  Package,
  MapPin,
  IndianRupee,
  Truck,
  FileText,
} from "lucide-react";

axios.defaults.withCredentials = true;

const PublicQuotationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rfq, setRFQ] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [quotationItems, setQuotationItems] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [freightAmount, setFreightAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  /* =====================================
     FETCH
  ===================================== */

  useEffect(() => {
    fetchRFQ();
  }, []);

  const fetchRFQ = async () => {
    try {
      const res = await axios.get(`/api/v1/rfq/vendor/rfq/${token}`);
      setRFQ(res.data.data.rfq);
      setSupplier(res.data.data.supplier);
      setAlreadySubmitted(res.data.data.alreadySubmitted);
      setQuotationItems(
        res.data.data.rfq.items.map((item) => ({
          itemId: item.itemId._id,
          name: item.itemId.name,
          category: item.itemId?.categoryId?.name,
          quantity: item.quantity,
          unit: item.unit,
          rate: "",
          gst: 18,
          deliveryDays: 0,
          lastPurchaseRate: item.lastPurchaseRate,
          remarks: "",
          amount: 0,
        })),
      );
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     TOTAL
  ===================================== */

  const totalAmount = useMemo(() => {
    return (
      quotationItems.reduce((sum, item) => {
        const amount = Number(item.amount || 0);

        const gst = amount * (Number(item.gst) / 100);

        return sum + amount + gst;
      }, 0) + Number(freightAmount || 0)
    );
  }, [quotationItems, freightAmount]);

  /* =====================================
     UPDATE ITEM
  ===================================== */

  const updateItem = (index, field, value) => {
    const updated = [...quotationItems];

    updated[index][field] = value;

    /* AMOUNT */

    if (field === "rate") {
      updated[index].amount = Number(updated[index].quantity) * Number(value);
    }

    setQuotationItems(updated);
  };

  /* =====================================
     SUBMIT
  ===================================== */

  const submitQuotation = async () => {
    try {
      setSubmitting(true);

      /* VALIDATION */

      const invalid = quotationItems.some((i) => !i.rate || i.rate <= 0);

      if (invalid) {
        return toast.error("Please enter valid rate for all items");
      }

      /* PAYLOAD */

      const payload = {
        accessToken: token,
        items: quotationItems.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
          rate: Number(i.rate),
          gst: Number(i.gst),
          lastPurchaseRate: i.lastPurchaseRate,
          deliveryDays: Number(i.deliveryDays),
          remarks: i.remarks,
        })),
        freightAmount: Number(freightAmount),
        paymentTerms,
      };

      await axios.post("/api/v1/rfq/public/submit", payload);

      toast.success("Quotation submitted successfully");
      setSubmitted(true);
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        RFQ not found
      </div>
    );
  }

  /* =====================================
     UI
  ===================================== */
  if (submitted || alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-sm border max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mt-6">Quotation Submitted</h1>

          <p className="text-gray-500 mt-3 leading-relaxed">
            Your quotation has been submitted successfully. Procurement team
            will review your quotation and contact you if required.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mt-6 text-left">
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">RFQ No</span>

              <span className="font-medium">{rfq?.rfqNo}</span>
            </div>

            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">Supplier</span>

              <span className="font-medium">{supplier?.supplierId?.name}</span>
            </div>

            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">Submitted At</span>

              <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => window.close()}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-2xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* HEADER */}

      <div className="bg-white rounded-2xl border-b top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold">Request For Quotation</h1>

          <p className="text-gray-500 mt-1">{rfq.rfqNo}</p>
        </div>
      </div>

      {/* BODY */}

      <div className="max-w-6xl mx-auto py-4 md:py-6 md:px-4 space-y-5 pb-10">
        {/* BASIC */}

        <div className="bg-white rounded-2xl border p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info
              icon={<Building2 size={18} />}
              label="Store"
              value={rfq.storeId?.name}
            />

            <Info
              icon={<CalendarDays size={18} />}
              label="Deadline"
              value={new Date(rfq.quotationDeadline).toDateString()}
            />

            <Info
              icon={<Package size={18} />}
              label="Supplier"
              value={supplier?.supplierId?.name}
            />

            <Info
              icon={<Package size={18} />}
              label="Items"
              value={rfq.items?.length}
            />
          </div>
        </div>

        {/* DELIVERY */}

        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} />

            <h2 className="font-semibold text-lg">Delivery Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Delivery To</p>

              <p className="font-medium mt-1">
                {rfq.purchaseRequestId?.site?.name || rfq.storeId?.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>

              <div className="flex items-start gap-2 mt-1">
                <MapPin size={16} className="mt-1 text-gray-500" />

                <p className="font-medium">
                  {rfq.purchaseRequestId?.site?.address?.fullAddress ||
                    "No address available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS */}

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Quotation Items</h2>
          </div>

          <div className="space-y-4 p-4">
            {quotationItems.map((item, index) => (
              <div key={index} className="border rounded-2xl p-4">
                {/* ITEM */}

                <div className="mb-4">
                  <h3 className="font-semibold text-base">{item.name}</h3>

                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>

                  <p className="text-sm mt-2">
                    Qty:{" "}
                    <span className="font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </p>
                </div>

                {/* INPUTS */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* RATE */}

                  <div>
                    <label className="text-sm text-gray-500">Rate</label>

                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", e.target.value)
                      }
                      className="w-full border rounded-xl px-4 py-3 mt-1"
                    />
                  </div>

                  {/* GST */}

                  <div>
                    <label className="text-sm text-gray-500">GST %</label>

                    <input
                      type="number"
                      value={item.gst}
                      onChange={(e) => updateItem(index, "gst", e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 mt-1"
                    />
                  </div>

                  {/* DELIVERY */}

                  <div>
                    <label className="text-sm text-gray-500">
                      Delivery Days
                    </label>

                    <input
                      type="date"
                      value={item.deliveryDays}
                      onChange={(e) =>
                        updateItem(index, "deliveryDays", e.target.value)
                      }
                      className="w-full border rounded-xl px-4 py-3 mt-1"
                    />
                  </div>
                </div>

                {/* AMOUNT */}

                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Amount</span>

                    <span className="text-xl font-bold">
                      ₹{Number(item.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* REMARKS */}

                <div className="mt-4">
                  <label className="text-sm text-gray-500">Item Remarks</label>

                  <textarea
                    rows={3}
                    value={item.remarks}
                    onChange={(e) =>
                      updateItem(index, "remarks", e.target.value)
                    }
                    className="w-full border rounded-xl px-4 py-3 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMERCIAL TERMS */}

        <div className="bg-white rounded-2xl border p-5 space-y-5">
          <div className="flex items-center gap-2">
            <FileText size={18} />

            <h2 className="font-semibold text-lg">Commercial Terms</h2>
          </div>

          {/* FREIGHT */}

          <div>
            <label className="text-sm font-medium">Freight Amount</label>

            <input
              type="number"
              value={freightAmount}
              onChange={(e) => setFreightAmount(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          {/* PAYMENT */}

          <div>
            <label className="text-sm font-medium">Payment Terms</label>

            <textarea
              rows={4}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>
        </div>

        {/* TOTAL */}

        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee size={20} />

              <span className="text-gray-500">Total Amount</span>
            </div>

            <span className="text-3xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ACTION */}

        <div className="bg-white rounded-2xl border p-5">
          <button
            onClick={submitQuotation}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-xl w-full font-medium"
          >
            {submitting ? "Submitting..." : "Submit Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-gray-500">{icon}</div>

    <div>
      <p className="text-xs text-gray-500">{label}</p>

      <p className="font-medium mt-1">{value}</p>
    </div>
  </div>
);

export default PublicQuotationPage;
