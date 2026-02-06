import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const SalesInvoiceScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`/api/v1/sales-invoice/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!invoice) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {invoice.invoiceNo}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600"
        >
          Back
        </button>
      </div>

      {/* BASIC INFO */}
      <div className="border rounded p-3 bg-white text-sm space-y-1">
        <p><b>Date:</b> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <p><b>Store:</b> {invoice.store?.name}</p>
        <p><b>Site:</b> {invoice.site?.name}</p>
        <p><b>Status:</b> {invoice.status}</p>
      </div>

      {/* ITEMS */}
      <div className="border rounded bg-white">
        <div className="p-3 font-medium border-b">Items</div>

        {invoice.items.map((item, i) => (
          <div key={i} className="p-3 border-b text-sm">
            <p className="font-medium">{item.item}</p>
            <p className="text-xs text-gray-500">
              Qty: {item.qty} {item.unit} × ₹{item.rate}
            </p>
            <p className="text-sm font-semibold mt-1">
              ₹ {item.amount}
            </p>
          </div>
        ))}
      </div>

      {/* TOTALS */}
      <div className="border rounded p-3 bg-white text-sm space-y-1">
        <div className="flex justify-between">
          <span>Taxable Amount</span>
          <span>₹ {invoice.taxableAmount}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>₹ {invoice.gstAmount}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₹ {invoice.netAmount}</span>
        </div>
      </div>

      {/* ACTIONS (FUTURE) */}
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded">
          Download PDF
        </button>

        <button className="flex-1 bg-green-600 text-white py-2 rounded">
          Receive Payment
        </button>
      </div>

    </div>
  );
};

export default SalesInvoiceScreen;
