import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd, MdDownload } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PurchaseOrderPdf from '../pdf/PurchaseOrderPdf';
import ApprovalTimeLine from '../components/UI/ApprovalTimeLine';
axios.defaults.withCredentials = true;

const PurchaseOrderScreen = () => {
  const [purchaseOrder, setPurchaseOrder] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getpurchaseOrder(id);
    }
  }, [])

  const getpurchaseOrder = async (id) => {
    try {
      const purchaseRequestData = await axios.get(`/api/v1/purchase-request/${id}`);
      console.log(purchaseRequestData.data)
      setPurchaseOrder(purchaseRequestData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEdit = (id, index) => {
    navigate(`/edit-purchaseOrder/${id}/material/${index}`);
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/purchase-order/${id}/projectDetails/${index}`);
      console.log(response.data)
      setPurchaseOrder(response.data.purchaseOrder);
    } catch (error) {
      toast.error(error.message)
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

  const PurchaseOrderCard = ({ material, request, approved, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{material}</h2>
        <div className='flex flex-col gap-2 text-md'>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Rate:</div>
            <div className="text-gray-800">{rate}/{unit}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Quantity:</div>
            <div className="text-gray-800">{quantity}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Amount:</div>
            <div className="text-gray-800">₹{amount}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Status:</div>
            <div className={`${status === 'paid' ? 'text-green-800' : 'text-red-800'} ${status === 'paid' ? 'bg-green-200' : 'bg-red-200'} py-0.5 px-2.5 rounded-md font-semibold text-sm`}>{status}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Paid Amount:</div>
            <div className="text-gray-800">₹{paid ? paid : '0'}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Amount:</div>
            <div className="text-gray-800">₹{due}</div>
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
    <div >
      <Header category="Page" title="Purchase Order" />
              <div className="flex justify-between items-center mt-4 mb-6">
                <button
                  onClick={() => handleAdd(purchaseOrder._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                >
                  <MdAdd /> Add
                </button>
                  <PDFDownloadLink
                    document={<PurchaseOrderPdf Work={purchaseOrder} />}
                    fileName={`PO-${purchaseOrder?._id || "download"}.pdf`}
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
              <ApprovalTimeLine item={purchaseOrder} module="purchaseOrder" />
      <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {purchaseOrder.requirement?.map((req, index) => (
          <div key={index} className='bg-white shadow-lg rounded-xl'>
            <PurchaseOrderCard
              material={req.item}
              request={req.request}
              approved={req.approved}

              handleEdit={() => handleEdit(purchaseOrder._id, index)}
              handleDelete={() => deleteDetail(purchaseOrder._id, index)}
            />
          </div>
        ))}
      </div>
            {/* Bottom Action Buttons (Approve/Reject) */}
      {location.pathname !== `/purchase-order/${id}` && (
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
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          head="Reject Reason"
        >
          <Reject onClose={() => setRejectModal(false)} Id={rejectId} />
        </Modal>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  )
}

export default PurchaseOrderScreen