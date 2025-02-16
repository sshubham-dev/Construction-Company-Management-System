import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Select from 'react-select';

axios.defaults.withCredentials = true;

const CreateProjectSchedule = ({ onClose, isEdit }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    site: '',
    projectScheduleId: '',
    projectDetail: [{
      workDetail: '',
      startingStatus: {
        toStart: '',
        startedAt: '',
        difference: '',
        reason: '',
      },
      completingStatus: {
        toComplete: '',
        completedAt: '',
        difference: '',
        reason: '',
      },
      status: '',
    }]
  });
  const [workDetails, setWorkDetails] = useState([]);
  const [data, setData] = useState('');
  const [sites, setSite] = useState([]);
  const [scheduleIdToEdit, setScheduleIdToEdit] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState({ id: '', index: '' });
  const { user } = useSelector((state) => state.auth);
  const statusOptions = ['Started', 'Completed', 'Pending', 'Partially Completed'];
  const { index, id } = isEdit;

  useEffect(() => {
    if (id && !index) {
      fetchProjectSchedule(id);
      setScheduleIdToEdit(id);
    } else if (id && index) {
      fetchProjectDetail(id, index);
      setProjectToEdit({ id, index });
    }
  }, [id, index]);

  const fetchProjectDetail = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/project-schedule/${id}/projectDetails`);
      const detail = response.data[index];
      setFormData(prevState => ({
        ...prevState,
        projectDetail: [{
          ...prevState.projectDetail[0],
          workDetail: detail.workDetail,
          startingStatus: {
            ...prevState.projectDetail[0].startingStatus,
            toStart: detail.toStart,
            startedAt: detail.startedAt,
            difference: detail.difference,
            reason: detail.reason,
          },
          completingStatus: {
            ...prevState.projectDetail[0].completingStatus,
            toComplete: detail.toComplete,
            completedAt: detail.completedAt,
            difference: detail.difference,
            reason: detail.reason,
          },
          status: detail.status,

        }]
      }));
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to fetch project details.');
    }
  };

  const fetchProjectSchedule = async (id) => {
    try {
      const response = await axios.get(`/api/v1/project-schedule/${id}`);
      const project = response.data;
      setData(project?.site.name);
      setFormData({
        site: project?.site.id,
        projectScheduleId: project?.projectScheduleId,
        projectDetail: [{
          workDetail: '',
          startingStatus: {
            toStart: '',
            startedAt: '',
            difference: '',
            reason: '',
          },
          completingStatus: {
            toComplete: '',
            completedAt: '',
            difference: '',
            reason: '',
          },
          status: '',
        }]
      });
    } catch (error) {
      console.error('Error fetching project schedule:', error);
      toast.error('Failed to fetch project schedule.');
    }
  };

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get('/api/v1/site');
        const filteredSites = user.department === 'Site Supervisor' || user.department === 'Site Incharge'
          ? response.data.filter(site => user.site.includes(site._id))
          : response.data;
        setSite(filteredSites);
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to fetch sites.');
      }
    };

    const fetchWork = async () => {
      try {
        const title = 'Project Schedule';
        const workData = await axios.post('/api/v1/work-details/name', { title });
        setWorkDetails(workData.data.description);
      } catch (error) {
        console.error('Error fetching work details:', error);
        toast.error('Failed to fetch work details.');
      }
    };

    fetchSite();
    fetchWork();
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = (field, value) => {
    setFormData(prevState => {
      const updatedProjectDetail = [...prevState.projectDetail];
      if (!updatedProjectDetail[step - 1]) {
        updatedProjectDetail[step - 1] = {
          workDetail: '',
          startingStatus: { toStart: '', startedAt: '', difference: '', reason: '' },
          completingStatus: { toComplete: '', completedAt: '', difference: '', reason: '' },
          status: '',
        };
      }

      if (['toStart', 'startedAt', 'difference', 'reason'].includes(field)) {
        updatedProjectDetail[step - 1].startingStatus[field] = value;
      } else if (['toComplete', 'completedAt'].includes(field)) {
        updatedProjectDetail[step - 1].completingStatus[field] = value;
      } else {
        updatedProjectDetail[step - 1][field] = value;
      }

      return { ...prevState, projectDetail: updatedProjectDetail };
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    // if (!formData.projectDetail[step].workDetail) {
    //   toast.error("Please enter work detail before proceeding.");
    //   return;
    // }
    if (step < formData.projectDetail.length - 1) {
      setStep(step + 1);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        projectDetail: [
          ...prevState.projectDetail,
          {
            workDetail: '',
            startingStatus: { toStart: '', startedAt: '', difference: '', reason: '' },
            completingStatus: { toComplete: '', completedAt: '', difference: '', reason: '' },
            status: '',
          },
        ],
      }));
      setStep(step + 1);
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault()
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setFormData({
      site: '',
      projectScheduleId: '',
      projectDetail: [{
        workDetail: '',
        startingStatus: { toStart: '', startedAt: '', difference: '', reason: '' },
        completingStatus: { toComplete: '', completedAt: '', difference: '', reason: '' },
        status: '',
      }],
    });
    setStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData); // Log the form data before submission

    // **Filter out empty project details before submitting**
    formData.projectDetail = formData.projectDetail.filter(detail =>
      detail.completingStatus.toComplete || detail.startingStatus.toStart
    );

    try {
      if (scheduleIdToEdit) {
        const response = await axios.put(`/api/v1/project-schedule/${scheduleIdToEdit}`, formData);
        toast.success(response.data.message);
      } else if (projectToEdit.id !== '' && projectToEdit.index !== '') {
        await axios.put(`/api/v1/project-schedule/${projectToEdit.id}/projectDetails/${projectToEdit.index}`, formData.projectDetail[0]);
        toast.success('Edited successfully');
      } else {
        console.log('first', formData)
        const response = await axios.post('/api/v1/project-schedule/create', formData);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting project schedule:', error);
      toast.error('Failed to submit project schedule.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 w-full max-w-md">
        {projectToEdit.index && projectToEdit.id ? (
          <>
            <div className="mb-4">
              <label htmlFor="workDetail" className="block text-gray-700 text-sm font-bold mb-2">Work:</label>
              <Select
                onChange={(selectedOption) => handleUpdate('workDetail', selectedOption.value)}
                options={workDetails.map(workDetail => ({
                  value: workDetail.work,
                  label: workDetail.work
                }))}
                placeholder={formData.projectDetail[step]?.workDetail || 'Select Work Detail:'}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="toStart" className="block text-gray-700 text-sm font-bold mb-2">Starting Date:</label>
              <input
                type="date"
                name="toStart"
                value={formData.projectDetail[step]?.startingStatus.toStart || ''}
                onChange={(e) => handleUpdate('toStart', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="startedAt" className="block text-gray-700 text-sm font-bold mb-2">Actual Starting Date:</label>
              <input
                type="date"
                name="startedAt"
                value={formData.projectDetail[step]?.startingStatus.startedAt || ''}
                onChange={(e) => handleUpdate('startedAt', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="difference" className="block text-gray-700 text-sm font-bold mb-2">Difference:</label>
              <input
                type="text"
                name="difference"
                value={formData.projectDetail[step]?.startingStatus.difference || ''}
                onChange={(e) => handleUpdate('difference', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">Reason:</label>
              <input
                type="text"
                name="reason"
                value={formData.projectDetail[step]?.startingStatus.reason || ''}
                onChange={(e) => handleUpdate('reason', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
              <select
                onChange={(e) => handleUpdate('status', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">{projectDetail.status || 'Select Status'}</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <button type="button" onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Reset</button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Submit
              </button>
            </div>
          </>
        ) : (
          <>
            {step === 0 && (
              <>
                <div className="mb-4">
                  <label htmlFor="site" className="block text-sm font-medium text-gray-600">Select a Site</label>
                  <select
                    name="site"
                    value={formData.site}
                    onChange={(e) => handleChange('site', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option>{scheduleIdToEdit ? data.site : 'Site'}</option>
                    {sites.map((site) => (
                      <option key={site._id} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="projectScheduleId" className="block text-sm font-medium text-gray-600">Schedule Id:</label>
                  <input
                    type="text"
                    name="projectScheduleId"
                    value={formData.projectScheduleId}
                    onChange={(e) => handleChange('projectScheduleId', e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button type="button" onClick={() => setStep(step + 1)} className="bg-blue-500 text-white p-2 rounded">Add Work</button>
              </>
            )}
            <div className="my-4">
              {step > 0 && (
                <div>
                  <Select
                    onChange={(selectedOption) => handleUpdate('workDetail', selectedOption.value)}
                    options={workDetails.map(workDetail => ({
                      value: workDetail.work,
                      label: workDetail.work
                    }))}
                    placeholder={formData.projectDetail[step - 1]?.workDetail || 'Select Work Detail:'}
                  />

                  <input
                    type="date"
                    name="toStart"
                    value={formData.projectDetail[step - 1]?.startingStatus.toStart || ''}
                    onChange={(e) => handleUpdate('toStart', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />

                  <input
                    type="date"
                    name="toComplete"
                    value={formData.projectDetail[step - 1]?.completingStatus.toComplete || ''}
                    onChange={(e) => handleUpdate('toComplete', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              )}
              <div className="mt-4 flex justify-between gap-4">
                {step > 0 && (
                  <div className="flex justify-between gap-4">
                    <button type="button" onClick={handlePrevious} className="bg-gray-500 text-white p-2 rounded">Previous</button>
                    <button type="submit" className="bg-green-500 text-white p-2 rounded">Submit</button>
                    <button type="button" onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Reset</button>
                    <button type="button" onClick={handleNext} className="bg-blue-500 text-white p-2 rounded">Next</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </form>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateProjectSchedule;