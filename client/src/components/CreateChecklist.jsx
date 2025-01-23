import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Header from './Header';

const categories = ['Housekeeping', 'Safety'];

const CreateChecklist = () => {
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
    ratings: categories.map(category => ({ category, score: 0 })), // Ratings for categories
    observation: '',              // Additional observations
  });
  const [sites, setSite] = useState([]);                      // Selected site
  const [showChecklist, setShowChecklist] = useState(false);  // Flag to show the checklist
  const [isAllChecked, setIsAllChecked] = useState(false);   // Flag to indicate if all works are checked
  const [checkListWork, setCheckListWork] = useState([]);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get('/api/v1/site');
        setSite(response.data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchSite();
  }, []);

  // Fetch predefinedItems from API
  useEffect(() => {
    const fetchWorkDetails = async () => {
      try {
        const response = await axios.get('/api/v1/work-details');
        const filteredItems = response.data.filter(item => item.title.includes('Checklist'));
        setCheckListWork(filteredItems);
      } catch (error) {
        console.error('Error fetching work details:', error);
      }
    };

    fetchWorkDetails();
  }, []);

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

  const updateRating = (category, score) => {
    setFormData(prevData => ({
      ...prevData,
      ratings: prevData.ratings.map(rating =>
        rating.category === category ? { ...rating, score } : rating
      ),
    }));
  };

  const handleSubmit = () => {
    if (formData.site && formData.date && formData.name) {
      setShowChecklist(true);
    }
    if (formData.name) {
      const selectedChecklist = checkListWork.find(item => item.title === formData.name);
      console.log('selectedChecklist', selectedChecklist);
      if (selectedChecklist) {
        setFormData({
          ...formData,
          checkWork: selectedChecklist.description.map(desc => ({ work: desc.work, status: '', remarks: '' })),
        });
      }
    }
    console.log('first', formData)
  };

  const handleChecklistSubmit = () => {
    localStorage.setItem('formData', JSON.stringify(formData));
    alert('Checklist submitted successfully!');
    console.log(formData)
  };

  useEffect(() => {
    setIsAllChecked(formData.checkWork.every(item => item.status !== ''));
  }, [formData.checkWork]);

  return (
    <div className='m-1.5 md:m-6 p-4 min-w-screen min-h-screen md:p-8 bg-white rounded-3xl'>
      <Header category="Page" title="Checklist's" />
      <section className='container mx-auto mt-4 mb-16'>
        <div className="p-8 max-w-2xl mx-auto">
          {!showChecklist ? (
            <div>
              <h1 className="text-3xl font-bold mb-4">Checklist Setup</h1>
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
                <label htmlFor="date" className="block mb-1">Date</label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="checklistname" className="block mb-1">Checklist Name</label>
                <select
                  name="site"
                  id="site"
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
              <h1 className="text-3xl font-bold mb-4">Checklist</h1>
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
                  <li key={index} className="border p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-semibold">{item.work}</label>
                      <select
                        value={item.status || ''}
                        onChange={(e) => updateStatus(index, e.target.value)}
                        className="border p-2 rounded w-40"
                      >
                        <option value="">Status</option>
                        <option value="N/A">N/A</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label htmlFor={`remarks-${index}`} className="block mb-1">Remarks</label>
                      <input
                        id={`remarks-${index}`}
                        value={item.remarks || ''}
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
                  <div className="space-y-4">
                    {formData.ratings.map(rating => (
                      <div key={rating.category} className="flex items-center justify-between">
                        <label className="font-semibold">{rating.category}</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <svg
                              key={score}
                              className={`w-4 h-4 cursor-pointer ${score <= rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                              onClick={() => updateRating(rating.category, score)}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.517 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.884a1 1 0 00-.364 1.118l1.517 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.884a1 1 0 00-1.175 0l-3.97 2.884c-.784.57-1.838-.197-1.54-1.118l1.517-4.674a1 1 0 00-.364-1.118L2.539 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.517-4.674z" />
                            </svg>
                          ))}
                        </div>
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
