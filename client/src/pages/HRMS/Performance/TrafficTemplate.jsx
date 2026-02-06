import { useState } from "react";
import TrafficTemplateTable from "./TrafficTemplateTable";
import TrafficTemplateModal from "./TrafficTemplateModal";
import Modal from "../../../components/Modal";

const TrafficTemplate = () => {
  const [open, setOpen] = useState(false);

  const [templates, setTemplates] = useState([
    {
      id: "TLT-001",
      name: "Design Engineer – Monthly",
      role: "Design Engineer",
      thresholds: { green: 90, amber: 70 },
      bonus: { green: 2000, red: -1000 },
      tasks: ["TASK-001", "TASK-002"],
      status: "Active",
    },
  ]);

  const addTemplate = (template) => {
    setTemplates((prev) => [...prev, template]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Traffic Light Templates</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create Template
        </button>
      </div>

      <TrafficTemplateTable templates={templates} />

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <TrafficTemplateModal
          onClose={() => setOpen(false)}
          onSave={addTemplate}
        />
      </Modal>
    </div>
  );
};

export default TrafficTemplate;
