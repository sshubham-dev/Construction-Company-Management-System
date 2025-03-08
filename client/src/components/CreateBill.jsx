import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

axios.defaults.withCredentials = true;

const CreateBill = ({ onClose, isEdit }) => {
  const [sites, setSite] = useState([]);
  const [data, setData] = useState({
    site: '',
    contractor: '',
  });
  const [bill, setBill] = useState({
    site: '',
    contractor: '',
    billOf: '',
    billNo: '',
    toPay: '',
    amount: '',
    unit: '',
    dateOfPayment: '',
    paymentStatus: '',
    reason: '',
    paidAmount: '',
    dueAmount: '',
  });
  const [contractors, setContractor] = useState([]);
  const status = ['Due', 'Paid', 'Pending'];
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [billToEdit, setBillToEdit] = useState(null);
  const [billWork, setBillWork] = useState([]);
  const [paymentDetail, setPaymentDetail] = useState({});
  const units = ['%', '₹']

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await axios.get('/api/v1/site');
        if (user.department === 'Site Supervisor' || user.department === 'Site Incharge') {
          const existingSites = user?.site;
          let Sites = [];
          for (let site of response.data) {
            if (existingSites.includes(site._id)) {
              Sites.push(site);
            }
          }
          setSite(Sites)
        } else {
          setSite(response.data)
        }
      } catch (error) {
        console.error(error.message)
      }
    };
    fetchSite();
    if (isEdit) {
      setBillToEdit(isEdit)
      fetchBill(isEdit)
    }
  }, [])

  useEffect(() => {
    const siteId = bill.site;
    let siteData = [];
    if (siteId) {
      siteData = sites.filter((site) => site._id === siteId);
    }
    console.log(siteData)
    setContractor(siteData[0]?.contractor || '');
  }, [bill.site]);

  useEffect(() => {
    const getWorkOrder = async () => {
      try {
        const response = await axios.get(`/api/v1/work-order/${bill.site}/${bill.contractor}`);
        // console.log(response.data.map((workOrder) => workOrder.work?.filter((work) => work?.due !== 0 && work?.status !== 'Pending')))
        setBillWork(...response.data.map((workOrder) => workOrder.work?.filter((work) => work?.due !== 0 && work?.status === 'Pending')))
      } catch (error) {
        console.error(error);
        // toast.error(error.message);
      }
    }
    getWorkOrder();
  }, [bill.contractor])
  console.log('work:', billWork)


  useEffect(() => {
    console.log(billWork.filter((work) => work?.workDetail === bill.billOf)[0])
    setPaymentDetail(billWork.filter((work) => work?.workDetail === bill.billOf)[0])
  }, [bill.billOf])
  // console.log(paymentDetail)

  const fetchBill = async (id) => {
    try {
      const billData = await axios.get(`/api/v1/bill/${id}`);
      // console.log(billData.data)
      setData({
        site: billData.data.site?.name,
        contractor: billData.data.contractor?.name,
      })

      setBill({
        site: billData.data?.site._id,
        contractor: billData.data.contractor?._id,
        billOf: billData.data?.billOf.workDetail,
        toPay: billData.data.toPay,
        billNo: billData.data.billNo,
        amount: billData.data?.amount,
        createdBy: billData.data?.createdBy?._id,
        dateOfPayment: billData.data?.dateOfPayment,
        paymentStatus: billData.data?.paymentStatus,
        reason: billData.data?.reason,
        paidAmount: billData.data?.paidAmount,
        dueAmount: billData.data?.dueAmount,
      })
      // console.log(billData.data?.billOf)
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const handleChange = (field, data) => {
    setBill({
      ...bill,
      [field]: data,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (billToEdit) {
        // console.log(bill)
        const paid = parseFloat(bill.paidAmount);
        const updateBill = await axios.put(`/api/v1/bill/${billToEdit}`, bill);
        if (updateBill) {
          console.log(updateBill.data)
          toast.success(updateBill.data.message);
          onClose()
        }
      } else {
        console.log(bill)
        const response = await axios.post('/api/v1/bill', bill);
        console.log(response.data?.ContractorBill)
        toast.success(response.data.message);
        onClose()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const Update = () => {
    return (
      <>
        <div className="mb-4">
          <label htmlFor='dateOfPayment' className="block text-sm font-semibold text-gray-600 mb-2">
            Date of Payment
          </label>
          <input
            type="date"
            name='dateOfPayment'
            value={bill.dateOfPayment}
            onChange={(e) => handleChange('dateOfPayment', e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor='paidAmount' className="block text-sm font-semibold text-gray-600 mb-2">
            Paid Amount
          </label>
          <input
            type="text"
            id='paidAmount'
            name='paidAmount'
            value={bill.paidAmount}
            onChange={(e) => handleChange('paidAmount', e.target.value)}
            placeholder="Paid Amount"
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor='dueAmount' className="block text-sm font-semibold text-gray-600 mb-2">
            Due Amount
          </label>
          <input
            type="number"
            id='dueAmount'
            name='dueAmount'
            value={bill.dueAmount}
            readOnly
            onChange={(e) => handleChange('dueAmount', e.target.value)}
            placeholder="Due Amount"
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="paymentStatus" className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
          <select
            id='paymentStatus'
            value={bill.paymentStatus}
            onChange={(e) => handleChange('paymentStatus', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>
              {billToEdit ? bill.paymentStatus :
                'Status'
              }
            </option>
            {status.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </>
    )
  }

  return (
    <div >
      <form className="max-w-md mx-auto" onSubmit={handleSubmit}>

        <div className="mb-4">
          <label htmlFor='site' className="block text-sm font-medium text-gray-600 mb-2">Site</label>
          <select
            name='site'
            value={bill.site}
            required
            onChange={(e) => handleChange('site', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>{billToEdit ? data.site : 'Site'}</option>
            {sites?.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="contractor" className="block text-sm font-medium text-gray-600 mb-2">
            Choose Contractor
          </label>
          <select
            name="contractor"
            value={bill.contractor}
            onChange={(e) => handleChange('contractor', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option>{billToEdit ? data.contractor : 'Contractor'}</option>
            {contractors && contractors?.map((contractor) => (
              <option key={contractor?._id} value={contractor?._id}>
                {contractor?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor='work'
            className="block text-sm font-medium text-gray-600 mb-2">
            Work
          </label>
          <select
            value={bill.billOf}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={(e) => handleChange('billOf', e.target.value)}>
            <option>{billToEdit ? bill?.billOf : 'Work'}</option>
            {billWork?.map((work, index) => (
              <option key={index} value={work.workDetail}>
                {work.workDetail}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor='toPay' className="block text-sm font-medium text-gray-600 mb-2">To Pay</label>
          <input
            type='text'
            name='toPay'
            id='toPay'
            value={bill.toPay}
            onChange={(e) => handleChange('toPay', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {billToEdit ? <Update /> : ''}

        <div className="mb-4">
          <h2 className="block text-lg font-semibold text-gray-600 mb-4 mt-2">Detail</h2>
          <p className="text-md font-medium text-gray-600 my-1">Rate: {paymentDetail?.rate}{'/' + paymentDetail?.unit}</p><hr />
          <p className="text-md font-medium text-gray-600 my-1">Quantity: {paymentDetail?.area}</p><hr />
          <p className="text-md font-medium text-gray-600 my-1">Total Amount: ₹ {paymentDetail?.amount}</p><hr />
          <p className="text-md font-medium text-gray-600 my-1">Work Status: {paymentDetail?.status}</p><hr />
          <p className="text-md font-medium text-gray-600 my-1">Amount Paid: {paymentDetail?.paid}</p><hr />
          <p className="text-md font-medium text-gray-600 my-1">Amount Due: {paymentDetail?.due}</p><hr />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            {billToEdit ? 'Update Bill' : 'Create Bill'}
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

export default CreateBill