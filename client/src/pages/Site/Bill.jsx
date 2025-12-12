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
              console.log(bill)
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
      console.log(error)
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