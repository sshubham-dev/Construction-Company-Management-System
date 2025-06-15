import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
axios.defaults.withCredentials = true;

function WorkDetailsForm({ onClose, id, index }) {

  const [workDetail, setWorkDetail] = useState({
    title: '',
    description: [{
      work: '',
    }]
  });
  const [workToEdit, setWorkToEdit] = useState({
    id: '',
    index: '',
  });
  const [workDetailsToEdit, setWorkDetailsToEdit] = useState();

  useEffect(() => {
    if (id && !index) {
      fetchWorkDetail(id);
      setWorkDetailsToEdit(id);
      console.log(id)
    } else if (id && index) {
      setWorkToEdit({ id, index })
      fetchDescription(id, index)
    }
  }, [])

  const fetchWorkDetail = async (id) => {
    try {
      const response = await axios.get(`/api/v1/work-details/${id}`);
      setWorkDetail({
        title: response.data?.title,
        description: [{
          work: '',
        }]
      });
    } catch (error) {
      toast.error(error.message)
    }
  };

  const fetchDescription = async (id, index) => {
    try {
      const response = await axios.get(`/api/v1/work-details/${id}`);
      setWorkDetail({
        title: response.data?.title,
        description: [{
          work: response.data?.description[index].work,
        }]
      });
      console.log(response.data?.description[index])
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handelChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'work') {
      setWorkDetail((prevWorkDetail) => {
        const newDescription = [...prevWorkDetail.description];
        newDescription[index] = {
          ...newDescription[index],
          [name]: value
        };
        return {
          ...prevWorkDetail,
          description: newDescription
        };
      });
    } else {
      // Update other fields outside the description array
      setWorkDetail({
        ...workDetail,
        [name]: value,
      });
    }
  };

  const moreWork = () => {
    setWorkDetail((workDetail) => ({
      ...workDetail,
      description: [
        ...workDetail.description,
        {
          work: '',
        },
      ],
    }));
  };

  const removeWork = (index) => {
    setWorkDetail((prevWorkDetail) => {
      const updatedDescription = [...prevWorkDetail.description];
      updatedDescription.splice(index, 1); // Remove the entry at the specified index
      return {
        ...prevWorkDetail,
        description: updatedDescription,
      };
    });
  };

  const createWorkDetails = async (e) => {
    e.preventDefault();
    try {
      if (workDetailsToEdit) {
        console.log(workDetailsToEdit)
        console.log(workDetail)
        const response = await axios.put(`/api/v1/work-details/${workDetailsToEdit}`, workDetail);
        toast.success(response.data.message)
        onClose()
      } else if (workToEdit.id !== '' && workToEdit.index !== '') {
        const response = await axios.put(`/api/v1/work-details/${workToEdit.id}/${workToEdit.index}`, workDetail);
        toast.success(response.data.message)
        onClose()
      } else {
        const response = await axios.post('/api/v1/work-details', workDetail);
        toast.success(response.data.message)
        onClose()
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Send to backend
      await axios.post('/api/v1/work-details/import-data', data);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div >
      <form className='max-w-md mx-auto ' onSubmit={createWorkDetails}>

        <div className="mb-4">
          <label htmlFor='title' className="block text-sm font-semibold text-gray-600">
            Work Title
          </label>
          <input
            type='text'
            name='title'
            value={workDetail.title}
            required
            onChange={handelChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Work Description</h2>
          {workDetail?.description?.map((works, index) => (
            <div className="mb-4" key={index}>
              <label htmlFor='description' className="block text-sm font-semibold text-gray-600">
                Work
              </label>
              <div className="flex">
                <input
                  type='text'
                  name='work'
                  value={works.work}
                  required
                  onChange={(e) => handelChange(e, index)}
                  className="border p-2 rounded text-pretty w-full"
                />

                {workDetail.description.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWork(index)}
                    className="bg-red-500 text-white p-2 rounded ml-2"
                  >
                    Remove
                  </button>
                )}

              </div>
            </div>
          ))}
          {id ? '' :
            <button
              type="button"
              onClick={moreWork}
              className="bg-blue-500 text-white p-2 rounded mt-4"
            >
              Add More
            </button>
          }
        </div>

        {/* <h2 className="text-lg text-center font-semibold my-4">OR</h2>
        <div className="mb-4">
          <label htmlFor='title' className="block text-sm font-semibold text-gray-600">
            Import From Excel ( .csv, .xlsx, .xls )
          </label>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
        </div> */}

        <button
          type="button"
          onClick={createWorkDetails}
          className="bg-green-500 text-white p-2 rounded mt-4"
        >
          {id ? 'Update' : 'Create'} Work Detail
        </button>

      </form>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  );
}

export default WorkDetailsForm;