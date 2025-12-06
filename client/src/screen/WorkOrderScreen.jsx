import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./screen.css";
import { GrEdit } from "react-icons/gr";
import {
  MdDelete,
  MdEdit,
  MdDownload,
  MdCheckCircle,
  MdCancel,
  MdAdd,
} from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";
import Modal from "../components/Modal";
import CreateWorkOrder from "../components/CreateWorkOrder";
import logo from "../asset/bhuvihomes.png";
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import WorkOrderPdf from "../pdf/WorkOrderPdf";
import ApprovalTimeLine from "../components/UI/ApprovalTimeLine";

axios.defaults.withCredentials = true;

const WorkOrderScreen = () => {
  const [workOrder, setWorkOrder] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editDetailModal, setEditDetailModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [editIndex, setEditIndex] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");

  const { id, approvalId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchWorkOrder(id);
  }, [id]);

  const fetchWorkOrder = async (id) => {
    try {
      const res = await axios.get(`/api/v1/work-order/${id}`);
      setWorkOrder(res.data);
    } catch (err) {
      toast.error("Error fetching work order");
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    setEditModal(true);
  };

  const editWork = (id, index) => {
    setEditId(id);
    setEditIndex(index);
    setEditDetailModal(true);
  };

  const deleteWork = async (id, index) => {
    try {
      await axios.delete(`/api/v1/work-order/${id}/work/${index}`);
      toast.success("Work deleted successfully");
      fetchWorkOrder(id);
    } catch (err) {
      toast.error("Error deleting work");
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.put(`/api/v1/approval/${id}`);
      toast.success(res.data.message);
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = (id) => {
    setRejectId(id);
    setRejectModal(true);
  };

  if (!workOrder) return <p className="text-center py-6">Loading...</p>;

  return (
    <div className="p-4 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between border-b pb-4">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <img src={logo} className="w-20 h-20" alt="Logo" />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-800">Bhuvi Consultants</h1>
            <p className="text-sm text-gray-600 text-wrap ">3rd Floor, The Western Tower, Ratu Road, Ranchi, Jharkhand</p>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Work Order:</strong> {workOrder.workOrderNo}</p>
        </div>
      </div>

      {/* Site and Contractor */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700 mb-2">Site Details</h2>
          <p><strong>Name:</strong> {workOrder.site?.name}</p>
          <p><strong>Structure:</strong> {workOrder.site?.id?.structureType || "N/A"}</p>
          <p><strong>Incharge:</strong> {workOrder.site?.id?.incharge?.name || "N/A"}</p>
          <p><strong>Supervisor:</strong> {workOrder.site?.id?.supervisor?.name || "N/A"}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700 mb-2">Contractor Details</h2>
          <p><strong>Name:</strong> {workOrder.contractor?.name}</p>
          <p><strong>Phone:</strong> {workOrder.contractor?.id?.phone}</p>
          <p><strong>GST:</strong> {workOrder.contractor?.id?.gst || "N/A"}</p>
        </div>

      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <h3 className="text-lg font-bold">₹{workOrder.totalValue}</h3>
        </div>
        <div>
          <p className="text-xs text-gray-500">Paid</p>
          <h3 className="text-lg font-bold text-green-600">₹{workOrder.totalPaid}</h3>
        </div>
        <div>
          <p className="text-xs text-gray-500">Due</p>
          <h3 className="text-lg font-bold text-red-500">₹{workOrder.totalDue}</h3>
        </div>
      </div>

      {/* Work List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-base font-semibold mb-4">Work Details</h2>

        {workOrder.works?.map((w, i) => (
          <div key={i} className="border rounded-lg p-3 mb-4 bg-gray-50">

            <h3 className="font-semibold mb-2">{w.name}</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <p><strong>Qty:</strong> {w.qty}</p>
              <p><strong>Unit:</strong> {w.unit}</p>
              <p><strong>Rate:</strong> ₹{w.rate}</p>
              <p><strong>Amount:</strong> ₹{w.amount}</p>
            </div>

            {/* Stages */}
            {w.stages?.length > 0 && (
              <div className="mt-3 border-t pt-2">
                <h4 className="font-semibold text-sm mb-1">Payment Stages</h4>

                <div className="space-y-1">
                  {w.stages.map((st, sIndex) => (
                    <div
                      key={sIndex}
                      className="flex justify-between bg-white p-2 rounded shadow-sm text-xs"
                    >
                      <div>
                        <p className="font-medium">{st.name}</p>
                        <p className="text-gray-500">({st.percentage}%)</p>
                      </div>
                      <div className="text-right">
                        <p>₹{st.amount}</p>
                        <p className="font-semibold text-gray-500">
                          Paid: ₹{st.paid} / Due: ₹{st.due}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => editWork(workOrder._id, i)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                <MdEdit />
              </button>

              <button
                onClick={() => deleteWork(workOrder._id, i)}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs"
              >
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ApprovalTimeLine item={workOrder} module="workOrder" />

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">

        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(workOrder._id)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            <MdEdit className="inline mr-2" />
            Edit
          </button>

          <PDFDownloadLink
            document={<WorkOrderPdf Work={workOrder} />}
            fileName={`WO-${workOrder.workOrderNo}.pdf`}
          >
            {({ loading }) => (
              <button className="bg-green-600 text-white px-4 py-2 rounded">
                <MdDownload className="inline mr-2" />
                {loading ? "Preparing..." : "Download"}
              </button>
            )}
          </PDFDownloadLink>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleApprove(approvalId)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            <MdCheckCircle className="inline mr-2" />
            Approve
          </button>

          <button
            onClick={() => handleReject(approvalId)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            <MdCancel className="inline mr-2" />
            Reject
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} head="Reject Reason">
        <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
      </Modal>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} head="Update Work Order">
        <CreateWorkOrder onClose={() => setEditModal(false)} existingWorkOrder={workOrder} />
      </Modal>

      <Modal
        isOpen={editDetailModal}
        onClose={() => setEditDetailModal(false)}
        head="Edit Work Detail"
      >
        <CreateWorkOrder
          onClose={() => setEditDetailModal(false)}
          existingWorkOrder={workOrder}
          index={editIndex}
        />
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};


export default WorkOrderScreen;
