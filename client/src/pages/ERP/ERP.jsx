import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { MdDelete, MdAdd } from "react-icons/md";

const ERP = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const handleERP = () => {
    navigate('/erp/create-account');
  };
  const handleRecord = () => {
    navigate('/erp/create-record');
  };
  const handleInventory = () => {
    navigate('/erp/inventory/record-inventory');
  };

  return (
    <div>
      <Header category="Page" title="ERP" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 col-span-2">

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Add Account</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button onClick={handleERP} className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Record Transactions</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button onClick={handleRecord} className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-lg' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Payment In</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Payment Out</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Contra</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Record Inventory</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button onClick={handleInventory} className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow w-full mx-auto mb-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-md md:text-lg lg:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">Record Inventory</h2>
              {user.department === 'Ceo' || user.department === 'Account Head' && (
                <button onClick={handleInventory} className="bg-green-500 rounded-full text-white px-2 py-2">
                  <MdAdd className='text-xl' />
                </button>
              )}
            </div>
            
          </div>
        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default ERP;
