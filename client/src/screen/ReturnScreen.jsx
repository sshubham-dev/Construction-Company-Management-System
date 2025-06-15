import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ReturnFormModal from '../components/CreateReturn';

const ReturnScreen = () => {
  const [Return, setReturn] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
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
        <div className=" w-full flex flex-row justify-end items-end mb-6">
          <button onClick={() => handleAdd(id)} className="bg-green-500 text-white px-2 py-2 rounded-full">
            <MdAdd className='text-xl' />
          </button>
        </div>
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
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Edit Return Request'>
          <ReturnFormModal onClose={() => setEditModal(false)} editId={editId} editIndex={editIndex} />
        </Modal>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Return Request'>
          <ReturnFormModal onClose={() => setAddModal(false)} editId={editId} />
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