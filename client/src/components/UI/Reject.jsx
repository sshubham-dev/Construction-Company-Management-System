import axios from "axios";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Reject = ({ onClose, Id }) => {
  const [message, setMessage] = useState();
  // console.log(Id);
  const navigate = useNavigate();
  const handleReject = async (e) => {
    e.preventDefault();
    try {
      console.log(Id);
      console.log(message);
      const response = await axios.put(`/api/v1/approval/reject/${Id}`, {
        message,
      });
      console.log(response.data);
      toast.success(response.data.message);
      navigate(-1);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleReject}>
      <div className="mb-2">
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          name="message"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Wite Message..."
          value={message}
        ></textarea>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white p-2 rounded"
        >
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Save
        </button>
      </div>
       <Toaster position="top-right" reverseOrder={false} />
    </form>
  );
};

export default Reject;
