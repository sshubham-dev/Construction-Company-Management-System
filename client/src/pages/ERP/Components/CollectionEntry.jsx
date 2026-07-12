import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const CollectionEntry = ({ onClose, editId }) => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, user } = useSelector((state) => {
    return state.auth;
  });
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),

    settlementTo: "COMPANY",

    costCenterId: "",
    clientLedgerId: "",
    receivedInto: "",
    departmentId: "",
    amount: "",
    medium: "",
    referenceNo: "",
    narration: "",
    proofImage: null,
  });
  const [costCenters, setCostCenter] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [uploading, setUploading] = useState(false);

  const PARTY_UNDER = ["Sundry Debtors"];
  const CASH_BANK_UNDER = ["Cash-in-Hand", "Bank Accounts", "Capital Account"];
  const INCLUDED_GROUPS = ["Sundry Creditors", "Indirect Income"];

  useEffect(() => {
    axios
      .get("/api/v1/ledger", {
        params: {
          companyId: user.companyId,
        },
      })
      .then((res) => setLedgers(res.data.data));
    const fetchCostCenter = async () => {
      try {
        const res = await axios.get("/api/v1/cost-center", {
          params: {
            companyId: user.companyId,
          },
        });
        // console.log("Fetched cost centers:", res.data);
        setCostCenter(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCostCenter();

    if (editId) {
      console.log("Edit ID found on mount:", editId);
      fetchData(editId);
    }
  }, []);

  // console.log(ledgers);
  const departments = useMemo(
    () => costCenters.filter((cc) => cc.type === "Department"),
    [costCenters],
  );

  const fetchData = async (id) => {
    try {
      const res = await axios.get(`/api/v1/collection/${id}`);
      const data = res.data;
      console.log(data);

      setForm({
        date: data.date?.slice(0, 10),
        settlementTo: data.settlementTo || "COMPANY",
        costCenterId: data.costCenterId?._id || null,
        departmentId: data.departmentId?._id || null,
        clientLedgerId: data.clientLedgerId?._id || "",
        receivedInto: data.receivedInto?._id || "",
        amount: data.amount || "",
        medium: data.medium || "",
        referenceNo: data.referenceNo || "",
        narration: data.narration || "",
        proofImage: null,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
  };

  const partyLedgers = useMemo(
    () => ledgers.filter((l) => PARTY_UNDER.includes(l?.groupId?.name)),
    [ledgers],
  );

  const cashBankLedgers = useMemo(
    () => ledgers.filter((l) => CASH_BANK_UNDER.includes(l?.groupId?.name)),
    [ledgers],
  );

  const otherLedgers = useMemo(
    () => ledgers.filter((l) => INCLUDED_GROUPS.includes(l?.groupId?.name)),
    [ledgers],
  );

  const filteredCostCenters = useMemo(() => {
    // console.log("Filtering cost centers for departmentId:", departmentId);
    if (!form.departmentId) return [];
    console.log(costCenters);
    return costCenters.filter((cc) => cc.parentId?._id === form.departmentId);
  }, [costCenters, form.departmentId]);

  const findOption = (options, value) => options.find((o) => o.value === value);

  const mapOptions = (arr) =>
    arr.map((l) => ({
      value: l._id,
      label: `${l.name} (${
        l.mailingDetails?.phoneNo ||
        l.referenceType ||
        l?.groupId?.name ||
        l?.type
      })`,
    }));

  const updateForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let toastId;
    try {
      setUploading(true);
      // ✅ show loading toast
      toastId = toast.loading("Uploading image...");
      // compress
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });
      setForm((p) => ({
        ...p,
        proofImage: compressedFile,
      }));
      // ✅ success toast (replaces loading)
      toast.success("Image uploaded successfully", { id: toastId });
    } catch (err) {
      console.log("Upload error", err);
      // ❌ error toast (replaces loading)
      toast.error("Upload failed. Try again.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        fd.append(key, value);
      }
    });

    for (const pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }

    let toastId;
    try {
      toastId = toast.loading("Processing...");
      if (editId !== undefined) {
        await axios.put(`/api/v1/collection/${editId}`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Updated successfully", { id: toastId });
      } else {
        await axios.post("/api/v1/collection", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Created successfully", { id: toastId });
      }
      onClose();
    } catch (err) {
      // ❌ error toast (replaces loading)
      toast.error(err.message || "Failed. Try again.", { id: toastId });
      console.log(err);
    }

    setLoading(false);
  };

  const receivedIntoOptions =
    form.settlementTo === "COMPANY" ? cashBankLedgers : otherLedgers;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Record Client Payment</h2>

      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => {
            updateForm("settlementTo", "COMPANY");
            updateForm("receivedInto", "");
          }}
          className={`flex-1 py-2 text-sm font-medium transition ${
            form.settlementTo === "COMPANY"
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          Company
        </button>

        <button
          type="button"
          onClick={() => {
            updateForm("settlementTo", "OTHER");
            updateForm("receivedInto", "");
          }}
          className={`flex-1 py-2 text-sm font-medium transition ${
            form.settlementTo === "OTHER"
              ? "bg-green-600 text-white"
              : "bg-white"
          }`}
        >
          Other
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* CLIENT */}
        <Select
          options={mapOptions(partyLedgers)}
          value={findOption(mapOptions(partyLedgers), form.clientLedgerId)}
          placeholder="Client *"
          onChange={(v) => updateForm("clientLedgerId", v?.value || "")}
        />

        {/* RECEIVED INTO */}
        <Select
          options={mapOptions(receivedIntoOptions)}
          value={findOption(mapOptions(receivedIntoOptions), form.receivedInto)}
          placeholder={
            form.settlementTo === "COMPANY"
              ? "Receive Into Account *"
              : "Paid To *"
          }
          onChange={(v) => updateForm("receivedInto", v?.value || "")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* DATE */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => updateForm("date", e.target.value)}
          className="border rounded-lg p-2"
        />

        <select
          value={form.medium}
          onChange={(e) => updateForm("medium", e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="">Payment Medium</option>
          <option value="cash">Cash</option>
          <option value="bank">Bank Transfer</option>
          <option value="upi">UPI</option>
          <option value="cheque">Cheque</option>
          {form.settlementTo === "OTHER" && (
            <option value="settlement">Settlement</option>
          )}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Department */}
        <Select
          options={mapOptions(departments)}
          value={findOption(mapOptions(departments), form.departmentId)}
          placeholder="Department *"
          onChange={(v) => {
            updateForm("departmentId", v?.value || "");
            updateForm("costCenterId", "");
          }}
        />

        {/* Service/Site */}
        <Select
          options={mapOptions(filteredCostCenters)}
          value={findOption(mapOptions(filteredCostCenters), form.costCenterId)}
          placeholder="Service / Site"
          isDisabled={!form.departmentId}
          onChange={(v) => updateForm("costCenterId", v?.value || "")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => updateForm("amount", e.target.value)}
          className="border rounded-lg p-2"
        />

        {/* Reference */}
        <input
          placeholder="Reference / UTR / Cheque"
          value={form.referenceNo}
          onChange={(e) => updateForm("referenceNo", e.target.value)}
          className="border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Payment Proof</label>

        <input type="file" accept="image/*" onChange={handleUpload} />

        {form.proofImage && (
          <div className="mt-2 text-xs text-green-600">
            ✓ {form.proofImage.name}
          </div>
        )}
      </div>

      {/* NARRATION */}
      <textarea
        placeholder="Narration.."
        value={form.narration}
        onChange={(e) => updateForm("narration", e.target.value)}
        className="border p-2 rounded w-full"
        required
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading ? "Saving..." : editId ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default CollectionEntry;
