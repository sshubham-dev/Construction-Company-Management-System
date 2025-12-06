import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import moment from 'moment';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import Modal from '../../components/Modal';
import CreateQualitySchedule from '../../components/CreateQualitySchedule';
axios.defaults.withCredentials = true;

const QualitySchedules = () => {
  const navigate = useNavigate();
  const [qualitySchedules, setQualitySchedule] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');

  useEffect(() => {
    const getqualitySchedules = async () => {
      try {
        const qualitySchedulesData = await axios.get('/api/v1/quality-schedule');
       
        if ((user.department === 'Site Supervisor' || user.department === 'Site Incharge') && isLoggedIn) {
          const sites = user.site;
          // console.log(user)
          let QualitySchedules = [];
          for (let site of sites) {
            const filteredQualitySchedules = qualitySchedulesData.data.filter((qualitySchedule) => qualitySchedule.site?.id._id === site.id)
            QualitySchedules = [...QualitySchedules, ...filteredQualitySchedules]
          }
           setQualitySchedule(QualitySchedules);
          console.log("QualitySchedules for all sites:", QualitySchedules);
        } else {
          setQualitySchedule(qualitySchedulesData.data);
        }
        console.log(qualitySchedulesData.data)
      } catch (error) {
        console.error(error);
      }
    }
    getqualitySchedules();
  }, []);


  const handleEdit = (id) => {
    console.log(id)
    setEditModal(true)
    setEditId(id)
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/quality-schedule/${id}`);
      setQualitySchedule(qualitySchedules.filter((qualitySchedule) => qualitySchedule._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleRedirect = (id) => {
    navigate(`/quality-schedule/${id}`);
  };


  return (
    <div>
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Quality Check Schedule's" />
        <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
          <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
            Total Quality Schedules: {qualitySchedules?.length}
          </h2>
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
            <thead className="bg-gray-300">
              <tr className=" text-left">
                <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Site</th>
                <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Date</th>
                <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Approval Status</th>
                {/* <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center">Actual Date</th> */}
                <th scope="col" className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {qualitySchedules.map((qualitySchedule, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50 ">
                  <td className="px-6 py-4 text-center">
                  <Link to={`/quality-schedule/${qualitySchedule._id}`} className="px-6 py-4">
                    {qualitySchedule.site?.name}
                  </Link>
                  </td>
                  <td className="px-6 py-4 text-center">{moment(qualitySchedule.date).format('DD-MM-YYYY')}</td>
                  <td className="px-6 py-4 text-center">{qualitySchedule.approvalStatus}</td>
                  {/* <td className="px-6 py-4 text-center">{work.startedAt ? moment(work.startedAt).format('DD-MM-YYYY') : '-'}</td> */}
                  <td className="px-6 py-4">
                    <button onClick={() => handleRedirect(qualitySchedule._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button>
                    <button
                      onClick={() => handleEdit(qualitySchedule._id)}
                      className="mr-2">
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                    <button
                      onClick={() => handleDelete(qualitySchedule._id)}>
                      <MdDelete className='text-red-500 hover:text-red-600 text-xl' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
      {/* Quality Schedules Modal */}
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Quality Schedules' >
          <CreateQualitySchedule onClose={() => setCreateModal(false)} />
        </Modal>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Edit Quality Schedules' >
          <CreateQualitySchedule onClose={() => setEditModal(false)} id={editId} />
        </Modal>
    </div>
  )
}

export default QualitySchedules;