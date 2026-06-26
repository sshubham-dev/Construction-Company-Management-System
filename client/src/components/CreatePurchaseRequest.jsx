import { useEffect, useMemo, useState } from "react";

import axios from "axios";
import Select from "react-select";

import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Package } from "lucide-react";

axios.defaults.withCredentials = true;

const CreatePurchaseRequest = ({ onClose, editId }) => {
  const isEdit = Boolean(editId);

  const [loading, setLoading] = useState(false);

  const [sites, setSites] = useState([]);

  const [stores, setStores] = useState([]);

  const [itemsMaster, setItemsMaster] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    group: "",
    category: "",

    requirementFor: "",

    reqDate: "",

    site: "",

    store: "",

    narration: "",

    items: [],
    status: "DRAFT",
  });

  /* =========================
     LOAD MASTER
  ========================== */
  useEffect(() => {
    loadMasters();

    if (isEdit) {
      loadPR(editId);
    }
  }, [editId]);

  const loadMasters = async () => {
    try {
      const [
        siteRes,
        storeRes,
        itemRes,
        categoryRes,
        groupRes,
        // requirementRes
      ] = await Promise.all([
        axios.get("/api/v1/store?type=SITE"),

        axios.get("/api/v1/store?type=WAREHOUSE"),

        axios.get("/api/v1/stock-item"),

        axios.get("/api/v1/stock-category"),

        axios.get("/api/v1/stock-group"),

        // axios.get("/api/v1/project-schedule"),
      ]);

      setSites(siteRes.data.data || []);
      setStores(storeRes.data.data || []);
      setItemsMaster(itemRes.data.data || []);
      setCategories(categoryRes.data.data || []);
      setGroups(groupRes.data.data || []);

      // setRequirements(requirementRes.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load master data");
    }
  };

  useEffect(() => {
    if (!form.category || !itemsMaster.length) return;

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => {
        const item = itemsMaster.find(
          (m) => String(m._id) === String(i.itemId),
        );

        if (!item) return true;

        return (
          String(item?.categoryId?._id || item?.categoryId) ===
          String(form.category)
        );
      }),
    }));
  }, [form.category, itemsMaster]);

  /* =========================
     LOAD EDIT
  ========================== */
  const loadPR = async (id) => {
    try {
      const res = await axios.get(`/api/v1/purchase-request/${id}`);

      const data = res.data;

      setForm({
        group: data.group?._id || data.group || "",
        category: data.category?._id || data.category || "",

        requirementFor: data.requirementFor || "",

        reqDate: data.reqDate?.split("T")[0] || "",

        site: data.site?._id || data.site,

        store: data.store?._id || data.store,

        narration: data.narration || "",

        status: data.status || "DRAFT",

        items:
          data.items?.map((i) => ({
            itemId: i.itemId?._id || i.itemId,

            itemName: i.itemId?.name,

            unit: i.unit || "",

            requestedQty: i.requestedQty || 0,

            remarks: i.remarks || "",
          })) || [],
      });
    } catch (err) {
      console.log(err);
      toast.error("Failed to load PR");
    }
  };

  /* =========================
     ITEM HANDLING
  ========================== */
  const addItem = (e) => {
    e.preventDefault();
    setForm((prev) => ({
      ...prev,

      items: [
        ...prev.items,

        {
          itemId: "",
          itemName: "",
          unit: "",
          requestedQty: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,

      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    const updated = [...form.items];

    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      items: updated,
    }));
  };

  const handleItemSelect = (index, selected) => {
    const item = itemsMaster.find((i) => i._id === selected.value);

    if (!item) return;

    /* DUPLICATE CHECK */

    const exists = form.items.some(
      (i, idx) => i.itemId === item._id && idx !== index,
    );

    if (exists) {
      return toast.error("Item already added");
    }

    updateItem(index, "itemId", item._id);

    updateItem(index, "itemName", item.name);

    updateItem(index, "unit", item.unit);
  };

  /* =========================
     TOTALS
  ========================== */
  const totalQty = useMemo(() => {
    return form.items.reduce((a, i) => a + Number(i.requestedQty || 0), 0);
  }, [form.items]);

  const filteredCategories = useMemo(() => {
    if (!form.group) {
      return categories;
    }

    return categories.filter(
      (category) =>
        String(category.groupId?._id || category.groupId) ===
        String(form.group),
    );
  }, [categories, form.group]);

  const filteredItems = useMemo(() => {
    let data = [...itemsMaster];

    if (form.group) {
      data = data.filter(
        (item) =>
          String(item.groupId?._id || item.groupId) === String(form.group),
      );
    }

    if (form.category) {
      data = data.filter(
        (item) =>
          String(item.categoryId?._id || item.categoryId) ===
          String(form.category),
      );
    }

    return data;
  }, [itemsMaster, form.group, form.category]);

  /* =========================
     VALIDATE
  ========================== */
  const validate = () => {
    if (!form.site) {
      toast.error("Site required");

      return false;
    }

    if (!form.store) {
      toast.error("Store required");

      return false;
    }

    if (!form.reqDate) {
      toast.error("Request date required");

      return false;
    }

    if (!form.group) {
      toast.error("Stock Group required");

      return false;
    }

    if (!form.category) {
      toast.error("Category required");
      return false;
    }

    if (!form.requirementFor) {
      toast.error("Need to tell the Requirement");
      return false;
    }

    if (!form.items.length) {
      toast.error("Add items");

      return false;
    }

    for (const item of form.items) {
      if (!item.itemId) {
        toast.error("Select item");

        return false;
      }

      if (!item.requestedQty || item.requestedQty <= 0) {
        toast.error("Invalid quantity");

        return false;
      }
    }

    return true;
  };
  useEffect(() => {
    setForm((prev) => ({
      ...prev,

      category: "",
    }));
  }, [form.group]);

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        ...form,

        status: form.status || "REQUESTED",

        items: form.items.map((i) => ({
          itemId: i.itemId,

          unit: i.unit,

          requestedQty: Number(i.requestedQty),
        })),
      };
      console.log(payload);
      if (isEdit) {
        await axios.put(`/api/v1/purchase-request/${editId}`, payload);

        toast.success("PR updated");
      } else {
        await axios.post("/api/v1/purchase-request", payload);

        toast.success("PR submitted");
      }

      onClose?.();
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.message || "Failed to save PR");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div>
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Purchase Request" : "Create Purchase Request"}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Request material from warehouse/store
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BASIC */}

        <Section title="Basic Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Site*"
              options={sites.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
              value={sites
                .map((s) => ({
                  value: s._id,
                  label: s.name,
                }))
                .find((s) => s.value === form.site)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  site: v?.value || "",
                }))
              }
            />

            <SelectField
              label="Store*"
              options={stores.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
              value={stores
                .map((s) => ({
                  value: s._id,
                  label: s.name,
                }))
                .find((s) => s.value === form.store)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  store: v?.value || "",
                }))
              }
            />

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
                .find((g) => g.value === form.group)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,

                  group: v?.value || "",

                  category: "",
                }))
              }
            />

            <SelectField
              label="Category*"
              isDisabled={!form.group}
              options={filteredCategories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              value={filteredCategories
                .map((c) => ({
                  value: c._id,
                  label: c.name,
                }))
                .find((c) => c.value === form.category)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  category: v?.value || "",
                }))
              }
              placeholder={
                !form.group
                  ? "Select Group First*"
                  : !form.category
                    ? "Select Category First*"
                    : "Select Item*"
              }
            />

            {/* <SelectField
              label="Requirement For"
              options={requirements.map((r) => ({
                value: r.name,
                label: r.name,
              }))}
              value={requirements
                .map((r) => ({
                  value: r.name,
                  label: r.name,
                }))
                .find((r) => r.value === form.requirementFor)}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  requirementFor: v?.value || "",
                }))
              }
            /> */}

            <Input
              label="Requirement For*"
              type="text"
              required="true"
              value={form.requirementFor}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  requirementFor: e.target.value,
                }))
              }
            />

            <Input
              type="date"
              label="Required Date*"
              value={form.reqDate}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  reqDate: e.target.value,
                }))
              }
            />
          </div>
        </Section>

        {/* ITEMS */}
        <Section title="Items">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total Qty: <span className="font-semibold">{totalQty}</span>
            </div>

            <button
              onClick={addItem}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-gray-50 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package size={16} />

                    <span className="font-medium text-sm">
                      Item {index + 1}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <Select
                  placeholder={
                    form.category ? "Select Item*" : "Select Category First*"
                  }
                  options={filteredItems.map((i) => ({
                    value: i._id,
                    label: `${i.name} (${i.unit})`,
                  }))}
                  value={
                    filteredItems
                      .map((i) => ({
                        value: i._id,
                        label: `${i.name} (${i.unit})`,
                      }))
                      .find((i) => String(i.value) === String(item.itemId)) ||
                    null
                  }
                  onChange={(v) => handleItemSelect(index, v)}
                  isDisabled={!form.group || !form.category}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    label="Requested Qty*"
                    value={item.requestedQty}
                    onChange={(e) =>
                      updateItem(index, "requestedQty", e.target.value)
                    }
                  />

                  <Input label="Unit*" value={item.unit} readOnly />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* NARRATION */}

        <Section title="Narration">
          <Textarea
            value={form.narration}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                narration: e.target.value,
              }))
            }
            placeholder="Additional notes..."
          />
        </Section>

        {/* ACTIONS */}

        <div className="bg-white p-2 flex gap-3 z-50">
          <button
            onClick={(e) =>
              setForm((p) => ({
                ...p,
                status: "DRAFT",
              }))
            }
            disabled={loading}
            className="flex-1 bg-gray-700 text-white py-3 rounded-lg"
          >
            Save Draft
          </button>

          <button
            // onClick={() => handleSubmit(true)}
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg"
          >
            Submit PR
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseRequest;

/* =========================
   HELPERS
========================= */
const Section = ({ title, children }) => (
  <div className="bg-white border rounded-xl p-4 space-y-4">
    <h2 className="font-medium">{title}</h2>

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

const SelectField = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">{label}</label>

    <Select {...props} isClearable />
  </div>
);
