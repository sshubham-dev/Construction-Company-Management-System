import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd, MdDownload } from "react-icons/md";
import Modal from "../components/Modal";
import CreateQualitySchedule from "../components/CreateQualitySchedule";
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QualitySchedulePdf from "../pdf/QualitySchedulePdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";
axios.defaults.withCredentials = true;

const QualityScheduleScreen = () => {
  const [qualitySchedule, setQualitySchedule] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getqualitySchedule(id);
    }
  }, []);

  const getqualitySchedule = async (id) => {
    try {
      const qualityScheduleData = await axios.get(
        `/api/v1/quality-schedule/${id}`
      );
      console.log(qualityScheduleData.data);
      setQualitySchedule(qualityScheduleData.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (id, index) => {
    // console.log(id)
    setEditModal(true);
    setEditId(id);
    setEditIndex(index);
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/quality-schedule/${id}/workDetails/${index}`
      );
      setQualitySchedule(response.data?.qualitySchedule);
      console.table(response.data?.qualitySchedule);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addMore = async (id) => {
    // console.log(id)
    setAddModal(true);
    setEditId(id);
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

  const QualityScheduleCard = ({
    workDescription,
    reason,
    difference,
    checkedAt,
    status,
    checkingDate,
    handleEdit,
    handleDelete,
  }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{workDescription}</h2>
        <div className="flex flex-col gap-2 text-md">
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Checking Date:</div>
            <div className="text-gray-800">
              {checkingDate ? moment(checkingDate).format("DD-MM-YYYY") : "-"}
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
            <div className="text-gray-600">Actual Date:</div>
            <div className="text-gray-800">
              {checkedAt ? moment(checkedAt).format("DD-MM-YYYY") : "-"}
            </div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Difference:</div>
            <div className="text-gray-800">{difference}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Reason:</div>
            <div className="text-gray-800">{reason}</div>
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
          title={`${qualitySchedule.site?.name} Quality Check Schedule`}
        />
        <div className="flex justify-between items-center mt-4 mb-6">
          <button
            onClick={() => handleAdd(qualitySchedule._id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <MdAdd /> Add
          </button>
          <PDFDownloadLink
            document={<QualitySchedulePdf QualitySchedule={qualitySchedule} />}
            fileName={`QS-${qualitySchedule?._id || "download"}.pdf`}
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

        <ApprovalTimeLine item={qualitySchedule} module="qualitySchedule" />

        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {qualitySchedule.workDetails?.map((detail, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl">
              <QualityScheduleCard
                workDescription={detail.work || "No Work Detail"}
                checkingDate={detail.checkingDate}
                status={detail.status}
                checkedAt={detail.checkedAt}
                difference={detail.difference}
                reason={detail.reason}
                handleEdit={() => handleEdit(qualitySchedule._id, index)}
                handleDelete={() => deleteDetail(qualitySchedule._id, index)}
              />
            </div>
          ))}
        </div>
        {/* Bottom Action Buttons (Approve/Reject) */}
        {approvalId !== undefined && (
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
          head="Edit Quality Schedules"
        >
          <CreateQualitySchedule
            onClose={() => setEditModal(false)}
            id={editId}
            index={editIndex}
          />
        </Modal>
        <Modal
          isOpen={addModal}
          onClose={() => setAddModal(false)}
          head="Add Quality Schedules"
        >
          <CreateQualitySchedule
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

export default QualityScheduleScreen;
