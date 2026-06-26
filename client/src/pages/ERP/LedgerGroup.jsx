import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import GroupModal from "../../components/CreateGroup";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";

axios.defaults.withCredentials = true;

const LedgerGroup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState("");
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("/api/v1/ledger-group", {
        params: { companyId: user.companyId },
      });
      setLedgerGroups(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ CREATE + UPDATE sync
  const handleSave = (data) => {
    setLedgerGroups((prev) => {
      const exists = prev.find((g) => g._id === data._id);

      if (exists) {
        return prev.map((g) => (g._id === data._id ? data : g));
      } else {
        return [...prev, data];
      }
    });
  };

  // ✅ EDIT
  const handleEdit = (id) => {
    setEditId(id);
    setEditModal(true);
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`/api/v1/ledger-group/${id}`);
      setLedgerGroups((prev) => prev.filter((g) => g._id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  const filtered = ledgerGroups.filter((lg) => {
    const matchSearch =
      lg?.name?.toLowerCase().includes(search.toLowerCase()) ||
      lg?.parentId?.name.toLowerCase().includes(search.toLowerCase()) ||
      lg?.nature.toLowerCase().includes(search.toLowerCase())
    return matchSearch;
  });

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Ledger Groups</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-72"
        />
      </div>
      {/* Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2"
      >
        <MdAdd /> Add Ledger Group
      </button>

      {/* List */}
      <ul className="border rounded-md p-4 bg-white shadow-md">
        {filtered.map((group) => (
          <li key={group._id} className="border-b py-3 last:border-0">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">
                  {group.name} ({group?.companyId?.name})
                </div>

                <div className="text-sm text-gray-600">
                  Under: {group.parentId?.name || "Primary"}
                </div>

                <div className="text-sm text-gray-600">
                  Nature: {group.nature}
                </div>

                <div className="text-sm text-gray-500 italic">
                  Affects GP: {group.affectsGrossProfit ? "Yes" : "No"}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => handleEdit(group._id)}>
                  <GrEdit className="text-blue-500" />
                </button>

                <button onClick={() => handleDelete(group._id)}>
                  <MdDelete className="text-red-500" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head="Create Ledger Group"
      >
        <GroupModal onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        head="Update Ledger Group"
      >
        <GroupModal
          onClose={() => setEditModal(false)}
          editId={editId}
          onSave={handleSave}
        />
      </Modal>
    </div>
  );
};

export default LedgerGroup;
