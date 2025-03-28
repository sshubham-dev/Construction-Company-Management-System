import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { MdOutlineRemoveCircle, MdOutlineAddCircle } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
axios.defaults.withCredentials = true;

const CreateEmployee = ({ onClose, isEdit }) => {
    const [employee, setEmployee] = useState({
        name: "",
        email: "",
        phone: '',
        whatsapp: '',
        employeeNo: "",
        joinDate: "",
        birthdate: "",
        address: "",
        addhar: "",
        pan: "",
        cv: "",
        offerletter: "",
        bank: "",
        isUser: false,
        department: '',
    });
    const departments = [
        'Company',
        'Accountant',
        'Marketing',
        'Ceo',
        'Site Incharge',
        'Site Supervisor',
        'Design Engineer',
        'Quality Engineer',
        'Store Incharge',
        'H.R',
        'Account Head',
        'Store Helper'
    ];
    const [error, setError] = useState(null);


    useEffect(() => {
        if (isEdit) {
            fetchEmployee(isEdit);
        }
    }, [])

    const fetchEmployee = async (id) => {
        try {
            const employeerData = await axios.get(`/api/v1/employee/${id}`);
            const exitEmployee = employeerData.data
            if (employeerData.data) {
                setEmployee({
                    name: exitEmployee.name,
                    email: exitEmployee.email,
                    phone: exitEmployee.phone,
                    whatsapp: exitEmployee.whatsapp,
                    employeeNo: exitEmployee.employeeNo,
                    joinDate: exitEmployee.joinDate,
                    birthdate: exitEmployee.birthdate,
                    address: exitEmployee.address,
                    isUser: exitEmployee.isUser,
                    department: exitEmployee.department,
                });
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleReset = () => {
        setEmployee({
            name: "",
            email: "",
            phone: '',
            whatsapp: '',
            employeeNo: "",
            joinDate: "",
            birthdate: "",
            address: "",
            addhar: "",
            pan: "",
            cv: "",
            offerletter: "",
            bank: "",
            isUser: '',
            department: ''
        })
    }

    const inputData = (data, field) => {
        const { name, value, type } = data.target;
        if (type === 'file') {
            setEmployee((prevEmployee) => ({
                ...prevEmployee,
                [field]: data.target.files[0],
            }));
        } else {
            setEmployee((prevEmployee) => ({ ...prevEmployee, [name]: value }));
        }
    };

    const formSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(employee);
            if(isEdit){
                const response = await axios.put(`/api/v1/employee/${isEdit}`, employee);
                if (response.data) {
                    console.log(response.data);
                    toast.success('Employee Updated successfully!');
                }
                onClose()
            }else{
                const response = await axios.post('/api/v1/employee', employee, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
                    },
                });
                if (response.data) {
                    console.log(response.data);
                    toast.success('Employee Created successfully!');
                }
                onClose()
            }
        } catch (error) {
            toast.error(error.message);
            setError(error.message);
        }
    };

    return (
        <div>
            <form
                className='space-y-4'
                onSubmit={formSubmit}>

                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-1' htmlFor='name'>
                        Full Name
                    </label>
                    <input
                        className='appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        type='text'
                        name='name'
                        placeholder='Enter Full Name here'
                        autoComplete='off'
                        value={employee.name}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-1' htmlFor='email'>
                        Email
                    </label>
                    <input
                        className='appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        type='email'
                        name='email'
                        placeholder='Enter Your Email here'
                        autoComplete='off'
                        value={employee.email}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor='phone'
                        className='block text-gray-700 text-sm font-bold mb-1'>
                        Contact Number:
                    </label>
                    <input
                        className='py-2 px-3 w-full border rounded-md focus:outline-none focus:border-blue-500'
                        type='text'
                        name='phone'
                        id='phone'
                        placeholder='Enter Your Contact Number'
                        autoComplete='off'
                        value={employee.phone}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor='whatsapp'
                        className='block text-gray-700 text-sm font-bold mb-1'>
                        Whatsapp Number:
                    </label>
                    <input
                        className='py-2 px-3 w-full border rounded-md focus:outline-none focus:border-blue-500'
                        type='text'
                        name='whatsapp'
                        id='whatsapp'
                        placeholder='Enter Your Whatsapp Number'
                        autoComplete='off'
                        value={employee.whatsapp}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor='employeeNo' className='block text-gray-700 text-sm font-bold mb-1'>Employee ID</label>
                    <input
                        type='text'
                        className='appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        name='employeeNo'
                        placeholder='Enter Your Employee ID here'
                        autoComplete='off'
                        value={employee.employeeNo}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-1">
                        Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Address"
                        value={employee.address}
                        onChange={inputData}
                        className="py-2 px-3 w-full border rounded-md focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className='mb-4'>
                    <label
                        htmlFor='joining'
                        className='block text-gray-700 text-sm font-bold mb-1'>
                        Joining Date: {employee.joinDate}
                    </label>
                    <input
                        className='appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        type='date'
                        name='joinDate'
                        value={employee.joinDate}
                        onChange={inputData}
                    />
                </div>

                <div className='mb-6'>
                    <label htmlFor='birthdate' className='block text-gray-700 text-sm font-bold mb-1'>DOB: {employee.birthdate}</label>
                    <input
                        className='appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        type='date'
                        name='birthdate'
                        value={employee.birthdate}
                        onChange={inputData}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="access" className="block text-gray-700 text-sm font-bold mb-2">
                        Department
                    </label>
                    <select
                        name='department'
                        onChange={inputData}
                        required
                        value={employee.department}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option>Department</option>
                        {departments.map((department, index) => (
                            <option key={index} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        name="isUser"
                        className="border-none rounded-lg focus:outline-none mr-2"
                        onChange={inputData}
                        value='true' />
                    <label htmlFor="isUser" className="block text-md font-medium text-gray-600">Is a User</label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-red-400 text-white rounded-md">
                        Cancel
                    </button>
                    <button
                        type='submit'
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" >
                        Create
                    </button>
                    <button type="button" onClick={handleReset}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">
                        Reset
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
        </div>
    )
}


export default CreateEmployee