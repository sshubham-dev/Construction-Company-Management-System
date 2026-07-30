import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const CreateStockItem = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [purchaseLedgers, setPurchaseLedgers] = useState([]);
  const [salesLedgers, setSalesLedgers] = useState([]);
  const [inventoryLedgers, setInventoryLedgers] = useState([]);
  const [issueLedgers, setIssueLedgers] = useState([]);
  const [form, setForm] = useState({
    // Basic
    name: "",
    code: "",
    description: "",

    // Classification
    groupId: "",
    categoryId: "",
    unit: "",
    itemType: "INVENTORY",
    procurementMode: "STORE_STOCK",

    // Tax
    hsnSacCode: "",
    gstRate: 18,
    gstType: "GOODS",

    // Accounting
    purchaseLedgerId: null,
    salesLedgerId: null,
    inventoryLedgerId: null,
    issueLedgerId: null,

    // Inventory Behaviour
    affectsInventory: true,
    allowNegativeStock: false,
    trackBatch: false,
    trackSerialNo: false,
    expiryApplicable: false,

    // Stock Control
    minimumLevel: 0,
    reorderLevel: 0,
    maximumLevel: 0,

    // Purchase
    defaultPurchaseRate: 0,

    // Additional
    brand: "",
    specification: "",

    isActive: true,
  });

  /* =========================
     LOAD MASTERS
  ========================== */
  useEffect(() => {
    fetchMasters();
  }, []);
  const fetchMasters = async () => {
    try {
      const [
        groupRes,
        categoryRes,
        purchaseLedgerRes,
        salesLedgerRes,
        inventoryLedgerRes,
        issueLedgerRes,
      ] = await Promise.all([
        axios.get("/api/v1/stock-group"),
        axios.get("/api/v1/stock-category"),
        axios.get("/api/v1/ledger", {
          params: { companyId: user.companyId },
        }),
        axios.get("/api/v1/ledger", {
          params: { companyId: user.companyId },
        }),
        axios.get("/api/v1/ledger", {
          params: { companyId: user.companyId },
        }),
        axios.get("/api/v1/ledger", {
          params: { companyId: user.companyId },
        }),
      ]);

      setGroups(groupRes.data.data || []);
      console.log(groupRes.data.data);

      setCategories(categoryRes.data.data || []);

      setPurchaseLedgers(purchaseLedgerRes.data.data || []);
      setSalesLedgers(salesLedgerRes.data.data || []);
      setInventoryLedgers(inventoryLedgerRes.data.data || []);
      setIssueLedgers(issueLedgerRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load master data");
    }
  };

  /* =========================
     LOAD EDIT ITEM
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const loadItem = async () => {
      try {
        const res = await axios.get(`/api/v1/stock-item/${editId}`);

        const data = res.data.data;
        console.log(data);

        setForm({
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",

          groupId: data.groupId?._id || "",
          categoryId: data.categoryId?._id || "",
          unit: data.unit || "",
          itemType: data.itemType || "INVENTORY",
          procurementMode: data.procurementMode || "",

          // Tax
          hsnSacCode: data.hsnSacCode || "",
          gstRate: data.gstRate || "",
          gstType: data.gstType || "",

          // Accounting
          purchaseLedgerId: data.purchaseLedgerId || null,
          salesLedgerId: data.salesLedgerId || null,
          inventoryLedgerId: data.inventoryLedgerId || null,
          issueLedgerId: data.issueLedgerId || null,

          // Inventory Behaviour
          affectsInventory: data.affectsInventory || true,
          allowNegativeStock: data.allowNegativeStock || false,
          trackBatch: data.trackBatch || false,
          trackSerialNo: data.trackSerialNo || false,
          expiryApplicable: data.expiryApplicable || false,

          // Stock Control
          minimumLevel: data.minimumLevel || 0,
          reorderLevel: data.reorderLevel || 0,
          maximumLevel: data.maximumLevel || 0,

          defaultPurchaseRate: data.defaultPurchaseRate || 0,

          brand: data.brand || "",
          specification: data.specification || "",

          isActive: data.isActive ?? true,
        });
      } catch (err) {
        toast.error("Failed to load item");
      }
    };

    loadItem();
  }, [editId]);

  /* =========================
     HANDLERS
  ========================== */
  const filteredCategories = useMemo(() => {
    if (!form.groupId) {
      return categories;
    }

    return categories.filter(
      (category) =>
        String(category.groupId?._id || category.groupId) ===
        String(form.groupId),
    );
  }, [categories, form.groupId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumber = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Number(value),
    }));
  };

  /* =========================
     VALIDATION
  ========================== */
  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return false;
    }

    if (!form.groupId) {
      toast.error("Group required");
      return false;
    }

    if (!form.categoryId) {
      toast.error("Category required");
      return false;
    }

    if (!form.unit.trim()) {
      toast.error("Unit required");
      return false;
    }

    return true;
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validate()) return;

      setLoading(true);

      const payload = {
        ...form,

        name: form.name.trim(),

        code: form.code.trim().toUpperCase(),

        defaultPurchaseRate: Number(form.defaultPurchaseRate) || 0,
      };

      if (editId !== undefined) {
        await axios.put(`/api/v1/stock-item/${editId}`, payload);

        toast.success("Item updated");
      } else {
        await axios.post("/api/v1/stock-item", payload);

        toast.success("Item created");
      }

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-lg md:text-xl font-semibold">
          {isEdit ? "Edit Stock Item" : "Create Stock Item"}
        </h2>

        <p className="text-sm text-gray-500">
          Configure item and stock behavior
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* BASIC */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Item Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="UltraTech Cement"
            />

            <Input
              label="Item Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="UTC-001"
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional notes"
          />
        </Section>

        {/* CLASSIFICATION */}
        <Section title="Classification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField
              label="Group*"
              options={groups.map((g) => ({
                value: g._id,
                label: g.name,
              }))}
              value={groups
                .map((g) => ({
                  value: g._id,
                  label: g.name,
                }))
                .find((g) => g.value === form.groupId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  groupId: v?.value || "",
                  categoryId: "",
                }))
              }
            />

            <SelectField
              label="Category*"
              isDisabled={!form.groupId}
              options={filteredCategories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={filteredCategories
                .map((c) => ({
                  value: c._id,
                  label: c.name,
                }))
                .find((c) => c.value === form.categoryId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  categoryId: v?.value || "",
                }))
              }
              placeholder={
                !form.groupId
                  ? "Select Group*"
                  : !form.categoryId
                    ? "Select Category*"
                    : "Select Item*"
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Bag / Kg / Nos"
            />

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Item Type
              </label>

              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="border rounded-lg px-3 py-3 w-full"
              >
                <option value="INVENTORY">Inventory</option>

                <option value="MATERIAL">Material</option>

                <option value="ASSET">Asset</option>

                <option value="SERVICE">Service</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Order Mode
              </label>

              <select
                name="procurementMode"
                value={form.procurementMode}
                onChange={handleChange}
                className="border rounded-lg px-3 py-3 w-full"
              >
                <option value="STORE_STOCK">STORE_STOCK</option>

                <option value="DIRECT_PROCUREMENT">DIRECT_PROCUREMENT</option>

                <option value="BOTH">Asset</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Tax Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="HSN / SAC Code"
              name="hsnSacCode"
              value={form.hsnSacCode}
              onChange={handleChange}
              placeholder="2523"
            />

            <Input
              label="GST Rate (%)"
              type="number"
              value={form.gstRate}
              onChange={(e) => handleNumber("gstRate", e.target.value)}
              placeholder="18"
            />

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                GST Type
              </label>

              <select
                name="gstType"
                value={form.gstType}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="GOODS">Goods</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Accounting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField
              label="Purchase Ledger *"
              options={purchaseLedgers.map((l) => ({
                value: l._id,
                label: l.name,
              }))}
              value={purchaseLedgers
                .map((l) => ({
                  value: l._id,
                  label: l.name,
                }))
                .find((l) => l.value === form.purchaseLedgerId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  purchaseLedgerId: v?.value || null,
                }))
              }
            />

            <SelectField
              label="Sales Ledger *"
              options={salesLedgers.map((l) => ({
                value: l._id,
                label: l.name,
              }))}
              value={salesLedgers
                .map((l) => ({
                  value: l._id,
                  label: l.name,
                }))
                .find((l) => l.value === form.salesLedgerId)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  salesLedgerId: v?.value || null,
                }))
              }
            />

            {form.itemType !== "SERVICE" && (
              <>
                <SelectField
                  label={
                    form.itemType === "ASSET"
                      ? "Fixed Asset Ledger"
                      : "Inventory Ledger"
                  }
                  options={inventoryLedgers.map((l) => ({
                    value: l._id,
                    label: l.name,
                  }))}
                  value={inventoryLedgers
                    .map((l) => ({
                      value: l._id,
                      label: l.name,
                    }))
                    .find((l) => l.value === form.inventoryLedgerId)}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      inventoryLedgerId: v?.value || null,
                    }))
                  }
                />

                <SelectField
                  label="Issue Ledger"
                  options={issueLedgers.map((l) => ({
                    value: l._id,
                    label: l.name,
                  }))}
                  value={issueLedgers
                    .map((l) => ({
                      value: l._id,
                      label: l.name,
                    }))
                    .find((l) => l.value === form.issueLedgerId)}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      issueLedgerId: v?.value || null,
                    }))
                  }
                />
              </>
            )}
          </div>
        </Section>

        {form.itemType !== "SERVICE" && (
          <Section title="Inventory Behaviour">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Toggle
                label="Affects Inventory"
                checked={form.affectsInventory}
                name="affectsInventory"
                onChange={handleChange}
              />

              <Toggle
                label="Allow Negative Stock"
                checked={form.allowNegativeStock}
                name="allowNegativeStock"
                onChange={handleChange}
              />

              <Toggle
                label="Track Batch"
                checked={form.trackBatch}
                name="trackBatch"
                onChange={handleChange}
              />

              <Toggle
                label="Track Serial Number"
                checked={form.trackSerialNo}
                name="trackSerialNo"
                onChange={handleChange}
              />

              <Toggle
                label="Expiry Applicable"
                checked={form.expiryApplicable}
                name="expiryApplicable"
                onChange={handleChange}
              />
            </div>
          </Section>
        )}

        {/* PURCHASE */}
        <Section title="Purchase Information">
          <Input
            label="Default Purchase Rate"
            type="number"
            value={form.defaultPurchaseRate}
            onChange={(e) =>
              handleNumber("defaultPurchaseRate", e.target.value)
            }
            placeholder="0"
          />
        </Section>

        {/* OPTIONAL */}
        <Section title="Additional Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="UltraTech"
            />

            <Input
              label="Specification"
              name="specification"
              value={form.specification}
              onChange={handleChange}
              placeholder="50kg OPC Grade"
            />
          </div>

          {isEdit && (
            <Toggle
              label="Active Item"
              checked={form.isActive}
              name="isActive"
              onChange={handleChange}
            />
          )}
        </Section>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStockItem;

/* =========================
   HELPERS
========================= */

const Section = ({ title, children }) => (
  <div className="border rounded-xl p-4 bg-white space-y-4">
    <h2 className="text-sm font-semibold">{title}</h2>

    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <input {...props} className="border rounded-lg px-3 py-2 w-full" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <textarea
      {...props}
      rows={3}
      className="border rounded-lg px-3 py-2 w-full"
    />
  </div>
);

const Toggle = ({ label, checked, name, onChange }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={checked} name={name} onChange={onChange} />

    <span className="text-sm">{label}</span>
  </label>
);

const SelectField = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <Select {...props} isClearable />
  </div>
);
