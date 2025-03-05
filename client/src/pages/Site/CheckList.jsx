import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Tabs } from 'antd';
import { FcApproval } from "react-icons/fc";
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import CreateChecklist from '../../components/CreateChecklist';

const CheckList = () => {
  const navigate = useNavigate();
  const [checkLists, setCheckList] = useState([]);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);

  useEffect(() => {
    const getcheckLists = async () => {
      try {
        const checkListData = await axios.get('/api/v1/checkList');
        setCheckList(checkListData.data);
        console.log(checkLists)
      } catch (error) {
        toast.error(error.message)
        setError(error.message);
      }
    }
    getcheckLists();
  }, [])

  const handleEdit = (checkListId) => {
    navigate(`/edit-checkList?checkListId=${checkListId}`);
  };

  const handleRedirect = (checkListId) => {
    navigate(`/checkList?checkListId=${checkListId}`);
  }
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/checklist/${id}`);
      setCheckList(checkLists.filter((checkList) => checkList._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };

  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Checklist's" />
        <div className=" mb-4 mr-2 text-right flex justify-between align-center">
          <h2 className="text-xl text-green-600 ">Total CheckList's: </h2>
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
        </div>

        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className=" uppercase bg-gray-300 ">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Site Id</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checkLists.map((checkList) => (
              <tr key={checkList._id} className="bg-white border-b hover:bg-gray-50 ">
                <td className="px-6 py-4">
                  <NavLink>
                  </NavLink>
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleRedirect(checkList._id)}
                    className="bg-blue-500 text-white px-2 py-1 mr-2"
                  >
                    <FaExternalLinkAlt />
                  </button>
                  {/* <button
                    onClick={() => handleEdit(checkList._id)}
                    className="bg-blue-500 text-white px-2 py-1 mr-2"
                  >
                    <GrEdit />
                  </button> */}
                  <button
                    onClick={() => handleDelete(checkList._id)}
                    className="bg-red-500 text-white px-2 py-1 mr-2"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {error && <p className="text-red-500">{error}</p>}
        </table>
        
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
      {/* Check List Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Check List' >
          <CreateChecklist onClose={() => setCreateModal(false)} />
        </Modal>
      )}
    </div>
  )
}

export default CheckList