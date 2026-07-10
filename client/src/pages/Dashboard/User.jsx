import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";
import image from "../../asset/profile.webp";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import CreateUser from "../../components/CreateUser";
axios.defaults.withCredentials = true;

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData = await axios.get("/api/v1/user/lists");
        setUsers(userData.data);
        console.log(userData.data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      }
    };
    getUsers();
  }, []);

  const handleEdit = (id) => {
    setEditModal(true);
    setEditId(id);
  };

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = !search
        ? true
        : user?.userName?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter
        ? true
        : user?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const handleRedirect = (id) => {
    navigate(`/user/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/v1/user/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Header category="Page" title="User's" />
      <section className="h-full w-full flex justify-center ">
        <div className="overflow-x-auto w-full max-w-screen-xl mx-auto">
          <div className="w-full mx-auto mb-4 text-gray-700 py-1 flex flex-row sm:flex-row justify-between items-center">
            <h2 className="text-lg sm:text-xl text-green-600 mb-2 sm:mb-0 sm:mr-4">
              Total Users: {users.length}
            </h2>
            <button
              onClick={() => setCreateModal(true)}
              className="bg-green-500 rounded-full text-white p-2 mt-2 sm:mt-0"
            >
              <MdAdd className="text-xl" />
            </button>
          </div>

          <div className=" flex flex-row justify-between items-center gap-4">
            <div className="flex-1 bg-white border rounded-xl p-2 mb-6 shadow-sm ">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border rounded-xl p-2 mb-6 shadow-sm text-sm"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>

          {/* </div> */}
          <div
            className="overflow-x-auto"
            style={{
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            <table className="w-full whitespace-nowrap divide-y divide-gray-300 bg-blue-gray-800 overflow-hidden">
              <thead className="bg-blue-400">
                <tr className="bg-blue-gray-100 text-white">
                  <th
                    scope="col"
                    className="font-semibold text-sm uppercase px-6 py-4"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="font-semibold text-sm uppercase px-6 py-4 text-center"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="font-semibold text-sm uppercase px-6 py-4 text-center"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="font-semibold text-sm uppercase px-6 py-4 text-center"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-blue-gray-900">
                {filtered.map((user) => (
                  <tr key={user._id} className="border-b border-blue-gray-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="inline-flex w-10 h-10">
                          <img
                            className="w-10 h-10 object-cover rounded-full"
                            alt="User avatar"
                            src={user?.avatar || image}
                          />
                        </div>
                        <div>
                          <p>{user.userName}</p>
                          <p className="text-gray-500 text-sm font-semibold tracking-wide">
                            {user.userMail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{user.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <p>{user.role}</p>
                      <p className="text-gray-500 text-sm font-semibold tracking-wide">
                        {user.department}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* <button onClick={() => handleRedirect(user._id)} className="mr-2">
                        <FaExternalLinkAlt className='text-blue-500 hover:text-blue-800 text-lg' />
                      </button> */}
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="ml-1"
                      >
                        <GrEdit className="text-blue-500 hover:text-blue-800 text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="mx-2"
                      >
                        <MdDelete className="text-red-500 hover:text-red-600 text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {/* Contractor Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        head="Create User"
      >
        <CreateUser onClose={() => setCreateModal(false)} />
      </Modal>
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Create User"
      >
        <CreateUser onClose={() => setEditModal(false)} isEdit={editId} />
      </Modal>
    </div>
  );
};

export default UserManagement;
