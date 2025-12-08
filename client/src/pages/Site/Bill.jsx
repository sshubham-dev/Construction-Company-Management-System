import { useSelector } from 'react-redux'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
// import { DotsVerticalIcon } from "@heroicons/react/solid"; // heroicons needed


axios.defaults.withCredentials = true;

// const Bills = () => {
//   const navigate = useNavigate();
//   const [createModal, setCreateModal] = useState(false);
//   const [editModal, setEditModal] = useState(false);
//   const [editId, setEditId] = useState('');
//   const [contractorBill, setContractorBill] = useState([]);
//   const [draftBill, setDraftBill] = useState([]);
//   const { user, isLoggedIn } = useSelector((state) => state.auth)
//   const [activeTab, setActiveTab] = useState("approved");

//   useEffect(() => {
//     const getbills = async () => {
//       try {
//         const billData = await axios.get('/api/v1/bill');
//         const bills = billData.data;

//         console.log('Bills Fetched:', bills);

//         if ((user?.department === 'Site Supervisor' || user?.department === 'Site Incharge') && isLoggedIn) {
//           const sites = user?.site;
//           const contractorBills = bills.filter((bill) =>
//             sites.some((site) =>
//               bill.site?.id?._id?.toString() === site.id?.toString()
//             )
//           );
//           console.log('Filtered contractor bills:', contractorBills);
//           setContractorBill(contractorBills);
//         } else {
//           setContractorBill(bills);
//         }
//       } catch (error) {
//         console.error('Error fetching bills:', error);
//       }
//     };

//     const getDraftBills = async () => {
//       try {
//         const billData = await axios.get(`/api/v1/bill/draft/${user?._id}`);
//         const bills = billData.data;
//         console.log('Draft Bills Fetched:', bills);

//         if ((user?.department === 'Site Supervisor' || user?.department === 'Site Incharge') && isLoggedIn) {
//           const sites = user?.site || [];
//           const draftBills = bills?.filter((bill) => {
//             const billSiteId = bill?.site?.id?._id?.toString?.() || bill?.site?.id?.toString?.();
//             return sites?.some((site) => site.id?.toString?.() === billSiteId);
//           });

//           setDraftBill(draftBills);
//           console.log('Filtered Draft Bills:', draftBills);
//         } else {
//           setDraftBill(bills);
//         }
//       } catch (error) {
//         console.error('Error fetching draft bills:', error);
//       }
//     };


//     getbills();
//     getDraftBills();
//   }, [])

//   const handleEdit = (id) => {
//     setEditModal(true)
//     setEditId(id)
//   };

//   const handleRedirect = (id) => {
//     navigate(`/bill/${id}`);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/v1/bill/${id}`);
//       setContractorBill(contractorBill.filter((bill) => bill._id !== id));
//       setDraftBill(draftBill.filter((bill) => bill._id !== id));
//     } catch (error) {
//       toast.error(error.message)
//     }
//   };

//   const handleSave = async (id) => {
//     try {
//       const response = await axios.put(`/api/v1/bill/save/${id}`);
//       setDraftBill(draftBill.filter((bill) => bill._id !== id));
//       toast.success(response.data?.message);
//     } catch (error) {
//       console.log(error)
//       toast.error(error.message)
//     }
//   };

//   return (
//     <div >
//       <section className="h-full w-full overflow-x-auto scrollbar-hide">
//         <Header category="Page" title="Bill's" />
//         <div className="w-full mx-auto text-gray-700 flex justify-end items-center">
//           {/* {user.department === 'Site Incharge' && ( */}
//           <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
//             <MdAdd className='text-xl' />
//           </button>
//           {/* // )} */}
//         </div>

//         <div className="flex space-x-4 border-b-2 mb-4 w-full md:w-auto">
//           <button
//             className={`px-4 py-2 ${activeTab === "approved" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
//             onClick={() => setActiveTab("approved")}
//           >
//             Approved
//           </button>
//           <button
//             className={`px-4 py-2 ${activeTab === "draft" ? "border-b-4 border-blue-500 font-bold" : "text-gray-500"}`}
//             onClick={() => setActiveTab("draft")}
//           >
//             Drafts
//           </button>
//         </div>

