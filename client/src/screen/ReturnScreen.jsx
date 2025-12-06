import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd, MdDownload } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ReturnFormModal from '../components/CreateReturn';
import Reject from "../components/UI/Reject";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReturnRequestPdf from '../pdf/ReturnRequestPdf';
import ApprovalTimeLine from '../components/UI/ApprovalTimeLine';
axios.defaults.withCredentials = true;

const ReturnScreen = () => {
  const [Return, setReturn] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const { id, approvalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');
  useEffect(() => {
    if (id) {
      getReturn(id);
    }
  }, [])

  const getReturn = async (id) => {
    try {
      const returnRequestData = await axios.get(`/api/v1/return/${id}`);
      console.log(returnRequestData.data)
      setReturn(returnRequestData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }
  const handleAdd = (id) => {
    setAddModal(true)
    setEditId(id)
  };
  const handleEdit = (id, index) => {
    setEditId(id);
    setEditIndex(index);
    setEditModal(true)
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/return/${id}/projectDetails/${index}`);
      console.log(response.data)
      setReturn(response.data.Return);
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


  const ReturnCard = ({ item, quantity, receivedQuantity, remarks, rate, amount, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{item}</h2>
        <div className='flex flex-col gap-2 text-md'>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Quantity:</div>
            <div className="text-gray-800">{quantity}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Received Quantity:</div>
            <div className="text-gray-800">{receivedQuantity}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Rate:</div>
            <div className="text-gray-800">{rate}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Amount:</div>
            <div className="text-gray-800">{amount}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Remarks:</div>
            <div className="text-gray-800">{remarks}</div>
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
      <Header category="Page" title="return Request" />
      <section className='mb-12 h-full w-full'>
        <div className="flex justify-between items-center mt-4 mb-6">
          <button
            onClick={() => handleAdd(Return._id)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <MdAdd /> Add
          </button>
            <PDFDownloadLink
              document={<ReturnRequestPdf Work={Return} />}
              fileName={`RS-${Return._id || "download"}.pdf`}
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

        <ApprovalTimeLine item={Return} module="return" />

        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Return.returnable?.map((req, index) => (
            <div key={index} className='bg-white shadow-lg rounded-xl'>
              <ReturnCard
                item={req.item}
                quantity={`${req.quantity} ${req.unit}`}
                receivedQuantity={`${req?.receivedQuantity || 0} ${req.unit}`}
                remarks={req?.remarks}
                rate={`₹${req?.rate || 0}/${req.unit}`}
                amount={`₹${req?.amount || 0}`}
                handleEdit={() => handleEdit(Return._id, index)}
                handleDelete={() => deleteDetail(Return._id, index)}
              />
            </div>
          ))}
        </div>
              {location.pathname !== `/sites/return/${id}` && (
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
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Edit Return Request'>
          <ReturnFormModal onClose={() => setEditModal(false)} editId={editId} editIndex={editIndex} />
        </Modal>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Return Request'>
          <ReturnFormModal onClose={() => setAddModal(false)} editId={editId} />
        </Modal>
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
      </section>
    </div>
  )
}

export default ReturnScreen