import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";
import Modal from "../../components/Modal";
import axios from "axios";

export default function LeadDetail() {
  const [activeTab, setActiveTab] = useState("info");
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const { id } = useParams();
  // You MUST set this from API: setLeads(singleLeadData)
  const [lead, setLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    if (id) fetchLead(id);
  }, [id]);
  const fetchLead = async (id) => {
    try {
      const response = await axios.get(`/api/v1/lead/${id}`);
      setLead(response.data);
      console.log(response.data)
      
    } catch (error) {
      console.log(error)
    }
  };
  const tabs = [
    { key: "info", label: "Info" },
    { key: "followups", label: "Follow-ups" },
    { key: "attachments", label: "Attachments" },
    { key: "timeline", label: "history" },
  ];

  const handleAddFollowUp = async (lead, newFollowUp) => {
    try {
      setLead((prev) => ({
        ...prev,
        followUps: [...(prev?.followUps || []), newFollowUp],
      }));
      toast.success("Follow-up added successfully!");
    } catch (error) {
      console.log(error)
    }
  };

  const handleOpenAddFollowUpModal = (lead) => {
    setSelectedLead(lead);
    setIsAddFollowUpModalOpen(true);
  };

  if (!lead) return <p>Loading...</p>;

  return (
    <div className="space-y-6 pb-6">
      {/* Lead Card */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-4">
        <img
          src="https://placehold.co/800@2x.png"
          alt="Lead"
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <p className="text-xs text-blue-600 font-medium">
            {lead.leadStatus === "active" ? "Active Lead" : "Closed Lead"}
          </p>
          <h2 className="text-base font-semibold">{lead.name}</h2>

          <p className="text-sm text-gray-500">
            {lead.requirement?.service || "No service specified"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-center pb-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}
      {activeTab === "info" && (
        <div className="space-y-6">
          {/* Basic Details */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Basic Details</h3>
            <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
              <DetailRow label="Lead Name" value={lead.name} />
              <DetailRow label="Phone" value={lead.contact?.phoneNo} />
              <DetailRow label="Whatsapp" value={lead.contact?.whatsapp} />
              <DetailRow label="Email" value={lead.contact?.email} />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
            <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
              <DetailRow label="Address" value={lead.location?.address} />
              <DetailRow label="City" value={lead.location?.city} />
              <DetailRow label="District" value={lead.location?.district} />
              <DetailRow label="State" value={lead.location?.state} />
            </div>
          </div>

          {/* Requirement */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Requirement</h3>
            <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
              <DetailRow label="Service" value={lead.requirement?.service} />
              <DetailRow label="Message" value={lead.requirement?.message} />
            </div>
          </div>

          {/* Source */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Source</h3>
            <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
              <DetailRow label="Source" value={lead.source} />
            </div>
          </div>

          {/* Contact Agent */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Contact Agent</h3>
            <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
              <DetailRow label="Agent" value={lead.contactAgent} />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <ActionButton text="Edit Lead" />
            <ActionButton text="Assign Lead" />
            <ActionButton text="Change Status" />
            <ActionButton text="Delete Lead" danger />
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === "timeline" && (
        <div>
          <h3 className="font-semibold mb-2">Activity Timeline</h3>

          <ul className="border-l-2 border-blue-500 pl-4 space-y-4 text-sm">
            <li>
              <span className="font-medium">
                {new Date(lead.createdAt).toLocaleDateString()}:
              </span>{" "}
              Lead Created
            </li>

            <li>
              <span className="font-medium">Status:</span> {lead.status}
            </li>

            {lead.followUps?.map((f, i) => (
              <li key={i}>
                <span className="font-medium">
                  {new Date(f.date).toLocaleDateString()}:
                </span>{" "}
                Follow-up #{f.followUpNo} — {f.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ATTACHMENTS TAB */}
      {activeTab === "attachments" && (
        <div>
          <h3 className="font-semibold mb-2">Attachments</h3>

          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4">
            + Upload File
          </button>

          {/* If attachments in backend */}
          <ul className="space-y-2 text-sm">
            {lead.attachments?.length > 0 ? (
              lead.attachments.map((file, i) => (
                <li key={i} className="flex justify-between border p-2 rounded">
                  {file.name}
                  <span className="text-blue-500 cursor-pointer">Download</span>
                </li>
              ))
            ) : (
              <p>No attachments</p>
            )}
          </ul>
        </div>
      )}

      {/* FOLLOW-UPS TAB */}
      {activeTab === "followups" && (
        <div>
          <h3 className="font-semibold mb-2">Follow-ups</h3>

          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
            onClick={() => handleOpenAddFollowUpModal(lead)}
          >
            + Follow-up
          </button>

          <div>
            <h4 className="font-medium">All Follow-ups</h4>

            <ul className="space-y-2 text-sm">
              {lead.followUps?.length > 0 ? (
                lead.followUps.map((f, i) => (
                  <li key={i} className="border p-2 rounded">
                    {new Date(f.date).toLocaleDateString()} — {f.message}
                  </li>
                ))
              ) : (
                <p>No follow-ups yet</p>
              )}
            </ul>
          </div>
        </div>
      )}

      <AddFollowUpModal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        onAddFollowUp={handleAddFollowUp}
        lead={selectedLead}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between px-4 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function ActionButton({ text, danger }) {
  return (
    <button
      className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
      }`}
    >
      {text}
    </button>
  );
}

const AddFollowUpModal = ({ isOpen, onClose, onAddFollowUp, lead }) => {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  console.log(lead);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newFollowUp = { date, message };
    onAddFollowUp(lead, newFollowUp);
    try {
      const response = await axios.patch(
        `/api/v1/lead/${lead._id}/followUp`,
        newFollowUp
      );
      if (response) {
        console.log(response.data);
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} head="Add Follow-Up">
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold mt-2">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mt-2">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4 mt-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">
              Add Follow-Up
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
