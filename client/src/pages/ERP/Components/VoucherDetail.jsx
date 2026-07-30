import { useState } from "react";
import axios from "axios";
import Header from "./Voucher/Header";
import PartyCard from "./Voucher/PartyCard";
import ReferenceCard from "./Voucher/ReferenceCard";
import EntriesCard from "./Voucher/EntriesCard";
import SummaryCard from "./Voucher/SummaryCard";
import TimelineCard from "./Voucher/TimelineCard";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const API_MAP = {
  contra: "/api/v1/contra/detail",
  journal: "/api/v1/journal/detail",
  payment: "/api/v1/payment/detail",
  receipt: "/api/v1/receipt/detail",
  purchase: "/api/v1/purchase/detail",
  sales: "/api/v1/sales/detail",
};

export default function VoucherDetail() {
  const [voucherData, setVoucher] = useState({
    voucherNo: "PUR-26-27-00012",
    type: "PURCHASE",
    status: "POSTED",

    date: "2026-07-15",

    reference: "INV-4587",

    narration: "Purchase of Cement",

    createdBy: "Shubham",

    postedBy: "Admin",

    createdAt: "15 Jul 2026 10:20 AM",

    postedAt: "15 Jul 2026 10:35 AM",

    party: {
      name: "UltraTech Cement",

      phone: "9876543210",

      gst: "20ABCDE1234F1Z5",

      address: "Ranchi, Jharkhand",
    },

    references: {
      site: "Bhuvi Heights",

      costCenter: "Construction",

      po: "PO-00045",

      grn: "GRN-00018",
    },

    entries: [
      {
        ledger: "Purchase Account",

        type: "DEBIT",

        amount: 100000,
      },

      {
        ledger: "Input CGST",

        type: "DEBIT",

        amount: 9000,
      },

      {
        ledger: "Input SGST",

        type: "DEBIT",

        amount: 9000,
      },

      {
        ledger: "UltraTech Cement",

        type: "CREDIT",

        amount: 118000,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const { voucher, id } = useParams();
  const endpoint = API_MAP[voucher.toLowerCase()];
  useEffect(() => {
    loadVoucher();
  }, [id, voucher]);

  const loadVoucher = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${endpoint}/${id}`);
      console.log(res.data);

      setVoucher(res.data);
    } catch (err) {
      console.log(err);
      // toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl space-y-5 p-2 lg:p-4">
        <Header voucher={voucherData?.voucher} />

        {/* <PartyCard voucher={voucherData?.voucher} /> */}

        <ReferenceCard voucher={voucherData?.voucher} />

        <EntriesCard entries={voucherData?.voucher?.entries} />

        <SummaryCard entries={voucherData?.voucher?.entries} voucher={voucherData?.voucher} />

        <TimelineCard voucher={voucherData?.voucher} />
      </div>
    </div>
  );
}
