import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from 'axios'

const CreateLead = ({ onClose, onSubmit, leadData }) => {
    const [lead, setLead] = useState(
        leadData || {
            name: "",
            contact: { phoneNo: "", whatsapp: "", email: "" },
            location: { address: "", city: "", district: "", state: "" },
            leadStatus: "",
            requirement: { service: "", message: "" },
            followUps: [],
            source: "",
            contactAgent: "",
            isClient: '',
        }
    );
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const userData = await axios.get('/api/v1/user/lists');
                let users = userData.data;
                if (userData) {
                    setUsers(users);
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
        getUsers();
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLead((prev) => {
            const keys = name.split(".");
            if (keys.length > 1) {
                return {
                    ...prev,
                    [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleReset = () => {
        setLead({
            name: "",
            contact: { phoneNo: "", whatsapp: "", email: "" },
            location: { address: "", city: "", district: "", state: "" },
            leadStatus: "active",
            requirement: { service: "", message: "" },
            followUps: [],
            source: "",
            contactAgent: "",
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(lead)
            const response = await axios.post('/api/v1/lead', lead)
            console.log(response)
            onSubmit(lead);
            onClose();
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.name}
                />

                <input
                    type="text"
                    name="contact.phoneNo"
                    placeholder="Phone Number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.contact.phoneNo}
                />

                <input
                    type="text"
                    name="contact.whatsapp"
                    placeholder="WhatsApp"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.contact.whatsapp}
                />

                <input
                    type="email"
                    name="contact.email"
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.contact.email}
                />

                <input
                    type="text"
                    name="location.address"
                    placeholder="Address"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.location.address}
                />

                <input
                    type="text"
                    name="location.city"
                    placeholder="City"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.location.city}
                />

                <input
                    type="text"
                    name="location.district"
                    placeholder="District"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.location.district}
                />

                <input
                    type="text"
                    name="location.state"
                    placeholder="State"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.location.state}
                />

                <select
                    name="leadStatus"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.leadStatus}
                >
                    <option value="">Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                </select>

                <select
                    name="requirement.service"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.requirement.service}
                >
                    <option value="">Service</option>
                    <option value="design">Design</option>
                    <option value="construction">Construction</option>
                </select>

                <textarea
                    name="requirement.service"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    placeholder="Wite Message..."
                    value={lead.requirement.message}>
                </textarea>

                <select
                    name="source"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.source}
                >
                    <option value="">Lead Source</option>
                    <option value="website">Web Site</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">Youtube</option>
                    <option value="facebook">FaceBook</option>
                    <option value="india mart">India Mart</option>
                    <option value="justdial">Just Dial</option>
                    <option value="flex">Flex</option>
                    <option value="wall">Wall Marketing</option>
                </select>

                <select
                    name="contactAgent"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleChange}
                    value={lead.contactAgent}
                >
                    <option value="">Contact Agent</option>
                    {users.map((user, index) => (
                        <option key={index} value={user._id}>{user.userName}</option>
                    ))}
                </select>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isClient"
                        className="border-none rounded-lg focus:outline-none mr-2"
                        onChange={handleChange}
                        value='true' />
                    <label htmlFor="isClient" className="block text-md font-medium text-gray-600">Is a Client</label>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className=" bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Submit
                    </button>
                    <button type="button" onClick={handleReset}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
                        Reset
                    </button>
                    <button
                        type="button"
                        className=" bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </form>
        </div>
    );
};



export default CreateLead;