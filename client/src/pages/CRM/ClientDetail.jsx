import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";

export default function ClientDetail() {
  const [activeTab, setActiveTab] = useState("projects");
  const tabs = [
    "projects",
    "payments",
    "schedule",
    "extra work",
    "communication",
    "documents",
  ];

  return (
<MainLayout title="Client Details">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Client Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 mt-2">
          <div className="flex items-center space-x-4 ">
            {/* Company Logo */}
            <img
              src="https://placehold.co/600x400@2x.png"
              alt="Client Logo"
              className="w-22 h-22 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">BuildRight Construction</h2>
              <p className="text-md text-gray-500">Established 2005</p>
              <p className="text-sm text-blue-600">
                123 Main St, Anytown, USA
              </p>
            </div>
          </div>

          {/* Contact Person */}
          <div className="flex items-center mt-6 space-x-4 ">
            <img
              src="https://placehold.co/800@2x.png"
              alt="Manager"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">Ethan Carter</p>
              <p className="text-sm text-blue-600">Project Manager</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">📧</span>
              <p className="text-sm">ethan.carter@buildright.com</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">📞</span>
              <p className="text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3.5 border-b pb-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-2 space-y-6">
          {activeTab === "projects" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg shadow-md">
                  <h3 className="font-bold">Custom Villa</h3>
                  <p>Status: In Progress (60%)</p>
                  <p>Timeline: Jan 2025 – Aug 2025</p>
                </div>
                <div className="p-4 rounded-lg shadow-md">
                  <h3 className="font-bold">Apartment Complex</h3>
                  <p>Status: Completed</p>
                  <p>Timeline: Jan 2024 – Dec 2024</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "communication" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Communication Log</h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg shadow-md">
                  <p>
                    <strong>12 Aug 2025:</strong> Called client regarding villa
                    design.
                  </p>
                </div>
                <div className="p-3 rounded-lg shadow-md">
                  <p>
                    <strong>15 Aug 2025:</strong> Sent quotation for interior
                    work.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Payments</h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 ">Invoice ID</th>
                    <th className="p-2 ">Date</th>
                    <th className="p-2 ">Amount</th>
                    <th className="p-2 ">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 ">INV-001</td>
                    <td className="p-2 ">10 Aug 2025</td>
                    <td className="p-2 ">₹1,20,000</td>
                    <td className="p-2  text-green-600">Paid</td>
                  </tr>
                  <tr>
                    <td className="p-2 ">INV-002</td>
                    <td className="p-2 ">20 Aug 2025</td>
                    <td className="p-2 ">₹80,000</td>
                    <td className="p-2  text-red-600">Pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Schedule</h2>
              <ul className="space-y-3">
                <li className="p-3 rounded-lg shadow-md">
                  <strong>Meeting:</strong> 25 Aug 2025 – Villa Site Visit
                </li>
                <li className="p-3 rounded-lg shadow-md">
                  <strong>Meeting:</strong> 30 Aug 2025 – Quotation Discussion
                </li>
              </ul>
            </div>
          )}

          {activeTab === "extra work" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Extra Work Requests
              </h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg shadow">
                  <p>
                    <strong>Modular Kitchen</strong> – Pending Approval
                  </p>
                </div>
                <div className="p-3 rounded-lg shadow-md">
                  <p>
                    <strong>Landscape Design</strong> – Approved
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg flex justify-between items-center shadow-md">
                  <p>Contract Agreement.pdf</p>
                  <button className="text-blue-600">Download</button>
                </div>
                <div className="p-3 rounded-lg flex justify-between items-center shadow-md">
                  <p>Floor Plan.dwg</p>
                  <button className="text-blue-600">Download</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-row justify-between gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Add Project
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">
              Send Message
            </button>
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg">
            Schedule Meeting
          </button>
        </div>
      </div>
</MainLayout>
  );
}
