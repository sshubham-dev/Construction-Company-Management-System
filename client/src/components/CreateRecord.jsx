import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const CreateRecord = ({ userId, onClose }) => {
  const [sites, setSite] = useState([]);
  const [record, setRecord] = useState({
    recordFor: '',
    site: '',
    purpose: '',
    unit: '',
    amount: '',
    quantity: '',
    rate: '',
    paidTo: '',
    paymentMode: '',
    remarks: '',
    slip: '',
  })
  const [contractors, setContractor] = useState([]);
  const units = ['SQFT', 'RFT', 'LUMSUM', 'NOS', 'FIXED', 'RMT', 'SQMT', 'CUM', '₹', 'BAG', 'KG', 'BUNDLE', 'LOAD', 'HYVA', 'TRACTOR', 'M', 'MM', 'FT', 'INCH'];
  const kharchiFor = ['Material Record', 'Labour Payment', 'Extra Work', 'Other Expenses'];
  const paymentmode = ['Cash', 'Account']
  const [userid, setUserId] = useState(null)

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get('/api/v1/site');
        setSite(response.data)
        console.log(response)
      } catch (error) {
        console.error(error.message)
      }
    };

    const fetchContractor = async () => {
      try {
        const contractorData = await axios.get('/api/v1/contractor');
        setContractor(contractorData.data);
      } catch (error) {
        console.error(error.message)
      }
    };

    fetchSite();
    fetchContractor()

    if (userId) {
      console.log(userId)
      setUserId(userId)
    }
  }, [])

  const handleChange = (field, value) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
  };

  const RecordFor = (name) => {
    switch (name) {
      case 'Material Record':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="paidTo"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Supplier
              </label>
              <input
                name="paidTo"
                onChange={(e) => handleChange('paidTo', e.target.value)}
                placeholder='Supplier'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={record.paidTo} />
            </div>
            <div className="mb-4">
              <label
                htmlFor="purpose"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Item
              </label>
              <input
                name="purpose"
                value={record.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder='purpose'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="unit" className="block text-gray-700 text-sm font-bold mb-2">
                Unit:
              </label>
              <select
                name="unit"
                value={record.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select a Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="rate"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Rate
              </label>
              <input
                type="number"
                name="rate"
                onChange={(e) => handleChange('rate', e.target.value)}
                placeholder="Enter The Rate"
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="Enter The Quantity"
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Enter The Amount"
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMode" className="block text-gray-700 text-sm font-bold mb-2">
                Payment Mode:
              </label>
              <select
                name="paymentMode"
                value={record.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select The Mode of Payment</option>
                {paymentmode.map((mode, index) => (
                  <option key={index} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </>
        )
        break;

      case 'Labour Payment':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="paidTo"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Contractor
              </label>
              <select
                name="paidTo"
                onChange={(e) => handleChange('paidTo', e.target.value)}
                value={record.paidTo}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="" disabled>Select The Contractor</option>
                <option value="cash">Cash</option>
                <option value="account">Account</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="purpose"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Work
              </label>
              <input
                name="purpose"
                value={record.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder='Work'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="unit" className="block text-gray-700 text-sm font-bold mb-2">
                Unit:
              </label>
              <select
                name="unit"
                value={record.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select a Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="rate"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Rate
              </label>
              <input
                type="number"
                name="rate"
                placeholder="Enter The Rate"
                onChange={(e) => handleChange('rate', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                placeholder="Enter The Quantity"
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter The Amount"
                onChange={(e) => handleChange('amount', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMode" className="block text-gray-700 text-sm font-bold mb-2">
                Payment Mode:
              </label>
              <select
                name="paymentMode"
                value={record.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select The Mode of Payment</option>
                {paymentmode.map((mode, index) => (
                  <option key={index} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </>
        )
        break;

      case 'Extra Work':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="paidTo"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Payment To
              </label>
              <input
                name="paidTo"
                onChange={(e) => handleChange('paidTo', e.target.value)}
                value={record.paidTo}
                placeholder='Paid To'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="purpose"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Purpose
              </label>
              <input
                name="purpose"
                value={record.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder='Purpose'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="unit" className="block text-gray-700 text-sm font-bold mb-2">
                Unit:
              </label>
              <select
                name="unit"
                value={record.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select a Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="rate"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Rate
              </label>
              <input
                type="number"
                name="rate"
                placeholder="Enter The Rate"
                onChange={(e) => handleChange('rate', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                placeholder="Enter The Quantity"
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter The Amount"
                onChange={(e) => handleChange('amount', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMode" className="block text-gray-700 text-sm font-bold mb-2">
                Payment Mode:
              </label>
              <select
                name="paymentMode"
                value={record.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select The Mode of Payment</option>
                {paymentmode.map((mode, index) => (
                  <option key={index} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </>
        )
        break;

      case 'Other Expenses':
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="paidTo"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Payment To
              </label>
              <input
                name="paidTo"
                onChange={(e) => handleChange('paidTo', e.target.value)}
                value={record.paidTo}
                placeholder='Paid To'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="purpose"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Purpose
              </label>
              <input
                name="purpose"
                value={record.purpose}
                placeholder='Purpose'
                onChange={(e) => handleChange('purpose', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="unit" className="block text-gray-700 text-sm font-bold mb-2">
                Unit:
              </label>
              <select
                name="unit"
                value={record.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select a Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="rate"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Rate
              </label>
              <input
                type="number"
                name="rate"
                placeholder="Enter The Rate"
                onChange={(e) => handleChange('rate', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                placeholder="Enter The Quantity"
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter The Amount"
                onChange={(e) => handleChange('amount', e.target.value)}
                className="border p-2 rounded w-full" />
            </div>
            <div className="mb-4">
              <label htmlFor="paymentMode" className="block text-gray-700 text-sm font-bold mb-2">
                Payment Mode:
              </label>
              <select
                name="paymentMode"
                value={record.paymentMode}
                onChange={(e) => handleChange('paymentMode', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option>Select The Mode of Payment</option>
                {paymentmode.map((mode, index) => (
                  <option key={index} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </>
        )
        break;

      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userid !== '') {
      console.log(userid)
    } else {
      console.log(record)
    }
    onClose()
  }

  return (
    <div >
      <form className="max-w-md mx-auto" onSubmit={handleSubmit}>

        <div className="mb-4">
          <label
            htmlFor="purpose"
            className="block text-sm font-semibold text-gray-600 mb-2">
            Purpose
          </label>
          <select
            name="purpose"
            value={record.recordFor || ""} // Ensure recordFor has a valid default value
            onChange={(e) => handleChange("recordFor", e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="" disabled>
              Select The Purpose
            </option>
            {kharchiFor.map((purpose, index) => (
              <option key={index} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor='site' className="block text-sm font-medium text-gray-600 mb-2">Site</label>
          <select
            name='site'
            value={record.site}
            required
            onChange={(e) => handleChange('site', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" >
            <option>Site</option>
            {sites?.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div>{RecordFor(record.recordFor)}</div>

        {record.recordFor && (
          <>
            <div className="mb-4">
              <label
                htmlFor="remarks"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Remarks
              </label>
              <input
                name="remarks"
                value={record.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder='Remarks'
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>

            <div className="mb-4">
              <label
                htmlFor="slip"
                className="block text-sm font-semibold text-gray-600 mb-2">
                Slip
              </label>
              <input
                type='file'
                name="slip"
                value={record.slip}
                onChange={(e) => handleChange('slip', e.target.value)}
                placeholder='slip'
                className="appearance-none w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
          </>
        )}

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 mt-4 text-white px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300" >
            Add Expenses
          </button>
        </div>

      </form>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </div>
  )
}


export default CreateRecord