//         {activeTab === "approved" && (
//           <div className="overflow-x-auto scrollbar-hide">
//             <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
//               <thead className="bg-gray-300">
//                 <tr className=" text-left">
//                   <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Bill For</th>
//                   <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Description</th>
//                   <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">toPay</th>
//                   <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Payment Status</th>
//                   <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
//                 </tr>
//               </thead>
//               {/* Table Body */}
//               <tbody className="divide-y divide-gray-200">
//                 {contractorBill?.map((bill) => (
//                   <tr key={bill._id} className='border-b border-blue-gray-200'>
//                     <td className="px-6 py-4">
//                       <Link to={`/bill/${bill._id}`} className=""> {bill.site?.name}</Link>
//                       <p className="text-gray-500 text-sm font-semibold tracking-wide"> {bill.contractor?.name} </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       {bill.billOf?.workDetail}
//                     </td>
//                     <td className="px-6 py-4 text-center">{bill.toPay}</td>
//                     <td className="px-6 py-4 text-center">{bill.paymentStatus}</td>
//                     <td className="px-6 py-4">
//                       <button onClick={() => navigate(`/bill/${bill._id}`)} className="mr-2">
//                         <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
//                       </button>
//                       <button onClick={() => handleEdit(bill._id)} className="mr-2">
//                         <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
//                       </button>
//                       <button onClick={() => handleDelete(bill._id)} className="">
//                         <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {user?.department === 'Site Incharge'  && (
//           <>
//             {activeTab === "draft" && (
//               <div className="overflow-x-auto scrollbar-hide">
//                 <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
//                   {/* Table Headers */}
//                   <thead className="bg-gray-300">
//                     <tr className=" text-left">
//                       <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Bill For</th>
//                       <th scope="col" className="font-semibold text-sm uppercase px-6 py-4">Description</th>
//                       <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">toPay</th>
//                       <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Payment Status</th>
//                       <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
//                     </tr>
//                   </thead>
//                   {/* Table Body */}
//                   <tbody className="divide-y divide-gray-200">
//                     {draftBill?.map((bill, index) => (
//                       <tr key={index} className='border-b border-blue-gray-200'>
//                         <td className="px-6 py-4">
//                           <Link to={`/bill/${bill._id}`} className=""> {bill.site?.name}</Link>
//                           <p className="text-gray-500 text-sm font-semibold tracking-wide"> {bill.contractor?.name} </p>
//                         </td>
//                         <td className="px-6 py-4">
//                           <NavLink to={`/bill/${bill?._id}`} className="hover:text-blue-800 text-md">
//                             {bill?.billOf.workDetail}
//                           </NavLink>
//                         </td>
//                         <td className="px-6 py-4 text-center">{bill.toPay}</td>
//                         <td className="px-6 py-4 text-center">{bill.paymentStatus}</td>
//                         <td className="px-6 py-4">
//                           <button onClick={() => handleSave(bill._id)} className=" mr-2">
//                             <FcApproval className="text-green-500 hover:text-green-700 text-xl" />
//                           </button>
//                           <button onClick={() => handleRedirect(bill._id)} className="mr-2">
//                             <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
//                           </button>
//                           <button onClick={() => handleEdit(bill._id)} className="mr-2">
//                             <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
//                           </button>
//                           <button onClick={() => handleDelete(bill._id)} >
//                             <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </>

//         )}


//         <Toaster position="top-right" reverseOrder={false} />
//       </section>
//       {/* Contractor Modal */}
//       <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Bill' >
//         <CreateBill onClose={() => setCreateModal(false)} />
//       </Modal>
//       <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Bill' >
//         <CreateBill onClose={() => setEditModal(false)} editId={editId} />
//       </Modal>
//     </div>
//   );
// };


