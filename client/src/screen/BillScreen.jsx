import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import Reject from "../components/UI/Reject";
// import { reject } from "../../../server/controller/approval.controller";

const BillScreen = () => {
  const { id, approvalId } = useParams();
  const [bill, setBill] = useState("");
  const [contractorBill, setContractorBill] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [editId, setEditId] = useState("");
  useEffect(() => {
    getbill(id);
  }, [id]);

  const getbill = async (id) => {
    try {
      if (id) {
        const billData = await axios.get(`/api/v1/bill/${id}`);
        console.log(billData);
        setBill(billData.data);
        setContractorBill(billData.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const handleApprove = async () => {
    try {
      await axios.put(`/api/v1/approval/${approvalId}`);
      toast.success("Bill Approved");
      getbill(id);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      setRejectId(id);
      setRejectModal(true);
    } catch (error) {
      console.error(error);
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
            3rd Floor, The Western Tower, Ratu Road, Ranchi, Jharkhand
          </div>
          <div className="text-gray-600 text-sm">
            Contact: +91 7019943376 | bhuvihomes@gmail.com
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
          <div className="text-sm text-gray-700">
            Bill Type:{" "}
            <span className="font-semibold uppercase">{bill?.billType}</span>
          </div>
        </div>

        {/* Work Details Card */}
        <div className="border border-gray-300 rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Work Details:</h3>

          {/* WORK ORDER */}
          {bill?.billType === "workorder" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500">Work Name</p>
                <p className="font-medium">{bill?.billOf?.workName}</p>
              </div>
              <div>
                <p className="text-gray-500">Stage</p>
                <p className="font-medium">{bill?.billOf?.stageName}</p>
              </div>
              <div>
                <p className="text-gray-500">Quantity ({bill?.billOf?.unit})</p>
                <p className="font-medium">{bill?.billOf?.qty}</p>
              </div>
              <div>
                <p className="text-gray-500">Rate</p>
                <p className="font-medium">₹{bill?.billOf?.rate}</p>
              </div>
            </div>
          )}

          {/* EXTRA WORK */}
          {bill?.billType === "extrawork" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500">Work Name</p>
                <p className="font-medium">{bill?.billOf?.workName}</p>
              </div>
              <div>
                <p className="text-gray-500">Quantity ({bill?.billOf?.unit})</p>
                <p className="font-medium">{bill?.billOf?.qty}</p>
              </div>
              <div>
                <p className="text-gray-500">Rate</p>
                <p className="font-medium">₹{bill?.billOf?.rate}</p>
              </div>
            </div>
          )}

          {/* SUPPLY LABOUR */}
          {bill?.billType === "supplylabour" && (
            <div>
              <p className="text-gray-700 mb-2">Work: {bill?.billOf?.work}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Skilled Male</p>
                  <p className="font-medium">
                    {bill?.billOf?.skilledMale} × ₹
                    {bill?.billOf?.skilledMaleRate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Skilled Female</p>
                  <p className="font-medium">
                    {bill?.billOf?.skilledFemale} × ₹
                    {bill?.billOf?.skilledFemaleRate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Unskilled Male</p>
                  <p className="font-medium">
                    {bill?.billOf?.unskilledMale} × ₹
                    {bill?.billOf?.unskilledMaleRate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Unskilled Female</p>
                  <p className="font-medium">
                    {bill?.billOf?.unskilledFemale} × ₹
                    {bill?.billOf?.unskilledFemaleRate}
                  </p>
                </div>
              </div>
            </div>
          )}
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
              <p className="font-medium">₹{bill?.toPay || 0}</p>
            </div>

            <div>
              <p className="text-gray-500">Paid</p>
              <p className="font-medium">₹{bill?.paidAmount || 0}</p>
            </div>

            <div>
              <p className="text-gray-500">Due</p>
              <p className="font-medium">₹{bill?.due || 0}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">{bill?.paymentStatus}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-2">
          <p className="text-gray-700">{bill?.reason}</p>
        </div>

        <ApprovalTimeLine item={bill} module="bill" />

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end mt-6 gap-3">
          <PDFDownloadLink
            document={<BillPdf bill={bill} />}
            fileName={`${
              bill.site?.name + "-" + bill?.billNo || "download"
            }.pdf`}
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
          {/* <button
            type="button"
            className="bg-green-600 flex justify-center items-center gap-3 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
            onClick={() => handleEdit(bill._id)}
          >
            <GrEdit /> Edit
          </button> */}
          {approvalId !== undefined && (
            <>
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
                onClick={() => handleReject(approvalId)}
              >
                Reject
              </button>
            </>
          )}
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
        <Modal
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          head="Reject Reason"
        >
          <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
        </Modal>

        <Toaster position="top-right" reverseOrder={false} />
      </section>
    </div>
  );
};

export default BillScreen;
