import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { MdDelete, MdAdd } from "react-icons/md";
import Table from '../../components/Table';
import AdvTable from '../../components/Table/AdvTable';
import ReactTable from '../../components/Table/ReactTable';
import ModernTable from '../../components/Table/ModernTable';

const AccountManagement = () => {
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
    <div className='m-1 md:m-6 p-4 min-w-screen min-h-screen md:p-8 '>
      <Header category="Page" title="Accounts Management" />
      <section className="h-full w-full mb-16 flex justify-center">
        <div className='overflow-x-auto w-full max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6'>
          {/* <div className="bg-white p-4 rounded-lg shadow col-span-1">
            <Table />
          </div>
          <div className="bg-white p-4 rounded-lg shadow col-span-1">
            <AdvTable />
          </div>
          <div className="bg-white p-4 rounded-lg shadow col-span-2">
            <ReactTable/>
          </div> */}
          <div className="bg-white p-4 rounded-lg shadow col-span-2">
            <ModernTable />
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


export default AccountManagement