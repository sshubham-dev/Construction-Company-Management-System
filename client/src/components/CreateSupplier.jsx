import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

axios.defaults.withCredentials = true;

const CreateSupplier = ({ onClose, isEdit }) => {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    gstNo: "",
    address: "",
    pan: "",
    bank: "",
    isUser: false,
  });
  const [error, setError] = useState(null);
  const [supplierIdToEdit, setSupplierIdToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isEdit) {
      setSupplierIdToEdit(isEdit);
      fetchSupplierDetails(isEdit);
    }
  }, []);

  const fetchSupplierDetails = async (id) => {
    try {
      const response = await axios.get(`/api/v1/supplier/${id}`);
      const supplier = response.data;
      console.log(supplier);
      setSupplier({
        name: supplier.name,
        email: supplier?.email,
        phone: supplier.phone,
        whatsapp: supplier.whatsapp,
        gstNo: supplier.gstNo,
        address: supplier.address,
        pan: supplier.pan,
        bank: "",
      });
    } catch (error) {
      console.log("Error fetching user details:", error);
    }
  };

  const handleChange = (data) => {
    const { type, value, name } = data.target;
    if (type === "file") {
      setSupplier((prevSupplier) => ({
        ...prevSupplier,
        [name]: data.target.files[0],
      }));
    } else {
      setSupplier((prevSupplier) => ({
        ...prevSupplier,
        [name]: value,
      }));
    }
  };

  const handleReset = () => {
    setSupplier({
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      gstNo: "",
      address: "",
      pan: "",
      bank: "",
      isUser: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit !== undefined) {
        console.log(supplier);
        await axios.put(`/api/v1/supplier/${supplierIdToEdit}`, supplier);
        toast.success("User edited successfully");

        onClose();
      } else {
        console.log("Form data submitted:", supplier);
        const response = await axios.post("/api/v1/supplier", supplier);
        toast.success(response.data.message);
        onClose();
      }
    } catch (error) {
      setLoading(false);
      console.error("Error creating contractor:", error);
      toast.error("Failed Creating Contractor. Please check your credentials.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={supplier.name}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={supplier.email}
            onChange={handleChange}
            placeholder="Email"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-600"
          >
            Contact Number:
          </label>
          <input
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            name="phone"
            value={supplier.phone}
            placeholder="Enter Your Contact Number"
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="whatsapp"
            className="block text-sm font-medium text-gray-600"
          >
            Whatsapp Number:
          </label>
          <input
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
            type="text"
            name="whatsapp"
            value={supplier.whatsapp}
            placeholder="Enter Your Whatsapp Number"
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-600"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            value={supplier.address}
            onChange={handleChange}
            placeholder="Address"
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="gstNo"
            className="block text-sm font-medium text-gray-600"
          >
            GST No
          </label>
          <input
            type="text"
            name="gstNo"
            value={supplier.gstNo}
            onChange={handleChange}
            placeholder="GST No."
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="pan"
            className="block text-sm font-medium text-gray-600"
          >
            Pan Card:
          </label>
          <input
            type="text"
            name="pan"
            placeholder="Pan"
            value={supplier.pan}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* <div className="mb-4">
          <label
            htmlFor="account"
            className="block text-sm font-medium text-gray-600"
          >
            Account Details:
          </label>
          <input
            type="file"
            name="bank"
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div> */}

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="isUser"
            className="border-none rounded-lg focus:outline-none mr-2"
            // value={supplier.isUser || "true"}
            checked={supplier.isUser}
            onChange={(e) =>
              setSupplier((prev) => ({
                ...prev,
                isUser: e.target.checked,
              }))
            }
          />
          <label
            htmlFor="isUser"
            className="block text-md font-medium text-gray-600"
          >
            Is a User
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-400 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateSupplier;
