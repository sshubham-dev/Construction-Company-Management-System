import React from "react";
import MainLayout from "../../layouts/MainLayout";

export default function ReceiptDetail() {
  return (
    <MainLayout title="Receipt Details">
      {/* Outer container centers the content */}
        <div
          className="space-y-5 pb-6 "
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          {/* Receipt Info */}
          <div className="p-4">
            <div className="flex flex-row  justify-between gap-4 rounded-lg">
              {/* Left Info */}
              <div className="flex flex-col gap-1 flex-[2_2_0px]">
                <p className="text-[#49739c] text-sm font-normal leading-normal">
                  Receipt #12345
                </p>
                <p className="text-[#0d141c] text-base md:text-lg font-bold leading-tight">
                  BuildPro Supplies
                </p>
                <p className="text-[#49739c] text-sm font-normal leading-normal">
                  Date: 2024-01-15 | Amount: ₹5,500
                </p>
              </div>

              {/* Image */}
              <div
                className="w-1/3 bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5e1Y9PCW1XRwVREDGEzf_CyrpWc3YMap-YkN1XaWHb4zd0upd4hx0eL89TL1J3OOvKsiXIOu8yvOgQCuf8DtYaY42DbytgQ-JjURsy13JAun-Fkr8uCfdARMoavK-AwMB-qbZHg-QY39GjPjHGdETF3PvOZLXquSj73E1BJ2GIlA_iBG1qtfyFJ8tjfw0vO7MQGdp_cPdCwhs58PzLvBRT2gOB8EsbrgJs86s7RSFGycVFlhY-NOuwOFOnzqRpIrWk22yZKyZca0")',
                }}
              ></div>
            </div>
          </div>

          {/* Linked Invoices */}
          <h2 className="text-[#0d141c] text-[20px] md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Linked Invoices
          </h2>

          {[
            { date: "2024-01-10", number: "INV-001" },
            { date: "2024-01-12", number: "INV-002" },
          ].map((invoice, i) => (
            <div
              key={i}
              className="flex flex-row items-start sm:items-center gap-3 sm:gap-4 bg-slate-50 px-4 min-h-[72px] py-3"
            >
              <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M72,104a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm8,40h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM232,56V208a8,8,0,0,1-11.58,7.15L192,200.94l-28.42,14.21a8,8,0,0,1-7.16,0L128,200.94,99.58,215.15a8,8,0,0,1-7.16,0L64,200.94,35.58,215.15A8,8,0,0,1,24,208V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z"></path>
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">
                  Invoice Date: {invoice.date}
                </p>
                <p className="text-[#49739c] text-sm font-normal leading-normal line-clamp-2">
                  Invoice #{invoice.number}
                </p>
              </div>
            </div>
          ))}

          {/* Attachments */}
          <h2 className="text-[#0d141c] text-[20px] md:text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            Attachments
          </h2>
          <div className=" overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex flex-wrap p-4 gap-3">
              {[
                {
                  name: "Attachment 1",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAArjQBVqQxtFqisQt4xv4UYGMdm2RxiyXU-VGDMOE-5ZrC49m4ORGwypAhJScD5xFWJnGcvkpYcI-qHayzFtXiU45NJ4e1AkTPSedaPwE0lbSfq31ijnCqaG59YhljfG_YmtqoFvtNmRARfYgfSMjZLv4gd0Q0V0b-UuQis9K8rPrmma_UyfGNgwKxLzP7_Pw_xKogleL7KAHzkN2EEZuz8L53i4ekJFYUy9WALQGB8bWRwXKD9pNCjcCZ3w10e7mc-Qe3TyDH9eE",
                },
                {
                  name: "Attachment 2",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsMtF2RZhaAg8F5fzeKbI7Zi9HsQgrPZK0qzX6ZNITvzbUSQAdFPNw_gVZFEweKTvDAlXFAzUKEOMH2Wdv4c95tBM1UkGQD7KfYXEYfaFqg4GznR_KYyGKB3qmAtGCd6ooCvKIi-hs_ZRa2Uuerybdi96eNEBsQtwhraBukAGZO5cM9G3g7xPeBcnPeMrJRsN1Dbh5hbnjMK5lS0FEGJtKSUjwbZKmBbLQoSqszCc6Geayl_O3IuPxb6aA19rOEQQtKhlFEXQwHWQ",
                },
                {
                  name: "Attachment 3",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4EVDZBsxbTztUSrBq1nDP7SgHnClZF0dxrmue8NVEf83MQAECKdGNcXcS-kpdIgAp9CaR8byI84xIf1tL9epyX2ilu4FO9oSfzrAvCVo_ZU2HMjiU6cvdwIa2EYqgmLz8NwHNbUnIpQ6YokbCLH2_ZQkha8zH6UqRK2obyRCNjwkokSpNaAPJLwsU9IMd3EVoNvN2y4UwPnmYLTVueTdJSNaf6kh0txS7wofNkXN1UrKd9WxUmQcELj4dAVVg3ucxVUSuanVezC4",
                },
                                {
                  name: "Attachment 4",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAArjQBVqQxtFqisQt4xv4UYGMdm2RxiyXU-VGDMOE-5ZrC49m4ORGwypAhJScD5xFWJnGcvkpYcI-qHayzFtXiU45NJ4e1AkTPSedaPwE0lbSfq31ijnCqaG59YhljfG_YmtqoFvtNmRARfYgfSMjZLv4gd0Q0V0b-UuQis9K8rPrmma_UyfGNgwKxLzP7_Pw_xKogleL7KAHzkN2EEZuz8L53i4ekJFYUy9WALQGB8bWRwXKD9pNCjcCZ3w10e7mc-Qe3TyDH9eE",
                },
              ].map((att, i) => (
                <div
                  key={i}
                  className="flex h-full flex-1 flex-col gap-2 rounded-lg min-w-[120px] sm:min-w-40"
                >
                  <div
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                    style={{ backgroundImage: `url(${att.img})` }}
                  ></div>
                  <p className="text-[#0d141c] text-sm sm:text-base font-medium leading-normal text-center sm:text-left">
                    {att.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
    </MainLayout>
  );
}
