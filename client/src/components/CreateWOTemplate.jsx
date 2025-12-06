import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const UNITS = ["SQFT", "RFT", "KG", "NOS", "CUM", "LUMSUM", "CFT"];
const SCOPES = ["perFloor", "perSite", "selectable"];

const CreateWOTemplate = ({ templateId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isEdit = !!templateId;
  const [form, setForm] = useState({
    title: "",
    trade: "",
    description: [
      {
        name: "",
        scope: "perSite",
        unit: "SQFT",
        rate: "",
        subWorks: [{ name: "", included: false }],
        paymentSchedule: [{ stage: "", percentage: "" }],
      },
    ],
  });
  const [expanded, setExpanded] = useState({});

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  // ---------------------------------------
  // LOAD TEMPLATE WHEN EDITING
  // ---------------------------------------
  useEffect(() => {
    if (!templateId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/work-template/${templateId}`);
        const t = res.data;

        setForm({
          title: t.title,
          trade: t.trade,
          description:
            t.workItems ||
            t.description || // fallback for earlier version
            [],
        });
      } catch (e) {
        toast.error("Failed to load template");
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId]);

  // ---------------------------------------
  // DESCRIPTION HANDLERS
  // ---------------------------------------

  const toggleExpand = (i) => {
    setExpanded((prev) => ({
      ...prev,
      [i]: !prev[i],
    }));
  };

  const updateDescription = (i, field, value) => {
    const updated = [...form.description];
    updated[i][field] = value;
    setForm({ ...form, description: updated });
  };

  const addDescription = () => {
    setForm({
      ...form,
      description: [
        ...form.description,
        {
          name: "",
          scope: "perSite",
          unit: "SQFT",
          rate: "",
          subWorks: [{ name: "", included: false }],
          paymentSchedule: [{ stage: "", percentage: "" }],
        },
      ],
    });
  };

  const removeDescription = (i) => {
    const updated = [...form.description];
    updated.splice(i, 1);
    setForm({ ...form, description: updated });
  };

  // ---------------------------------------
  // SUBWORK HANDLERS
  // ---------------------------------------

  const addSubWork = (i) => {
    const desc = [...form.description];
    desc[i].subWorks.push({ name: "", included: false });
    setForm({ ...form, description: desc });
  };

  const updateSubWork = (i, j, field, value) => {
    const desc = [...form.description];
    desc[i].subWorks[j][field] = value;
    setForm({ ...form, description: desc });
  };

  const deleteSubWork = (i, j) => {
    const desc = [...form.description];
    desc[i].subWorks.splice(j, 1);
    setForm({ ...form, description: desc });
  };

  // ---------------------------------------
  // PAYMENT STAGE HANDLERS
  // ---------------------------------------

  const addStage = (i) => {
    const desc = [...form.description];
    desc[i].paymentSchedule.push({ stage: "", percentage: "" });
    setForm({ ...form, description: desc });
  };

  const updateStage = (i, j, field, value) => {
    const desc = [...form.description];
    desc[i].paymentSchedule[j][field] = value;
    setForm({ ...form, description: desc });
  };

  const deleteStage = (i, j) => {
    const desc = [...form.description];
    desc[i].paymentSchedule.splice(j, 1);
    setForm({ ...form, description: desc });
  };

  // ---------------------------------------
  // SAVE TEMPLATE (Create or Edit)
  // ---------------------------------------
  const submit = async () => {
    try {
      setLoading(true);

      if (isEdit) {
        // PUT update
        await axios.put(`/api/v1/work-template/${templateId}`, {
          title: form.title,
          trade: form.trade,
          description: form.description,
        });

        toast.success("Template updated successfully");
      } else {
        // POST create
        await axios.post("/api/v1/work-template", form);
        toast.success("Template created successfully");
      }

      onSuccess && onSuccess();
      onClose && onClose();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          (isEdit ? "Failed to update template" : "Failed to create template")
      );
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <p className="p-6 text-center">Loading template...</p>;
  }

  return (
    <div className="">
      {/* Step Indicator */}
      <div className="flex mb-6 gap-4 text-sm mt-2">
        <div
          className={`${
            step === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
          } px-3 py-1 rounded`}
        >
          1. Basic Info
        </div>
        <div
          className={`${
            step === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
          } px-3 py-1 rounded`}
        >
          2. Work Details
        </div>
        <div
          className={`${
            step === 3 ? "bg-blue-600 text-white" : "bg-gray-200"
          } px-3 py-1 rounded`}
        >
          3. Review & Save
        </div>
      </div>

      {/* ---------------------- STEP 1 ---------------------- */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="font-medium">Template Title</label>
            <input
              className="border p-2 w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Civil Work"
            />
          </div>

          <div>
            <label className="font-medium">Trade</label>
            <select
              className="border p-2 w-full"
              value={form.trade}
              onChange={(e) => setForm({ ...form, trade: e.target.value })}
            >
              <option value="">Select Trade</option>
              <option value="civil">Civil</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="tiles">Tiles</option>
              <option value="painting">Painting</option>
              <option value="door">Door</option>
              <option value="window">Window</option>
              <option value="grill">Grill</option>
              <option value="railing">Railing</option>
            </select>
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={next}
          >
            Next
          </button>
        </div>
      )}

      {/* ---------------------- STEP 2 ---------------------- */}
      {step === 2 && (
        <div className="space-y-6">
          {form.description.map((d, i) => {
            const isOpen = expanded[i] ?? true;

            return (
              <div
                key={i}
                className="border rounded-xl shadow-sm bg-white transition hover:shadow-md"
              >
                {/* HEADER */}
                <div
                  className="flex justify-between items-start p-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(i)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base leading-snug break-words">
                      {d.name || `Work ${i + 1}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* <span className="text-xl">{isOpen ? "▾" : "▸"}</span> */}

                    {form.description.length > 1 && (
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDescription(i);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* BODY */}
                {isOpen && (
                  <div className="p-4 border-t">
                    {/* Work Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Work Name / Title
                      </label>
                      <textarea
                        rows={2}
                        className="border p-2.5 w-full text-sm rounded-lg focus:ring-2 focus:ring-blue-400 resize-y"
                        placeholder="Enter work title"
                        value={d.name}
                        onChange={(e) =>
                          updateDescription(i, "name", e.target.value)
                        }
                      />
                    </div>

                    {/* Scope, Unit, Rate */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Scope
                        </label>
                        <select
                          className="border p-2.5 w-full rounded-lg"
                          value={d.scope}
                          onChange={(e) =>
                            updateDescription(i, "scope", e.target.value)
                          }
                        >
                          {SCOPES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Unit
                        </label>
                        <select
                          className="border p-2.5 w-full rounded-lg bg-white"
                          value={d.unit}
                          onChange={(e) =>
                            updateDescription(i, "unit", e.target.value)
                          }
                        >
                          {UNITS.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Default Rate
                        </label>
                        <input
                          type="number"
                          className="border p-2.5 w-full rounded-lg"
                          placeholder="Rate"
                          value={d.rate}
                          onChange={(e) =>
                            updateDescription(i, "rate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Subworks */}
                    <h4 className="font-medium mt-3">Sub-Works</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1 mt-2">
                      {d.subWorks.map((sw, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg"
                        >
                          <input
                            className="border p-2 flex-1 rounded-lg"
                            placeholder="Sub-work name"
                            value={sw.name}
                            onChange={(e) =>
                              updateSubWork(i, j, "name", e.target.value)
                            }
                          />
                          <input
                            type="checkbox"
                            checked={sw.included}
                            onChange={(e) =>
                              updateSubWork(i, j, "included", e.target.checked)
                            }
                          />
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteSubWork(i, j)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="text-sm text-blue-600 mt-2 hover:underline"
                      onClick={() => addSubWork(i)}
                    >
                      + Add Sub-Work
                    </button>

                    {/* Payment Schedule */}
                    <h4 className="font-medium mt-4">Payment Stages</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mt-2">
                      {d.paymentSchedule.map((st, j) => (
                        <div
                          key={j}
                          className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <input
                            className="border p-2 rounded-lg"
                            placeholder="Stage Name"
                            value={st.stage}
                            onChange={(e) =>
                              updateStage(i, j, "stage", e.target.value)
                            }
                          />

                          <input
                            className="border p-2 rounded-lg"
                            type="number"
                            placeholder="%"
                            value={st.percentage}
                            onChange={(e) =>
                              updateStage(i, j, "percentage", e.target.value)
                            }
                          />

                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteStage(i, j)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="text-sm text-blue-600 mt-2 hover:underline"
                      onClick={() => addStage(i)}
                    >
                      + Add Stage
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Section */}
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            onClick={addDescription}
          >
            + Add Another Work
          </button>

          <div className="flex justify-between mt-6">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={back}>
              Back
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={next}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ---------------------- STEP 3 ---------------------- */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {isEdit ? "Review Changes" : "Review Template"}
          </h2>

          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(form, null, 2)}
          </pre>

          <div className="flex justify-between mt-6">
            <button className="px-4 py-2 bg-gray-300" onClick={back}>
              Back
            </button>

            <button
              className="px-6 py-2 bg-green-600 text-white rounded"
              onClick={submit}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Template"
                : "Create Template"}
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-left" />
    </div>
  );
};

export default CreateWOTemplate;