const Bills = () => {
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [contractorBill, setContractorBill] = useState([]);
  const [draftBill, setDraftBill] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("approved");

  /* ---------- Helpers ---------- */

  const getBillDescription = (bill) => {
    if (bill?.billType === "workorder") {
      return `${bill?.billOf?.workName || "Work"} - ${bill?.billOf?.stageName || "Stage"}`;
    }
    if (bill?.billType === "extrawork") return bill?.billOf?.workName || "Extra Work";
    if (bill?.billType === "supplylabour") {
      const date = bill?.createdAt
        ? new Date(bill.createdAt).toLocaleDateString("en-IN")
        : "";
      return `Supply Labour - ${date}`;
    }
    return bill?.billOf?.workDetail || "N/A";
  };

  const getContractorName = (bill) => {
    if (bill?.billType === "supplylabour") return "Supply Labour";
    return bill?.contractor?.name || "N/A";
  };

  /* ---------- Fetch Bills ---------- */

  useEffect(() => {
    const getbills = async () => {
      try {
        const billData = await axios.get("/api/v1/bill");
        let bills = billData.data;

        if (
          (user?.department === "Site Supervisor" ||
            user?.department === "Site Incharge") &&
          isLoggedIn
        ) {
          const sites = user?.site || [];
          bills = bills.filter((bill) =>
            sites.some(
              (site) =>
                bill.site?.id?._id?.toString() === site.id?.toString()
            )
          );
        }

        setContractorBill(bills);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    const getDraftBills = async () => {
      try {
        const billData = await axios.get(`/api/v1/bill/draft/${user?._id}`);
        let bills = billData.data;

        if (
          (user?.department === "Site Supervisor" ||
            user?.department === "Site Incharge") &&
          isLoggedIn
        ) {
          const sites = user?.site || [];
          bills = bills.filter((bill) => {
            const billSiteId =
              bill?.site?.id?._id?.toString?.() ||
              bill?.site?.id?.toString?.();
            return sites.some(
              (site) => site.id?.toString?.() === billSiteId
            );
          });
        }

        setDraftBill(bills);
      } catch (error) {
        console.error("Error fetching draft bills:", error);
      }
    };

    getbills();
    getDraftBills();
  }, []);

  /* ---------- Actions ---------- */

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const handleRedirect = (id) => navigate(`/bill/${id}`);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/bill/${id}`);
      setContractorBill(contractorBill.filter((b) => b._id !== id));
      setDraftBill(draftBill.filter((b) => b._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (id) => {
    try {
      const response = await axios.put(`/api/v1/bill/save/${id}`);
      setDraftBill(draftBill.filter((b) => b._id !== id));
      toast.success(response.data?.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------- Reusable Card ---------- */

  const BillCard = ({ bill, isDraft }) => (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <Link to={`/bill/${bill._id}`} className="font-semibold">{bill.site?.name}</Link>
          <p className="text-sm text-gray-500">{getContractorName(bill)}</p>
        </div>
        <span className="text-sm font-semibold">
          ₹ {bill.toPay}
        </span>
      </div>

      <p className="text-sm text-gray-700">{getBillDescription(bill)}</p>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs px-2 py-1 rounded bg-gray-100">
          {bill.paymentStatus}
        </span>

        <div className="flex gap-3 text-lg">
          {isDraft && (
            <button onClick={() => handleSave(bill._id)}>
              <FcApproval className="text-green-500" />
            </button>
          )}
          <button onClick={() => handleRedirect(bill._id)}>
            <FaExternalLinkAlt className="text-blue-500" />
          </button>
          {/* <button onClick={() => handleEdit(bill._id)}>
            <GrEdit className="text-blue-500" />
          </button> */}
          <button onClick={() => handleDelete(bill._id)}>
            <MdDelete className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- UI ---------- */

  return (
    <div className="p-2 sm:p-4">
      <Header category="Page" title="Bills" />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreateModal(true)}
          className="bg-green-500 rounded-full text-white p-3"
        >
          <MdAdd className="text-xl" />
        </button>
      </div>

      <div className="flex gap-6 border-b mb-4">
        {["approved", "draft"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* -------- Mobile Layout -------- */}
      <div className="grid gap-4 sm:hidden">
        {(activeTab === "approved" ? contractorBill : draftBill).map((bill) => (
          <BillCard
            key={bill._id}
            bill={bill}
            isDraft={activeTab === "draft"}
          />
        ))}
      </div>

      {/* -------- Desktop Table -------- */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full bg-white divide-y divide-gray-300">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-6 py-4">Site</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">To Pay</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "approved" ? contractorBill : draftBill).map((bill) => (
              <tr key={bill._id}>
                <td className="px-6 py-4">
                  <Link to={`/bill/${bill._id}`}>{bill.site?.name}</Link>
                  <p className="text-sm text-gray-500">{getContractorName(bill)}</p>
                </td>
                <td className="px-6 py-4">{getBillDescription(bill)}</td>
                <td className="px-6 py-4 text-center">₹ {bill.toPay}</td>
                <td className="px-6 py-4 text-center">{bill.paymentStatus}</td>
                <td className="px-6 py-4 flex gap-3 justify-center">
                  {activeTab === "draft" && (
                    <button onClick={() => handleSave(bill._id)}>
                      <FcApproval className="text-green-500 text-lg" />
                    </button>
                  )}
                  <button onClick={() => handleRedirect(bill._id)}>
                    <FaExternalLinkAlt className="text-blue-500 text-lg" />
                  </button>
                  <button onClick={() => handleEdit(bill._id)}>
                    <GrEdit className="text-blue-500 text-lg" />
                  </button>
                  <button onClick={() => handleDelete(bill._id)}>
                    <MdDelete className="text-red-500 text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------- Modals -------- */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create Bill"
      >
        <CreateBill onClose={() => setCreateModal(false)} />
      </Modal>

      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Bill"
      >
        <CreateBill onClose={() => setEditModal(false)} editId={editId} />
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};


export default Bills;