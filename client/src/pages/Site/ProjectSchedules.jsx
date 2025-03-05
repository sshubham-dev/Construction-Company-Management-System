import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { GrEdit } from "react-icons/gr";
import { MdAdd, MdDelete } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import moment from 'moment';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import CreateProjectSchedule from '../../components/CreateProjectSchedule';

axios.defaults.withCredentials = true;

const ProjectSchedules = () => {
  const navigate = useNavigate();
  const [projectSchedules, setProjectSchedule] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({
    toEdit:false,
    id:'',
  });

  useEffect(() => {
    const getprojectSchedules = async () => {
      try {
        const projectScheduleData = await axios.get('/api/v1/project-schedule');
        if ((user.department === 'Site Supervisor' || user.department === 'Site Incharge') && isLoggedIn) {
          const sites = user.site;
          console.log(user)
          let ProjectSchedules = [];
          for (let site of sites) {
            const filteredProjectSchedules = projectScheduleData.data.filter((projectSchedule) => projectSchedule.site._id.includes(site))
            ProjectSchedules = [...ProjectSchedules, ...filteredProjectSchedules]
          }
          setProjectSchedule(ProjectSchedules)
          console.log("ProjectSchedule for all sites:", ProjectSchedules);
        } else {
          setProjectSchedule(projectScheduleData.data);
        }
        console.log(projectScheduleData.data)
      } catch (error) {
        console.error(error);
      }
    }
    getprojectSchedules();
  }, []);


  const handleEdit = (id) => {
    console.log(id)
    console.log(index)
    setCreateModal(true)
    setEditModal({
      toEdit:true,
      id,
    })
    // navigate(`/edit-projectSchedule/${id}/${index}`);
  };

  const addMore = async (id) => {
    navigate(`/edit-projectSchedule/${id}`);
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/project-schedule/${id}`);
      setProjectSchedule(projectSchedules.filter((projectSchedule) => projectSchedule._id !== id));
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleRedirect = (id) => {
    navigate(`/project-schedule/${id}`);
  }

  return (
    <div >
      <section className="overflow-x-auto scrollbar-hide">
        <Header category="Page" title="Project Schedule's" />
        <div className="w-full mx-auto mb-6 text-gray-700 p-1 flex flex-row justify-between items-center">
          <h2 className="text-lg text-wrap sm:text-md md:text-lg lg:text-xl text-green-600 mr-4 pr-4">
            Total Project Schedules: {projectSchedules?.length}
          </h2>
          <button onClick={() => setCreateModal(true)} className="bg-green-500 rounded-full text-white px-2 py-2">
            <MdAdd className='text-xl' />
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className='w-full whitespace-nowrap bg-white divide-y divide-gray-300 overflow-hidden'>
            <thead className="bg-gray-300">
              <tr className=" text-left">
                <th className="font-semibold text-sm uppercase px-6 py-4 "> Name </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Total Floor </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Incharge </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"> Project Type </th>
                <th className="font-semibold text-sm uppercase px-6 py-4 text-center"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {projectSchedules.map((projectSchedule) => (
                <tr key={projectSchedule._id} className='border-b border-blue-gray-200'>
                  <td className="px-6 py-4">
                    <p className=""> {projectSchedule.site.name} </p>
                    {/* <p className="text-gray-500 text-sm font-semibold tracking-wide"> {site.client.name} </p> */}
                  </td>
                  {/* <td className="px-6 py-4 text-center">
                      {site.floors}
                    </td>
                    <td className="px-6 py-4 text-center">{site.incharge?.userName}</td>
                    <td className="px-6 py-4 text-center">{site.projectType}</td> */}
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleRedirect(projectSchedule._id)} className="mr-2">
                      <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                    </button>
                    <button onClick={() => handleEdit(projectSchedule._id)} className="mr-2">
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                    <button onClick={() => handleDelete(projectSchedule._id)} className="mr-2">
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
      {/* Project Schedule Modal */}
      {createModal && (
        <Modal isOpen={createModal} onClose={() => setCreateModal(false)} head='Create Project Schedule' >
          <CreateProjectSchedule onClose={() => setCreateModal(false)} isEdit={editModal} />
        </Modal>
      )}
    </div>
  )
}

export default ProjectSchedules;