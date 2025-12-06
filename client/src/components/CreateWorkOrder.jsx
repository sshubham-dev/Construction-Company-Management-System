import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../features/notification/notificationSlice";
import Select from "react-select";
import moment from "moment";

axios.defaults.withCredentials = true;

/**
 * CreateWorkOrder.jsx
 * Vite + React (browser safe)
 *
 * Notes:
 * - Fetches templates (/api/v1/work-template), sites (/api/v1/site), contractors (/api/v1/contractor)
 * - Fetches units from /api/v1/work-details/name with { title: "Unit" }
 * - Tries to fetch serial from /api/v1/work-order/next-serial?site=...&template=...
 * - Save draft uses localStorage key "wo_draft_v1" (can be changed)
 */

/* ----------------------------- CONSTANTS ----------------------------- */
const DRAFT_KEY = "wo_draft_v1";
const SCOPES = ["perFloor", "perSite", "selectable"];
const DEFAULT_UNITS = ["SQFT", "RFT", "KG", "NOS", "LUMSUM"];

/* --------------------------- HELPERS / UTIL --------------------------- */
const genId = () => {
  try {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.randomUUID
    ) {
      return window.crypto.randomUUID();
    }
    // fallback RFC4122 v4
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
};

const normalize = (s = "") =>
  String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const recalcStagesForWork = (work) => {
  // work: { id, name, unit, qty, rate, subWorks, stages: [{ id, name, percentage }] }
  const w = { ...work };
  w.qty = Number(w.qty || 0);
  w.rate = Number(w.rate || 0);
  if (!Array.isArray(w.subWorks)) w.subWorks = [];
  if (!Array.isArray(w.stages)) w.stages = [];

  // compute amounts per stage, fallback single stage if none
  if (w.stages.length === 0) {
    w.stages = [
      {
        id: genId(),
        name: "Full Work",
        percentage: 100,
      },
    ];
  }

  w.stages = w.stages.map((s) => {
    const percentage = Number(s.percentage || 0);
    const stageRate = Number(((w.rate * percentage) / 100).toFixed(2));
    const amount = Number((stageRate * w.qty).toFixed(2));
    const paid = Number(s.paid || 0);
    const due = Number((amount - paid).toFixed(2));
    return {
      id: s.id || genId(),
      name: s.name || "Stage",
      percentage,
      stageRate,
      amount,
      paid,
      due,
      status: s.status || "Pending",
      billable: s.billable !== false,
    };
  });

  w.amount = Number(
    w.stages.reduce((sum, s) => sum + (Number(s.amount) || 0), 0).toFixed(2)
  );
  w.paid = Number(
    w.stages.reduce((sum, s) => sum + (Number(s.paid) || 0), 0).toFixed(2)
  );
  w.due = Number((w.amount - w.paid).toFixed(2));
  return w;
};

