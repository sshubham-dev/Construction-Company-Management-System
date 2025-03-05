import { useSelector } from 'react-redux'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { FaExternalLinkAlt } from "react-icons/fa";
import { MdDelete, MdAdd } from "react-icons/md";
import { Tabs } from 'antd';
import { FcApproval } from "react-icons/fc";
import moment from 'moment';
import Modal from '../../components/Modal';
import CreateBill from '../../components/CreateBill';
import Header from '../../components/Header';


axios.defaults.withCredentials = true;

const Bills = () => {
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const [contractorBill, setContractorBill] = useState([]);
  const [draftBill, setDraftBill] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("approved");

  useEffect(() => {
    const getbills = async () => {
      try {
        const billData = await axios.get('/api/v1/bill');
        const bills = billData.data;
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge' && isLoggedIn) {
          const sites = user?.site;
          let contractorBills;
          for (let site of sites) {
            contractorBills = bills.filter((bill) => bill.site?._id.includes(site) && bill.billFor === 'Contractor')
          }
          console.log('contractorBillfirst', contractorBills)
          setContractorBill(contractorBills);
        } else {
          setContractorBill(bills.filter((bill) => bill.billFor === 'Contractor'));
        }
      } catch (error) {
        console.error(error)
      }
    }
    const getDraftBills = async () => {
      try {
        const billData = await axios.get(`/api/v1/bill/draft/${user?._id}`);
        const bills = billData.data;
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge' && isLoggedIn) {
          const sites = user?.site;
          let draftBills;
          for (let site of sites) {
            draftBills = bills?.filter((bill) => bill.site?._id.includes(site))
          }
          setDraftBill(draftBills);
          console.log(draftBills)
        }
      } catch (error) {
        console.error(error)
      }
    };
    getbills();
    getDraftBills();
  }, [])

  const handleEdit = (id) => {
    navigate(`/edit-bill/${id}`);
  };

  // const handleRedirect = (id) => {
  //   navigate(`/bill/${id}`);
  // };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/bill/${id}`);
      setContractorBill(contractorBill.filter((bill) => bill._id !== id));
      setDraftBill(draftBill.filter((bill) => bill._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleSave = async (id) => {
    try {
      const response = await axios.put(`/api/v1/bill/save/${id}`);
      setDraftBill(draftBill.filter((bill) => bill._id !== id));
      toast.success(response.data?.message);
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  };

  return (
    <div >
      <section className="h-full w-full overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Bill's" />
        <div className="w-full mx-auto text-gray-700 flex justify-end items-center">
          {/* {user.department === 'Site Incharge' && ( */}
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
          {/* // )} */}
        </div>

        <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
          <button
            className={`px-4 py-2 ${activeTab === "approved" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "draft" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
            onClick={() => setActiveTab("draft")}
          >
            Drafts
          </button>
        </div>

        {activeTab === "approved" && (
          <div className="overflow-x-auto scrollbar-hide">
            <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
              <thead className="bg-gray-300">
                <tr className=" text-left">
                  <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Bill For</th>
                  <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Description</th>
                  <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Amount</th>
                  <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Payment Status</th>
                  <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {contractorBill?.map((bill) => (
                  <tr key={bill._id} className='border-b border-blue-gray-200'>
                    <td className="px-6 py-4">
                      <p className=""> {bill.site?.name}</p>
                      <p className="text-gray-500 text-sm font-semibold tracking-wide"> {bill.contractor?.name} </p>
                    </td>
                    <td className="px-6 py-4">
                      {bill.billOf?.workDetail}
                    </td>
                    <td className="px-6 py-4 text-center">{bill.amount}</td>
                    <td className="px-6 py-4 text-center">{bill.paymentStatus}</td>
                    <td className="px-6 py-4">
                      {/* <button onClick={() => navigate(`/bill/${bill._id}`)} className="mr-2">
                        <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                      </button>
                      <button onClick={() => handleEdit(bill._id)} className="mr-2">
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button> */}
                      <button onClick={() => handleDelete(bill._id)} className="">
                        <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {user.department === 'Site Incharge' && (
          <>
            {activeTab === "draft" && (
              <div className="overflow-x-auto scrollbar-hide">
                <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
                  {/* Table Headers */}
                  <thead className="bg-gray-300">
                    <tr className=" text-left">
                      <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Bill For</th>
                      <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Description</th>
                      <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Amount</th>
                      <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Payment Status</th>
                      <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200">
                    {draftBill?.map((bill) => (
                      <tr key={bill?._id} className='border-b border-blue-gray-200'>
                        <td className="px-6 py-4">
                          <p className=""> {bill.site?.name}</p>
                          <p className="text-gray-500 text-sm font-semibold tracking-wide"> {bill.billFor === 'Contractor' ? bill.contractor?.name : bill.supplier?.name} </p>
                        </td>
                        <td className="px-6 py-4">
                          <NavLink to={`/bill/${bill?._id}`} className="hover:text-blue-800 text-md">
                            {bill.billFor === 'Contractor' ? bill?.billOf.workDetail : bill?.billOf.material}
                          </NavLink>
                        </td>
                        <td className="px-6 py-4 text-center">{bill.amount}</td>
                        <td className="px-6 py-4 text-center">{bill.paymentStatus}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleSave(bill._id)} className=" mr-2">
                            <FcApproval className="text-green-500 hover:text-green-700 text-xl" />
                          </button>
                          {/* <button onClick={() => handleRedirect(purchaseOrder._id)} className="mr-2">
                            <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                          </button>
                          <button onClick={() => handleEdit(bill._id)} className="mr-2">
                            <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                          </button> */}
                          <button onClick={() => handleDelete(bill._id)} >
                            <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>

        )}


        <Toaster position="top-right" reverseOrder={false} />
      </section>
      {/* Contractor Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Contractor' >
          <CreateBill onClose={() => setCreateModal(false)} />
        </Modal>
      )}
    </div>
  );
};

export default Bills;