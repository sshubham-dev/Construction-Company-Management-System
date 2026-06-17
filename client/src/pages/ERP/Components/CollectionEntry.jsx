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

  const PARTY_UNDER = ["Sundry Debtors", "Direct Income", "Indirect Income"];
  const CASH_BANK_UNDER = ["Cash-in-Hand", "Bank Accounts"];

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

  console.log(ledgers);
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
        costCenterId: data.costCenterId?._id || null,
        departmentId: data.departmentId?._id || null,
        clientLedgerId: data.clientLedgerId?._id || "",
        receivedInto: data.receivedInto?._id || "",
        amount: data.amount || "",
        medium: data.medium || "",
        referenceNo: data.referenceNo || "",
        narration: data.narration || data.purpose || "",
        proofImage: null, // don't prefill file
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

  const filteredCostCenters = useMemo(() => {
    // console.log("Filtering cost centers for departmentId:", departmentId);
    if (!form.departmentId) return [];
    return costCenters.filter((cc) => cc.parentId === form.departmentId);
  }, [costCenters, form.departmentId]);

  const findOption = (options, value) => options.find((o) => o.value === value);

  const mapOptions = (arr) =>
    arr.map((l) => ({
      value: l._id,
      label: `${l.name} (${
        l.mailingDetails?.phoneNo ||
        l.referenceType ||
        l?.groupId?.name
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
      toast.error("Failed. Try again.", { id: toastId });
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Record Client Payment</h2>

      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e) => updateForm("date", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* CLIENT */}
      <Select
        options={mapOptions(partyLedgers)}
        value={findOption(mapOptions(partyLedgers), form.clientLedgerId)}
        placeholder="Select Client"
        onChange={(v) => updateForm("clientLedgerId", v?.value || "")}
      />

      {/* RECEIVED INTO */}
      <Select
        options={mapOptions(cashBankLedgers)}
        value={findOption(mapOptions(cashBankLedgers), form.receivedInto)}
        placeholder="Select Bank"
        onChange={(v) => updateForm("receivedInto", v?.value || "")}
      />

      <Select
        options={mapOptions(departments)}
        placeholder="Select Department"
        value={findOption(mapOptions(departments), form.departmentId)}
        onChange={(v) => {
          setDepartmentId(v?.value || "");
          updateForm("departmentId", v?.value || "");
        }}
      />

      <Select
        options={mapOptions(filteredCostCenters)}
        value={findOption(mapOptions(filteredCostCenters), form.costCenterId)}
        placeholder="Payment For"
        onChange={(v) => updateForm("costCenterId", v?.value || "")}
      />

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={(e) => updateForm("amount", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* PURPOSE */}
      {/* <input
        type="text"
        placeholder="Purpose"
        value={form.purpose}
        onChange={(e) => updateForm("purpose", e.target.value)}
        className="border p-2 rounded w-full"
      /> */}

      {/* MEDIUM */}
      <select
        value={form.medium}
        onChange={(e) => updateForm("medium", e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Payment Medium</option>
        <option value="cash">Cash</option>
        <option value="bank">Bank Transfer</option>
        <option value="upi">UPI</option>
        <option value="cheque">Cheque</option>
      </select>

      {/* REFERENCE */}
      <input
        placeholder="Reference No / UTR / Cheque No"
        value={form.referenceNo}
        onChange={(e) => updateForm("referenceNo", e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* PROOF IMAGE */}
      <input
        type="file"
        accept="image/*"
        // onChange={(e) => updateForm("proofImage", e.target.files[0])}
        onChange={handleUpload}
        className="border p-2 rounded w-full"
      />

      {/* NARRATION */}
      <textarea
        placeholder="Narration.."
        value={form.narration}
        onChange={(e) => updateForm("narration", e.target.value)}
        className="border p-2 rounded w-full"
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
