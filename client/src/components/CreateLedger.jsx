import { useState } from "react";
import axios from "axios";

const LedgerModal = ({ onClose }) => {
  const [ledger, setLedger] = useState({
    name: "",
    alias: "",
    under: "",
    isGSTApplicable: false,
    isTDSDeductible: false,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setLedger((prev) => ({ ...prev, [name]: checked }));
    } else {
      setLedger((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/ledger', ledger);
      console.log(response)
      console.log("Ledger Data:", ledger);
      onClose();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ledger Name & Alias */}
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
            />
          </div>

        </div>

        {/* Account Group Selection */}
        <div>
          <label className="block text-sm font-medium">Under</label>
          <select
            name="under"
            value={ledger.under}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Ledger Group</option>
            <option value="Capital Account">Capital Account</option>
            <option value="Bank Account">Bank Account</option>
            <option value="Cash-in-Hand">Cash-in-Hand</option>
            <option value="Sundry Debtors">Sundry Debtors</option>
            <option value="Sundry Creditors">Sundry Creditors</option>
            <option value="Expenses">Expenses</option>
            <option value="Income">Income</option>
          </select>
        </div>

        {/* Statutory Details */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="activateInterestCalculation"
            checked={ledger.isGSTApplicable}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-md font-medium">Is GST Applicable</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isTDSDeductible"
            checked={ledger.isTDSDeductible}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-md font-medium">Is TDS Deductible</label>
        </div>

        {/* Mailing Details */}
        <p className="mt-3 font-bold">Mailing Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="mailingDetails.name"
              value={ledger.mailingDetails.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              name="mailingDetails.address"
              value={ledger.mailingDetails.address}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              type="text"
              name="mailingDetails.state"
              value={ledger.mailingDetails.state}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Banking Details */}
          <h3 className="mt-3 font-bold">Banking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="bankingDetails.name"
              value={ledger.bankingDetails.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Account Number</label>
            <input
              type="text"
              name="bankingDetails.acNo"
              value={ledger.bankingDetails.acNo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">IFSC Code</label>
            <input
              type="text"
              name="bankingDetails.ifscCode"
              value={ledger.bankingDetails.ifscCode}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bank Name</label>
            <input
              type="text"
              name="bankingDetails.bankname"
              value={ledger.bankingDetails.bankname}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Branch</label>
            <input
              type="text"
              name="bankingDetails.branch"
              value={ledger.bankingDetails.branch}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Tax Details */}
        <div>
          <label className="block text-sm font-medium">PAN No</label>
          <input
            type="text"
            name="taxRegistrationDetails.gstinUin"
            value={ledger.taxRegistrationDetails.panNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">GSTIN/UIN</label>
          <input
            type="text"
            name="taxRegistrationDetails.gstinUin"
            value={ledger.taxRegistrationDetails.gstin}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        {/* Opening Balance */}
        <div>
          <label className="block text-sm font-medium">Opening Balance</label>
          <input
            type="number"
            name="openingBalance"
            value={ledger.openingBalance}
            onChange={handleChange}
            min='0'
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        {/* Action Buttons */}
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