import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import GroupModal from "../../components/CreateGroup";

axios.defaults.withCredentials = true;

const LedgerGroup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [LedgerGroups, setLedgerGroups] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);


  useEffect(() => {
    const fetchLedgerGroup = async () => {
      try {
        const res = await axios.get("/api/v1/ledger-group", {
          params: { companyId: user.companyId },
        });
        console.log(res.data);
        setLedgerGroups(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLedgerGroup();
  }, []);

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Ledger Groups</h1>

      {/* Add Ledger Group Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md"
      >
        + Add Ledger Groups
      </button>

      {/* Ledger Groups List */}
      <ul className="border rounded-md p-4 bg-white shadow-md">
        {LedgerGroups.map((group) => (
          <li key={group.id} className="border-b py-3 last:border-0">
            <div className="font-semibold text-lg text-gray-800">
              {group.name} ({group?.companyId?.name})
            </div>
            <div className="text-sm text-gray-600">
              Under: {`${group.parentId?.name || "Primary"}`}
            </div>
            <div className="text-sm text-gray-600">Nature: {group.nature}</div>
            <div className="text-sm text-gray-500 italic">
              Affects Gross Profit:{" "}
              <span className="font-medium">
                {group.affectsGrossProfit ? "Yes" : "No"}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Cost group Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        head="Create Ledger Group"
      >
        <GroupModal onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default LedgerGroup;
