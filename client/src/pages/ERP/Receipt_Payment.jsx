import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { IoIosAddCircle } from "react-icons/io";
import CreateReceipt_Payment from "../../components/CreateReceipt_Payment";

const Receipt_Payment = () => {
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  return (
    <div className="p-5">
      <Header category="Page" title="Receipt & Payment Manager" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto bg-white rounded-xl shadow p-6'>
          <div className="flex justify-end mb-6 space-x-2">
            <button
              className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg "
              onClick={() => setIsModalOpen(true)}>
              <IoIosAddCircle size={24} />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-5">Receipts</h2>
          <table className="w-full border-collapse border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Receipt No</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">From</th>
                <th className="border p-2">To</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, index) => (
                <tr key={index}>
                  <td className="border p-2">{r.receiptNo}</td>
                  <td className="border p-2">{r.date}</td>
                  <td className="border p-2">{r.from}</td>
                  <td className="border p-2">{r.to}</td>
                  <td className="border p-2">{r.amount}</td>
                  <td className="border p-2">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-xl font-bold mt-5">Payments</h2>
          <table className="w-full border-collapse border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Payment No</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">From</th>
                <th className="border p-2">To</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, index) => (
                <tr key={index}>
                  <td className="border p-2">{p.paymentNo}</td>
                  <td className="border p-2">{p.date}</td>
                  <td className="border p-2">{p.from}</td>
                  <td className="border p-2">{p.to}</td>
                  <td className="border p-2">{p.amount}</td>
                  <td className="border p-2">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Add/Edit Modal */}
        {isModalOpen && (
          <CreateReceipt_Payment onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} />
        )}
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  );
};

export default Receipt_Payment