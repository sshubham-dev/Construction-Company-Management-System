import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const CreateLedger = ({ onClose, editData = null }) => {
  const isEdit = Boolean(editData?._id);

  /* =========================
     STATE
  ========================== */
  const [ledger, setLedger] = useState({
    name: "",
    alias: "",
    under: "",
    statutoryDetails: {
      isGSTApplicable: false,
      isTDSDeductible: false,
    },
    mailingDetails: {
      name: "",
      address: "",
      state: "",
    },
    taxRegistrationDetails: {
      panNo: "",
      gstNo: "",
    },
    bankingDetails: {
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branch: "",
    },
    openingBalance: 0,
  });

  const [referenceType, setReferenceType] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [references, setReferences] = useState([]);

  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    axios.get("/api/v1/ledger-group").then((res) => {
      setLedgerGroups(res.data);
    });
  }, []);

  /* =========================
     LOAD EDIT DATA
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    setLedger({
      name: editData.name,
      alias: editData.alias,
      under: editData.under,
      statutoryDetails: editData.statutoryDetails || {},
      mailingDetails: editData.mailingDetails || {},
      taxRegistrationDetails: editData.taxRegistrationDetails || {},
      bankingDetails: editData.bankingDetails || {},
      openingBalance: editData.openingBalance || 0,
    });

    setReferenceType(editData.referenceType || "");
    setReferenceId(editData.referenceId || "");
  }, [isEdit, editData]);

  /* =========================
     LOAD REFERENCES BASED ON TYPE
  ========================== */
  useEffect(() => {
    if (!referenceType) {
      setReferences([]);
      return;
    }

    axios
      .get(`/api/v1/${referenceType.toLowerCase()}/`)
      .then((res) => setReferences(res.data))
      .catch(() => setReferences([]));
  }, [referenceType]);

  /* =========================
     HANDLE INPUT
  ========================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setLedger((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setLedger((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...ledger,
      };

      // only send reference on create
      if (!isEdit && referenceType && referenceId) {
        payload.referenceType = referenceType;
        payload.referenceId = referenceId;
      }

      if (isEdit) {
        await axios.put(`/api/v1/ledger/${editData._id}`, payload);
      } else {
        await axios.post("/api/v1/ledger", payload);
      }

      onClose();
    } catch (error) {
      console.error("Ledger save error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================== */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* BASIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={ledger.name}
          onChange={handleChange}
          placeholder="Ledger Name"
          className="border p-2 rounded"
          required
        />
        <input
          name="alias"
          value={ledger.alias}
          onChange={handleChange}
          placeholder="Alias"
          className="border p-2 rounded"
        />
      </div>

      {/* GROUP */}
      <Select
        value={
          ledger.under ? { label: ledger.under, value: ledger.under } : null
        }
        onChange={(e) => setLedger((prev) => ({ ...prev, under: e.value }))}
        options={ledgerGroups.map((g) => ({
          label: g.name,
          value: g.name,
        }))}
        placeholder="Ledger Group"
      />

      {/* STATUTORY */}
      <div className="flex gap-6">
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            name="statutoryDetails.isGSTApplicable"
            checked={ledger.statutoryDetails.isGSTApplicable}
            onChange={handleChange}
          />
          GST Applicable
        </label>

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            name="statutoryDetails.isTDSDeductible"
            checked={ledger.statutoryDetails.isTDSDeductible}
            onChange={handleChange}
          />
          TDS Deductible
        </label>
      </div>

      {/* MAILING DETAILS */}
      <div>
        <h4 className="font-medium mb-2">Mailing Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="mailingDetails.name"
            value={ledger.mailingDetails.name}
            onChange={handleChange}
            placeholder="Mailing Name"
            className="border p-2 rounded"
          />

          <input
            name="mailingDetails.state"
            value={ledger.mailingDetails.state}
            onChange={handleChange}
            placeholder="State"
            className="border p-2 rounded"
          />
        </div>

        <textarea
          name="mailingDetails.address"
          value={ledger.mailingDetails.address}
          onChange={handleChange}
          placeholder="Full Address"
          rows={3}
          className="border p-2 rounded w-full mt-2"
        />
      </div>

      {/* BANK */}
      <div>
        <h4 className="font-medium mb-2">Banking Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="bankingDetails.accountHolder"
            value={ledger.bankingDetails.accountHolder}
            onChange={handleChange}
            placeholder="Account Holder"
            className="border p-2 rounded"
          />
          <input
            name="bankingDetails.accountNumber"
            value={ledger.bankingDetails.accountNumber}
            onChange={handleChange}
            placeholder="Account Number"
            className="border p-2 rounded"
          />
          <input
            name="bankingDetails.ifscCode"
            value={ledger.bankingDetails.ifscCode}
            onChange={handleChange}
            placeholder="IFSC Code"
            className="border p-2 rounded"
          />
          <input
            name="bankingDetails.bankName"
            value={ledger.bankingDetails.bankName}
            onChange={handleChange}
            placeholder="Bank Name"
            className="border p-2 rounded"
          />
          <input
            name="bankingDetails.branch"
            value={ledger.bankingDetails.branch}
            onChange={handleChange}
            placeholder="Branch"
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* OPENING BALANCE */}
      {!isEdit && (
        <input
          type="number"
          name="openingBalance"
          value={ledger.openingBalance}
          onChange={handleChange}
          placeholder="Opening Balance"
          className="border p-2 rounded"
        />
      )}

      {/* REFERENCE (CREATE ONLY) */}
      {!isEdit && (
        <>
          <Select
            placeholder="Reference Type"
            value={
              referenceType
                ? { label: referenceType, value: referenceType }
                : null
            }
            onChange={(e) => {
              setReferenceType(e.value);
              setReferenceId("");
            }}
            options={[
              { label: "Client", value: "Client" },
              { label: "Site", value: "Site" },
              { label: "Supplier", value: "Supplier" },
              { label: "Contractor", value: "Contractor" },
              { label: "Employee", value: "Employee" },
            ]}
          />

          <Select
            placeholder={`Select ${referenceType}`}
            isDisabled={!referenceType}
            value={
              references.find((r) => r._id === referenceId)
                ? {
                    label: references.find((r) => r._id === referenceId)?.name,
                    value: referenceId,
                  }
                : null
            }
            onChange={(e) => setReferenceId(e.value)}
            options={references.map((r) => ({
              label: r.name,
              value: r._id,
            }))}
          />
        </>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving..." : isEdit ? "Update Ledger" : "Create Ledger"}
        </button>
      </div>
    </form>
  );
};

export default CreateLedger;
