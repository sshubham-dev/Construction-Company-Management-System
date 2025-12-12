import React, { useEffect, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd, MdDownload } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import Modal from "../components/Modal";
import CreateExtraWork from "../components/CreateExtraWork";
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExtraWorkPdf from "../pdf/ExtraWorkPdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";
axios.defaults.withCredentials = true;

const ExtraWorkScreen = () => {
  const [extraWork, setExtraWork] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");

  useEffect(() => {
    if (id) getextraWork(id);
  }, [id]);

  const getextraWork = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/extra-work/${id}`);
      setExtraWork(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAdd = (id) => {
    setAddModal(true);
    setEditId(id);
  };

  const handleEdit = (id, index) => {
    setEditModal(true);
    setEditId(id);
    setEditIndex(index);
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/extra-work/${id}/work/${index}`
      );
      setExtraWork(response.data.extraWork);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await axios.put(`/api/v1/approval/${id}`);
      toast.success(response.data.message);
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = (id) => {
    setRejectId(id);
    setRejectModal(true);
  };

  const ExtraWorkCard = ({
    work,
    rate,
    unit,
    paid,
    due,
    amount,
    status,
    paymentStatus,
    quantity,
    handleEdit,
    handleDelete,
  }) => {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{work}</h2>

        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between">
            <div className="text-gray-600">Rate:</div>
            <div>{rate}/{unit}</div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Quantity:</div>
            <div>{quantity}</div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Amount:</div>
            <div>₹{amount}</div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Status:</div>
            <span
              className={`${
                status === "Paid" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              } px-2 py-0.5 rounded text-sm font-semibold`}
            >
              {status}
            </span>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Payment Status:</div>
            <span
              className={`${
                paymentStatus === "Completed"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              } px-2 py-0.5 rounded text-sm font-semibold`}
            >
              {paymentStatus}
            </span>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Paid Amount:</div>
            <div>₹{paid || 0}</div>
          </div>

          <div className="flex justify-between">
            <div className="text-gray-600">Due Amount:</div>
            <div>₹{due || 0}</div>
          </div>

          {extraWork?.approvalStatus === "Pending" && (
            <div className="flex justify-between pt-3">
              <button onClick={handleEdit} className="text-blue-500">
                <GrEdit className="inline-block mr-1" />
                Edit
              </button>
              <button onClick={handleDelete} className="text-red-500">
                <MdDelete className="inline-block mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header category="Page" title="Extra Work's" />

      <section className="mb-12 w-full">
        <div className="flex justify-between items-center mt-4 mb-6">
          <button
            onClick={() => handleAdd(extraWork._id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <MdAdd /> Add
          </button>

          <PDFDownloadLink
            document={<ExtraWorkPdf Work={extraWork} />}
            fileName={`EW-${extraWork?.site?.name || "download"}.pdf`}
          >
            {({ loading }) => (
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center">
                <MdDownload className="mr-2" />
                {loading ? "Preparing..." : "Download"}
              </button>
            )}
          </PDFDownloadLink>
        </div>

        <ApprovalTimeLine
          item={extraWork}
          module={
            extraWork?.extraFor === "Client"
              ? "clientExtraWork"
              : "contractorExtraWork"
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {extraWork?.WorkDetail?.map((detail, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl">
              <ExtraWorkCard
                work={detail.work}
                rate={detail.rate}
                unit={detail.unit}
                quantity={detail.area}
                amount={detail.amount}
                status={detail.status}
                paid={detail.paid}
                due={detail.due}
                paymentStatus={extraWork.paymentStatus}
                handleEdit={() => handleEdit(extraWork._id, index)}
                handleDelete={() => deleteDetail(extraWork._id, index)}
              />
            </div>
          ))}
        </div>

        {approvalId !== undefined && (
          <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-center gap-6">
            <button
              onClick={() => handleApprove(extraWork?._id)}
              className="bg-green-500 text-white px-6 py-2 rounded-full"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(extraWork?._id)}
              className="bg-red-500 text-white px-6 py-2 rounded-full"
            >
              Reject
            </button>
          </div>
        )}

        <Toaster position="top-right" reverseOrder={false} />

        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          head="Edit Extra Work"
        >
          <CreateExtraWork
            onClose={() => setEditModal(false)}
            id={editId}
            index={editIndex}
          />
        </Modal>

        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          head="Add Extra Work"
        >
          <CreateExtraWork onClose={() => setAddModal(false)} id={editId} />
        </Modal>

        <Modal
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          head="Reject Reason"
        >
          <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
        </Modal>
      </section>
    </div>
  );
};


export default ExtraWorkScreen;
