import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskTemplateModal from "./TaskTemplateModal";
import Modal from "../../../components/Modal"


const TaskTemplate = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal]= useState(false)
  const [tasks, setTasks] = useState([
    {
      _id: "1",
      name: "Weekly Bill Submission",
      role: "Site Supervisor",
      frequency: "Weekly",
      verificationMethod: "SYSTEM",
      status: "Active",
      enabled: true,
    },
  ]);

  const remove = (id) => {
    setTasks((p) => p.filter((t) => t._id !== id));
  };

  return (
    <div className="p-2 mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Task Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Task
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Role</th>
            <th className="p-2">Frequency</th>
            <th className="p-2">Method</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id} className="border-t">
              <td className="p-2">{t.name}</td>
              <td className="p-2 text-center">{t.role}</td>
              <td className="p-2 text-center">{t.frequency}</td>
              <td className="p-2 text-center">{t.verificationMethod}</td>
              <td className="p-2 text-center">{t.status}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => navigate(`/task-templates/${t._id}`)}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(t._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={showModal} onClose={()=> setShowModal(false)}>
        <TaskTemplateModal/>
      </Modal>
    </div>
  );
};


export default TaskTemplate;
