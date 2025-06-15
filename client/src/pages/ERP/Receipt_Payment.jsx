import React, { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { IoIosAddCircle } from "react-icons/io";
import CreateReceipt_Payment from "../../components/CreateReceipt_Payment";
import Modal from "../../components/Modal";
import { useSelector, useDispatch } from 'react-redux';
import { fetchReceipt } from "../../features/erp/receiptSlice";
import moment from 'moment';
import { fetchPayment } from "../../features/erp/paymentSlice";

const Receipt_Payment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("receipts");
  const dispatch = useDispatch();

  const receipts = useSelector((state) => state.receipt?.all);
  const payments = useSelector((state) => state.payment?.all);
  console.log(receipts)

  useEffect(() => {
    dispatch(fetchReceipt())
    dispatch(fetchPayment())
  }, [dispatch])


  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Receipt & Payment Manager" />
        <div className="w-full mx-auto text-gray-700 p-1 flex flex-row justify-end items-center">
          <button
            className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg md:mt-0"
            onClick={() => setIsModalOpen(true)}>
            <IoIosAddCircle size={24} />
          </button>
        </div>
        <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
          <button
            className={`px-4 py-2 ${activeTab === "receipts" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("receipts")}
          >
            Receipts
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "payments" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
        </div>

        {activeTab === "receipts" && (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full whitespace-nowrap text-sm overflow-x-auto scrollbar-hide">
              <thead className="bg-gray-200">
                <tr className=" text-left">
                  <th className="px-4 py-2">Receipt No</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">From</th>
                  <th className="px-4 py-2">To</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Description</th>
                  {/* <th className="px-4 py-2">Invoice</th> */}
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {receipts?.map((r, index) => (
                  <tr key={index} className="text-left">
                    <td className="px-4 py-2">{r.receiptNo}</td>
                    <td className="px-4 py-2">{moment(r.date).format('DD MMM YYYY')}</td>
                    <td className="px-4 py-2">{r.from.name}</td>
                    <td className="px-4 py-2">{r.to.name}</td>
                    <td className="px-4 py-2">{r.amount}</td>
                    <td className="px-4 py-2">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full whitespace-nowrap text-sm overflow-x-auto scrollbar-hide">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2">Payment No</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">From</th>
                  <th className="px-4 py-2">To</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {payments?.map((p, index) => (
                  <tr key={index} className="text-left">
                    <td className="px-4 py-2">{p.paymentNo}</td>
                    <td className="px-4 py-2">{moment(p.date).format("DD MM YYYY")}</td>
                    <td className="px-4 py-2">{p.from.name}</td>
                    <td className="px-4 py-2">{p.to.name}</td>
                    <td className="px-4 py-2">{p.amount}</td>
                    <td className="px-4 py-2">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} head='Record Receipt / Payment'>
          <CreateReceipt_Payment onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} />
        </Modal>

        <Toaster position="top-right" reverseOrder={false} />
      </section>
    </div>
  );
};

export default Receipt_Payment;
