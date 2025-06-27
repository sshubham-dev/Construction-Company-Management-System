import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../features/notification/notificationSlice';
import Select from 'react-select';
import moment from 'moment';

axios.defaults.withCredentials = true;

const CreateProjectSchedule = ({ onClose, id, index }) => {
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
      status: 'Pending',
    }]
  });
  const [workDetails, setWorkDetails] = useState([]);
  const [data, setData] = useState('');
  const [sites, setSite] = useState([]);
  const [scheduleIdToEdit, setScheduleIdToEdit] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState({ id: '', index: '' });
  const { user } = useSelector((state) => state.auth);
  const statusOptions = ['Started', 'Completed', 'Pending', 'Partially Completed'];
  const [projectDetail, setProjectDetail] = useState({
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
    status: 'Pending',
  })
  const dispatch = useDispatch();
  useEffect(() => {
    if (id && index !== undefined) {
      fetchProjectDetail(id, index);
      setProjectToEdit({ id, index });
    } else if (id) {
      setScheduleIdToEdit(id);
      fetchProjectSchedule(id);
    }
  }, [id, index]);
  const fetchProjectDetail = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/project-schedule/${id}/projectDetails`);
      const detail = response.data[index];
      console.log(response.data[index])
      setProjectDetail(prevState => ({
        ...prevState,
        workDetail: detail.workDetail,
        startingStatus: {
          toStart: detail.startingStatus.toStart,
          startedAt: detail.startingStatus.startedAt,
          difference: detail.startingStatus.difference,
          reason: detail.startingStatus.reason,
        },
        completingStatus: {
          toComplete: detail.completingStatus.toComplete,
          completedAt: detail.completingStatus.completedAt,
          difference: detail.completingStatus.difference,
          reason: detail.completingStatus.reason,
        },
        status: detail.status,
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
        site: project?.site.id._id,
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
        if (user.department === 'Site Incharge' || user.department === 'Site Supervisor') {
          const existingSites = user?.site;
          let SitesData = [];
          for (let site of response.data) {
            if (existingSites?.some(existingSite => existingSite.id === site._id)) {
              SitesData.push(site);
            }
          }
          setSite(SitesData)
          // console.log(SitesData)
        } else {
          setSite(response.data)
        }
      } catch (error) {
        console.error(error.message)
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
  }, []);
  const handleChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };
  const handleEdit = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProjectDetail(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        }
      }));
    } else {
      setProjectDetail(prev => ({
        ...prev,
        [field]: value
      }));
    }
    if (field === 'completingStatus.completedAt') {
      const toComplete = new Date(projectDetail.completingStatus.toComplete);
      const completedAt = new Date(value);
      const diffDays = Math.ceil((completedAt - toComplete) / (1000 * 60 * 60 * 24));
      setProjectDetail(prev => ({
        ...prev,
        completingStatus: {
          ...prev.completingStatus,
          completedAt: value,
          difference: `${diffDays} day(s)`
        }
      }));
      return;
    }
    if (field === 'startingStatus.startedAt') {
      const toStart = new Date(projectDetail.startingStatus.toStart);
      const startedAt = new Date(value);
      const diffDays = Math.ceil((startedAt - toStart) / (1000 * 60 * 60 * 24));
      setProjectDetail(prev => ({
        ...prev,
        startingStatus: {
          ...prev.startingStatus,
          startedAt: value,
          difference: `${diffDays} day(s)`
        }
      }));
      return;
    }

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
    formData.projectDetail = formData.projectDetail.filter(detail =>
      detail.completingStatus.toComplete || detail.startingStatus.toStart
    );
    try {
      if (scheduleIdToEdit) {
        console.log(formData)
        const response = await axios.put(`/api/v1/project-schedule/${scheduleIdToEdit}`, formData);
        toast.success(response.data.message);
        onClose()
        dispatch(fetchNotifications(user._id));
      } else if (projectToEdit.id !== '' && projectToEdit.index !== '') {
        console.log(projectDetail)
        await axios.put(`/api/v1/project-schedule/${projectToEdit.id}/projectDetails/${projectToEdit.index}`, projectDetail);
        toast.success('Edited successfully');
        onClose()
        dispatch(fetchNotifications(user._id));
      } else {
        console.log('first', formData)
        const response = await axios.post('/api/v1/project-schedule', formData);
        toast.success(response.data.message);
        onClose()
        dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.error('Error submitting project schedule:', error);
      toast.error('Failed to submit project schedule.');
    }
  };
  const AddMore = () => {
    return (
      <></>
    )
  }
  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 w-full max-w-md">
        {projectToEdit.index !== undefined && projectToEdit.id ? (
          <>
            <div className="mb-4">
              <label htmlFor="workDetail" className="block text-gray-700 text-sm font-bold mb-2">Work:</label>
              <Select
                onChange={(selectedOption) => handleEdit('workDetail', selectedOption.value)}
                options={workDetails.map(workDetail => ({
                  value: workDetail.work,
                  label: workDetail.work
                }))}
                placeholder={projectDetail?.workDetail || 'Select Work Detail:'}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
              <select
                onChange={(e) => handleEdit('status', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">{projectDetail.status || 'Select Status'}</option>
                {statusOptions.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <h3 className='mb-4 mt-6 font-bold text-lg'>Work Starting Status</h3>
            <div className="mb-4">
              <label htmlFor="toStart" className="block text-gray-700 text-sm font-bold mb-2">Starting Date: {moment(projectDetail?.startingStatus.toStart).format('DD MM YYYY')}</label>
              <input
                type="date"
                name="toStart"
                value={projectDetail?.startingStatus.toStart || ''}
                onChange={(e) => handleEdit('startingStatus.toStart', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="startedAt" className="block text-gray-700 text-sm font-bold mb-2">Actual Starting Date: {moment(projectDetail?.startingStatus.startedAt).format('DD MM YYYY')}</label>
              <input
                type="date"
                name="startedAt"
                value={projectDetail?.startingStatus.startedAt || ''}
                onChange={(e) => handleEdit('startingStatus.startedAt', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="difference" className="block text-gray-700 text-sm font-bold mb-2">Difference:</label>
              <input
                type="text"
                name="difference"
                value={projectDetail?.startingStatus.difference || ''}
                onChange={(e) => handleEdit('startingStatus.difference', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">Reason:</label>
              <input
                type="text"
                name="reason"
                value={projectDetail?.startingStatus.reason || ''}
                onChange={(e) => handleEdit('startingStatus.reason', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>



            {projectDetail.status === 'Completed' && (
              <>
                <h3 className='mb-4 mt-6 font-bold text-lg'>Work Completion Status</h3>
                <div className="mb-4">
                  <label htmlFor="toStart" className="block text-gray-700 text-sm font-bold mb-2">Starting Date: {moment(projectDetail?.completingStatus.toComplete).format('DD MM YYYY')}</label>
                  <input
                    type="date"
                    name="toComplete"
                    value={projectDetail?.completingStatus.toComplete || ''}
                    onChange={(e) => handleEdit('completingStatus.toComplete', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="completedAt" className="block text-gray-700 text-sm font-bold mb-2">Actual Starting Date: {moment(projectDetail?.completingStatus.completedAt).format('DD MM YYYY')}</label>
                  <input
                    type="date"
                    name="completedAt"
                    value={projectDetail?.completingStatus.completedAt || ''}
                    onChange={(e) => handleEdit('completingStatus.completedAt', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="difference" className="block text-gray-700 text-sm font-bold mb-2">Difference:</label>
                  <input
                    type="text"
                    name="difference"
                    value={projectDetail?.completingStatus.difference || ''}
                    onChange={(e) => handleEdit('completingStatus.difference', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">Reason:</label>
                  <input
                    type="text"
                    name="reason"
                    value={projectDetail?.completingStatus.reason || ''}
                    onChange={(e) => handleEdit('completingStatus.reason', e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </>
            )}


            <div>
              <button type="button" onClick={handleReset} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600">Reset</button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 ml-6 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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
                    {sites.map((site, index) => (
                      <option key={index} value={site._id}>
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
                  <div className="mb-4">
                    <label htmlFor="workDetail" className="block text-sm font-medium text-gray-600">Work Details</label>
                    <Select
                      onChange={(selectedOption) => handleUpdate('workDetail', selectedOption.value)}
                      options={workDetails.map(workDetail => ({
                        value: workDetail.work,
                        label: workDetail.work
                      }))}
                      placeholder={formData.projectDetail[step - 1]?.workDetail || 'Select Work Detail:'}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="toStart" className="block text-sm font-medium text-gray-600">Starting Date</label>
                    <input
                      type="date"
                      name="toStart"
                      value={formData.projectDetail[step - 1]?.startingStatus.toStart || ''}
                      onChange={(e) => handleUpdate('toStart', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="toComplete" className="block text-sm font-medium text-gray-600">Completion Date</label>
                    <input
                      type="date"
                      name="toComplete"
                      value={formData.projectDetail[step - 1]?.completingStatus.toComplete || ''}
                      onChange={(e) => handleUpdate('toComplete', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
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