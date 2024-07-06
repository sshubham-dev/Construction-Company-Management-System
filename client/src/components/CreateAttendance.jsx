import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
axios.defaults.withCredentials = true;

const CreateAttendance = () => {
  const [markAttendance, setMarkAttendance] = useState({
    date: moment().format('DD-MM-YYYY'),
    timeIn: moment().format('HH:mm'),
    status: '',
  });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(markAttendance);
      const response = await axios.post('/api/v1/attendance', markAttendance);
      toast.success(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-fit md:w-fit mb-4">
      <form onSubmit={handleSubmit} className="gap-3 flex flex-row justify-between">
        <button
          type="submit"
          onClick={() => setMarkAttendance({ ...markAttendance, status: 'present' })}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 w-fit h-full rounded-3xl focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
        >
          Present
        </button>
        <button onClick={() => navigate('/create-leave')} className="bg-green-500 hover:bg-green-600 rounded-3xl text-white px-6 py-2 w-fit h-full">
          Leave
        </button>
      </form>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  );
};

export default CreateAttendance;
