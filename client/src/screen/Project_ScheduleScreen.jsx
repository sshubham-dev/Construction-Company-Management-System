import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import { GrEdit } from "react-icons/gr";
import { MdAdd, MdDelete, MdDownload } from "react-icons/md";
import Modal from "../components/Modal";
import CreateProjectSchedule from "../components/CreateProjectSchedule";
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProjectSchedulePdf from "../pdf/ProjectSchedulePdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";
axios.defaults.withCredentials = true;

const Project_ScheduleScreen = () => {
  const [projectSchedule, setProjectSchedule] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getprojectSchedule(id);
  }, []);

  const getprojectSchedule = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/project-schedule/${id}`);
      setProjectSchedule(data);
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
      const { data } = await axios.delete(
        `/api/v1/project-schedule/${id}/projectDetails/${index}`
      );
      setProjectSchedule(data);
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

  const ProjectScheduleCard = ({
    workDescription,
    reason,
    difference,
    actual,
    status,
    planned,
    rePlannedDates,
    onEdit,
    onDelete,
  }) => (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          {workDescription}
        </h2>

        {/* Planned Date */}
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-500">Planned Date</span>
          <span className="text-gray-800">
            {planned ? moment(planned).format("DD-MM-YYYY") : "-"}
          </span>
        </div>

        {/* ✅ Replanned Dates List */}
        {rePlannedDates?.length > 0 && (
          <div className="mt-2">
            <span className="text-gray-500 text-sm">Replanned Dates</span>
            <div className="border border-gray-100 rounded-md p-2 mt-1 bg-gray-50 space-y-1 max-h-32 overflow-y-auto">
              {rePlannedDates.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-xs text-gray-700 border-b border-gray-100 last:border-0 pb-1"
                >
                  <span>{moment(item.date).format("DD-MM-YYYY")}</span>
                  <span className="text-right text-gray-600 italic">
                    {item.reason || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex justify-between text-sm py-1 mt-2">
          <span className="text-gray-500">Status</span>
          <span
            className={`${
              status.toLowerCase() === "completed"
                ? "bg-green-100 text-green-700"
                : status.toLowerCase() === "started" && "partially completed" ? "bg-yellow-100 text-yellow-700" :"bg-red-100 text-red-700"
            } px-2 py-0.5 rounded-full text-xs font-medium`}
          >
            {status}
          </span>
        </div>

        {/* Actual */}
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-500">Actual Date</span>
          <span className="text-gray-800">
            {actual ? moment(actual).format("DD-MM-YYYY") : "-"}
          </span>
        </div>

        {/* Difference */}
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-500">Difference</span>
          <span className="text-gray-800">{difference || "-"}</span>
        </div>

        {/* Reason */}
        <div className="flex justify-between text-sm py-1">
          <span className="text-gray-500">Reason</span>
          <span className="text-gray-800 text-right w-1/2">
            {reason || "-"}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-3 pt-3 border-t">
        <button
          onClick={onEdit}
          className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
        >
          <GrEdit /> Edit
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 text-sm flex items-center gap-1 hover:underline"
        >
          <MdDelete /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <section className="p-2 md:p-6 w-full mx-auto">
        <Header
          category="Page"
          title={`${projectSchedule.site?.name || "Project"} Schedule`}
        />

        {/* Top Action Buttons */}
        <div className="flex justify-between items-center mt-4 mb-6">
          <button
            onClick={() => handleAdd(projectSchedule._id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <MdAdd /> Add
          </button>
          <PDFDownloadLink
            document={<ProjectSchedulePdf ProjectSchedule={projectSchedule} />}
            fileName={`PS-${projectSchedule?._id || "download"}.pdf`}
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

        <ApprovalTimeLine item={projectSchedule} module="projectSchedule" />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projectSchedule.projectDetail?.length > 0 ? (
            projectSchedule.projectDetail.map((work, index) => (
              <ProjectScheduleCard
                key={index}
                workDescription={work.workDetail || "No Work Detail"}
                planned={work?.planned}
                rePlannedDates={work?.rePlannedDates || []}
                difference={work?.difference}
                actual={work?.actual}
                status={work?.status}
                reason={work?.reason}
                onEdit={() => handleEdit(projectSchedule._id, index)}
                onDelete={() => deleteDetail(projectSchedule._id, index)}
              />
            ))
          ) : (
            <div className="text-center col-span-full text-gray-500 py-10">
              No project details available
            </div>
          )}
        </div>
      </section>

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

      {/* Modals */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Project Detail"
      >
        <CreateProjectSchedule
          onClose={() => setEditModal(false)}
          id={editId}
          index={editIndex}
        />
      </Modal>

      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        head="Add Project Schedule"
      >
        <CreateProjectSchedule onClose={() => setAddModal(false)} id={editId} />
      </Modal>

      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        head="Reject Reason"
      >
        <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
      </Modal>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Project_ScheduleScreen;
