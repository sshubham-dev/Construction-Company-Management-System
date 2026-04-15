import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import CreateDeliveryNote from "../../components/CreateDeliveryNote";
import ConfirmDeliveryNote from "../../components/ConfirmDeliveryNote";
import { useSelector } from "react-redux";
import { GrEdit } from "react-icons/gr";
import { MdDelete, MdAdd } from "react-icons/md";

const DeliveryNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ismodalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [confirmDnId, setConfirmDnId] = useState(null);
  const [isconfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/v1/delivery-note");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Delivery Notes</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          + New
        </button>
      </div>

      <div className="space-y-3">
        {notes.map((dn) => (
          <div key={dn._id} className="border rounded p-3 bg-white shadow-sm">
            <div
              onClick={() => navigate(`/erp/inventory/delivery-note/${dn._id}`)}
              className="cursor-pointer"
            >
              <div className="flex justify-between">
                <p className="font-medium">{dn.deliveryNoteNo}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    dn.status === "Verified"
                      ? "bg-green-200"
                      : dn.status === "Issued"
                      ? "bg-yellow-200"
                      : dn.status === "Mismatch"
                      ? "bg-red-200"
                      : "bg-gray-200"
                  }`}
                >
                  {dn.status}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Store: {dn.store?.name}
              </p>
              <p className="text-xs text-gray-500">Site: {dn.site?.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(dn.issueDate).toLocaleDateString()}
              </p>
            </div>

            {/* CONFIRM BUTTON */}
            {dn.status === "Issued" &&
              (user?.department === "Site Supervisor" ||
                user?.department === "Site Incharge") && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevent navigation
                      setConfirmDnId(dn._id);
                      setIsConfirmModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1 text-xs rounded"
                  >
                    Confirm Delivery
                  </button>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* CREATE DN MODAL */}
      <Modal isOpen={ismodalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateDeliveryNote
          onClose={() => {
            setIsModalOpen(false);
            fetchNotes();
          }}
        />
      </Modal>

      {/* CONFIRM DN MODAL */}
      <Modal
        isOpen={isconfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <ConfirmDeliveryNote
          dnId={confirmDnId}
          onClose={() => {
            setIsConfirmModalOpen(false);
            fetchNotes();
          }}
        />
      </Modal>
    </div>
  );
};

export default DeliveryNotes;
