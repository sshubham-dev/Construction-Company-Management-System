import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';

axios.defaults.withCredentials = true;

const CreateLeave = ({ onClose, isEdit }) => {
    const [leave, setLeave] = useState({
        reportingDate: '',
        from: '',
        reason: '',
    });

    useEffect(()=>{
        if(isEdit){
            fetchLeave(isEdit)
        }
    },[])
    
    const fetchLeave = async (id) => {
        try {
          const leaveResponse = await axios.get(`/api/v1/leave/${id}`);
          console.log('Leaves:', leaveResponse.data);
          setLeave(leaveResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLeave({
            ...leave,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(leave);
            if (isEdit) {
                const response = await axios.put(`/api/v1/leave/${isEdit}`, leave);
                toast.success(response.data.message);
                onClose()
                // Reset form fields after successful submission
                setLeave({
                    reportingDate: moment(),
                    from: moment(),
                    reason: '',
                });
            } else {
                const response = await axios.post('/api/v1/leave', leave);
                toast.success(response.data.message);
                onClose()
                // Reset form fields after successful submission
                setLeave({
                    reportingDate: moment(),
                    from: moment(),
                    reason: '',
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit leave request');
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="space-y-4">
                <div className='mb-4'>
                    <label htmlFor="from" className="block text-sm font-medium text-gray-700">From: {leave.from}</label>
                    <input
                        type="date"
                        id="from"
                        name="from"
                        value={leave.from}
                        onChange={handleChange}
                        className="mt-1 p-2 w-full border rounded-md"
                    />
                </div>
                <div className='mb-4'>
                    <label htmlFor="reportingDate" className="block text-sm font-medium text-gray-700">Reporting Date: {leave.reportingDate}</label>
                    <input
                        type="date"
                        id="reportingDate"
                        name="reportingDate"
                        value={leave.reportingDate}
                        onChange={handleChange}
                        className="mt-1 p-2 w-full border rounded-md"
                    />
                </div>
                <div className='mb-4'>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason:</label>
                    <textarea
                        id="reason"
                        name="reason"
                        value={leave.reason}
                        onChange={handleChange}
                        className="mt-1 p-2 w-full border rounded-md resize-none"
                        rows="4"
                    ></textarea>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-red-400 text-white rounded-md">
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Submit</button>
                    <button type="button" onClick={() => setLeave({
                        reportingDate: moment(),
                        from: moment(),
                        reason: '',
                    })} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
                        Reset
                    </button>
                </div>
            </form>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
        </div>
    );
};

export default CreateLeave;
