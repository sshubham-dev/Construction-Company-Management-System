// CreateQuotation.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiSave,
  FiEdit3,
} from "react-icons/fi";

/**
 * CreateQuotation (Option B: modular & cleaned)
 *
 * - Sends payloads aligned to server controllers:
 *   POST /api/v1/calculator/quote/calculate  -> expects packageSnapshot, floorsData, structureCode, parsedFloors, selectedCustomizations, gstIncluded, utilities, inputs
 *   POST /api/v1/calculator/quote            -> expects package, structure, floorsData, inputs, optionalInputs, workLines, materials, selectedCustomizations, workDetails, totals, durationInMonths
 *
 * - Brick impact applies only to floors/headroom/parapet (excluded from Footing & Basements)
 * - Floor-to-Floor and Ground Level are editable in the Rates Editor and saved to inputs
 * - Septic/UGWT/Boundary appear correctly in Quote (from optionalWorks)
 */

// Helper small components (kept inline since single-file requested)
const SmallLabel = ({ children }) => (
  <div className="text-xs text-gray-600">{children}</div>
);

const CreateQuotation = ({
  initialData = null,
  initialStep = "start",
  onSave = () => {},
  onClose = () => {},
}) => {
  const [step, setStep] = useState(initialStep || "start");
  const [leadSnapshot, setLeadSnapshot] = useState({
    leadId: "",
    name: "",
    phone: "",
    city: "",
    service: "",
    address: "",
  });
  const [packageSnapshot, setPackageSnapshot] = useState({
    _id: "",
    name: "",
    category: "",
    items: [], // rate items
    materials: [],
    workDetails: [],
    brickType: "",
    materialOptions: [], // for editor (tile/cement/steel etc)
  });
  const [structureSnapshot, setStructureSnapshot] = useState({
    raw: "G",
    hasBasement: false,
    levels: [], // built only on save
  });
  const [inputs, setInputs] = useState({
    floorToFloorHeightFt: 10,
    groundLevelAboveRoadFt: 2.5,
    brickType: "AAC Block",
  });
  const [floorsData, setFloorsData] = useState({});
  const [parsedFloors, setParsedFloors] = useState([]);
  const [parkingEnabled, setParkingEnabled] = useState(false);
  const [parkingArea, setParkingArea] = useState(0);
  const [septicEnabled, setSepticEnabled] = useState(false);
  const [septicDims, setSepticDims] = useState({ l: 0, w: 0, h: 0 });
  const [ugwtEnabled, setUgwtEnabled] = useState(false);
  const [ugwtDims, setUgwtDims] = useState({ l: 0, w: 0, h: 0 });
  const [boundaryWall, setBoundaryWall] = useState({ length: 0, height: 0 });
  const [workLines, setWorkLines] = useState([]);
  const [optionalWorks, setOptionalWorks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [workDetails, setWorkDetails] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    gstPercent: 18,
    gstAmount: 0,
    total: 0,
    gstIncluded: false,
  });
  const [durationInMonths, setDurationInMonths] = useState(0);
  const [leads, setLeads] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activePackageId, setActivePackageId] = useState("");
  const [activePackageLocal, setActivePackageLocal] = useState(null);
  const [ratesEditing, setRatesEditing] = useState([]);
  const [useExistingLead, setUseExistingLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [openUtility, setOpenUtility] = useState({
    septic: false,
    ugwt: false,
  });
  // header map
  const headerMap = {
    start: { title: "Client Details", subtitle: "घर आपका, जिम्मेदारी हमारी" },
    input: {
      title: "Building Requirements",
      subtitle: "अपने घर की जानकारी दर्ज करें",
    },
    quote: { title: "Quote Summary", subtitle: "आपके घर का खर्च अनुमान" },
    ratesEditor: {
      title: "Customize Rates",
      subtitle: "अपनी जरूरत के अनुसार रेट बदले",
    },
    material: {
      title: "Material Estimate",
      subtitle: "सामग्री और मात्रा का सटीक अनुमान",
    },
    pdf: { title: "Quotation", subtitle: "ग्राहक के लिए कोटेशन" },
    saved: { title: "Saved Quotes", subtitle: "सहेजे गए कोटेशन" },
  };
  // ---------- initial load ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [leadsRes, packagesRes] = await Promise.all([
          axios.get("/api/v1/lead").catch(() => ({ data: [] })),
          axios.get("/api/v1/calculator/packages").catch(() => ({ data: [] })),
        ]);
        if (!mounted) return;
        setLeads(leadsRes.data || []);
        const pkgs = Array.isArray(packagesRes.data) ? packagesRes.data : [];
        setPackages(pkgs);
        if (pkgs.length) {
          const first = pkgs[0];
          setActivePackageId(first._id);
          setActivePackageLocal(first);
          setPackageSnapshot((p) => ({ ...p, ...first }));
          setRatesEditing(
            (first.items || []).map((it, idx) => ({ ...it, _localId: idx }))
          );
        }
      } catch (e) {
        console.warn("Failed to load initial data", e);
      }
    })();
    return () => (mounted = false);
  }, []);
  useEffect(() => {
    if (!initialData) return;
    try {
      if (initialData.lead)
        setLeadSnapshot((s) => ({ ...s, ...initialData.lead }));
      if (initialData.package) {
        setPackageSnapshot((p) => ({ ...p, ...(initialData.package || {}) }));
        if (initialData.package._id) {
          setActivePackageId(initialData.package._id);
          setActivePackageLocal(initialData.package);
        }
      }
      if (initialData.structure && initialData.structure.raw) {
        setStructureSnapshot((s) => ({ ...s, raw: initialData.structure.raw }));
      }
      if (initialData.floorsData) setFloorsData(initialData.floorsData);
      if (initialData.inputs)
        setInputs((i) => ({ ...i, ...initialData.inputs }));
      if (initialData.utilities) {
        if (initialData.utilities.septic) {
          setSepticEnabled(true);
          setSepticDims(initialData.utilities.septic);
        }
        if (initialData.utilities.ugwt) {
          setUgwtEnabled(true);
          setUgwtDims(initialData.utilities.ugwt);
        }
      }
      if (initialData.totals) setTotals(initialData.totals);
      if (initialData.durationInMonths)
        setDurationInMonths(initialData.durationInMonths);
      if (initialStep) setStep(initialStep);
    } catch (e) {
      console.warn("Failed to apply initialData", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, initialStep]);
  function ordinalName(n) {
    const map = [
      "Zero",
      "First",
      "Second",
      "Third",
      "Fourth",
      "Fifth",
      "Sixth",
      "Seventh",
      "Eighth",
      "Ninth",
      "Tenth",
    ];
    return map[n] || `${n}th`;
  }
  function parseStructure(code) {
    if (!code) return [];
    const parts = String(code || "")
      .split("+")
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);
    const floors = [];
    parts.forEach((p) => {
      const bm = p.match(/^(\d*)B$/);
      if (bm) {
        const n = bm[1] ? Number(bm[1]) : 1;
        for (let i = n; i >= 1; i--)
          floors.push(i === 1 ? "Basement floor" : `Basement ${i} floor`);
        return;
      }
      if (p === "B") {
        floors.push("Basement floor");
        return;
      }
      if (p === "G") {
        floors.push("Ground floor");
        return;
      }
      if (/^\d+$/.test(p)) {
        const n = Number(p);
        for (let i = 1; i <= n; i++) floors.push(`${ordinalName(i)} floor`);
        return;
      }
      if (!p.toLowerCase().includes("FLOOR")) floors.push(`${p} floor`);
      else floors.push(p);
    });
    return floors;
  }
  // derived parsed floors
  useEffect(() => {
    const pf = parseStructure(structureSnapshot.raw || "");
    setParsedFloors(pf);
  }, [structureSnapshot.raw]);
  // ensure floorsData keys exist when structure parsed
  useEffect(() => {
    const next = { ...(floorsData || {}) };
    (parsedFloors || []).forEach((f) => {
      if (!(f in next)) next[f] = 0;
    });
    if (!("Headroom" in next)) next["Headroom"] = 0;
    if (!("__parapetHeight" in next)) next["__parapetHeight"] = 3;
    if (!next.__units) next.__units = { ...(floorsData.__units || {}) };
    if (!next.__usage) next.__usage = { ...(floorsData.__usage || {}) };
    if (typeof next.__headroomManual === "undefined")
      next.__headroomManual = Boolean(floorsData.__headroomManual);
    const hasBasement = (parsedFloors || []).some((x) => /basement/i.test(x));
    setStructureSnapshot((s) => ({ ...s, hasBasement }));
    if (!hasBasement) {
      if (!("Footing" in next)) next["Footing"] = 0;
    } else {
      if ("Footing" in next) delete next["Footing"];
    }
    setFloorsData(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedFloors]);
  // UI derived values
  const derived = useMemo(() => {
    const lastFloorName =
      (parsedFloors || [])
        .slice()
        .reverse()
        .find((f) => !/basement/i.test(f)) ||
      parsedFloors[parsedFloors.length - 1] ||
      null;
    const lastArea = lastFloorName ? Number(floorsData[lastFloorName] || 0) : 0;
    const parapetHeight = Number(floorsData.__parapetHeight || 3);
    const baseLength = lastArea ? lastArea / 40 : 0;
    const offset = lastArea > 4000 ? 50 : 40;
    const parapetRFT = lastArea ? 2 * baseLength + offset + offset : 0;
    const parapetSqft = parapetRFT ? parapetRFT * parapetHeight : 0;
    const headroomManual = Boolean(floorsData.__headroomManual);
    const manualHeadroom = Number(floorsData.Headroom || 0);
    const autoHeadroom = Math.round(lastArea * 0.125);
    const headroomEffective =
      headroomManual && manualHeadroom > 0 ? manualHeadroom : autoHeadroom;
    const groundFloorName = (parsedFloors || []).find((f) => /ground/i.test(f));
    const groundArea = groundFloorName
      ? Number(floorsData[groundFloorName] || 0)
      : 0;
    const effectiveGround = parkingEnabled
      ? Math.max(0, groundArea - Number(parkingArea || 0))
      : groundArea;

    return {
      lastFloorName,
      lastArea,
      parapet: { rft: parapetRFT, sqft: parapetSqft, height: parapetHeight },
      headroom: {
        manual: headroomManual,
        manualValue: manualHeadroom,
        autoValue: autoHeadroom,
        effective: headroomEffective,
      },
      ground: {
        name: groundFloorName,
        area: groundArea,
        effective: effectiveGround,
      },
    };
  }, [floorsData, parsedFloors, parkingEnabled, parkingArea]);
  // ---------- validation ----------
  function validateBeforeCalculate() {
    if (!leadSnapshot.name) {
      alert("Enter client name");
      return false;
    }
    if (!structureSnapshot.raw) {
      alert("Enter structure code");
      return false;
    }
    const any = (parsedFloors || []).some((f) => Number(floorsData[f]) > 0);
    if (!any) {
      alert("Enter area for at least one floor");
      return false;
    }
    if (parkingEnabled && (!parkingArea || parkingArea <= 0)) {
      alert("Enter parking area");
      return false;
    }
    if (septicEnabled && (!septicDims.l || !septicDims.w || !septicDims.h)) {
      alert("Enter septic tank L×W×H");
      return false;
    }
    if (ugwtEnabled && (!ugwtDims.l || !ugwtDims.w || !ugwtDims.h)) {
      alert("Enter UGWT L×W×H");
      return false;
    }
    return true;
  }
  // ---------- calculate (remote preferred) ----------
  async function handleCalculate() {
    if (!validateBeforeCalculate()) return;
    setQuoteLoading(true);

    // prepare customization payload: material options selected (e.g., bricks)
    // selectedCustomizations is an array of { key, label, description, rateImpact }
    // ensure bricks entry exists if packageSnapshot.brickType selected
    const scopy = (selectedCustomizations || [])
      .filter(Boolean)
      .map((s) => ({ ...s }));
    const brickKey = "bricks";
    const brickLabel =
      activePackageLocal?.brickType || packageSnapshot.brickType || "";
    const brickImpact = (() => {
      // find matching material option in packageSnapshot.materialOptions
      const opts =
        activePackageLocal?.materialOptions ||
        packageSnapshot.materialOptions ||
        [];
      const bricksOpt = opts.find((o) => /brick/i.test(String(o.title || "")));
      if (!bricksOpt) {
        // fallback: see ratesEditing for a rateImpact entry named "Bricks"
        const found = (ratesEditing || []).find((r) =>
          String(r.label || "")
            .toLowerCase()
            .includes("brick")
        );
        return found ? Number(found.rateImpact || 40) : 0;
      }
      const chosen = (bricksOpt.options || []).find(
        (o) => o.label === brickLabel
      );
      return chosen ? Number(chosen.rateImpact || 40) : 0;
    })();
    // Add/replace bricks customization
    if (brickLabel) {
      const existingIndex = scopy.findIndex((s) => s.key === brickKey);
      const entry = {
        key: brickKey,
        label: brickLabel,
        description: `Selected bricks: ${brickLabel}`,
        rateImpact: Number(brickImpact || 40),
      };
      if (existingIndex >= 0) scopy[existingIndex] = entry;
      else scopy.push(entry);
    }

    const payload = {
      packageId: activePackageId,
      packageSnapshot: activePackageLocal || packageSnapshot,
      floorsData,
      structure: {
        raw: structureSnapshot.raw,
        hasBasement: structureSnapshot.hasBasement,
      },
      structureCode: structureSnapshot.raw,
      parsedFloors: parsedFloors,
      parkingEnabled,
      parkingArea,
      septicEnabled,
      septicDims,
      ugwtEnabled,
      ugwtDims,
      boundaryWall,
      selectedCustomizations: scopy,
      gstIncluded: gstEnabled,
      inputs, // floorToFloorHeightFt, groundLevelAboveRoadFt
    };

    try {
      const res = await axios.post(
        "/api/v1/calculator/quote/calculate",
        payload
      );
      if (res && res.data) {
        const d = res.data;
        // prefer server totals but keep safe defaults
        setWorkLines(d.workLines || []);
        setOptionalWorks(d.optionalWorks || []);
        setMaterials(d.materials || []);
        setSelectedCustomizations(d.selectedCustomizations || scopy);
        setWorkDetails(d.workDetails || []);
        setTotals(
          d.totals || {
            subtotal: 0,
            gstPercent: 18,
            gstAmount: 0,
            total: 0,
            gstIncluded: gstEnabled,
          }
        );
        setDurationInMonths(d.durationInMonths || 0);
        setStep("quote");
      } else {
        alert("Calculation returned no data");
      }
    } catch (err) {
      console.warn(
        "Calculate API failed, trying local fallback:",
        err?.message || err
      );
      // Local fallback (simple): attempt to compute minimal totals from ratesEditing
    } finally {
      setQuoteLoading(false);
    }
  }
  // ---------- rates editor helpers ----------
  function openRatesForPackage(pkgId) {
    const pkg = packages.find((p) => p._id === pkgId) || null;
    if (!pkg) return;
    setActivePackageId(pkgId);
    setActivePackageLocal(pkg);
    setPackageSnapshot((p) => ({ ...p, ...pkg }));
    setRatesEditing(
      (pkg.items || []).map((it, idx) => ({ ...it, _localId: idx }))
    );
    setStep("ratesEditor");
  }
  async function saveRatesToServer() {
    if (!activePackageLocal) return;
    try {
      const updated = {
        ...activePackageLocal,
        items: ratesEditing.map((r) => ({
          label: r.label,
          unit: r.unit,
          rate: r.rate,
        })),
        materialOptions:
          packageSnapshot.materialOptions ||
          activePackageLocal.materialOptions ||
          [],
      };
      // update local packages and active
      setPackages((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setActivePackageLocal(updated);
      setPackageSnapshot((p) => ({ ...p, ...updated }));
      // optional: call server endpoint to persist
      // await axios.post(`/api/v1/calculator/packages/${updated._id}/update`, updated);
      alert("Package updated (local)");
      setStep("input");
    } catch (err) {
      console.error("Failed to save package", err);
      alert("Failed to save package");
    }
  }
  // ---------- lead select ----------
  function handleLeadSelect(leadId) {
    setSelectedLead(leadId);
    setUseExistingLead(true);
    const l = leads.find((x) => x._id === leadId) || null;
    if (l) {
      setLeadSnapshot({
        leadId: l._id,
        name: l.name || "",
        phone: l?.contact?.phoneNo || "",
        city: l.location?.city || l?.city || "",
        service: l?.requirement?.service || "",
        address: l.location?.address || l?.address || "",
      });
    } else {
      setLeadSnapshot({
        leadId: "",
        name: "",
        phone: "",
        city: "",
        service: "",
        address: "",
      });
    }
  }
  // ---------- save quote ----------
  async function handleSaveQuote(action = "save") {
    // action: "draft" | "save" | "send"
    if (!workLines || !Array.isArray(workLines) || workLines.length === 0) {
      if (action !== "draft") {
        if (
          !window.confirm(
            "No calculated work lines found. Do you want to save anyway?"
          )
        )
          return;
      }
    }

    // build structure levels from floorsData & parsedFloors
    const levels = (parsedFloors || []).map((label) => ({
      key: label.replace(/\s+/g, "_").toUpperCase(),
      label,
      area: Number(floorsData[label] || 0),
      usage: (floorsData.__usage && floorsData.__usage[label]) || "Residential",
      scope: (floorsData.__scope && floorsData.__scope[label]) || "finishing",
    }));

    const payload = {
      lead: leadSnapshot.leadId
        ? {
            leadId: leadSnapshot.leadId,
            name: leadSnapshot.name,
            phone: leadSnapshot.phone,
            city: leadSnapshot.city,
            address: leadSnapshot.address,
            service: leadSnapshot.service,
          }
        : leadSnapshot,
      package: {
        name: activePackageLocal?.name || packageSnapshot.name,
        category: activePackageLocal?.category || packageSnapshot.category,
        snapshot: activePackageLocal || packageSnapshot,
      },
      structure: {
        raw: structureSnapshot.raw,
        hasBasement: structureSnapshot.hasBasement,
        levels,
      },
      brickType:
        activePackageLocal?.brickType || packageSnapshot.brickType || "",
      floorsData,
      utilities: {
        septic: septicEnabled ? septicDims : undefined,
        ugwt: ugwtEnabled ? ugwtDims : undefined,
        boundaryWall:
          boundaryWall && (boundaryWall.length || boundaryWall.height)
            ? boundaryWall
            : undefined,
        parking: parkingEnabled ? { area: parkingArea } : undefined,
      },
      inputs: { ...inputs },
      FloortoFloorHeight: inputs.floorToFloorHeightFt,
      quoteSummary: {
        total: totals.total || 0,
        breakdown: workLines || [],
        duration: durationInMonths,
        gstIncluded: totals.gstIncluded || gstEnabled,
      },
      workLines,
      optionalWorks,
      materials,
      selectedCustomizations,
      workDetails,
      totals,
      durationInMonths,
    };

    try {
      if (action === "draft") {
        onSave(payload); // parent may persist
        alert("Saved as draft locally.");
        return;
      }

      const serverPayload = {
        ...payload,
        action,
        sendChannels: action === "send" ? ["email", "whatsapp"] : [],
      };
      const res = await axios.post("/api/v1/calculator/quote", serverPayload);
      if (res && res.data) {
        alert(
          action === "send" ? "Quote saved and sent." : "Quote saved on server."
        );
        onSave(res.data);
        onClose();
      } else {
        alert("Saved locally (server did not return data).");
        onSave(payload);
        onClose();
      }
    } catch (err) {
      console.warn(
        "Failed to save on server, saving locally.",
        err?.message || err
      );
      onSave(payload);
      alert("Backend not available. Quote saved locally.");
    }
  }
  // ---------- small helpers ----------
  function onHeadroomChange(value) {
    const val = Number(value || 0);
    const manual = val > 0;
    setFloorsData((prev) => ({
      ...prev,
      Headroom: val,
      __headroomManual: manual,
    }));
  }
  // --------- Render ----------
  const header = headerMap[step] || { title: "", subtitle: "" };
  return (
    <div className="min-h-full p-4 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">{header.title}</h1>
          <div className="text-green-700 font-semibold text-sm mt-1">
            {header.subtitle}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            घर आपका, जिम्मेदारी हमारी
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          {/* START */}
          {step === "start" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">
                  Select Lead or Enter Manually
                </label>
                <div className="flex items-center gap-2">
                  <button
                    className={`text-xs px-2 py-1 rounded ${
                      useExistingLead
                        ? "bg-green-600 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setUseExistingLead((s) => !s)}
                  >
                    {useExistingLead ? "Manual" : "Use Lead"}
                  </button>
                </div>
              </div>

              {useExistingLead ? (
                <div>
                  <select
                    className="w-full border rounded-lg p-3"
                    value={selectedLead}
                    onChange={(e) => handleLeadSelect(e.target.value)}
                  >
                    <option value="">Select lead</option>
                    {(leads || []).map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name} — {l.location?.city || l.city || ""}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-semibold">Name</label>
                    <input
                      className="w-full border rounded-lg p-3 mt-1"
                      placeholder="Name"
                      value={leadSnapshot.name}
                      onChange={(e) =>
                        setLeadSnapshot((s) => ({ ...s, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Phone</label>
                    <input
                      className="w-full border rounded-lg p-3 mt-1"
                      placeholder="Phone"
                      value={leadSnapshot.phone}
                      onChange={(e) =>
                        setLeadSnapshot((s) => ({
                          ...s,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">City</label>
                    <input
                      className="w-full border rounded-lg p-3 mt-1"
                      placeholder="City"
                      value={leadSnapshot.city}
                      onChange={(e) =>
                        setLeadSnapshot((s) => ({ ...s, city: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Service</label>
                    <select
                      className="w-full border rounded-lg p-3 mt-1"
                      value={leadSnapshot.service || ""}
                      onChange={(e) =>
                        setLeadSnapshot((s) => ({
                          ...s,
                          service: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Service</option>
                      <option value="Construction">Construction</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                </>
              )}

              <button
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
                onClick={() => setStep("input")}
              >
                Let's Get Started
              </button>
            </div>
          )}

          {/* INPUT */}
          {step === "input" && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Select Package</label>
              <select
                className="w-full border rounded p-3"
                value={activePackageId}
                onChange={(e) => {
                  const id = e.target.value;
                  setActivePackageId(id);
                  const pkg = packages.find((p) => p._id === id);
                  setActivePackageLocal(pkg || null);
                  setPackageSnapshot((p) => ({ ...p, ...(pkg || {}) }));
                  setRatesEditing(
                    ((pkg && pkg.items) || []).map((it, idx) => ({
                      ...it,
                      _localId: idx,
                    }))
                  );
                }}
              >
                <option value="">Select a Package</option>
                {(packages || []).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium">
                Structure (G, G+1, B+G+1, 2B+G+2)
              </label>
              <input
                className="w-full border rounded p-2"
                value={structureSnapshot.raw}
                onChange={(e) =>
                  setStructureSnapshot((s) => ({
                    ...s,
                    raw: e.target.value.toUpperCase(),
                  }))
                }
              />

              {/* AREA SECTION */}
              <div className="mt-6">
                <h3 className="text-base font-semibold text-gray-800">
                  Area Details
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add area, unit and usage for each floor. Derived values
                  (headroom/parapet/ground-effective) show live below.
                </p>

                <div className="space-y-5 mt-4">
                  {/* FOOTING */}
                  {"Footing" in (floorsData || {}) && (
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          Footing
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          type="number"
                          placeholder="Area"
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                          value={floorsData.Footing || ""}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              Footing: Number(e.target.value),
                            }))
                          }
                        />
                        <select
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                          value={floorsData.__units?.Footing || "sqft"}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              __units: {
                                ...(fd.__units || {}),
                                Footing: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="sqft">sqft</option>
                          <option value="sqmt">sqmt</option>
                          <option value="rft">rft</option>
                          <option value="cuft">cuft</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* FLOORS */}
                  {(parsedFloors || []).map((key) => (
                    <div
                      key={key}
                      className="bg-white border rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          {key}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        <input
                          type="number"
                          placeholder="Area"
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                          value={
                            key.toLowerCase() === "ground floor"
                              ? derived.ground.effective ||
                                floorsData[key] ||
                                ""
                              : floorsData[key] || ""
                          }
                          min={0}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              [key]: Number(e.target.value),
                            }))
                          }
                        />

                        <select
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                          value={floorsData.__units?.[key] || "sqft"}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              __units: {
                                ...(fd.__units || {}),
                                [key]: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="sqft">sqft</option>
                          <option value="sqmt">sqmt</option>
                          <option value="rft">rft</option>
                          <option value="cuft">cuft</option>
                        </select>

                        <select
                          className="border rounded-lg p-3 bg-gray-50 text-sm"
                          value={floorsData.__usage?.[key] || "Residential"}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              __usage: {
                                ...(fd.__usage || {}),
                                [key]: e.target.value,
                              },
                            }))
                          }
                        >
                          <option>Residential</option>
                          <option>Commercial</option>
                          {/* <option>Shop</option>
                          <option>Office</option>
                          <option>Storage</option>
                          <option>Parking</option> */}
                        </select>
                      </div>

                      {/* Scope */}
                      {/* <div className="mt-3">
                        <label className="text-xs text-gray-600">Scope</label>
                        <select
                          className="w-full border rounded p-2 mt-1"
                          value={floorsData.__scope?.[key] || "finishing"}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              __scope: {
                                ...(fd.__scope || {}),
                                [key]: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="structure">Structure Only</option>
                          <option value="plaster">Plaster Only</option>
                          <option value="finishing">Full Finishing</option>
                        </select>
                      </div> */}

                      {/* Parking for ground */}
                      {key.toLowerCase().includes("ground") && (
                        <div className="mt-4 border-t pt-3">
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="scale-110"
                              checked={parkingEnabled}
                              onChange={(e) =>
                                setParkingEnabled(e.target.checked)
                              }
                            />{" "}
                            Include parking in this floor
                          </label>

                          {parkingEnabled && (
                            <input
                              type="number"
                              placeholder="Parking area (sqft)"
                              className="border rounded-lg p-3 bg-gray-50 text-sm w-full mt-3"
                              value={parkingArea || ""}
                              onChange={(e) =>
                                setParkingArea(Number(e.target.value))
                              }
                            />
                          )}

                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Ground area:</strong> {floorsData[key] || 0}{" "}
                            {floorsData.__units?.[key] || "sqft"}
                            {parkingEnabled && (
                              <span>
                                {" "}
                                • Effective (after parking):{" "}
                                {derived.ground.effective}{" "}
                                {floorsData.__units?.[key] || "sqft"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* HEADROOM */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Headroom
                      </h4>
                      <div className="text-xs text-gray-500">
                        Auto: 12.5% of last floor
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input
                        type="number"
                        placeholder="Area"
                        className="border rounded-lg p-3 bg-gray-50 text-sm"
                        value={
                          derived.headroom.effective ||
                          floorsData.Headroom ||
                          ""
                        }
                        onChange={(e) => onHeadroomChange(e.target.value)}
                      />
                      <select
                        className="border rounded-lg p-3 bg-gray-50 text-sm"
                        value={floorsData.__units?.Headroom || "sqft"}
                        onChange={(e) =>
                          setFloorsData((fd) => ({
                            ...fd,
                            __units: {
                              ...(fd.__units || {}),
                              Headroom: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqmt">sqmt</option>
                        <option value="rft">rft</option>
                        <option value="cuft">cuft</option>
                      </select>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      Effective headroom: {derived.headroom.effective} sqft
                      <button
                        className="ml-2 text-xs text-blue-600"
                        onClick={() =>
                          setFloorsData((p) => ({
                            ...p,
                            Headroom: 0,
                            __headroomManual: false,
                          }))
                        }
                      >
                        Use Auto
                      </button>
                    </div>
                  </div>

                  {/* PARAPET */}
                  <div className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <label className="font-medium text-sm">
                          Parapet Wall (auto)
                        </label>
                        <div className="pr-1 text-xs text-gray-600 mt-1">
                          {derived.parapet.rft
                            ? `${derived.parapet.rft.toFixed(
                                2
                              )} RFT → ${derived.parapet.sqft.toFixed(2)} sqft`
                            : "—"}
                        </div>
                      </div>
                      <div className="w-1/2">
                        <input
                          type="number"
                          placeholder="Height (ft)"
                          className="border rounded p-2 w-full"
                          value={floorsData.__parapetHeight || 3}
                          onChange={(e) =>
                            setFloorsData((fd) => ({
                              ...fd,
                              __parapetHeight: Number(e.target.value || 3),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Utilities */}
              <div className="space-y-2 mt-4">
                {/* Septic */}
                <div className="border rounded">
                  <div
                    className="flex items-center justify-between p-3"
                    onClick={() =>
                      setOpenUtility((o) => ({ ...o, septic: !o.septic }))
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={septicEnabled}
                        onChange={(e) => {
                          setSepticEnabled(e.target.checked);
                          setOpenUtility((o) => ({
                            ...o,
                            septic: e.target.checked,
                          }));
                        }}
                      />
                      <span className="font-medium">
                        Septic Tank (L × W × H in ft)
                      </span>
                    </div>
                    <FiChevronDown
                      className={`transition-transform ${
                        openUtility.septic ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openUtility.septic && septicEnabled && (
                    <div className="p-3 border-t grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Length (ft)"
                        className="border rounded p-2"
                        value={septicDims.l || ""}
                        onChange={(e) =>
                          setSepticDims((p) => ({
                            ...p,
                            l: Number(e.target.value),
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Width (ft)"
                        className="border rounded p-2"
                        value={septicDims.w || ""}
                        onChange={(e) =>
                          setSepticDims((p) => ({
                            ...p,
                            w: Number(e.target.value),
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Height (ft)"
                        className="border rounded p-2"
                        value={septicDims.h || ""}
                        onChange={(e) =>
                          setSepticDims((p) => ({
                            ...p,
                            h: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {/* UGWT */}
                <div className="border rounded">
                  <div
                    className="flex items-center justify-between p-3"
                    onClick={() =>
                      setOpenUtility((o) => ({ ...o, ugwt: !o.ugwt }))
                    }
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={ugwtEnabled}
                        onChange={(e) => {
                          setUgwtEnabled(e.target.checked);
                          setOpenUtility((o) => ({
                            ...o,
                            ugwt: e.target.checked,
                          }));
                        }}
                      />
                      <span className="font-medium">
                        Underground Water Tank (L × W × H in ft)
                      </span>
                    </div>
                    <FiChevronDown
                      className={`transition-transform ${
                        openUtility.ugwt ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {openUtility.ugwt && ugwtEnabled && (
                    <div className="p-3 border-t grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Length (ft)"
                        className="border rounded p-2"
                        value={ugwtDims.l || ""}
                        onChange={(e) =>
                          setUgwtDims((p) => ({
                            ...p,
                            l: Number(e.target.value),
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Width (ft)"
                        className="border rounded p-2"
                        value={ugwtDims.w || ""}
                        onChange={(e) =>
                          setUgwtDims((p) => ({
                            ...p,
                            w: Number(e.target.value),
                          }))
                        }
                      />
                      <input
                        type="number"
                        placeholder="Height (ft)"
                        className="border rounded p-2"
                        value={ugwtDims.h || ""}
                        onChange={(e) =>
                          setUgwtDims((p) => ({
                            ...p,
                            h: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Boundary */}
              <div className="mt-4 border rounded-lg p-3 bg-gray-50">
                <h4 className="text-sm font-semibold">Boundary Wall</h4>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input
                    type="number"
                    placeholder="Length (RFT)"
                    className="border rounded p-2"
                    value={boundaryWall.length}
                    onChange={(e) =>
                      setBoundaryWall((p) => ({
                        ...p,
                        length: Number(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Height (FT)"
                    className="border rounded p-2"
                    value={boundaryWall.height}
                    onChange={(e) =>
                      setBoundaryWall((p) => ({
                        ...p,
                        height: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              {/* GST */}
              <div className="flex items-center justify-between mt-8">
                <label className="text-md font-medium text-gray-700 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => {
                      setGstEnabled(e.target.checked);
                    }}
                  />{" "}
                  Include GST
                </label>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex flex-col gap-4">
                <button
                  className="flex-1 border rounded py-2"
                  onClick={() => setStep("start")}
                >
                  Back
                </button>
                <button
                  className="flex-1 bg-green-600 text-white py-2 rounded"
                  onClick={handleCalculate}
                  disabled={quoteLoading}
                >
                  {quoteLoading ? "Calculating..." : "Calculate"}
                </button>
                <button
                  className="flex-1 border rounded py-2"
                  onClick={() =>
                    activePackageLocal
                      ? openRatesForPackage(activePackageLocal._id)
                      : alert("Select package first")
                  }
                >
                  Customize Requirement
                </button>
              </div>
            </div>
          )}

          {/* RATES EDITOR */}
          {step === "ratesEditor" && activePackageLocal && (
            <div className="space-y-3 pb-20">
              <h2 className="font-medium text-lg">Package Editor</h2>
              <p className="text-sm text-gray-500">
                Edit package name and rates. Add or remove items. Set default
                brick & material options and global inputs.
              </p>

              <div className="mt-3">
                <label className="text-sm font-medium">Select Package</label>
                <select
                  className="w-full border rounded p-3 mt-1"
                  value={activePackageLocal?._id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    const pkg = packages.find((p) => p._id === id);
                    setActivePackageLocal(pkg || null);
                    setRatesEditing(
                      ((pkg && pkg.items) || []).map((it, idx) => ({
                        ...it,
                        _localId: idx,
                      }))
                    );
                  }}
                >
                  <option value="">Choose package</option>
                  {(packages || []).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                <label className="text-sm font-medium">
                  Default Brick Type
                </label>
                <select
                  className="w-full border rounded p-3 mt-1"
                  value={
                    activePackageLocal?.brickType ||
                    packageSnapshot.brickType ||
                    ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setActivePackageLocal((prev) =>
                      prev ? { ...prev, brickType: v } : prev
                    );
                    setPackageSnapshot((p) => ({ ...p, brickType: v }));
                    setInputs((i) => ({
                      ...i,
                      brickType: v,
                    }));
                  }}
                >
                  <option value="">Select Brick Type</option>
                  <option value="Red Bricks">Red Bricks</option>
                  <option value="Fly Ash Bricks">Fly Ash Bricks</option>
                  <option value="AAC Blocks">AAC Blocks</option>
                </select>
                <SmallLabel>
                  Bricks rate impact will apply to floors/headroom/parapet (not
                  footing/basement)
                </SmallLabel>
              </div>

              {/* Global inputs */}
              <div className="mt-6 border rounded p-3">
                <h3 className="font-medium mb-2">Global Inputs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs">
                      Floor to Floor Height (ft)
                    </label>
                    <input
                      className="border rounded p-2 w-full"
                      type="number"
                      value={inputs.floorToFloorHeightFt}
                      onChange={(e) =>
                        setInputs((i) => ({
                          ...i,
                          floorToFloorHeightFt: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs">
                      Ground Level Above Road (ft)
                    </label>
                    <input
                      className="border rounded p-2 w-full"
                      type="number"
                      value={inputs.groundLevelAboveRoadFt}
                      onChange={(e) =>
                        setInputs((i) => ({
                          ...i,
                          groundLevelAboveRoadFt: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <SmallLabel>
                  These inputs are stored in quote inputs and used in downstream
                  calculations/PDFs.
                </SmallLabel>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 border rounded py-3 bg-white"
                  onClick={() => setStep("input")}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-green-600 text-white py-3 rounded"
                  onClick={saveRatesToServer}
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* QUOTE */}
          {step === "quote" && (
            <div className="space-y-4 pb-4 pt-2">
              <h2 className="font-semibold text-lg">Total Construction Cost</h2>

              <div className="border rounded-xl p-3 shadow-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Package</span>
                  <span className="font-medium text-gray-800">
                    {activePackageLocal?.name || packageSnapshot.name}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {(workLines || []).map((row, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>
                        {row?.levelKey || row?.description || row?.code}
                      </span>
                      <span>
                        ₹{Number(row.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {row.quantity || row.area || 0} {row.unit || "sqft"} × ₹
                      {Number(row.rate || 0).toLocaleString("en-IN")} /{" "}
                      {row.unit || "sqft"}
                    </p>
                  </div>
                ))}

                {/* optional works */}
                {(optionalWorks || []).map((ow, idx) => (
                  <div
                    key={`ow-${idx}`}
                    className="bg-white border rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>{ow.title || ow.code}</span>
                      <span>
                        ₹{Number(ow.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {ow.quantity || 0} {ow.unit || ""} × ₹
                      {Number(ow.rate || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

                {/* materials */}
                {(materials || []).map((m, i) => (
                  <div
                    key={`m-${i}`}
                    className="bg-white border rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex justify-between font-medium text-gray-900">
                      <span>{m.description || m.materialCode}</span>
                      <span>
                        ₹{Number(m.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.quantity} {m.unit} × ₹
                      {Number(m.rate || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* totals */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm mt-2">
                <div className="flex justify-between font-semibold text-lg text-green-700">
                  <span>Total (Excl. GST)</span>
                  <span>
                    ₹
                    {Number(
                      totals.subtotal || totals.total || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 ml-4">
                  Effective GST (7.5%)
                </label>
                {gstEnabled && (
                  <span className="text-sm font-semibold text-gray-800">
                    ₹
                    {Number(
                      totals.gstAmount || (totals.subtotal || 0) * 0.18
                    ).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {gstEnabled && (
                <div className="bg-green-100 border border-green-300 p-3 rounded-xl font-bold text-green-800 flex justify-between text-lg">
                  <span>Total (Incl. GST)</span>
                  <span>
                    ₹
                    {Number(
                      totals.total || (totals.subtotal || 0) * 1.18
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="mt-4 border rounded p-2 bg-green-50">
                <p className="text-md font-medium">
                  Project Duration:{" "}
                  <span className="text-lg">{durationInMonths} months</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSaveQuote("draft")}
                  className="w-full border py-3 rounded-lg"
                >
                  Save as Draft
                </button>

                <button
                  onClick={() => handleSaveQuote("save")}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <FiSave /> Save Quotation
                </button>

                <button
                  onClick={() => handleSaveQuote("send")}
                  className="w-full bg-green-600 text-white py-3 rounded-lg"
                >
                  Save & Send (Email / WhatsApp)
                </button>

                <button
                  className="w-full border py-3 rounded-lg"
                  onClick={() => setStep("input")}
                >
                  Edit Inputs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuotation;