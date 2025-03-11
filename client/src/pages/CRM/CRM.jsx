import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../components/Header';
import axios from "axios";
axios.defaults.withCredentials = true;

const CRM = () => {
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    const fetchLead = async () => {
      const response = await axios.get('/api/v1/lead')
      setLeads(response.data)
    }
    fetchLead()
  },[])

  return (
    <div>
      <Header category="Page" title="CRM" />
      <section className="h-full w-full mb-16 flex justify-center px-4 sm:px-6 lg:px-8">
        <div className='overflow-x-hidden w-full mx-auto'>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Hello Evano 👋</h1>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-600">Total Leads</p>
                <h2 className="text-3xl font-bold">{leads.length}</h2>
                {/* <p className="text-green-500 text-sm mt-2">↑ 16% this month</p> */}
              </div>
              {/* <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-600">Members</p>
                <h2 className="text-3xl font-bold">1,893</h2>
                <p className="text-red-500 text-sm mt-2">↓ 1% this month</p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-gray-600">Active Now</p>
                <h2 className="text-3xl font-bold">189</h2>
              </div> */}
            </div>

        </div>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </section>
    </div>
  )
}

export default CRM;
