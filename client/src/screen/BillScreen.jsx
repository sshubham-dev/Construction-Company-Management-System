import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../asset/logo.png";
import moment from "moment";
import axios from "axios";
import { GrEdit } from "react-icons/gr";
import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/Modal";
import CreateBill from "../components/CreateBill";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BillPdf from "../pdf/BillPdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";

const BillScreen = () => {
  const { id } = useParams();
  const [bill, setBill] = useState("");
  const [contractorBill, setContractorBill] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    if (id) {
      getbills(id);
    }
  }, []);

  const getbills = async (id) => {
    try {
      if (id) {
        const billData = await axios.get(`/api/v1/bill/${id}`);
        setBill(billData.data);
        setContractorBill(billData.data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

const handleApprove = async () => {
    try {
      await axios.post(`/api/v1/bill/${id}/approve`);
      toast.success("Bill Approved");
      getBills(id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/api/v1/bill/${id}/reject`);
      toast.success("Bill Rejected");
      getBills(id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 px-3">
      <section className="w-full">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6">
          <img className="h-28 md:h-32 w-fit mb-2" src={logo} alt="Logo" />
          <div className="text-blue-950 font-bold text-2xl md:text-3xl">
            Bhuvi Consultants
          </div>
          <div className="text-gray-600 text-sm mt-1">
            123 Main Street, Ranchi, Jharkhand
          </div>
          <div className="text-gray-600 text-sm">
            Contact: +91 9876543210 | info@bhuvi.com
          </div>
        </div>

        {/* Bill Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Bill To:</h2>
          <p className="text-gray-700 mb-1">Name: {bill?.contractor?.name}</p>
          <p className="text-gray-700 mb-1">Site: {bill?.site?.name}</p>
          <p className="text-gray-700 mb-1">
            Date:{" "}
            {bill?.dateOfBill
              ? moment(bill?.dateOfBill).format("DD-MM-YYYY")
              : "-"}
          </p>
          <p className="text-gray-700 mb-1">
            Bill No:{" "}
            {bill === ""
              ? "-"
              : `BHC/${bill?.site?.name}${bill?.billNo ? bill?.billNo : ""}`}
          </p>
        </div>

        {/* Work Details Card */}
        <div className="border border-gray-300 rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Work Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500">Description</p>
              <p className="font-medium">{bill.billOf?.workDetail}</p>
            </div>
            <div>
              <p className="text-gray-500">Rate/{bill.billOf?.unit}</p>
              <p className="font-medium">₹{bill.billOf?.rate}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity ({bill.billOf?.unit})</p>
              <p className="font-medium">{bill.billOf?.area}</p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-medium">₹{bill.billOf?.amount}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border border-gray-300 rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
          <p className="text-gray-700 mb-2">
            Payment Date:{" "}
            {bill?.dateOfPayment
              ? moment(bill?.dateOfPayment).format("DD-MM-YYYY")
              : "-"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-medium">₹{bill?.amount}</p>
            </div>
            <div>
              <p className="text-gray-500">To Pay</p>
              <p className="font-medium">₹{bill?.toPay}</p>
            </div>
            <div>
              <p className="text-gray-500">Paid</p>
              <p className="font-medium">₹{bill?.paidAmount || "0"}</p>
            </div>
            <div>
              <p className="text-gray-500">Due</p>
              <p className="font-medium">₹{bill?.dueAmount || "0"}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-2">
          <p className="text-gray-700">{bill?.reason}</p>
        </div>

        <ApprovalTimeLine item={bill} module='bill' />

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end mt-6 gap-3">
          <PDFDownloadLink
            document={<BillPdf bill={bill} />}
            fileName={`Bill-${bill?.billNo || "download"}.pdf`}
          >
            {({ loading }) => (
              <button
                type="button"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                {loading ? "Preparing..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
          <button
            type="button"
            className="bg-green-600 flex justify-center items-center gap-3 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
            onClick={() => handleEdit(bill._id)}
          >
            <GrEdit /> Edit
          </button>
          <button
            type="button"
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:bg-emerald-700 transition"
            onClick={handleApprove}
          >
            Approve
          </button>
          <button
            type="button"
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
            onClick={handleReject}
          >
            Reject
          </button>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          head="Update Bill"
        >
          <CreateBill
            onClose={() => setEditModal(false)}
            isEdit={editId}
            bill={bill}
          />
        </Modal>

        <Toaster position="top-right" reverseOrder={false} />
      </section>
    </div>
  );
};

export default BillScreen;
