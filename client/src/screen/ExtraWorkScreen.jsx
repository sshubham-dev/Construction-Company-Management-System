import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CreateExtraWork from '../components/CreateExtraWork';

const ExtraWorkScreen = () => {
  const [extraWork, setExtraWork] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');

  useEffect(() => {
    if (id) {
      getextraWork(id);
    }
  }, [])

  const getextraWork = async (id) => {
    try {
      const extraWorkData = await axios.get(`/api/v1/extra-work/${id}`);
      console.log(extraWorkData.data)
      setExtraWork(extraWorkData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAdd = (id) => {
    setAddModal(true)
    setEditId(id)
  };
  const handleEdit = (id, index) => {
    console.log(id, index)
    setEditModal(true)
    setEditId(id);
    setEditIndex(index);
  };

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/extra-work/${id}/work/${index}`);
      console.log(response.data)
      setExtraWork(response.data.extraWork);
    } catch (error) {
      toast.error(error.message)
    }
  };

  const ExtraWorkCard = ({ work, rate, unit, paid, due, amount, status, paymentStatus, quantity, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{work}</h2>
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
            <div className="text-gray-600">Payment Status:</div>
            <div className={`${paymentStatus === 'paid' ? 'text-green-800' : 'text-red-800'} ${paymentStatus === 'paid' ? 'bg-green-200' : 'bg-red-200'} py-0.5 px-2.5 rounded-md font-semibold text-sm`}>{status}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Paid Amount:</div>
            <div className="text-gray-800">₹{paid ? paid : '0'}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Amount:</div>
            <div className="text-gray-800">₹{due ? due : '0'}</div>
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
      <Header category="Page" title="Extra Work's" />
      <section className='mb-12 h-full w-full'>
        <div className=" w-full flex flex-row justify-end items-end mb-6">
          <button onClick={() => handleAdd(id)} className="bg-green-500 text-white px-2 py-2 rounded-full">
            <MdAdd className='text-xl' />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {extraWork.WorkDetail?.map((detail, index) => (
            <div key={index} className='bg-white shadow-lg rounded-xl'>
              <ExtraWorkCard
                work={detail.work}
                rate={detail.rate}
                unit={detail.unit}
                quantity={detail.area}
                amount={detail.amount}
                status={detail.status}
                paid={extraWork.paid}
                due={extraWork.due}
                paymentStatus={extraWork.paymentStatus}
                handleEdit={() => handleEdit(extraWork._id, index)}
                handleDelete={() => deleteDetail(extraWork._id, index)}
              />
            </div>
          ))}
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Edit Return Request'>
          <CreateExtraWork onClose={() => setEditModal(false)} id={editId} index={editIndex} />
        </Modal>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Return Request'>
          <CreateExtraWork onClose={() => setAddModal(false)} id={editId} />
        </Modal>
      </section>
    </div>
  )
}

export default ExtraWorkScreen