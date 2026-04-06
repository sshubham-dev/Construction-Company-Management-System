import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";
import FollowUpModal from "./components/FollowUpModal.jsx";
import CreateLead from "../../components/CreateLead.jsx";

export default function LeadDetail() {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [editId, setEditId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`/api/v1/lead/${id}`);
      setLead(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddFollowUp = (lead, followUp) => {
    setLead((prev) => ({
      ...prev,
      followUps: [...(prev.followUps || []), followUp],
      nextFollowUpDate: followUp.nextFollowUp,
    }));

    toast.success("Follow-up added");
  };

  const openFollowUpModal = () => {
    setSelectedLead(lead);
    setIsAddFollowUpModalOpen(true);
  };

  if (!lead) return <p className="p-4">Loading...</p>;

  const tabs = [
    { key: "info", label: "Info" },
    { key: "followups", label: "Follow-ups" },
    { key: "attachments", label: "Attachments" },
    { key: "timeline", label: "History" },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* LEAD HEADER CARD */}

      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
        <img
          src="https://placehold.co/100"
          className="w-16 h-16 rounded-lg object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">{lead.name}</h2>

            {/* Temperature badge */}

            <span
              className={`text-xs px-2 py-1 rounded
                ${
                  lead.temperature === "hot"
                    ? "bg-red-100 text-red-600"
                    : lead.temperature === "warm"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-600"
                }
              `}
            >
              {lead.temperature}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            {lead.requirement?.service || "No service"}
          </p>

          {/* Status */}

          <p className="text-xs mt-1 text-gray-600">
            Status: <span className="font-medium">{lead.status}</span>
          </p>

          {/* Next followup */}

          {lead.nextFollowUpDate && (
            <p className="text-xs text-blue-600 mt-1">
              Next Follow-up:{" "}
              {new Date(lead.nextFollowUpDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* TABS */}

      <div className="border-b flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 pb-2 text-sm
              ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}

      {activeTab === "info" && (
        <div className="space-y-6">
          {/* BASIC DETAILS */}

          <Section title="Basic Details">
            <DetailRow label="Name" value={lead.name} />
            <DetailRow label="Phone" value={lead.contact?.phoneNo} />
            <DetailRow label="Whatsapp" value={lead.contact?.whatsapp} />
            <DetailRow label="Email" value={lead.contact?.email} />
            <DetailRow
              label="Lead Created"
              value={new Date(lead.createdAt).toLocaleDateString()}
            />
            <DetailRow
              label="Last Contacted"
              value={
                lead.lastContactedAt
                  ? new Date(lead.lastContactedAt).toLocaleDateString()
                  : "-"
              }
            />
          </Section>

          {/* LOCATION */}

          <Section title="Location">
            <DetailRow label="Address" value={lead.location?.address} />
            <DetailRow label="City" value={lead.location?.city} />
            <DetailRow label="District" value={lead.location?.district} />
            <DetailRow label="State" value={lead.location?.state} />
          </Section>

          {/* REQUIREMENT */}

          <Section title="Requirement">
            <DetailRow label="Service" value={lead.requirement?.service} />
            <DetailRow label="Message" value={lead.requirement?.message} />
          </Section>

          {/* SOURCE */}

          <Section title="Source">
            <DetailRow label="Source" value={lead.source} />
          </Section>

          {/* AGENT */}

          <Section title="Contact Agent">
            <DetailRow label="Agent" value={lead.contactAgent} />
          </Section>

          <button
            onClick={() => {
              setEditId(lead._id);
              setIsEditModal(true);
            }}
            className="text-blue-600 text-md w-full p-2 divide-y bg-white rounded shadow"
          >
            Edit
          </button>
        </div>
      )}

      {/* FOLLOWUPS TAB */}

      {activeTab === "followups" && (
        <div>
          <button
            onClick={openFollowUpModal}
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
          >
            + Add Follow-up
          </button>

          {lead.followUps?.length ? (
            <div className="space-y-3">
              {lead.followUps.map((f, i) => (
                <div key={i} className="border p-3 rounded">
                  <p className="text-sm font-medium">
                    {new Date(f.date).toLocaleDateString()} • {f.type}
                  </p>

                  <p className="text-sm text-gray-600">{f.note}</p>

                  {f.nextFollowUp && (
                    <p className="text-xs text-blue-600 mt-1">
                      Next: {new Date(f.nextFollowUp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No follow-ups yet</p>
          )}
        </div>
      )}

      {/* ATTACHMENTS */}

      {activeTab === "attachments" && (
        <div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded mb-4">
            Upload File
          </button>

          {lead.attachments?.length ? (
            <div className="space-y-2">
              {lead.attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex justify-between border p-2 rounded"
                >
                  <span>{file.name}</span>
                  <span className="text-blue-500 cursor-pointer">Download</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No attachments</p>
          )}
        </div>
      )}

      {/* TIMELINE */}

      {activeTab === "timeline" && (
        <ul className="border-l-2 border-blue-500 pl-4 space-y-4 text-sm">
          <li>
            <span className="font-medium">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>{" "}
            Lead Created
          </li>

          {lead.followUps?.map((f, i) => (
            <li key={i}>
              <span className="font-medium">
                {new Date(f.date).toLocaleDateString()}
              </span>{" "}
              {f.type} — {f.note}
            </li>
          ))}
        </ul>
      )}

      {/* FOLLOWUP MODAL */}

      <FollowUpModal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        onAddFollowUp={handleAddFollowUp}
        lead={selectedLead}
      />

      <Modal
        isOpen={isEditModal}
        onClose={() => setIsEditModal(false)}
        head="Edit Lead"
      >
        <CreateLead onClose={() => setIsEditModal(false)} isEdit={editId} />
      </Modal>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="divide-y bg-white rounded shadow">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between px-4 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value || "-"}</span>
    </div>
  );
}
