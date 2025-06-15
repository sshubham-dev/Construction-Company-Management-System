import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CreatePurchaseRequest from '../components/CreatePurchaseRequest';

const PurchaseRequestScreen = () => {
  const [PurchaseRequest, setPurchaseRequest] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');

  useEffect(() => {
    if (id) {
      getPurchaseRequest(id);
    }
  }, [])

  const getPurchaseRequest = async (id) => {
    try {
      const purchaseRequestData = await axios.get(`/api/v1/purchase-request/${id}`);
      console.log(purchaseRequestData.data)
      setPurchaseRequest(purchaseRequestData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAdd = (id) => {
    setAddModal(true)
    setEditId(id)
  };
  const handleEdit = (id, index) => {
    setEditModal(true)
    setEditId(id)
    setEditIndex(index)
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/purchase-request/${id}/requirement/${index}`);
      console.log(response.data)
      setPurchaseRequest(response.data.PurchaseRequest);
    } catch (error) {
      toast.error(error.message)
    }
  };

  const PurchaseRequestCard = ({ material, request, approved, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{material}</h2>
        <div className='flex flex-col gap-2 text-md'>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Request Quantity:</div>
            <div className="text-gray-800">{request.quantity} {request.unit}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Approved Quantity:</div>
            <div className="text-gray-800">{approved.quantity} {approved.unit}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Rate:</div>
            <div className="text-gray-800">₹{approved.rate}/{approved.unit}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Remarks:</div>
            <div className="text-gray-800">{approved.remarks}</div>
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
      <Header category="Page" title="Purchase Request" />
      <section className='mb-12 h-full w-full'>
        <div className=" w-full flex flex-row justify-end items-end mb-6">
          <button onClick={() => handleAdd(id)} className="bg-green-500 text-white px-2 py-2 rounded-full">
            <MdAdd className='text-xl' />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PurchaseRequest.requirement?.map((req, index) => (
            <div key={index} className='bg-white shadow-lg rounded-xl'>
              <PurchaseRequestCard
                material={req.item}
                request={req.request}
                approved={req.approved}

                handleEdit={() => handleEdit(PurchaseRequest._id, index)}
                handleDelete={() => deleteDetail(PurchaseRequest._id, index)}
              />
            </div>
          ))}
        </div>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Requirement' >
          <CreatePurchaseRequest onClose={() => setAddModal(false)} id={editId} />
        </Modal>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Requirement Detail' >
          <CreatePurchaseRequest onClose={() => setEditModal(false)} id={editId} index={editIndex} />
        </Modal>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default PurchaseRequestScreen