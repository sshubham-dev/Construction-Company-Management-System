import React, { useState } from 'react';
import CreateJournal from '../../components/CreateJournal';
import Header from '../../components/Header';
import { IoIosAddCircle } from "react-icons/io";

const Journal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <Header category="Page" title="Contra Voucher" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto'>
          <div className="flex justify-end mb-6 space-x-2">
            <button
              className="bg-blue-500 text-white py-2 px-2 rounded-4xl shadow-lg "
              onClick={() => setIsModalOpen(true)}>
              <IoIosAddCircle size={24} />
            </button>
          </div>
          <div className='grid grid-flow-row grid-cols-1 md:grid-flow-cols md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white rounded-xl shadow p-4'>
            <div className=" p-4 border rounded-lg bg-gray-100 w-full overflow-auto">
              {/* <h3 className="text-lg font-bold">Journal Entry Details</h3> */}
              <p><strong>Voucher Number:</strong> </p>
              <p><strong>Date:</strong> </p>
              <p><strong>Narration:</strong> </p>

              <h4 className="mt-4 font-bold"> Entries</h4>
              <table className="w-full mt-2 border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className=" p-2">Account</th>
                    <th className=" p-2">Debit</th>
                    <th className=" p-2">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className=" p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between">
              <p className="mt-2 font-bold text-wrap">Total Debit:  </p>
              <p className="mt-2 font-bold text-wrap">Total Credit: </p>
              </div>
            </div>
            <div className=" p-4 border rounded-lg bg-gray-100 w-full overflow-auto">
              {/* <h3 className="text-lg font-bold">Journal Entry Details</h3> */}
              <p><strong>Voucher Number:</strong> </p>
              <p><strong>Date:</strong> </p>
              <p><strong>Narration:</strong> </p>

              <h4 className="mt-4 font-bold">Entries</h4>
              <table className="w-full overflow-auto mt-2 border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className=" p-2">Account</th>
                    <th className=" p-2">Debit</th>
                    <th className=" p-2">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className=" p-2"></td>
                    <td className=" p-2"></td>
                    <td className=" p-2"></td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between">
              <p className="mt-2 font-bold text-wrap">Total Debit:  </p>
              <p className="mt-2 font-bold text-wrap">Total Credit: </p>
              </div>

              {/* <h4 className="mt-4 font-bold">Stock Items</h4>
            <table className="w-full mt-2 border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Item</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Rate</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Adjustment Type</th>
                  <th className="border p-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 font-bold">Total Stock Amount: </p> */}
            </div>
          </div>
          {isModalOpen && (
            <CreateJournal onClose={() => setIsModalOpen(false)} isOpen={isModalOpen} />
          )}
        </div>
      </section>
    </div>
  )
}

export default Journal