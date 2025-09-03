import { useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';

const LedgerModal = ({ onClose }) => {
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
      gstin: "",
    },
    bankingDetails: {
      name: '',
      acNo: '',
      ifscCode: '',
      bankname: '',
      branch: '',
    },
    openingBalance: 0,
  });
  const [referenceType, setReferenceType] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [createCostCenter, setCreateCostCenter] = useState(false);
  const [users, setUser] = useState([]);
  const [ledgerGroups, setLedgerGroup] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/v1/user/lists')
        setUser(response.data)
      } catch (error) {
        console.log(error)
      }
    };
    const fetchGroup = async () => {
      const response = await axios.get('/api/v1/ledger-group')
      setLedgerGroup(response.data)
    };
    fetchGroup();
    fetchUser()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('mailingDetails.')) {
      const mailingField = name.split('.')[1];
      setLedger((prev) => ({
        ...prev,
        mailingDetails: {
          ...prev.mailingDetails,
          [mailingField]: value,
        },
      }));
    } else if (name.startsWith('taxRegistrationDetails.')) {
      const taxField = name.split('.')[1];
      setLedger((prev) => ({
        ...prev,
        taxRegistrationDetails: {
          ...prev.taxRegistrationDetails,
          [taxField]: value,
        },
      }));
    } else if (name.startsWith('bankingDetails.')) {
      const bankingField = name.split('.')[1];
      setLedger((prev) => ({
        ...prev,
        bankingDetails: {
          ...prev.bankingDetails,
          [bankingField]: value,
        },
      }));
    } else if (name.startsWith('statutoryDetails.')) {
      const field = name.split('.')[1];
      setLedger((prev) => ({
        ...prev,
        statutoryDetails: {
          ...prev.statutoryDetails,
          [field]: checked,
        },
      }));
    } else if (type === "checkbox") {
      setLedger((prev) => ({ ...prev, [name]: checked }));
    } else {
      setLedger((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/ledger', {
        ...ledger,
        refrenceType: referenceType,
        refrenceId: referenceId,
        createCostCenter,
      });
      console.log("Ledger Data:", ledger);
      onClose();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={ledger.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Alias</label>
            <input
              type="text"
              name="alias"
              value={ledger.alias}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Under</label>
          <Select
            value={{ value: ledger.under, label: ledger.under }}
            onChange={(selectedOption) => setLedger((prev) => ({ ...prev, under: selectedOption.value }))}
            options={ledgerGroups.map(ledgerGroup => ({ value: ledgerGroup.name, label: ledgerGroup.name }))}
            placeholder="Ledger Group"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="statutoryDetails.isGSTApplicable"
            checked={ledger.statutoryDetails.isGSTApplicable}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-md font-medium">Is GST Applicable</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="statutoryDetails.isTDSDeductible"
            checked={ledger.statutoryDetails.isTDSDeductible}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-md font-medium">Is TDS Deductible</label>
        </div>

        <p className="mt-3 font-bold">Mailing Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" name="mailingDetails.name" value={ledger.mailingDetails.name} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Name" />
          <input type="text" name="mailingDetails.address" value={ledger.mailingDetails.address} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Address" />
          <input type="text" name="mailingDetails.state" value={ledger.mailingDetails.state} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="State" />
        </div>

        <h3 className="mt-3 font-bold">Banking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" name="bankingDetails.name" value={ledger.bankingDetails.name} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Name" />
          <input type="text" name="bankingDetails.acNo" value={ledger.bankingDetails.acNo} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Account Number" />
          <input type="text" name="bankingDetails.ifscCode" value={ledger.bankingDetails.ifscCode} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="IFSC Code" />
          <input type="text" name="bankingDetails.bankname" value={ledger.bankingDetails.bankname} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Bank Name" />
          <input type="text" name="bankingDetails.branch" value={ledger.bankingDetails.branch} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" placeholder="Branch" />
        </div>

        <div>
          <label className="block text-sm font-medium">PAN No</label>
          <input type="text" name="taxRegistrationDetails.panNo" value={ledger.taxRegistrationDetails.panNo} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">GSTIN/UIN</label>
          <input type="text" name="taxRegistrationDetails.gstin" value={ledger.taxRegistrationDetails.gstin} onChange={handleChange} className="w-full border px-3 py-2 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">Opening Balance</label>
          <input type="number" name="openingBalance" value={ledger.openingBalance} onChange={handleChange} min='0' className="w-full border px-3 py-2 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium">Reference Type</label>
          <Select
            value={{ label: referenceType, value: referenceType }}
            onChange={(e) => setReferenceType(e.value)}
            options={[
              { label: "Client", value: "Client" },
              { label: "Site", value: "Site" },
              { label: "Contractor", value: "Contractor" },
              { label: "Supplier", value: "Supplier" },
              { label: "Employee", value: "Employee" },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Reference</label>
          <Select
            value={referenceId}
            onChange={(e) => setReferenceId(e.value)}
            options={users
              .filter(u => u.role?.toLowerCase() === referenceType?.toLowerCase())
              .map(u => ({ value: u._id, label: u.userName }))}
            placeholder={`Select ${referenceType}`}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="createCostCenter"
            checked={createCostCenter}
            onChange={(e) => setCreateCostCenter(e.target.checked)}
            className="mr-2"
          />
          <label className="text-md font-medium">Also create Cost Center</label>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Save Ledger
          </button>
        </div>
      </form>
    </div>
  );
};

export default LedgerModal;
