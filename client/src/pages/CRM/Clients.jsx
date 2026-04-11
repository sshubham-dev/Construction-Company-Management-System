import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import CreateClient from "../../components/CreateClient";
import Modal from "../../components/Modal";

axios.defaults.withCredentials = true;

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
    const [search, setSearch] = useState("");

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");

  useEffect(() => {
    const getClients = async () => {
      try {
        const { data } = await axios.get("/api/v1/client");
        console.log(data)
        setClients(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    };
    getClients();
  }, []);

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const filtered = useMemo(() => {
    if (!search) return clients;

    return clients.filter((client) => {
      const text =
        `${client?.name} ${client?.service} ${client?.contactNo}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [clients, search]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/client/${id}`);
      setClients((prev) => prev.filter((c) => c._id !== id));
      toast.success("Client deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative pb-20">
      {/* Stats bar */}
      <div className="w-full mx-auto mb-4 text-gray-700 px-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-green-600">
          Total Clients: {clients?.length}
        </h2>
      </div>

      <div className="bg-white border rounded-xl p-3 m-2 shadow-sm">
        <input
          placeholder="Search client, purpose or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Mobile: Card view */}
      <div className="p-2 space-y-3 md:hidden">
        {filtered.map((client) => (
          <div
            key={client._id}
            className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-800">{client.name}</p>
              <p className="text-xs text-gray-500">{client?.site?.name || client?.service}</p>
              <p className="text-sm text-gray-600">{client.email}</p>
              <p className="text-xs text-gray-500">
                {client.whatsapp} {client.contactNo && `| ${client.contactNo}`}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => handleEdit(client._id)}>
                <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
              </button>
              <button onClick={() => handleDelete(client._id)}>
                <MdDelete className="text-red-500 hover:text-red-600 text-lg" />
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            No clients found
          </p>
        )}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block p-4">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full whitespace-nowrap divide-y divide-gray-300">
            <thead>
              <tr className="text-left bg-gray-100 text-sm text-gray-700">
                <th className="font-semibold px-6 py-3">Name</th>
                <th className="font-semibold px-6 py-3 text-center">Email</th>
                <th className="font-semibold px-6 py-3 text-center">Contact</th>
                <th className="font-semibold px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((client) => (
                <tr
                  key={client._id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <p>{client.name}</p>
                    <p className="text-gray-500 text-xs">{client.site?.name || client?.service}</p>
                  </td>
                  <td className="px-6 py-4 text-center">{client.email}</td>
                  <td className="px-6 py-4 text-center">
                    <p>{client.contactNo}</p>
                    {client.whatsapp && (
                      <p className="text-gray-500 text-xs">
                        WhatsApp: {client.whatsapp}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => handleEdit(client._id)}>
                      <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                    </button>
                    <button onClick={() => handleDelete(client._id)}>
                      <MdDelete className="text-red-500 hover:text-red-600 text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => setCreateModal(true)}
        className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition"
      >
        <MdAdd className="text-2xl" />
      </button>

      {/* Modals */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create Client"
      >
        <CreateClient onClose={() => setCreateModal(false)} />
      </Modal>

      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Client"
      >
        <CreateClient onClose={() => setEditModal(false)} isEdit={editId} />
      </Modal>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Clients;
