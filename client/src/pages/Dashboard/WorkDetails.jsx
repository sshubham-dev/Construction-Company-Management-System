import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import WorkDetailsForm from "../../components/CreateWorkDetail";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

axios.defaults.withCredentials = true;

const WorkDetails = () => {
  const [workDetails, setWorkDetail] = useState([]);
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editDetailModal, setEditDetailModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");

  useEffect(() => {
    const fetchWorkDetails = async () => {
      try {
        const response = await axios.get("/api/v1/work-details");
        console.log(response.data);
        setWorkDetail(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWorkDetails();
  }, []);

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const editDetails = (id, index) => {
    setEditDetailModal(true);
    setEditId(id);
    setEditIndex(index);
    console.log(index);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/v1/work-details/${id}`);
      setWorkDetail(workDetails.filter((workDetail) => workDetail._id !== id));
      toast.success(response.data.message);
      console.log(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const DeleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(
        `/api/v1/work-details/${id}/${index}`
      );
      setWorkDetail(response.data?.workDetails);
      toast.success(response.data.message);
      console.log(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get("/api/v1/work-details/export", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "work_details_all.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Exported all work details.");
    } catch (err) {
      console.error("Export all failed", err);
      toast.error("Export failed");
    }
  };

  const exportOneToExcel = async (id, title) => {
    try {
      const response = await axios.get(`/api/v1/work-details/${id}/export`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // make filename safe from title
      const safeTitle = (title || "work_detail").replace(/\s+/g, "_");
      const filename = `work_details_${safeTitle}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported "${title}"`);
    } catch (err) {
      console.error("Export one failed", err);
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <div className="overflow-x-auto h-full">
        <Header category="Page" title="Work Detail's" />
        <div className="text-sm text-gray-700 py-1  mb-4 flex flex-row items-center justify-end">
          <button onClick={() => exportToExcel()} className="pr-4">
            <RiFileExcel2Line size={28} color="green" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="bg-green-500 rounded-full text-white p-2 mt-2 sm:mt-0"
          >
            <MdAdd className="text-xl" />
          </button>
        </div>

        <div
          className="overflow-x-auto grid grid-cols-1 lg:grid-cols-2 gap-2"
          style={{
            scrollbarWidth: "none",
            "-ms-overflow-style": "none",
          }}
        >
          {workDetails?.map((workDetail) => (
            <div key={workDetail._id} className="card">
              <details className="rounded-lg bg-white overflow-hidden shadow-lg p-3">
                <summary
                  className="flex justify-between flex-row text-xl font-large text-color-title cursor-pointer"
                  style={{ padding: "1rem" }}
                >
                  {workDetail.title}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportOneToExcel(workDetail._id, workDetail.title)
                      }
                      title="Export"
                    >
                      <RiFileExcel2Line size={20} color="green" />
                    </button>
                    <button
                      onClick={() => handleEdit(workDetail._id)}
                      className="mr-2"
                    >
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                    <button onClick={() => handleDelete(workDetail._id)}>
                      <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                    </button>
                  </div>
                </summary>

                {workDetail?.description?.map((description, index) => (
                  <ul
                    key={index}
                    className="flex justify-between flex-row my-1.5"
                  >
                    <li className="font-medium text-color-title mx-5 py-2 list-disc text-wrap">
                      {description?.work}
                    </li>
                    <div className="px-6 py-2">
                      <button
                        onClick={() => editDetails(workDetail._id, index)}
                        className="mr-2"
                      >
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button>
                      <button
                        onClick={() => DeleteDetail(workDetail._id, index)}
                      >
                        <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                      </button>
                    </div>
                  </ul>
                ))}
              </details>
            </div>
          ))}
        </div>

        <Toaster position="top-right" reverseOrder={false} />
      </div>
      {/* Work Details Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create Work Detail"
      >
        <WorkDetailsForm onClose={() => setCreateModal(false)} />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Edit Work Detail"
      >
        <WorkDetailsForm onClose={() => setEditModal(false)} id={editId} />
      </Modal>
      <Modal
        isOpen={editDetailModal}
        onClose={() => setEditDetailModal(false)}
        head="Edit Work Detail"
      >
        <WorkDetailsForm
          onClose={() => setEditDetailModal(false)}
          id={editId}
          index={editIndex}
        />
      </Modal>
    </div>
  );
};

export default WorkDetails;
