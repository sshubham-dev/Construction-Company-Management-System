import { useEffect, useState } from "react";

const VoucherReview = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchVouchers = async () => {
    const res = await fetch("/api/v1/voucher?status=DRAFT");
    const data = await res.json();
    setVouchers(data);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const postVoucher = async (id) => {
    await fetch(`/api/v1/voucher/post/${id}`, { method: "POST" });
    fetchVouchers();
  };

  return (
    <div style={{ display: "flex" }}>
      {/* LEFT */}
      <div style={{ width: "40%" }}>
        {vouchers.map((v) => (
          <div key={v._id} onClick={() => setSelected(v)}>
            <p>{v.voucherNo}</p>
            <p>{v.type}</p>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ width: "60%" }}>
        {selected && (
          <>
            <h3>{selected.voucherNo}</h3>

            {selected.entries.map((e, i) => (
              <div key={i}>
                {e.ledgerId.name} | {e.type} | {e.amount}
              </div>
            ))}

            <button onClick={() => postVoucher(selected._id)}>
              POST
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoucherReview;