import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const CreateLead = ({ onClose, onSubmit, isEdit }) => {
  const initialState = {
    name: "",
    contact: { phoneNo: "", whatsapp: "", email: "" },
    location: { address: "", city: "", district: "", state: "" },

    temperature: "cold",

    status: "new",

    requirement: { service: "", message: "" },

    source: "",

    contactAgent: "",

    marketingTag: "",

    isClient: false,
  };

  const [lead, setLead] = useState(initialState);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  /* FETCH USERS */

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();

    if (isEdit) {
      fetchLead(isEdit);
    }
  }, [isEdit]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/v1/user/lists");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  /* FETCH EXISTING LEAD (EDIT MODE) */

  const fetchLead = async (id) => {
    try {
      const res = await axios.get(`/api/v1/lead/${id}`);
      console.log(res.data);
      setLead({
        ...initialState,
        ...res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  /* HANDLE CHANGE */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLead((prev) => {
      const keys = name.split(".");

      if (keys.length > 1) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }

      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }

      return { ...prev, [name]: value };
    });
  };

  /* RESET */

  const handleReset = () => {
    setLead(initialState);
  };

  /* SUBMIT */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      let res;

      if (isEdit !== undefined) {
        res = await axios.put(`/api/v1/lead/${isEdit}`, lead);
        toast.success("Lead updated");
        onClose();
      } else {
        res = await axios.post("/api/v1/lead", lead);
        toast.success("Lead created");
        onClose();
      }

      onSubmit(res.data);
    } catch (err) {
      toast.error("Error saving lead");
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* NAME */}

      <input
        type="text"
        name="name"
        placeholder="Lead Name"
        className="w-full p-2 border rounded"
        value={lead.name}
        onChange={handleChange}
      />

      {/* PHONE */}

      <input
        type="text"
        name="contact.phoneNo"
        placeholder="Phone Number"
        className="w-full p-2 border rounded"
        value={lead.contact.phoneNo}
        onChange={handleChange}
      />

      {/* WHATSAPP */}

      <input
        type="text"
        name="contact.whatsapp"
        placeholder="WhatsApp"
        className="w-full p-2 border rounded"
        value={lead.contact.whatsapp}
        onChange={handleChange}
      />

      {/* EMAIL */}

      <input
        type="email"
        name="contact.email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={lead.contact.email}
        onChange={handleChange}
      />

      {/* ADDRESS */}

      <input
        type="text"
        name="location.address"
        placeholder="Address"
        className="w-full p-2 border rounded"
        value={lead.location.address}
        onChange={handleChange}
      />

      <input
        type="text"
        name="location.city"
        placeholder="City"
        className="w-full p-2 border rounded"
        value={lead.location.city}
        onChange={handleChange}
      />

      <input
        type="text"
        name="location.district"
        placeholder="District"
        className="w-full p-2 border rounded"
        value={lead.location.district}
        onChange={handleChange}
      />

      <input
        type="text"
        name="location.state"
        placeholder="State"
        className="w-full p-2 border rounded"
        value={lead.location.state}
        onChange={handleChange}
      />

      {/* TEMPERATURE */}

      <select
        name="temperature"
        className="w-full p-2 border rounded"
        value={lead.temperature}
        onChange={handleChange}
      >
        <option value="cold">Cold Lead</option>
        <option value="warm">Warm Lead</option>
        <option value="hot">Hot Lead</option>
      </select>

      {/* STATUS */}

      <select
        name="status"
        className="w-full p-2 border rounded"
        value={lead.status}
        onChange={handleChange}
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="discussion">Discussion</option>
        <option value="proposal_sent">Proposal Sent</option>
        <option value="negotiation">Negotiation</option>
        <option value="converted">Converted</option>
        <option value="lost">Lost</option>
        <option value="closed">Closed</option>
      </select>

      {/* SERVICE */}

      <select
        name="requirement.service"
        className="w-full p-2 border rounded"
        value={lead.requirement.service}
        onChange={handleChange}
      >
        <option value="">Service</option>
        <option value="design">Design</option>
        <option value="approval">Approval</option>
        <option value="interior">Interior</option>
        <option value="construction">Construction</option>
      </select>

      {/* MESSAGE */}

      <textarea
        name="requirement.message"
        placeholder="Client Requirement / Message"
        className="w-full p-2 border rounded"
        value={lead.requirement.message}
        onChange={handleChange}
      />

      {/* SOURCE */}

      <select
        name="source"
        className="w-full p-2 border rounded"
        value={lead.source}
        onChange={handleChange}
      >
        <option value="">Lead Source</option>
        <option value="website">Website</option>
        <option value="google">Google</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="youtube">Youtube</option>
        <option value="india mart">India Mart</option>
        <option value="justdial">JustDial</option>
        <option value="wall">Wall Marketing</option>
        <option value="referral">Referral</option>
      </select>

      {/* AGENT */}

      <select
        name="contactAgent"
        className="w-full p-2 border rounded"
        value={lead.contactAgent}
        onChange={handleChange}
      >
        <option value="">Contact Agent</option>

        {users.map((user) => (
          <option key={user._id} value={user.userName}>
            {user.userName}
          </option>
        ))}
      </select>

      {/* CLIENT */}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isClient"
          checked={lead.isClient}
          onChange={handleChange}
        />

        <label>Is Client</label>
      </div>

      {/* BUTTONS */}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : isEdit ? "Update Lead" : "Create Lead"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </form>
  );
};

export default CreateLead;
