import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Tabs } from "antd";
import { FcApproval } from "react-icons/fc";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import CreateChecklist from "../../components/CreateChecklist";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ChecklistPdf from '../../pdf/CheckListPdf';

const CheckList = () => {
  const navigate = useNavigate();
  const [checkLists, setCheckList] = useState([]);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    const getcheckLists = async () => {
      try {
        const checkListData = await axios.get("/api/v1/checkList");
        setCheckList(checkListData.data);
        console.log(checkListData.data);
      } catch (error) {
        toast.error(error.message);
        setError(error.message);
      }
    };
    getcheckLists();
  }, []);

  const handleEdit = (checkListId) => {
    setEditModal(true);
    setEditId(checkListId);
  };

  const handleRedirect = (checkListId) => {
    navigate(`/checklist/${checkListId}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/checklist/${id}`);
      setCheckList(checkLists.filter((checkList) => checkList._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Checklist's" />
        <div className=" mb-4 mr-2 text-right flex justify-between align-center">
          <h2 className="text-xl text-green-600 ">Total CheckList's: </h2>
          <button
            onClick={() => setCreateModal(true)}
            className="bg-green-500 rounded-full text-white px-2 py-2"
          >
            <MdAdd className="text-xl" />
          </button>
        </div>

        {/* ✅ MOBILE VIEW (Card Layout) */}
        <div className="block md:hidden space-y-4">
          {checkLists.map((checkList) => (
            <div
              key={checkList._id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <NavLink
                    to={`/checklist/${checkList._id}`}
                    className="text-blue-600 font-semibold text-lg"
                  >
                    {checkList.name}
                  </NavLink>

                  <p className="text-sm text-gray-600 mt-1">
                    Site: {checkList?.site?.name || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Supervisor: {checkList?.supervisor?.name || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Work: {checkList?.checkFor || "N/A"}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded text-white ${
                      checkList?.approvalStatus === "Approved"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {checkList?.approvalStatus || "Pending"}
                  </span>

                  <p className="text-xs mt-1">
                    {new Date(checkList.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <p className="text-sm font-medium">
                  Client:
                  <span
                    className={`ml-2 ${
                      checkList?.clientSign?.approved
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {checkList?.clientSign?.approved ? "Approved" : "Pending"}
                  </span>
                </p>

                <div className="flex gap-4">
                  {/* <button
                    onClick={() => handleEdit(checkList._id)}
                    className="text-blue-500"
                  >
                    <GrEdit size={18} />
                  </button> */}
                <PDFDownloadLink
                  document={<ChecklistPdf checklist={checkList} />}
                  fileName={`${
                    checkList.site?.name + "-" + checkList.name|| "Checklist"
                  }.pdf`}
                >
                  {({ loading }) => (
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      {loading ? "...." : "PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
                  <button
                    onClick={() => handleDelete(checkList._id)}
                    className="text-red-500"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ DESKTOP VIEW (Table Layout) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-md text-left text-gray-500">
            <thead className="uppercase bg-gray-300">
              <tr>
                <th className="px-6 py-3">Checklist</th>
                <th className="px-6 py-3">Site</th>
                {/* <th className="px-6 py-3">Work</th> */}
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {checkLists.map((checkList) => (
                <tr
                  key={checkList._id}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <NavLink
                      to={`/checklist/${checkList._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {checkList.name}
                    </NavLink>
                  </td>

                  <td className="px-6 py-4">
                    <p>
                    {checkList?.site?.name || "N/A"}
                    </p>
                    <p>
                      {checkList?.supervisor?.name || "N/A"}
                    </p>
                  </td>
                  {/* <td className="px-6 py-4">{checkList?.checkFor || "N/A"}</td> */}

                  <td className="px-6 py-4">
                    {checkList?.clientSign?.approved ? (
                      <span className="text-green-600 font-semibold">
                        Approved
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        checkList?.approvalStatus === "Approved"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                    >
                      {checkList?.approvalStatus || "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {new Date(checkList.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-center flex justify-center gap-3">
                    {/* <button
                      onClick={() => handleEdit(checkList._id)}
                      className="text-blue-500"
                    >
                      <GrEdit />
                    </button> */}
                <PDFDownloadLink
                  document={<ChecklistPdf checklist={checkList} />}
                  fileName={`${
                    checkList.site?.name + "-" || "download"
                  }.pdf`}
                >
                  {({ loading }) => (
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                      {loading ? "...." : "PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
                    <button
                      onClick={() => handleDelete(checkList._id)}
                      className="text-red-500"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {error && (
              <caption className="text-red-500 text-sm mt-2">{error}</caption>
            )}
          </table>
        </div>
      </section>
      <Toaster position="top-right" reverseOrder={false} />
      {/* Check List Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create Check List"
      >
        <CreateChecklist onClose={() => setCreateModal(false)} />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Check List"
      >
        <CreateChecklist onClose={() => setEditModal(false)} isEdit={editId} />
      </Modal>
    </div>
  );
};

export default CheckList;
