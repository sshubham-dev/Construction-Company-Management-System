import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const CreateLedger = ({ onClose, editData }) => {
  const isEdit = Boolean(editData?._id);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  /* =========================
     STATE
  ========================== */
  const [ledger, setLedger] = useState({
    name: "",
    alias: "",
    groupId: "",
    companyId: "",
    mailingDetails: {
      name: "",
      phoneNo: "",
      email: "",
      address: "",
      state: "",
    },
    bankingDetails: {
      accountHolder: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branch: "",
    },
    statutoryDetails: {
      isGSTApplicable: false,
      isTDSDeductible: false,
    },
    taxDetails: {
      panNo: "",
      gstNo: "",
    },
    openingBalance: 0,
  });

  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [references, setReferences] = useState([]);
  const [company, setCompany] = useState([]);
  const [referenceType, setReferenceType] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD MASTER DATA
  ========================== */
  useEffect(() => {
    const fetchGroups = async () => {
      const res = await axios.get("/api/v1/ledger-group", {
        params: { companyId: user?.companyId },
      });
      console.log(res.data);
      setLedgerGroups(res.data || []);
    };

    const fetchCompany = async () => {
      const res = await axios.get("/api/v1/company");
      // console.log(res.data);
      setCompany(res.data);
    };
    fetchGroups();
    fetchCompany();
  }, []);

  /* =========================
     EDIT MODE
  ========================== */
  useEffect(() => {
    if (!isEdit) return;

    const fetchLedger = async () => {
      try {
        const res = await axios.get(`/api/v1/ledger/${editData._id}`);
        setLedger({
          ...res.data,
          companyId: res.data.companyId?._id || "",
          groupId: res.data.groupId?._id || "",
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchLedger();
    setReferenceType(editData.referenceType || "");
    setReferenceId(editData.referenceId || "");
  }, [editData]);

  /* =========================
     LOAD REFERENCES
  ========================== */
  useEffect(() => {
    if (!referenceType) return setReferences([]);

    axios
      .get(`/api/v1/${referenceType.toLowerCase()}`, {
        params: { companyId: ledger?.companyId },
      })
      .then((res) => setReferences(res.data || []))
      .catch(() => setReferences([]));
  }, [referenceType]);

  /* =========================
     HANDLE CHANGE
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
        referenceType,
        referenceId,
      };
      console.log(payload);
      if (isEdit) {
        await axios.put(`/api/v1/ledger/${editData._id}`, payload);
        toast.success("Ledger updated");
      } else {
        await axios.post("/api/v1/ledger", payload);
        toast.success("Ledger created");
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving ledger");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     OPTIONS
  ========================== */
  const groupOptions = ledgerGroups.map((g) => ({
    label: g.name,
    value: g._id,
  }));

  const companyOptions = company.map((c) => ({
    label: c.name,
    value: c._id,
  }));

  const referenceOptions = references.map((r) => ({
    label: r.name,
    value: r._id,
  }));

  /* =========================
     UI
  ========================== */
  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-6">
      {/* BASIC */}
      <div className="grid md:grid-cols-2 gap-4 h-full">
        <input
          name="name"
          value={ledger.name}
          onChange={handleChange}
          placeholder="Ledger Name"
          className="border p-2 w-full rounded"
          required
        />

        <input
          name="alias"
          value={ledger.alias}
          onChange={handleChange}
          placeholder="Alias"
          className="border p-2 w-full rounded"
        />
      </div>

      {/* COMPANY */}
      <Select
        options={companyOptions}
        value={companyOptions.find((c) => c.value === ledger.companyId)}
        onChange={(e) =>
          setLedger((prev) => ({
            ...prev,
            companyId: e?.value || "",
          }))
        }
        placeholder="Company"
      />

      {/* GROUP */}
      <Select
        options={groupOptions}
        value={groupOptions.find((g) => g.value === ledger.groupId)}
        onChange={(e) =>
          setLedger((prev) => ({ ...prev, groupId: e?.value || "" }))
        }
        placeholder="Ledger Group"
      />

      {/* MAILING */}
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
            name="mailingDetails.phoneNo"
            value={ledger.mailingDetails.phoneNo}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border p-2 rounded"
          />
          <input
            name="mailingDetails.email"
            value={ledger.mailingDetails.email}
            onChange={handleChange}
            placeholder="Email"
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

            {/* STATUTORY */}
      <div className="flex gap-6">
        <label>
          <input
            type="checkbox"
            name="statutoryDetails.isGSTApplicable"
            checked={ledger.statutoryDetails.isGSTApplicable}
            onChange={handleChange}
          />{" "}
          GST
        </label>

        <label>
          <input
            type="checkbox"
            name="statutoryDetails.isTDSDeductible"
            checked={ledger.statutoryDetails.isTDSDeductible}
            onChange={handleChange}
          />{" "}
          TDS
        </label>
      </div>

      {/* BANK */}
      <div>
        <h3 className="font-medium mb-2">Bank Detail</h3>
        <div className="space-y-2 border px-4 py-6 rounded">
          <input
            name="bankingDetails.accountHolder"
            value={ledger.bankingDetails.accountHolder}
            onChange={handleChange}
            placeholder="Account Holder"
            className="border p-2 w-full rounded"
          />
          <input
            name="bankingDetails.bankName"
            value={ledger.bankingDetails.bankName}
            onChange={handleChange}
            placeholder="Bank Name"
            className="border p-2 w-full rounded"
          />
          <input
            name="bankingDetails.accountNumber"
            value={ledger.bankingDetails.accountNumber}
            onChange={handleChange}
            placeholder="Account Number"
            className="border p-2 w-full rounded"
          />
          <input
            name="bankingDetails.ifscCode"
            value={ledger.bankingDetails.ifscCode}
            onChange={handleChange}
            placeholder="IFSC Code"
            className="border p-2 w-full rounded"
          />
          <input
            name="bankingDetails.branch"
            value={ledger.bankingDetails.branch}
            onChange={handleChange}
            placeholder="Branch"
            className="border p-2 w-full rounded"
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
          className="border p-2 w-full rounded"
        />
      )}

      {/* REFERENCE */}
      {!isEdit && (
        <>
          <Select
            options={[
              { label: "Site", value: "Site" },
              { label: "Contractor", value: "Contractor" },
              { label: "Supplier", value: "Supplier" },
              { label: "Employee", value: "Employee" },
            ]}
            onChange={(e) => setReferenceType(e?.value || "")}
            placeholder="Reference Type"
          />

          <Select
            options={referenceOptions}
            onChange={(e) => setReferenceId(e?.value || "")}
            placeholder="Select Reference"
            isDisabled={!referenceType}
          />
        </>
      )}

      {/* ACTION */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-gray">
          Cancel
        </button>

        <button disabled={loading} className="btn-primary">
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateLedger;
