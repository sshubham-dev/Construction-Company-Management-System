import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../features/notification/notificationSlice';
const categories = ['Housekeeping', 'Safety'];

const CreateChecklist = ({ onClose, isEdit }) => {
  const [formData, setFormData] = useState({
    site: '',                    // Selected site
    date: new Date().toISOString().slice(0, 10), // Selected date
    checklistId: '',              // Checklist ID
    checkFor: '',                 // Specifies which work the checklist is for
    name: '',                     // Predefined checklist name
    checkWork: [{                 // Work items
      work: '',                   // Predefined works
      status: '',                 // Status
      remarks: '',                // Remarks
    }],
    rating: categories.map(category => ({ category, stars: 0, remarks: '' })), // rating for categories
    observation: '',              // Additional observations
  });
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [sites, setSite] = useState([]);                      // Selected site
  const [showChecklist, setShowChecklist] = useState(false);  // Flag to show the checklist
  const [isAllChecked, setIsAllChecked] = useState(false);   // Flag to indicate if all works are checked
  const [checkListWork, setCheckListWork] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
    const dispatch = useDispatch();
  const status = [
    { value: 'N/A', label: 'N/A' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ]
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get('/api/v1/site');
        setSite(response.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    const fetchWorkDetails = async () => {
      try {
        const title = 'Checklist'
        const response = await axios.get('/api/v1/work-details');
        const filteredItems = response.data.filter(item => item.title.toLowerCase().includes(title.toLowerCase()));
        setCheckListWork(filteredItems);
      } catch (error) {
        console.error('Error fetching work details:', error);
      }
    };

    fetchWorkDetails();
    fetchSite();
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetchChecklist(isEdit)
    }
  }, [isEdit]);

  useEffect(() => {
    const fetchprojectSchedule = async () => {
      try {
        const projectScheduleData = await axios.get('/api/v1/project-schedule');
        console.log(projectScheduleData.data)
        // console.log(user)
        const filteredProjectSchedules = projectScheduleData.data.filter(
          (projectSchedule) => projectSchedule?.site?.id?._id === formData.site
        );
        const ProjectSchedules = filteredProjectSchedules[0].projectDetail
        setProjectDetails(ProjectSchedules)
        console.log("ProjectSchedule", ProjectSchedules);
      } catch (error) {
        console.error(error);
      }
    }

    fetchprojectSchedule();
  }, [formData.site]);


  const fetchChecklist = async (id) => {
    try {
      const response = await axios.get(`/api/v1/checkList/${id}`);
      const checklist = response.data;
      console.log('checklist', checklist);

      setFormData({
        site: checklist.site.id,
        date: checklist.date,
        checklistId: checklist.checklistId,
        checkFor: checklist.checkFor,
        name: checklist.name,
        checkWork: checklist.checkWork.map(item => ({
          work: item.work,
          status: ['Yes', 'No', 'N/A'].includes(item.status) ? item.status : '',
          remarks: item.remarks,
        })),
        rating: checklist.rating.map(item => ({
          category: item.category,
          stars: item.stars,
          remarks: item.remarks,
        })),
        observation: checklist.observation,
      });
      setIsAllChecked(checklist.checkWork.every(item => item.status !== ''));
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleChange = (field, data) => {
    setFormData({
      ...formData,
      [field]: data,
    });
  };

  const updateStatus = (index, status) => {
    setFormData(prevData => ({
      ...prevData,
      checkWork: prevData.checkWork.map((item, idx) =>
        idx === index ? { ...item, status } : item
      ),
    }));
  };

  const updateRemarks = (index, remarks) => {
    setFormData(prevData => ({
      ...prevData,
      checkWork: prevData.checkWork.map((item, idx) =>
        idx === index ? { ...item, remarks } : item
      ),
    }));
  };

  const updateRating = (category, stars, remarks) => {
    setFormData(prevData => ({
      ...prevData,
      rating: prevData.rating.map(rating =>
        rating.category === category ? { ...rating, stars, remarks } : rating
      ),
    }));
  };

const handleSubmit = () => {
  if (!formData.site || !formData.date || !formData.name) return;

  if (!isEdit) {
    const selectedChecklist = checkListWork.find(item => item.title === formData.name);
    if (selectedChecklist) {
      setFormData({
        ...formData,
        checkWork: selectedChecklist.description.map(desc => ({
          work: desc.work,
          status: '',
          remarks: ''
        })),
      });
    }
  }

  setShowChecklist(true);
};

  const handleChecklistSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData)
      if (isEdit) {
        const response = await axios.put(`/api/v1/checklist/${isEdit}`, formData);
        console.log(response)
        onClose()
                  dispatch(fetchNotifications(user._id));
      } else {
        const response = await axios.post('/api/v1/checklist', formData);
        console.log(response)
        onClose()
                  dispatch(fetchNotifications(user._id));
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    setIsAllChecked(formData.checkWork.every(item => item.status !== ''));
  }, [formData.checkWork]);

  return (
    <div >
      <section className='container mx-auto mt-4 mb-16'>
        <div className=" max-w-3xl mx-auto">
          {!showChecklist ? (
            <div>
              <div className="mb-4">
                <label htmlFor="site" className="block mb-1">Site</label>
                <select
                  name="site"
                  id="site"
                  value={formData.site}
                  onChange={(e) => handleChange('site', e.target.value)}
                  className="border p-2 rounded w-full">
                  <option value="">Select Site</option>
                  {sites.map(site => (
                    <option key={site._id} value={site._id}>{site.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="date" className="block mb-1">Date: {moment(formData.date).format('DD MMMM YYYY')}</label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="checkFor" className="block mb-1">Checklist For</label>
                <select
                  name="checkFor"
                  id="checkFor"
                  value={formData.checkFor}
                  onChange={(e) => handleChange('checkFor', e.target.value)}
                  className="border p-2 rounded w-full">
                  <option value="">CheckList For</option>
                  {projectDetails.map((work, index) => (
                    <option key={index} value={work.workDetail}>{work.workDetail}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="checklistname" className="block mb-1">Checklist Name</label>
                <select
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="border p-2 rounded w-full">
                  <option value="">Select CheckList Name</option>
                  {checkListWork.map(work => (
                    <option key={work._id} value={work.title}>{work.title}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">Submit</button>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold mb-4">Checklist</h1>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Checklist Id:</label>
                  <span>{formData.checklistId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Checklist Name:</label>
                  <span>{formData.name}</span>
                </div>
              </div>
              <ul className="space-y-4">
                {formData.checkWork.map((item, index) => (
                  <li key={item.work} className="border p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold">{item.work}</label>
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(index, e.target.value)}
                        className="border p-2 rounded w-40"
                      >
                        <option value="">Status</option>
                        {status.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label htmlFor={`remarks-${index}`} className="block mb-1">Remarks</label>
                      <input
                        id={`remarks-${index}`}
                        value={item.remarks}
                        onChange={(e) => updateRemarks(index, e.target.value)}
                        placeholder="Enter remarks"
                        className="border p-2 rounded w-full"
                      />
                    </div>
                  </li>
                ))}
              </ul>
              {isAllChecked && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Rating</h2>
                  <div className="space-y-4 ">
                    {formData.rating.map(rating => (
                      <div key={rating.category} className="flex items-center justify-between flex-col md:flex-row lg:flex-row gap-8 ">
                        <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-12">
                          <label className="font-semibold text-sm">{rating.category}</label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map(stars => (
                              <svg
                                key={stars}
                                className={`w-4 h-4 cursor-pointer ${stars <= rating.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                onClick={() => updateRating(rating.category, stars, rating.remarks)}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.517 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.884a1 1 0 00-.364 1.118l1.517 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.884a1 1 0 00-1.175 0l-3.97 2.884c-.784.57-1.838-.197-1.54-1.118l1.517-4.674a1 1 0 00-.364-1.118L2.539 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.517-4.674z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <input
                          value={rating.remarks}
                          onChange={(e) => updateRating(rating.category, rating.stars, e.target.value)}
                          placeholder="Enter remarks"
                          className="border p-2 rounded w-40" />
                      </div>
                    ))}
                  </div>
                  <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={handleChecklistSubmit}>Submit Checklist</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CreateChecklist;
