const crypto = require("crypto");

/* =====================================
   GENERATE TOKEN
===================================== */

const generateRFQToken = () => {
    return crypto
        .randomBytes(24)
        .toString("hex");
};

/* =====================================
   GENERATE SUPPLIER LINK
===================================== */

const generateSupplierRFQLink = (
    token
) => {
    return `${process.env.CLIENT_URL}/vendor/rfq/${token}`;
};

/* =====================================
   GENERATE SHARE MESSAGE
===================================== */

const generateRFQShareMessage = ({
    supplierName,
    rfqNo,
    link,
    deadline,
}) => {
    return `
Hello ${supplierName},

You are invited to submit quotation for RFQ ${rfqNo}.

Please submit your quotation using the link below:

${link}

Quotation Deadline: ${deadline}

Regards,
Bhuvi Procurement Team
  `;
};

module.exports = {
    generateRFQToken,
    generateSupplierRFQLink,
    generateRFQShareMessage,
};