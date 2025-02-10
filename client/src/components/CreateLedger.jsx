import { useState } from "react";

const LedgerModal = ({ isOpen, onClose }) => {
  const [ledger, setLedger] = useState({
    name: "",
    alias: "",
    under: "",
    isGSTApplicable: false,
    isTDSDeductible: false,
    mailingDetails: {
      name: "",
      address: "",
      country: "",
      pincode: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ledger Data:", ledger);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-8">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg md:w-3/4 lg:w-1/2 h-[75vh] md:h-[80vh] md:mt-12 overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Create Ledger</h2>
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
            <label className="text-sm font-medium">Is GST Applicable</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isTDSDeductible"
              checked={ledger.isTDSDeductible}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Is TDS Deductible</label>
          </div>

          {/* Mailing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="mailingDetails.name"
                value={ledger.mailingDetails.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
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
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Country</label>
              <input
                type="text"
                name="mailingDetails.country"
                value={ledger.mailingDetails.country}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Pin Code</label>
              <input
                type="text"
                name="mailingDetails.pincode"
                value={ledger.mailingDetails.pincode}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />
            </div>
          </div>

          {/* Banking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="bankingDetails.name"
                value={ledger.bankingDetails.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
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
                required
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
                required
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
                required
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
                required
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
    </div>
  );
};

export default LedgerModal;