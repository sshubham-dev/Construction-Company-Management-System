import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import Modal from '../components/Modal';
import CreateProjectSchedule from '../components/CreateProjectSchedule';
axios.defaults.withCredentials = true;

const Project_ScheduleScreen = () => {
  const [projectSchedule, setProjectSchedule] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editIndex, setEditIndex] = useState('');

  useEffect(() => {
    if (id) {
      getprojectSchedule(id);
    }
  }, [])

  const getprojectSchedule = async (id) => {
    try {
      const projectScheduleData = await axios.get(`/api/v1/project-schedule/${id}`);
      console.log(projectScheduleData.data)
      setProjectSchedule(projectScheduleData.data);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEdit = (id, index) => {
    setEditModal(true)
    setEditId(id)
    setEditIndex(index)
  };

  const handleAdd = (id) => {
    setAddModal(true)
    setEditId(id)
  }

  const deleteDetail = async (id, index) => {
    try {
      const response = await axios.delete(`/api/v1/project-schedule/${id}/projectDetails/${index}`);
      setProjectSchedule(response.data);
      console.table(response.data)
    } catch (error) {
      toast.error(error.message)
    }
  };

  const ProjectScheduleCard = ({ workDescription, reason, difference, startedAt, status, toStart, handleEdit, handleDelete }) => {
    return (
      <div className=" px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">{workDescription}</h2>
        <div className='flex flex-col gap-2 text-md'>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Starting Date:</div>
            <div className="text-gray-800">{toStart ? moment(toStart).format('DD-MM-YYYY') : '-'}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Status:</div>
            <div className={`${status === 'paid' ? 'text-green-800' : 'text-red-800'} ${status === 'paid' ? 'bg-green-200' : 'bg-red-200'} py-0.5 px-2.5 rounded-md font-semibold text-sm`}>{status}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Actual Date:</div>
            <div className="text-gray-800">{startedAt ? moment(startedAt).format('DD-MM-YYYY') : '-'}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Difference:</div>
            <div className="text-gray-800">{difference}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <div className="text-gray-600">Reason:</div>
            <div className="text-gray-800">{reason}</div>
          </div>
          <div className="flex justify-between gap-4 tracking-tight">
            <button onClick={handleEdit} className="text-blue-500 mr-2">
              <GrEdit className="inline-block mr-1" />
              Edit
            </button>
            <button onClick={handleDelete} className="text-red-500">
              <MdDelete className="inline-block mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div >
      <section className='mb-10 h-full w-full'>
        <Header category="Page" title={`${projectSchedule.site?.name} Project Schedule`} />
        <div className=" mb-4 text-right">
          <button onClick={() => handleAdd(projectSchedule._id)} className="bg-green-500 text-white px-2 py-2 rounded-3xl">
            <MdAdd className='text-lg md:text-xl' />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {projectSchedule.projectDetail?.map((work, index) => (
            <div key={index} className='bg-white shadow-lg rounded-xl'>
              <ProjectScheduleCard
                workDescription={work.workDetail || 'No Work Detail'}
                toStart={work.startingStatus?.toStart}
                difference={work.startingStatus?.difference}
                startedAt={work.startingStatus?.startedAt}
                status={work.status}
                reason={work.startingStatus?.reason}
                handleEdit={() => handleEdit(projectSchedule._id, index)}
                handleDelete={() => deleteDetail(projectSchedule._id, index)}
              />
            </div>
          ))}
        </div>
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} head='Update Project Detail' >
          <CreateProjectSchedule onClose={() => setEditModal(false)} id={editId} index={editIndex} />
        </Modal>
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} head='Add Project Schedule' >
          <CreateProjectSchedule onClose={() => setAddModal(false)} id={editId} />
        </Modal>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default Project_ScheduleScreen