import { useEffect, useState } from "react";

import GSTConfigTable from "./GSTConfigTable";
import GSTConfigModal from "./GSTConfigModal";
import Modal from "../../../components/Modal";
import {
  getGSTConfigs,
  createGSTConfig,
  updateGSTConfig,
  deleteGSTConfig,
} from "../../../api/gstLedgerConfig";

import { Plus } from "lucide-react";
import toast from "react-hot-toast";

const initialForm = {
  companyId: "",
  gstType: "GOODS",
  rate: 18,

  purchase: {
    intraState: {
      cgstRate: 9,
      sgstRate: 9,
      cgstLedgerId: "",
      sgstLedgerId: "",
    },
    interState: {
      igstRate: 18,
      igstLedgerId: "",
    },
  },

  sales: {
    intraState: {
      cgstRate: 9,
      sgstRate: 9,
      cgstLedgerId: "",
      sgstLedgerId: "",
    },
    interState: {
      igstRate: 18,
      igstLedgerId: "",
    },
  },

  isActive: true,
};

export default function GSTConfigPage() {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);

      const res = await getGSTConfigs();

      setConfigs(res.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load GST Configurations",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
    console.log("send");
  };

  const handleEdit = (record) => {
    setEditing(record);
    setForm(record);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      console.log(form);
      if (editing) {
        await updateGSTConfig(editing._id, form);
        toast.success("Configuration updated");
      } else {
        await createGSTConfig(form);
        toast.success("Configuration created");
      }

      setForm({
        companyId: "",
        gstType: "GOODS",
        rate: 18,

        purchase: {
          intraState: {
            cgstRate: 9,
            sgstRate: 9,
            cgstLedgerId: "",
            sgstLedgerId: "",
          },
          interState: {
            igstRate: 18,
            igstLedgerId: "",
          },
        },

        sales: {
          intraState: {
            cgstRate: 9,
            sgstRate: 9,
            cgstLedgerId: "",
            sgstLedgerId: "",
          },
          interState: {
            igstRate: 18,
            igstLedgerId: "",
          },
        },

        isActive: true,
      });
      setOpen(false);
      loadConfigs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this configuration?")) return;

    try {
      await deleteGSTConfig(id);

      toast.success("Configuration deleted");

      loadConfigs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GST Ledger Configuration</h1>

          <p className="text-sm text-gray-500">
            Configure GST ledger mapping for Purchase & Sales.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Configuration
        </button>
      </div>

      <GSTConfigTable
        loading={loading}
        data={configs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={open}
        head={editing ? "Edit GST Configuration" : "Add GST Configuration"}
        onClose={() => setOpen(false)}
      >
        <GSTConfigModal
          form={form}
          setForm={setForm}
          editing={editing}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      </Modal>
    </div>
  );
}
