import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDownload } from "react-icons/md";
import Header from "../components/Header";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PurchaseOrderPdf from "../pdf/PurchaseOrderPdf";

axios.defaults.withCredentials = true;

const PurchaseOrderScreen = () => {
  const { id, approvalId } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPO();
  }, [id]);

  const fetchPO = async () => {
    try {
      const res = await axios.get(`/api/v1/purchase-order/${id}`);
      setPo(res.data);
    } catch (err) {
      toast.error("Failed to load Purchase Order");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (index) => {
    navigate(`/edit-purchase-order/${po._id}/item/${index}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!po) return <div className="p-4">Not found</div>;

  return (
    <div>
      <Header category="Page" title="Purchase Order" />

      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">PO No</p>
          <p className="font-semibold">{po.poNumber}</p>
        </div>

        <PDFDownloadLink
          document={<PurchaseOrderPdf PurchaseOrder={po} />}
          fileName={`PO-${po.poNumber}.pdf`}
        >
          {({ loading }) => (
            <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <MdDownload />
              {loading ? "Preparing..." : "Download"}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded shadow">
        <Info label="Supplier" value={po.supplier?.name} />
        <Info label="Delivery To" value={po.deliveryTo} />
        <Info label="Delivery Status" value={po.deliveryStatus} />
        <Info label="Total Amount" value={`₹ ${po.totalAfterTax || 0}`} />
        <Info label="Paid" value={`₹ ${po.totalPaid || 0}`} />
        <Info label="Due" value={`₹ ${po.totalDue || 0}`} />
      </div>

      {/* APPROVAL TIMELINE */}
      <ApprovalTimeLine item={po} module="purchaseOrder" />

      {/* ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {po.items.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{item.item}</p>

            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <Row label="Requested Qty" value={item.requestedQty} />
              <Row label="Received Qty" value={item.receivedQty} />
              <Row label="Invoiced Qty" value={item.invoicedQty} />
              <Row label="Rate" value={`₹ ${item.rate}`} />
              <Row label="Amount" value={`₹ ${item.amount}`} />
            </div>

            {/* EDIT (only if no GRN yet) */}
            {po?.deliveryRecords?.length === 0 && (
              <button
                onClick={() => handleEditItem(index)}
                className="mt-3 text-blue-600 flex items-center gap-1"
              >
                <GrEdit /> Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {/* APPROVAL ACTIONS */}
      {approvalId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-center gap-6">
          <button
            onClick={() => axios.put(`/api/v1/approval/${approvalId}`)}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Approve
          </button>
          <button
            onClick={() => navigate(`/reject/${approvalId}`)}
            className="bg-red-600 text-white px-6 py-2 rounded"
          >
            Reject
          </button>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default PurchaseOrderScreen;
