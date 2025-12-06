import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import CreateWOTemplate from "../components/CreateWOTemplate";

const WOTemplateScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data } = await axios.get(`/api/v1/work-template/${id}`);
        setTemplate(data);
      } catch (error) {
        toast.error("Failed to fetch template details");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading template details...
      </div>
    );

  if (!template)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Template not found.
      </div>
    );

  const handleEdit = (templateId) => {
    // Logic to open edit modal or navigate to edit page
    setEditId(templateId);
    setEditModal(true);
  };

  const handleTemplateDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    try {
      await axios.delete(`/api/v1/work-template/${id}`);
      toast.success("Template deleted");
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FaArrowLeft className="text-lg" /> <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(template._id)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <MdEdit className="text-lg" /> Edit
          </button>
          <button
            onClick={() => handleTemplateDelete(template._id)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition"
          >
            <MdDelete className="text-lg" /> Delete
          </button>
        </div>
      </div>

      {/* Template Title */}
      <div className="bg-white shadow-sm border rounded-xl p-5 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          {template.title}
        </h1>
        <p className="text-sm text-gray-500">
          Created on {moment(template.createdAt).format("DD MMM YYYY")}
        </p>
      </div>

      {/* Description List */}
      <div className="space-y-6">
        {template.description?.map((desc, index) => (
          <div
            key={index}
            className="bg-white border shadow-sm rounded-2xl p-5 transition hover:shadow-md space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
              <div>
                <h2 className="text-md font-semibold text-gray-800">
                  {desc.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Applies to:{" "}
                  {desc.appliesTo?.length
                    ? desc.appliesTo.join(", ")
                    : "Not specified"}
                </p>
              </div>

              <div className="mt-3 sm:mt-0">
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg">
                    Unit: <span className="font-medium">{desc.unit}</span>
                  </span>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg">
                    Default Rate:{" "}
                    <span className="font-medium">₹{desc.rate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Work Stages Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium">
                      Stage Name
                    </th>
                    <th className="py-2.5 px-4 text-center font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {desc.paymentSchedule?.map((stage, i) => (
                    <tr
                      key={i}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-gray-700">
                        {stage.stage}
                      </td>
                      <td className="py-2.5 px-4 text-center text-gray-700">
                        {stage.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleEdit(template._id, index)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition"
              >
                <MdEdit className="text-lg" /> Edit
              </button>
              <button
                onClick={() => handleTemplateDelete(template._id)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm shadow-sm transition"
              >
                <MdDelete className="text-lg" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={editModal} onClose={() => setEditModal(false)}>
        <CreateWOTemplate onClose={() => setEditModal(false)} templateId={editId} />
      </Modal>
    </div>
  );
};

export default WOTemplateScreen;
