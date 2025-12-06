import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const CreateReceipt_Payment = ({ onClose }) => {
  const [form, setForm] = useState({
    type: "receipt",
    receiptNo: "",
    paymentNo: "",
    date: "",
    from: "",
    to: "",
    amount: 0,
    description: "",
    paymentFor: "",
    referenceNo: "",
    invoiceType: "",
    invoice: [],
  });
  const [loading, setLoading] = useState(false);
  const [ledgers, setLedger] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchaseRequest, setPurchaseRequest] = useState([]);
  const [returnRequests, setReturnRequest] = useState([]);
  const [paymentSchedules, setpaymentSchedules] = useState([]);
  const [clientExtraWorks, setClientExtraWork] = useState([]);
  const [contractorExtraWorks, setContractorExtraWork] = useState([]);
  const [bill, setBill] = useState([]);
  const {user} = useSelector((state) =>  state.auth)

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const response = await axios.get("/api/v1/ledger");
        setLedger(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchbills = async () => {
      try {
        const billData = await axios.get("/api/v1/bill");
        const bills = billData.data;

        console.log("Bills Fetched:", bills);

        if (
          (user?.department === "Site Supervisor" ||
            user?.department === "Site Incharge") &&
          isLoggedIn
        ) {
          const sites = user?.site;
          const contractorBills = bills.filter((bill) =>
            sites.some(
              (site) => bill.site?.id?._id?.toString() === site.id?.toString()
            )
          );
          console.log("Filtered contractor bills:", contractorBills);
          setBill(contractorBills);
        } else {
          setBill(bills.filter((bill) => bill.billFor === "Contractor"));
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await axios.get("/api/v1/invoices");
        const formatted = response.data.map((inv) => ({
          value: inv._id,
          label: `${inv.name} (${inv.type})`,
          type: inv.type,
        }));
        setInvoices(formatted);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchVoucherNos = async () => {
      try {
        const [receiptRes, paymentRes] = await Promise.all([
          axios.get("/api/v1/receipt/next-voucher"),
          axios.get("/api/v1/payment/next-voucher"),
        ]);
        console.log(receiptRes.data, paymentRes.data);
        setForm((prev) => ({
          ...prev,
          receiptNo: receiptRes.data.receiptNo,
          paymentNo: paymentRes.data.paymentNo,
        }));
      } catch (error) {
        console.error("Error fetching voucher numbers:", error);
      }
    };

    const fetchExtraWork = async () => {
      try {
        const extraWorkData = await axios.get("/api/v1/extra-work");
        let clientExtraWork;
        let contractorExtraWork;
        let draftExtraWork;
        console.log(extraWorkData.data);
        if (
          user.department === "Site Supervisor" ||
          (user.department === "Site Incharge" && isLoggedIn)
        ) {
          const sites = user?.site;
          for (let site of sites) {
            clientExtraWork = extraWorkData.data.filter(
              (extra) =>
                extra.extraFor === "Client" &&
                extra?.site?.id._id === site.id &&
                extra?.approvalStatus !== "Pending"
            );
            contractorExtraWork = extraWorkData.data.filter(
              (extra) =>
                extra.extraFor === "Contractor" &&
                extra?.site?.id._id === site.id &&
                extra?.approvalStatus !== "Pending"
            );
            draftExtraWork = extraWorkData.data.filter(
              (extra) =>
                extra?.site?.id._id === site.id &&
                extra?.approvalStatus === "Pending"
            );
          }
          setClientExtraWork(clientExtraWork);
          setContractorExtraWork(contractorExtraWork);
          setDraftExtraWork(draftExtraWork);
        } else {
          setClientExtraWork(
            extraWorkData.data.filter((extra) => extra.extraFor === "Client")
          );
          setContractorExtraWork(
            extraWorkData.data.filter(
              (extra) => extra.extraFor === "Contractor"
            )
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchpaymentSchedules = async () => {
      try {
        const paymentSchedulesData = await axios.get(
          "/api/v1/payment-schedule"
        );
        if (
          (user.department === "Site Supervisor" ||
            user.department === "Site Incharge") &&
          isLoggedIn
        ) {
          const sites = user?.site;
          let PaymentSchedules = [];
          for (let site of sites) {
            const filteredPaymentSchedules = paymentSchedulesData.data?.filter(
              (paymentSchedule) => paymentSchedule?.site?.id._id === site.id
            );
            PaymentSchedules = [
              ...PaymentSchedules,
              ...filteredPaymentSchedules,
            ];
          }
          setpaymentSchedules(PaymentSchedules);
          console.log("PaymentSchedules for all sites:", PaymentSchedules);
        } else {
          setpaymentSchedules(paymentSchedulesData.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchReturnRequest = async () => {
      try {
        const response = await axios.get("/api/v1/return");
        console.log("API Response:", response.data); // ✅ Debugging log

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid data format: Expected an array");
        }

        if (
          user?.department === "Site Supervisor" ||
          user?.department === "Site Incharge"
        ) {
          const sites = user?.site || [];
          let filteredRequests = [];

          for (let site of sites) {
            const siteRequests = response.data.filter(
              (req) => req.site?.id._id === site.id
            );
            filteredRequests = [...filteredRequests, ...siteRequests];
          }

          setReturnRequest(filteredRequests);
        } else {
          setReturnRequest(response.data);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load return requests.");
        setReturnRequest([]); // ✅ Ensure it remains an array
      }
    };

    const fetchPurchaseRequest = async () => {
      const response = await axios.get("/api/v1/purchase-request");
      console.log(...response.data);
      setPurchaseRequest(response.data);
    };

    fetchExtraWork();
    fetchpaymentSchedules();
    fetchReturnRequest();
    fetchbills();
    fetchPurchaseRequest();
    fetchLedger();
    fetchInvoices();
    fetchVoucherNos();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        form.type === "receipt" ? "/api/v1/receipt" : "/api/v1/payment";
      const payload = {
        ...form,
        invoice: form.invoice.map((inv) => ({
          id: inv.value,
          name: inv.label,
          type: inv.type,
        })),
      };
      delete payload.type;

      const response = await axios.post(endpoint, payload);
      console.log(response);
      setForm({
        type: "receipt",
        receiptNo: "",
        paymentNo: "",
        date: "",
        from: "",
        to: "",
        amount: 0,
        description: "",
        paymentFor: "",
        referenceNo: "",
        invoice: [],
      });
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <select
          name="type"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="receipt">Receipt</option>
          <option value="payment">Payment</option>
        </select>

        <input
          type="text"
          name={form.type === "receipt" ? "receiptNo" : "paymentNo"}
          placeholder={form.type === "receipt" ? "Receipt No" : "Payment No"}
          value={form.type === "receipt" ? form.receiptNo : form.paymentNo}
          onChange={(e) =>
            handleChange(
              form.type === "receipt" ? "receiptNo" : "paymentNo",
              e.target.value
            )
          }
          className="border p-2 w-full"
          readOnly
          disabled
        />

        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="border p-2 w-full"
        />

        <label className="block text-sm font-medium">From Account</label>
        <Select
          options={ledgers.map((ledger) => ({
            value: ledger._id,
            label: ledger.name,
          }))}
          onChange={(e) => handleChange("from", e.value)}
          placeholder="From"
        />

        <label className="block text-sm font-medium">To Account</label>
        <Select
          options={ledgers.map((ledger) => ({
            value: ledger._id,
            label: ledger.name,
          }))}
          onChange={(e) => handleChange("to", e.value)}
          placeholder="To"
        />

        <label className="block text-sm font-medium">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          className="border p-2 w-full"
        />

        <label className="block text-sm font-medium">Reference No</label>
        <input
          type="text"
          name="referenceNo"
          value={form.referenceNo}
          onChange={(e) => handleChange("referenceNo", e.target.value)}
          className="border p-2 w-full"
        />

        <label className="block text-sm font-medium">Invoice Reference</label>
        <Select
          isMulti
          name="invoice"
          options={invoices}
          onChange={(selected) => handleChange("invoice", selected)}
          placeholder="Select Invoices..."
        />

        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="border p-2 w-full"
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            {loading ? "Saving..." : "Create Voucher"}
          </button>
        </div>
      </form>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default CreateReceipt_Payment;
