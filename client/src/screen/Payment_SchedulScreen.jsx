import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd, MdDownload } from "react-icons/md";
import moment from "moment";
import Header from "../components/Header";
import Modal from "../components/Modal";
import CreatePaymentSchedule from "../components/CreatePaymentSchedule";
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentSchedulePdf from "../pdf/PaymentSchedulePdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";
axios.defaults.withCredentials = true;

const Payment_SchedulScreen = () => {
  const [paymentSchedule, setpaymentSchedules] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");

  useEffect(() => {
    if (id) {
      getpaymentSchedules(id);
    }
  }, []);

  const getpaymentSchedules = async (id) => {
    try {
      const paymentSchedulesData = await axios.get(
        `/api/v1/payment-schedule/${id}`
      );
      console.log(paymentSchedulesData.data);
      setpaymentSchedules(paymentSchedulesData.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (id, index) => {
    setEditModal(true);
    setEditId(id);
    setEditIndex(index);
  };

  const handleAdd = (id) => {
    setAddModal(true);
    setEditId(id);
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/payment-schedule/${id}/paymentDetails/${index}`
      );
      console.log(response.data);
      setpaymentSchedules(response.data.existingPaymentSchedule);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleApprove = async (id) => {
    try {
      // console.log(id)
      const response = await axios.put(`/api/v1/approval/${id}`);
      toast.success(response.data.message);
      navigate(-1);
    } catch (error) {
      console.error(error);
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

  const PaymentScheduleCard = ({
    workDescription,
    paid,
    due,
    amount,
    status,
    dateOfPayment,
    dueDate,
    handleEdit,
    handleDelete,
  }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{workDescription}</h2>
        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Payment Amount:</div>
            <div className="text-gray-800">{amount}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Payment Date:</div>
            <div className="text-gray-800">
              {dateOfPayment ? moment(dateOfPayment).format("DD-MM-YYYY") : "-"}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Status:</div>
            <div
              className={`${
                status === "paid" ? "text-green-800" : "text-red-800"
              } ${
                status === "paid" ? "bg-green-200" : "bg-red-200"
              } py-0.5 px-2.5 rounded-md font-semibold text-sm`}
            >
              {status}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Date:</div>
            <div className="text-gray-800">
              {moment(dueDate).format("DD-MM-YYYY")}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Amount:</div>
            <div className="text-gray-800">{due}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <button onClick={handleEdit} className="text-blue-500 mr-2">
              <GrEdit className="inline-block mr-1" />
              Edit
            </button>
            <button onClick={handleDelete} className="text-red-500">
              <MdDelete className="inline-block mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="mb-10 h-full w-full">
        <Header
          category="Page"
          title={`${paymentSchedule.site?.name} Payment Schedule`}
        />
        <div className="flex justify-between items-center mt-4 mb-6">
          <button
            onClick={() => handleAdd(paymentSchedule._id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <MdAdd /> Add
          </button>
          <PDFDownloadLink
            document={<PaymentSchedulePdf Work={paymentSchedule} />}
            fileName={`PAYS-${paymentSchedule?._id || "download"}.pdf`}
          >
            {({ loading }) => (
              <button
                type="button"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center"
              >
                <MdDownload className="mr-2" />{" "}
                {loading ? "Preparing..." : "Download"}
              </button>
            )}
          </PDFDownloadLink>
        </div>

        <ApprovalTimeLine item={paymentSchedule} module="paymentSchedule" />

        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paymentSchedule.paymentDetails?.map((work, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl">
              <PaymentScheduleCard
                workDescription={work.workDescription}
                // paid={work.paid}
                due={work.due}
                amount={work.amount}
                dateOfPayment={work.paymentDate}
                dueDate={work.dueDate}
                status={work.status}
                handleEdit={() => handleEdit(paymentSchedule._id, index)}
                handleDelete={() => deleteDetail(paymentSchedule._id, index)}
              />
            </div>
          ))}
        </div>
              {/* Bottom Action Buttons (Approve/Reject) */}
      {location.pathname !== `/payment-schedule/${id}` && (
        <div className="fixed bottom-14 lg:bottom-0 left-0 bg-white right-0 border-t p-3 flex justify-around md:justify-center md:gap-6 text-md">
          <button
            onClick={() => handleApprove(approvalId)}
            className="bg-green-500 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-all"
          >
            Approve
          </button>
          <button
            onClick={() => handleReject(approvalId)}
            className="bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-all"
          >
            Reject
          </button>
        </div>
      )}
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          head="Update Payment Detail"
        >
          <CreatePaymentSchedule
            onClose={() => setEditModal(false)}
            id={editId}
            index={editIndex}
          />
        </Modal>
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          head="Add Payment Schedule"
        >
          <CreatePaymentSchedule
            onClose={() => setAddModal(false)}
            id={editId}
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

export default Payment_SchedulScreen;
