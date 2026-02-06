import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SalesInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("/api/v1/sales-invoice");
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Sales Invoices</h2>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            onClick={() => navigate(`/erp/inventory/sales-invoice/${inv._id}`)}
            className="border rounded p-3 bg-white shadow-sm cursor-pointer"
          >
            <div className="flex justify-between">
              <p className="font-medium">{inv.invoiceNo}</p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  inv.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {inv.status}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Site: {inv.site?.name}
            </p>

            <p className="text-sm mt-1 font-semibold">
              ₹ {inv.netAmount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesInvoice;
