import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 15,
  },

  businessName: {
    fontSize: 14,
    fontWeight: "bold",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  section: {
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  label: {
    fontSize: 9,
    color: "#555",
  },

  bold: {
    fontWeight: "bold",
  },

  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    paddingBottom: 4,
    marginTop: 10,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "0.5 solid #ddd",
  },

  colDesc: { width: "30%" },
  col: { width: "14%" },

  right: {
    textAlign: "right",
  },

  summary: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  total: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },

  footer: {
    marginTop: 20,
  },

  signature: {
    marginTop: 30,
    textAlign: "right",
  },
});

const InvoicePDF = ({ data }) => {
  const {
    business,
    client,
    items,
    invoiceNo,
    date,
    subtotal,
    cgst,
    sgst,
    igst,
    total,
    amountInWords,
    terms,
    bank,
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.businessName}>{business?.name}</Text>
            <Text>{business?.address}</Text>
            <Text>GSTIN: {business?.gstin}</Text>
            {/* <Text>{business?.email}</Text> */}
          </View>

          <View>
            <Text style={styles.title}>TAX INVOICE</Text>
            <Text>Invoice No: {invoiceNo}</Text>
            <Text>Date: {date}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={[styles.rowBetween, styles.section]}>
          <View>
            <Text style={styles.label}>FROM</Text>
            <Text style={styles.bold}>{business.name}</Text>
            <Text>{business.address}</Text>
          </View>

          <View>
            <Text style={styles.label}>BILL TO</Text>
            <Text style={styles.bold}>{client.name}</Text>
            <Text>{client.address}</Text>
            <Text>GSTIN: {client.gstin}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.col}>HSN</Text>
          <Text style={styles.col}>Qty</Text>
          <Text style={styles.col}>Rate</Text>
          <Text style={styles.col}>GST%</Text>
          <Text style={[styles.col, styles.right]}>Amount</Text>
        </View>

        {items.map((item, i) => {
          const amt = item.qty * item.rate;
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.desc}</Text>
              <Text style={styles.col}>{item.hsn}</Text>
              <Text style={styles.col}>{item.qty}</Text>
              <Text style={styles.col}>Rs {item.rate}</Text>
              <Text style={styles.col}>{item.gst}%</Text>
              <Text style={[styles.col, styles.right]}>
                Rs {amt.toFixed(2)}
              </Text>
            </View>
          );
        })}

        {/* Summary */}
        <View style={styles.summary}>
          <Text>Subtotal: Rs {subtotal}</Text>

          {igst > 0 ? (
            <Text>IGST: Rs {igst}</Text>
          ) : (
            <>
              <Text>CGST: Rs {cgst}</Text>
              <Text>SGST: Rs {sgst}</Text>
            </>
          )}

          <Text style={styles.total}>Total: Rs {total}</Text>
        </View>

        {/*amountInWords */}
        <View style={styles.section}>
          <Text>Amount in words:</Text>
          <Text>{amountInWords}</Text>
        </View>

        {/* Bank Details */}
        {/* <View style={styles.section}>
          <Text style={styles.bold}>Bank Details</Text>
          <Text>Bank: {bank?.name}</Text>
          <Text>Account No: {bank?.account}</Text>
          <Text>IFSC: {bank?.ifsc}</Text>
        </View> */}

        {/* Terms */}
        <View style={styles.footer}>
          <Text style={styles.bold}>Terms & Conditions</Text>
          <Text>{terms}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text>For {business.name}</Text>
          <Text>Authorized Signatory</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
