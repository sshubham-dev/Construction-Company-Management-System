import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../../components/Modal";

const FollowUpModal = ({ isOpen, onClose, onAddFollowUp, lead }) => {
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("call");

  useEffect(() => {
    if (!isOpen) {
      setNextFollowUp("");
      setNote("");
      setType("call");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const followUpData = {
      type,
      note,
      nextFollowUp,
    };

    try {
      const response = await axios.put(
        `/api/v1/lead/followUp?id=${lead._id}`,
        followUpData
      );

      if (response.data) {
        onAddFollowUp(lead, response.data.followUp);
      }

      onClose();

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} head="Add Follow-Up">

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Follow-up Type */}

        <div>
          <label className="text-sm font-semibold">
            Follow-up Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="call">Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="meeting">Meeting</option>
            <option value="site_visit">Site Visit</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Note */}

        <div>
          <label className="text-sm font-semibold">
            Client Response / Notes
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did the client say?"
            className="w-full p-2 border rounded-lg"
            rows={3}
          />
        </div>

        {/* Next Follow-up */}

        <div>
          <label className="text-sm font-semibold">
            Next Follow-up Date
          </label>

          <input
            type="date"
            value={nextFollowUp}
            onChange={(e) => setNextFollowUp(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Buttons */}

        <div className="flex gap-3 pt-2">

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Save Follow-up
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

        </div>

      </form>

    </Modal>
  );
};

export default FollowUpModal;