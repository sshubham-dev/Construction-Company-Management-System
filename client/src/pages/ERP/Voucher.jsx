import React, { useState } from "react";
import { useParams } from "react-router-dom";
import VoucherList from "./Components/VoucherList";
import CreateContra from "../../components/CreateContra";
import Modal from "../../components/Modal";
import CreateReceipt_Payment from "../../components/CreateReceipt_Payment";
import CreateJournal from "../../components/CreateJournal";

const Voucher = () => {
  const { voucher } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(voucher)
  const displayVoucher = (voucher) => {
    switch (voucher) {
      case "contra":
        return <CreateContra onClose={() => setIsModalOpen(false)} />;
      case "payment":
        return <CreateReceipt_Payment onClose={() => setIsModalOpen(false)}  type = "Payment" />;
      case "receipt":
        return <CreateReceipt_Payment onClose={() => setIsModalOpen(false)}  type = "Receipt" />;
      case "journal":
        return <CreateJournal onClose={() => setIsModalOpen(false)} />;
      default:
        return null;
    }
  };
  return (
    <div>
      <>
        <VoucherList type={voucher} onCreate={() => setIsModalOpen(true)} />
        {/*  MODAL */}
        <Modal
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          head={`Create ${voucher.charAt(0).toUpperCase() + voucher.slice(1)}`}
        >
            {displayVoucher(voucher)}
        </Modal>
      </>
    </div>
  );
};

export default Voucher;
