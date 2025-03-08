import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../asset/logo.webp';
import moment from 'moment';
import axios from 'axios';
import { GrEdit } from "react-icons/gr";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import BillPdf from '../pdf/BillPdf';
import Modal from '../components/Modal';
import CreateBill from '../components/CreateBill';

const BillScreen = () => {
  const { id } = useParams();
  const [bill, setBill] = useState('');
  const [viewPdf, setViewPdf] = useState(false);
  const [contractorBill, setContractorBill] = useState({});
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');
  useEffect(() => {
    if (id) {
      getbills(id);
    }
  }, []);

  const getbills = async (id) => {
    try {
      if (id) {
        const billData = await axios.get(`/api/v1/bill/${id}`);
        console.log(billData.data);
        setBill(billData.data);
        setContractorBill(billData.data);
        // setMaterialBill(bills.filter((bill) => bill.billFor === 'Material'));
      }
    } catch (error) {
      toast.error(error.message)
    }
  };
  const handleEdit = (id) => {
    setEditModal(true)
    setEditId(id)
  }
  const handleDownload = () => {
    return (
      <>
        <PDFDownloadLink document={<BillPdf />} fileName='bill.pdf'></PDFDownloadLink>
      </>
    )
  }

  return (
    <div>
      <Header category="Page" title="Bill" />
      {viewPdf === true ? <BillPdf bill={bill} /> :
        <section className="h-full w-full bg-white overflow-x-auto p-2">
          <div className="flex items-center justify-center flex-col mb-6">
            <img className="h-20 md:24 w-fit mb-1" src={logo}
              alt="Logo" />
            <div className="text-blue-950 font-bold text-2xl md:text-3xl">Bhuvi Consultants</div>
          </div>

          <div className="pb-6 mb-4">
            <h2 className="text-2xl font-bold mb-4">Bill To:</h2>
            <div className="text-gray-700 mb-1">Name: {bill?.contractor?.name}</div>
            <div className="text-gray-700 mb-1">Site: {bill?.site?.name}</div>
            <div className="text-gray-700 mb-1">Date: {bill?.dateOfBill ? moment(bill?.dateOfBill).format('DD-MM-YYYY') : '-'}</div>
            <div className="text-gray-700 mb-1">Bill No : {bill === '' ? '-' : `BHC/${bill?.site?.name}${bill?.billNo ? bill?.billNo : ''}`}</div>
          </div>

          <div className="overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              '-ms-overflow-style': 'none',
            }}>
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
              <thead className="bg-gray-800">
                <tr className="text-white text-left">
                  <th className="font-semibold text-sm uppercase px-6 py-4">Description</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Rate</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Quantity</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-blue-gray-200'>
                  <td className="px-6 py-4 text-gray-700 text-wrap">{bill.billOf?.workDetail}</td>
                  <td className="px-6 py-4 text-gray-700">{bill ? `${bill.billOf?.rate}/${bill.billOf?.unit}` : '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{bill.billOf?.area}</td>
                  <td className="px-6 py-4 text-gray-700">₹{bill.billOf?.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className=" pb-4 mt-6">
            <h2 className="text-xl font-bold mt-4">Payment Details:</h2>
            <p className="text-gray-700 mt-4">Payment Date: {bill?.dateOfPayment ? moment(bill?.dateOfPayment).format('DD-MM-YYYY') : '-'}</p>
          </div>

          <div className="overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              '-ms-overflow-style': 'none',
            }}>
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
              <thead className="bg-gray-800">
                <tr className="text-white text-left">
                  <th className="font-semibold text-sm uppercase px-6 py-4">Total Amount</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">To Pay</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Paid</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Due</th>
                  <th className="font-semibold text-sm uppercase px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className='border-b border-blue-gray-200'>
                  <td className="px-6 py-4 text-gray-700">₹{bill?.amount}</td>
                  <td className="px-6 py-4 text-gray-700">₹{bill?.toPay}</td>
                  <td className="px-6 py-4 text-gray-700">₹{bill?.paidAmount ? bill?.paidAmount : '0'}</td>
                  <td className="px-6 py-4 text-gray-700">₹{bill?.dueAmount ? bill?.dueAmount : '0'}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <button onClick={() => handleEdit(bill._id)}>
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-8">
            <div className="text-gray-700 mb-2">{bill?.reason}</div>
            {/* <div className="text-gray-700 mb-2">Please make checks payable to Your Company Name and mail to:</div>
          <div className="text-gray-700">123 Main St., Anytown, USA 12345</div> */}
          </div>

          {/* <div className='mt-2 flex justify-between '>
              <button
                type='button'
                className='bg-blue-500 text-white px-4 py-2 rounded-md'
                onClick={() => setViewPdf(true)}>
                View As Pdf
              </button>
              <button
                type='button'
                className='bg-green-500 text-white px-4 py-2 rounded-md'
                onClick={handleDownload}>
                Download
              </button>
            </div>  */}
          <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Bill' >
            <CreateBill onClose={() => setEditModal(false)} isEdit={editId} />
          </Modal>
          <Toaster
            position="top-right"
            reverseOrder={false}
          />
        </section>
      }
    </div>
  )
}

export default BillScreen