const recalcTotals = (works = []) => {
  const totalValue = works.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalPaid = works.reduce((s, w) => s + (Number(w.paid) || 0), 0);
  const totalDue = Number((totalValue - totalPaid).toFixed(2));
  return {
    totalValue: Number(totalValue.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    totalDue,
  };
};

/* ----------------------------- MODAL (simple) ----------------------------- */
const EditWorkModal = ({ open, work, onClose, onSave, units }) => {
  const [local, setLocal] = useState(work || null);

  useEffect(() => setLocal(work ? { ...work } : null), [work]);

  if (!open || !local) return null;

  const updateLocal = (field, value) =>
    setLocal((p) => ({ ...p, [field]: value }));

  const updateStage = (idx, field, value) => {
    const stages = (local.stages || []).map((s) => ({ ...s }));
    stages[idx][field] = value;
    setLocal((p) => ({ ...p, stages }));
  };

  const addStage = () =>
    setLocal((p) => ({
      ...p,
      stages: [
        ...(p.stages || []),
        { id: genId(), name: "New Stage", percentage: 0 },
      ],
    }));

  const removeStage = (idx) => {
    const stages = (local.stages || []).slice();
    stages.splice(idx, 1);
    setLocal((p) => ({ ...p, stages }));
  };

  const save = () => {
    onSave(recalcStagesForWork(local));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Edit Work</h3>
          <button className="text-sm text-gray-600" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            value={local.name}
            onChange={(e) => updateLocal("name", e.target.value)}
            placeholder="Work name"
          />
          <input
            className="border p-2 rounded"
            type="number"
            value={local.qty}
            onChange={(e) => updateLocal("qty", Number(e.target.value))}
            placeholder="Qty"
          />
          <select
            className="border p-2 rounded"
            value={local.unit}
            onChange={(e) => updateLocal("unit", e.target.value)}
          >
            {(units || DEFAULT_UNITS).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            className="border p-2 rounded col-span-1 md:col-span-2"
            type="number"
            value={local.rate}
            onChange={(e) => updateLocal("rate", Number(e.target.value))}
            placeholder="Rate"
          />
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Payment Stages</h4>
          <div className="space-y-2">
            {(local.stages || []).map((s, i) => (
              <div
                className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                key={s.id}
              >
                <input
                  className="border p-2 rounded"
                  value={s.name}
                  onChange={(e) => updateStage(i, "name", e.target.value)}
                  placeholder="Stage name"
                />
                <input
                  className="border p-2 rounded"
                  type="number"
                  value={s.percentage}
                  onChange={(e) =>
                    updateStage(i, "percentage", Number(e.target.value))
                  }
                  placeholder="%"
                />
                <div className="text-sm">₹{s.stageRate}</div>
                <div className="flex gap-2">
                  <button
                    className="text-red-500"
                    onClick={() => removeStage(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="text-blue-600 mt-2" onClick={addStage}>
            + Add Stage
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- MAIN COMPONENT ----------------------------- */
const CreateWorkOrder = ({
  existingWorkOrder = null,
  onClose = () => {},
  onSuccess = () => {},
}) => {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [sites, setSites] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [units, setUnits] = useState(DEFAULT_UNITS);

  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [editModal, setEditModal] = useState({
    open: false,
    work: null,
    index: -1,
  });

  const [form, setForm] = useState({
    workOrderName: "",
    templateId: "",
    siteId: "",
    contractorId: "",
    startDate: "",
    durationMonths: "",
    works: [],
    serial: null,
  });

  /* ------------------- initial fetch dropdowns & units ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const [tplRes, siteRes, contRes, unitRes] = await Promise.allSettled([
          axios.get("/api/v1/work-template"),
          axios.get("/api/v1/site"),
          axios.get("/api/v1/contractor"),
          axios.post("/api/v1/work-details/name", { title: "Unit" }),
        ]);

        if (tplRes.status === "fulfilled")
          setTemplates(tplRes.value.data || []);
        if (siteRes.status === "fulfilled") setSites(siteRes.value.data || []);
        if (contRes.status === "fulfilled")
          setContractors(contRes.value.data || []);
        if (
          unitRes.status === "fulfilled" &&
          Array.isArray(unitRes.value.data?.description)
        ) {
          // unitRes.value.data.description may be ["SQFT", "NOS"...] or objects
          const u = unitRes.value.data.description.map((x) =>
            typeof x === "string" ? x : x.work || x
          );
          setUnits(Array.from(new Set([...u, ...DEFAULT_UNITS])));
        }
      } catch (err) {
        console.error("initial fetch error", err);
      }
    })();
  }, []);

  /* ------------------- load existing WO to edit ------------------- */
  useEffect(() => {
    if (!existingWorkOrder) return;
    // map existing to our form shape and recalc
    const mapped = {
      workOrderName: existingWorkOrder.workOrderName || "",
      templateId:
        existingWorkOrder.templateRef || existingWorkOrder.templateId || "",
      siteId: existingWorkOrder.site?.id || existingWorkOrder.siteId || "",
      contractorId:
        existingWorkOrder.contractor?.id ||
        existingWorkOrder.contractorId ||
        "",
      startDate: existingWorkOrder.startDate
        ? existingWorkOrder.startDate.slice(0, 10)
        : "",
      durationMonths: existingWorkOrder.durationMonths || "",
      works: (existingWorkOrder.works || []).map((w) => recalcStagesForWork(w)),
      serial: existingWorkOrder.serial || null,
    };
    setForm(mapped);
  }, [existingWorkOrder]);

  /* ------------------- generate works from template + site ------------------- */
  useEffect(() => {
    const buildFromTemplateAndSite = async () => {
      if (!form.templateId || !form.siteId) return;
      setLoading(true);
      try {
        const [tplRes, siteRes] = await Promise.all([
          axios.get(`/api/v1/work-template/${form.templateId}`),
          axios.get(`/api/v1/site/${form.siteId}`),
        ]);
        const tpl = tplRes.data;
        const site = siteRes.data;

        // convenience
        const floors = Array.isArray(site.floors) ? site.floors : [];
        const totalArea =
          site.area || floors.reduce((a, f) => a + (Number(f.area) || 0), 0);

        // classify floors
        const floorMap = floors.map((f) => ({
          ...f,
          nameN: normalize(f.name || ""),
        }));
        const basementFloor = floorMap.find((f) =>
          f.nameN.includes("basement")
        );
        const parkingFloor = floorMap.find((f) => f.nameN.includes("parking"));
        const parapetFloor = floorMap.find((f) => f.nameN.includes("parapet"));
        const otherSpecial = floorMap.filter((f) =>
          /(septic|tank|ug|water|boundary)/.test(f.nameN)
        );
        const norm = (v = "") => v.toLowerCase().trim();

        // real floors (perFloor usage) include headroom and named floors that are not special
        // real structural floors (used for perFloor logic)
        // RULE: Everything is a real floor EXCEPT special items:
        // basement, parking, parapet, septic tank, boundary wall, water tank, UG tank, etc.
        const realFloors = floorMap.filter((f) => {
          const n = f.nameN;

          const isSpecial =
            n.includes("basement") ||
            n.includes("parking") ||
            n.includes("parapet") ||
            /(septic|tank|boundary|ug|underground|water)/.test(n);

          return !isSpecial; // keep only structural floors: ground + first + second + headroom + etc.
        });

        // helper to push unique by normalized name
        const generated = [];
        const pushUnique = (item) => {
          const nn = normalize(item?.name || "");
          if (!generated.some((g) => normalize(g.name) === nn))
            generated.push(item);
        };

        // iterate descriptions
        const descriptions = tpl.description || tpl.workItems || [];
        descriptions.forEach((desc) => {
          const descN = normalize(desc.name || "");
          // Do not treat parking as a floor for any work except footing
          if (descN.includes("parking")) {
            const isFootingLike =
              descN.includes("footing") || descN.includes("tie beam");
            if (!isFootingLike) return;
          }

          const scope = desc.scope || "selectable";
          const unit = desc.unit || "SQFT";
          const rate = Number(desc.rate || 0);
          const pSched = Array.isArray(desc.paymentSchedule)
            ? desc.paymentSchedule
            : [];

          // Basement items: only if basement exists
          if (descN.includes("basement")) {
            if (!basementFloor) return;
            pushUnique(
              recalcStagesForWork({
                id: genId(),
                name: desc.name,
                unit,
                qty: Number(basementFloor.area || 0),
                rate,
                subWorks: desc.subWorks || [],
                stages: pSched.map((s) => ({
                  id: genId(),
                  name: s.stage,
                  percentage: s.percentage,
                })),
              })
            );
            return;
          }

          // Parapet / Septic / Tank items: only if matching floor exists; do not duplicate
          if (descN.includes("parapet")) {
            if (!parapetFloor) return;
            pushUnique(
              recalcStagesForWork({
                id: genId(),
                name: desc.name,
                unit: desc.unit || parapetFloor.unit || "RFT",
                qty: Number(parapetFloor.area || parapetFloor.qty || 0),
                rate,
                subWorks: desc.subWorks || [],
                stages: pSched.map((s) => ({
                  id: genId(),
                  name: s.stage,
                  percentage: s.percentage,
                })),
              })
            );
            return;
          }

          const isSpecial = /(septic|tank|boundary|ug|underground)/.test(descN);
          if (isSpecial) {
            // find any special floor that matches keywords
            const matched =
              otherSpecial.find((f) =>
                descN.includes("septic") ? f.nameN.includes("septic") : true
              ) || otherSpecial[0];
            if (!matched) return;
            pushUnique(
              recalcStagesForWork({
                id: genId(),
                name: desc.name,
                unit: desc.unit || matched.unit || "SQFT",
                qty: Number(matched.area || 0),
                rate,
                subWorks: desc.subWorks || [],
                stages: pSched.map((s) => ({
                  id: genId(),
                  name: s.stage,
                  percentage: s.percentage,
                })),
              })
            );
            return;
          }

          const matchesAnyRealFloor = realFloors.some((f) =>
            descN.includes(norm(f.name))
          );

          const allowAutoFloorQty = scope === "perFloor" || matchesAnyRealFloor;

          // If not allowed → default manual entry
          if (!allowAutoFloorQty) {
            pushUnique(
              recalcStagesForWork({
                id: genId(),
                name: desc.name,
                unit: desc.unit || "NOS",
                qty: Number(desc.defaultQty || 0),
                rate,
                subWorks: desc.subWorks || [],
                stages: pSched.map((s) => ({
                  id: genId(),
                  name: s.stage,
                  percentage: s.percentage,
                })),
              })
            );
            return;
          }

          // perFloor: apply to every real floor (including headroom)
          if (scope === "perFloor") {
            realFloors.forEach((f) =>
              pushUnique(
                recalcStagesForWork({
                  id: genId(),
                  name: `${desc.name} - ${f.name}`,
                  unit,
                  qty: f.nameN.includes("ground")
                    ? Number(f.area || 0) + Number(parkingFloor?.area || 0)
                    : Number(f.area || 0),
                  rate,
                  subWorks: desc.subWorks || [],
                  stages: pSched.map((s) => ({
                    id: genId(),
                    name: s.stage,
                    percentage: s.percentage,
                  })),
                })
              )
            );
            return;
          }

          // perSite: use defaultQty or site.area or total floor area
          if (scope === "perSite") {
            // The site-level qty: if desc.useFloorSum true, sum of real floor areas else site.area or defaultQty
            const qty = desc.useFloorSum
              ? realFloors.reduce((a, f) => a + (Number(f.area) || 0), 0)
              : Number(desc.defaultQty || site.area || totalArea || 0);

            pushUnique(
              recalcStagesForWork({
                id: genId(),
                name: desc.name,
                unit,
                qty,
                rate,
                subWorks: desc.subWorks || [],
                stages: pSched.map((s) => ({
                  id: genId(),
                  name: s.stage,
                  percentage: s.percentage,
                })),
              })
            );
            return;
          }

          // selectable / other: default single item (user can edit)
          pushUnique(
            recalcStagesForWork({
              id: genId(),
              name: desc.name,
              unit: desc.unit || "NOS",
              qty: Number(desc.defaultQty || 1),
              rate,
              subWorks: desc.subWorks || [],
              stages: pSched.map((s) => ({
                id: genId(),
                name: s.stage,
                percentage: s.percentage,
              })),
            })
          );
        });

        // FOOTING special rule: if template has "footing" description, set qty = ground + parking (if parking exists)
        const groundFloor =
          floorMap.find((f) => f.nameN.includes("ground")) || realFloors[0];
        if (groundFloor) {
          const parkingArea = Number(parkingFloor?.area || 0);
          const groundArea = Number(groundFloor?.area || 0);
          const footingQty =
            parkingArea > 0 ? parkingArea + groundArea : groundArea;

          const footingDesc = descriptions.find(
            (d) =>
              normalize(d.name || "").includes("footing") ||
              normalize(d.name || "").includes("tie beam")
          );
          if (footingDesc) {
            const footingWork = recalcStagesForWork({
              id: genId(),
              name: footingDesc.name,
              unit: footingDesc.unit || "SQFT",
              qty: footingQty,
              rate: Number(footingDesc.rate || 0),
              subWorks: footingDesc.subWorks || [],
              stages: (footingDesc.paymentSchedule || []).map((s) => ({
                id: genId(),
                name: s.stage,
                percentage: s.percentage,
              })),
            });

            // replace any existing footing-like item
            const existingIdx = generated.findIndex(
              (g) =>
                normalize(g.name).includes("footing") ||
                normalize(g.name).includes("tie beam")
            );
            if (existingIdx >= 0) generated[existingIdx] = footingWork;
            else generated.push(footingWork);
          }
        }

        // At this point generated[] contains unique items.
        // Set form: don't overwrite user edits if form.works already present and user likely editing; but when generating new, replace
        setForm((p) => ({
          ...p,
          workOrderName: tpl.title
            ? `${tpl.title} - ${site.name}`
            : p.workOrderName,
          works: generated.map((w) => recalcStagesForWork(w)),
        }));

        // Try to fetch next serial (best-effort)
        try {
          // const serialRes = await axios.get(
          //   `/api/v1/work-order/next-serial?site=${site._id}&template=${tpl._id}`
          // );
          // if (serialRes?.data?.serial) {
          //   setForm((p) => ({ ...p, serial: serialRes.data.serial }));
          // }
        } catch {
          // ignore if endpoint missing
        }
      } catch (err) {
        console.error("Generate works failed", err);
        toast.error("Failed to generate works from template/site");
      } finally {
        setLoading(false);
      }
    };

    buildFromTemplateAndSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.templateId, form.siteId]);

  /* ------------------- form update handlers ------------------- */
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const updateWork = useCallback((index, field, value) => {
    setForm((prev) => {
      const arr = prev.works.map((w) => ({ ...w }));
      if (!arr[index]) return prev;
      arr[index][field] = value;
      arr[index] = recalcStagesForWork(arr[index]);
      return { ...prev, works: arr };
    });
  }, []);

  const openEditModal = (index) => {
    const work = form.works[index];
    if (!work) return;
    setEditModal({ open: true, work: { ...work }, index });
  };

  const saveEditedWork = (updatedWork) => {
    setForm((p) => {
      const arr = p.works.map((w) => ({ ...w }));
      const idx = editModal.index;
      if (idx >= 0) arr[idx] = updatedWork;
      return { ...p, works: arr };
    });
    setEditModal({ open: false, work: null, index: -1 });
  };

  const toggleSubWork = (workIndex, subIndex, checked) => {
    setForm((prev) => {
      const arr = prev.works.map((w) => ({ ...w }));
      const work = arr[workIndex];
      if (!work) return prev;
      work.subWorks = (work.subWorks || []).map((s) => ({ ...s }));
      if (!work.subWorks[subIndex]) return prev;
      work.subWorks[subIndex].included = !!checked;
      arr[workIndex] = recalcStagesForWork(work);
      return { ...prev, works: arr };
    });
  };

  const removeWork = (index) => {
    setForm((prev) => {
      const arr = prev.works.slice();
      arr.splice(index, 1);
      return { ...prev, works: arr };
    });
    setExpandedIdx(null);
  };

  const addCustomWork = () => {
    const newWork = recalcStagesForWork({
      id: genId(),
      name: "Other: custom",
      unit: units[0] || "NOS",
      qty: 0,
      rate: 0,
      subWorks: [],
      stages: [{ id: genId(), name: "Full Work", percentage: 100 }],
    });
    setForm((p) => ({ ...p, works: [...p.works, newWork] }));
    setExpandedIdx(form.works.length);
  };

  /* ------------------- Draft save / load ------------------- */
  const saveDraftLocal = () => {
    try {
      const payload = { ...form, savedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      toast.success("Draft saved locally");
    } catch (err) {
      console.error(err);
      toast.error("Unable to save draft");
    }
  };

  const loadDraftLocal = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return toast("No draft found");
      const doc = JSON.parse(raw);
      // ensure stages recalculated
      doc.works = (doc.works || []).map((w) => recalcStagesForWork(w));
      setForm(doc);
      toast.success("Draft loaded");
    } catch (err) {
      console.error(err);
      toast.error("Unable to load draft");
    }
  };

  const clearDraftLocal = () => {
    localStorage.removeItem(DRAFT_KEY);
    toast.success("Draft cleared");
  };

  /* ------------------- Submit create/update ------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // basic validation
      if (!form.templateId || !form.siteId || !form.contractorId) {
        toast.error("Please select template, site and contractor");
        setLoading(false);
        return;
      }

      const payload = {
        workOrderName: form.workOrderName || "",
        contractor: form.contractorId,
        site: form.siteId,
        startDate: form.startDate,
        durationMonths: Number(form.durationMonths) || 0,
        works: form.works.map((w) => ({
          id: w.id,
          name: w.name,
          unit: w.unit,
          qty: w.qty,
          rate: w.rate,
          subWorks: w.subWorks,
          stages: (w.stages || []).map((s) => ({
            id: s.id,
            name: s.name,
            percentage: s.percentage,
            paid: s.paid || 0,
          })),
          notes: w.notes || "",
        })),
        templateRef: form.templateId || null,
        serial: form.serial || null,
      };

      if (existingWorkOrder && existingWorkOrder._id) {
        await axios.put(`/api/v1/work-order/${existingWorkOrder._id}`, payload);
        onClose();
        toast.success("Work Order updated");
      } else {
        await axios.post("/api/v1/work-order", payload);
        onClose();
        toast.success("Work Order created");
      }

      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error("Submit error", err);
      toast.error(
        err.response?.data?.message || "Failed to create/update work order"
      );
    } finally {
      setLoading(false);
    }
  };

  const totals = recalcTotals(form.works);

  /* ------------------- UI ------------------- */
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 items-center text-sm">
          <div
            className={`px-3 py-1 rounded ${
              step === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            1. Basic
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            2. Works
          </div>
          <div
            className={`px-3 py-1 rounded ${
              step === 3 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            3. Review
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Template</label>
              <select
                value={form.templateId}
                onChange={(e) => setField("templateId", e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="">Select template</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Work Order Name
              </label>
              <input
                value={form.workOrderName}
                onChange={(e) => setField("workOrderName", e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="e.g. Civil Work - Lah Khoti"
              />
              <div className="text-xs text-gray-500 mt-1">
                If empty, template title + site name will be used.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Site</label>
                <select
                  value={form.siteId}
                  onChange={(e) => setField("siteId", e.target.value)}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select Site</option>
                  {sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Contractor
                </label>
                <select
                  value={form.contractorId}
                  onChange={(e) => setField("contractorId", e.target.value)}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select Contractor</option>
                  {contractors.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Duration (months)
                </label>
                <input
                  type="month"
                  value={form.durationMonths}
                  onChange={(e) => setField("durationMonths", e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveDraftLocal}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={loadDraftLocal}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Load Draft
                </button>
                <button
                  type="button"
                  onClick={clearDraftLocal}
                  className="px-3 py-1 bg-red-100 rounded"
                >
                  Clear Draft
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!form.templateId || !form.siteId || !form.contractorId)
                      toast.error("Select template/site/contractor");
                    else setStep(2);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Items</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addCustomWork}
                  className="bg-gray-800 text-white px-3 py-1 rounded"
                >
                  + Add Work
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, works: [] }))}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Clear All
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-sm text-gray-500">Generating works...</div>
            )}

            {form.works.length === 0 && !loading && (
              <div className="text-sm text-gray-600 p-4 border rounded">
                No work items. Choose template & site to auto-generate or add a
                custom work.
              </div>
            )}

            <div className="space-y-3">
              {form.works.map((w, i) => (
                <div key={w.id} className="border rounded bg-white shadow-sm">
                  <div className="p-3 flex justify-between items-start">
                    <div className="w-3/4">
                      <button
                        type="button"
                        className="text-left w-full"
                        onClick={() =>
                          setExpandedIdx(expandedIdx === i ? null : i)
                        }
                      >
                        <div className="font-medium text-sm leading-tight break-words">
                          {w.name || "Untitled Work"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {w.qty} {w.unit} • Rate: ₹{w.rate} • Amount: ₹
                          {w.amount}
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">₹{w.amount}</div>
                      <button
                        type="button"
                        onClick={() => {
                          openEditModal(i);
                        }}
                        className="text-sm text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWork(i)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedIdx === i && (
                    <div className="p-3 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          className="border rounded p-2"
                          value={w.qty}
                          type="number"
                          onChange={(e) =>
                            updateWork(i, "qty", Number(e.target.value))
                          }
                          placeholder="Qty"
                        />
                        <input
                          className="border rounded p-2"
                          value={w.rate}
                          type="number"
                          onChange={(e) =>
                            updateWork(i, "rate", Number(e.target.value))
                          }
                          placeholder="Rate"
                        />
                        <select
                          className="border rounded p-2"
                          value={w.unit}
                          onChange={(e) =>
                            updateWork(i, "unit", e.target.value)
                          }
                        >
                          {units.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      {w.subWorks && w.subWorks.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2">
                            Sub Works
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {w.subWorks.map((sw, j) => (
                              <label
                                key={sw.id || `${i}-${j}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!sw.included}
                                  onChange={(e) =>
                                    toggleSubWork(i, j, e.target.checked)
                                  }
                                />
                                <span>{sw.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">
                          Payment Stages
                        </h4>
                        <div className="space-y-2">
                          {w.stages.map((st, j) => (
                            <div
                              key={st.id}
                              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                            >
                              <input
                                className="border rounded p-2"
                                value={st.name}
                                onChange={(e) =>
                                  updateStage(i, j, "name", e.target.value)
                                }
                                placeholder="Stage name"
                              />
                              <input
                                className="border rounded p-2"
                                value={st.percentage}
                                type="number"
                                onChange={(e) =>
                                  updateStage(
                                    i,
                                    j,
                                    "percentage",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="%"
                              />
                              <div className="text-sm">₹{st.stageRate}</div>
                              <div className="text-sm text-right">
                                ₹{st.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm mb-1">Notes</label>
                        <textarea
                          className="border rounded p-2 w-full"
                          value={w.notes || ""}
                          onChange={(e) =>
                            updateWork(i, "notes", e.target.value)
                          }
                          placeholder="Optional notes"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={saveDraftLocal}
                  className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review</h3>

            <div className="border rounded p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <strong>Work Order</strong>
                  <div>{form.workOrderName}</div>
                </div>
                <div>
                  <strong>Site</strong>
                  <div>
                    {sites.find((s) => s._id === form.siteId)?.name || "-"}
                  </div>
                </div>
                <div>
                  <strong>Contractor</strong>
                  <div>
                    {contractors.find((c) => c._id === form.contractorId)
                      ?.name || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Work</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {form.works.map((w) => (
                    <tr key={w.id} className="border-t">
                      <td className="p-2">{w.name}</td>
                      <td className="p-2">
                        {w.qty} {w.unit}
                      </td>
                      <td className="p-2">₹{w.rate}</td>
                      <td className="p-2 text-right">₹{w.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-medium">
                    <td className="p-2">Totals</td>
                    <td></td>
                    <td className="p-2"> </td>
                    <td className="p-2 text-right">₹{totals.totalValue}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded text-white ${
                    loading ? "bg-green-400" : "bg-green-600"
                  }`}
                >
                  {loading
                    ? "Processing..."
                    : existingWorkOrder
                    ? "Update Work Order"
                    : "Create Work Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      <EditWorkModal
        open={editModal.open}
        work={editModal.work}
        onClose={() => setEditModal({ open: false, work: null, index: -1 })}
        onSave={saveEditedWork}
        units={units}
      />
    </div>
  );
};

export default CreateWorkOrder;
