import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

axios.defaults.withCredentials = true;

const CreateStockGroup = ({ onClose, editId, refresh }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [showAccounting, setShowAccounting] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [ledgers, setLedgers] = useState([]);

  const [group, setGroup] = useState({
    name: "",
    code: "",

    affectsInventory: true,
    isConsumable: false,
    isAsset: false,

    description: "",

    accounting: {
      inventoryLedgerId: null,
      purchaseLedgerId: null,
      consumptionLedgerId: null,
      salesLedgerId: null,
      scrapLedgerId: null,
    },

    isActive: true,
  });

  /* =========================
     LOAD LEDGERS
  ========================== */

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const res = await axios.get("/api/v1/ledger", {
        params: {
          companyId: user?.companyId,
        },
      });
      console.log(res.data);
      const options = (res.data || []).map((l) => ({
        value: l._id,
        label: l.name,
      }));

      setLedgers(options);
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================
     LOAD EDIT DATA
  ========================== */

  useEffect(() => {
    if (!isEdit) return;

    const loadGroup = async () => {
      try {
        const res = await axios.get(`/api/v1/stock-group/${editId}`);

        const data = res.data.data;
        console.log(data);

        setGroup({
          name: data.name || "",
          code: data.code || "",

          affectsInventory: data.affectsInventory ?? true,

          isConsumable: data.isConsumable ?? false,

          isAsset: data.isAsset ?? false,

          description: data.description || "",

          accounting: {
            inventoryLedgerId: data.accounting?.inventoryLedgerId || null,

            purchaseLedgerId: data.accounting?.purchaseLedgerId || null,

            consumptionLedgerId: data.accounting?.consumptionLedgerId || null,
            salesLedgerId: data.accounting.salesLedgerId || null,
            scrapLedgerId: data.accounting.scrapLedgerId || null,
          },

          isActive: data.isActive ?? true,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load group");
      }
    };

    loadGroup();
  }, [editId]);

  /* =========================
     HANDLERS
  ========================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setGroup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAccountingChange = (field, value) => {
    setGroup((prev) => ({
      ...prev,
      accounting: {
        ...prev.accounting,
        [field]: value,
      },
    }));
  };

  /* =========================
     VALIDATION
  ========================== */

  const validate = () => {
    if (!group.name.trim()) {
      toast.error("Group name required");
      return false;
    }

    if (group.isAsset && group.isConsumable) {
      toast.error("Asset group cannot be consumable");
      return false;
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        ...group,

        name: group.name.trim(),

        code: group.code?.trim(),
      };

      if (isEdit) {
        await axios.put(`/api/v1/stock-group/${editId}`, payload);

        toast.success("Group updated successfully");
      } else {
        await axios.post("/api/v1/stock-group", payload);

        toast.success("Group created successfully");
      }

      refresh?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save group");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* HEADER */}

      <div className="mb-5">
        <h2 className="text-lg md:text-xl font-semibold">
          {isEdit ? "Edit Stock Group" : "Create Stock Group"}
        </h2>

        <p className="text-sm text-gray-500">
          Configure inventory and accounting behavior
        </p>
      </div>

      {/* FORM */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BASIC */}

        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Group Name"
              name="name"
              value={group.name}
              onChange={handleChange}
              placeholder="Raw Material"
            />

            <Input
              label="Code"
              name="code"
              value={group.code}
              onChange={handleChange}
              placeholder="RAW"
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={group.description}
            onChange={handleChange}
            placeholder="Optional notes"
          />
        </Section>

        {/* BEHAVIOR */}

        <Section title="Inventory Behavior">
          <div className="space-y-3">
            <Toggle
              label="Affects Inventory"
              description="Track stock movement and valuation"
              checked={group.affectsInventory}
              name="affectsInventory"
              onChange={handleChange}
            />

            <Toggle
              label="Consumable Group"
              description="Used for operational consumables"
              checked={group.isConsumable}
              name="isConsumable"
              onChange={handleChange}
            />

            <Toggle
              label="Asset Group"
              description="Items will create/manage assets"
              checked={group.isAsset}
              name="isAsset"
              onChange={handleChange}
            />

            {isEdit && (
              <Toggle
                label="Active"
                description="Inactive groups cannot be used"
                checked={group.isActive}
                name="isActive"
                onChange={handleChange}
              />
            )}
          </div>
        </Section>

        {/* ACCOUNTING */}

        <Section title="Advanced Accounting">
          <button
            type="button"
            onClick={() => setShowAccounting(!showAccounting)}
            className="text-sm text-blue-600"
          >
            {showAccounting ? "Hide Accounting" : "Configure Accounting"}
          </button>

          {showAccounting && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <SelectField
                label="Inventory Ledger"
                options={ledgers}
                value={ledgers.find(
                  (l) => l.value === group.accounting?.inventoryLedgerId,
                )}
                onChange={(v) =>
                  handleAccountingChange("inventoryLedgerId", v?.value || null)
                }
              />

              <SelectField
                label="Purchase Ledger"
                options={ledgers}
                value={ledgers.find(
                  (l) => l.value === group.accounting?.purchaseLedgerId,
                )}
                onChange={(v) =>
                  handleAccountingChange("purchaseLedgerId", v?.value || null)
                }
              />

              <SelectField
                label="Sales Ledger"
                options={ledgers}
                value={ledgers.find(
                  (l) => l.value === group.accounting?.salesLedgerId,
                )}
                onChange={(v) =>
                  handleAccountingChange("salesLedgerId", v?.value || null)
                }
              />

              <SelectField
                label="Consumption Ledger"
                options={ledgers}
                value={ledgers.find(
                  (l) => l.value === group.accounting?.consumptionLedgerId,
                )}
                onChange={(v) =>
                  handleAccountingChange("consumptionLedgerId", v?.value || null)
                }
              />

              <SelectField
                label="Scrap Ledger"
                options={ledgers}
                value={ledgers.find(
                  (l) => l.value === group.accounting?.scrapLedgerId,
                )}
                onChange={(v) =>
                  handleAccountingChange("scrapLedgerId", v?.value || null)
                }
              />
            </div>
          )}
        </Section>

        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Group" : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStockGroup;

/* =========================
   HELPERS
========================= */

const Section = ({ title, children }) => (
  <div className="bg-white border rounded-xl p-4 space-y-4">
    <h3 className="font-medium text-sm">{title}</h3>

    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <input
      {...props}
      className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <textarea
      {...props}
      rows={3}
      className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Toggle = ({ label, description, checked, name, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      name={name}
      onChange={onChange}
      className="mt-1"
    />

    <div>
      <p className="text-sm font-medium">{label}</p>

      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </label>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <Select options={options} value={value} onChange={onChange} isClearable />
  </div>
);
