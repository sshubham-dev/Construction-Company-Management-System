import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import moment from 'moment';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CreatePaymentSchedule from '../components/CreatePaymentSchedule';
axios.defaults.withCredentials = true;

const Payment_SchedulScreen = () => {
  const [paymentSchedule, setpaymentSchedules] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');

  useEffect(() => {
    if (id) {
      getpaymentSchedules(id);
    }
  }, [])

  const getpaymentSchedules = async (id) => {
    try {
      const paymentSchedulesData = await axios.get(`/api/v1/payment-schedule/${id}`);
      console.log(paymentSchedulesData.data)
      setpaymentSchedules(paymentSchedulesData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEdit = (id, index) => {
    setEditModal(true)
    setEditId(id)
    setEditIndex(index)
  };

  const handleAdd = (id) => {
    setAddModal(true)
    setEditId(id)
  }

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/payment-schedule/${id}/paymentDetails/${index}`);
      console.log(response.data)
      setpaymentSchedules(response.data.existingPaymentSchedule);
    } catch (error) {
      toast.error(error.message)
    }
  };

  const PaymentScheduleCard = ({ workDescription, paid, due, amount, status, dateOfPayment, dueDate, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{workDescription}</h2>
        <div className='flex flex-col gap-2 text-md'>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Payment Amount:</div>
            <div className="text-gray-800">{amount}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Payment Date:</div>
            <div className="text-gray-800">{dateOfPayment ? moment(dateOfPayment).format('DD-MM-YYYY') : '-'}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Status:</div>
            <div className={`${status === 'paid' ? 'text-green-800' : 'text-red-800'} ${status === 'paid' ? 'bg-green-200' : 'bg-red-200'} py-0.5 px-2.5 rounded-md font-semibold text-sm`}>{status}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Date:</div>
            <div className="text-gray-800">{moment(dueDate).format('DD-MM-YYYY')}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Due Amount:</div>
            <div className="text-gray-800">{due}</div>
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
      <section className='mb-10 h-full w-full'>
        <Header category="Page" title={`${paymentSchedule.site?.name} Payment Schedule`} />
        <div className="mb-4 text-right">
          <button onClick={() => handleAdd(paymentSchedule._id)} className="bg-green-500 text-white px-2 py-2 rounded-3xl">
            <MdAdd className='text-lg md:text-xl' />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paymentSchedule.paymentDetails?.map((work, index) => (
            <div key={index} className='bg-white shadow-lg rounded-xl'>
              <PaymentScheduleCard
                workDescription={work.workDescription}
                // paid={work.paid}
                due={work.due}
                amount={work.amount}
                dateOfPayment={work.paymentDate}
                dueDate={work.dueDate}
                status={work.status}
                handleEdit={() => handleEdit(paymentSchedule._id, index)}
                handleDelete={() => deleteDetail(paymentSchedule._id, index)}
              />
            </div>
          ))}
        </div>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Payment Detail' >
          <CreatePaymentSchedule onClose={() => setEditModal(false)} id={editId} index={editIndex} />
        </Modal>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Payment Schedule' >
          <CreatePaymentSchedule onClose={() => setAddModal(false)} id={editId} />
        </Modal>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default Payment_SchedulScreen
