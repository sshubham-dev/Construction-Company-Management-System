import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import logo from "../asset/bhuvihomes.png";

const accent = "#4CAF50"; // modern green accent
const lightBg = "#f9f9f9"; // light background

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
    backgroundColor: "#eeffda",
  },

  /* ---------- HEADER ---------- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `2px solid ${accent}`,
    paddingBottom: 8,
    marginBottom: 14,
  },
  logo: { width: 55, marginRight: 12 },
  headerRight: { flex: 1 },
  companyName: { fontSize: 16, fontWeight: "bold", color: accent },
  contact: { fontSize: 9, color: "#555" },

  /* ---------- SECTION ---------- */
  section: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: lightBg,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: accent,
    marginBottom: 6,
    borderBottom: `1px solid ${accent}`,
    paddingBottom: 3,
  },

row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
},

  label: { fontWeight: "bold", color: "#333" },

/* ---------- TABLE ---------- */
table: {
  marginTop: 6,
  borderWidth: 1,
  borderColor: "#ddd",
},

tableRow: {
  flexDirection: "row",
  borderBottomWidth: 1,
  borderBottomColor: "#ddd",
  paddingVertical: 4,
  alignItems: "center",
},

tableHeaderRow: {
  backgroundColor: "#eef6ee",
},

/* column widths must total ~100% */
colWork: { width: "40%", paddingRight: 4 },
colUnit: { width: "10%", textAlign: "right" },
colRate: { width: "12%", textAlign: "right" },
colQty: { width: "12%", textAlign: "right" },
colAmount: { width: "12%", textAlign: "right" },
// colPaid: { width: "12%", textAlign: "right" },
// colDue: { width: "12%", textAlign: "right" },
colStatus: { width: "14%", textAlign: "center" },

tableHeaderText: {
  fontWeight: "bold",
  color: accent,
  fontSize: 8.5,
},

tableCellText: {
  fontSize: 8.5,
  color: "#333",
},


  /* ---------- SUMMARY ---------- */
  summaryBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: `1px solid ${accent}`,
  },
  profitText: {
  color: accent,
  fontWeight: "bold",
},

netAmountText: {
  fontWeight: "bold",
  borderTop: "1px solid #ccc",
  paddingTop: 4,
},


  /* ---------- SIGNATURE ---------- */
  signatures: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: { width: "22%", textAlign: "center" },
  signatureLine: {
    marginTop: 18,
    borderTop: "1px solid #000",
    paddingTop: 4,
    fontSize: 9,
  },

  footer: {
    position: "absolute",
    bottom: 14,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 9,
    color: "#666",
  },
});

const ExtraWorkPdf = ({ Work }) => {
  if (!Work) return <Document />;

  const partyName =
    Work.extraFor === "Contractor" ? Work.contractor?.name : Work.client?.name;

    const totalAmount = Number(Work.totalAmount || 0);
const profitPercentage = 10;
const profitAmount = Math.round((totalAmount * profitPercentage) / 100);
const netAmount = totalAmount + profitAmount;

const showProfit = Work.extraFor === "Client";



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ✅ HEADER */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            The Western Tower, Ratu Road, Ranchi, Jharkhand
          </Text>
          <Text style={styles.contact}>
            Contact: +91 8986699600 | bhuviconsultant@yahoo.in
          </Text>
          </View>
        </View>

        {/* ✅ BASIC INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Work Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Extra Work For:</Text>
            <Text>{Work.extraFor}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text>{partyName || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text>{Work.site?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Created Date:</Text>
            <Text>{moment(Work.createdAt).format("DD-MM-YYYY")}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text>{Work.paymentStatus}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Approval Status:</Text>
            <Text>{Work.approvalStatus}</Text>
          </View>
        </View>

        {/* ✅ WORK DETAILS TABLE */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Work Details</Text>

  <View style={styles.table}>
    {/* Header */}
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      <Text style={[styles.colWork, styles.tableHeaderText]}>Work</Text>
      <Text style={[styles.colRate, styles.tableHeaderText]}>Unit</Text>
      <Text style={[styles.colRate, styles.tableHeaderText]}>Rate</Text>
      <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
      <Text style={[styles.colAmount, styles.tableHeaderText]}>Amount</Text>
      {/* <Text style={[styles.colPaid, styles.tableHeaderText]}>Paid</Text> */}
      {/* <Text style={[styles.colDue, styles.tableHeaderText]}>Due</Text> */}
      <Text style={[styles.colStatus, styles.tableHeaderText]}>Status</Text>
    </View>

    {/* Rows */}
    {Work.WorkDetail?.map((item, index) => (
      <View key={index} style={styles.tableRow}>
        <Text style={[styles.colWork, styles.tableCellText]}>
          {item.work}
        </Text>

        <Text style={[styles.colUnit, styles.tableCellText]}>
          {item.unit}
        </Text>
        <Text style={[styles.colRate, styles.tableCellText]}>
          {item.rate}
        </Text>

        <Text style={[styles.colQty, styles.tableCellText]}>
          {item.area}
        </Text>

        <Text style={[styles.colAmount, styles.tableCellText]}>
          {item.amount}
        </Text>

        {/* <Text style={[styles.colPaid, styles.tableCellText]}>
          {item.paid || 0}
        </Text>

        <Text style={[styles.colDue, styles.tableCellText]}>
          {item.due || 0}
        </Text> */}

        <Text style={[styles.colStatus, styles.tableCellText]}>
          {item.status}
        </Text>
      </View>
    ))}
  </View>
</View>


        {/* ✅ FINANCIAL SUMMARY */}
        <View style={styles.section} wrap={false}>
  <Text style={styles.sectionTitle}>Financial Summary</Text>

  <View style={styles.summaryBox}>
    <View style={styles.row}>
      <Text style={styles.label}>Total Amount:</Text>
      <Text>₹{totalAmount}</Text>
    </View>

{showProfit && (
  <View style={styles.row}>
    <Text style={styles.label}>Profit (10%):</Text>
    <Text style={styles.profitText}>{profitAmount}</Text>
  </View>
)}


    <View style={styles.row}>
      <Text style={styles.label}>Net Amount:</Text>
     <Text style={styles.netAmountText}>{netAmount}</Text>
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>Total Paid:</Text>
      <Text>{Work.paid}</Text>
    </View>

    <View style={styles.row}>
      <Text style={styles.label}>Total Due:</Text>
      <Text>{netAmount-Work.paid}</Text>
    </View>
  </View>
</View>


        {/* ✅ APPROVAL TRACKING */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approval Status</Text>

          <View style={styles.row}>
            <Text>Client:</Text>
            <Text>{Work.clientApprove}</Text>
          </View>

          <View style={styles.row}>
            <Text>Contractor:</Text>
            <Text>{Work.contractorApprove}</Text>
          </View>

          <View style={styles.row}>
            <Text>Authority:</Text>
            <Text>{Work.adminApprove}</Text>
          </View>

          <View style={styles.row}>
            <Text>Account Head:</Text>
            <Text>{Work.accountheadApprove}</Text>
          </View>
        </View> */}

        {/* ✅ SIGNATURES */}
        <View style={styles.signatures}>
          {Work.extraFor === "Contractor" ? (
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLine}>Contractor</Text>
            </View>
          ) : (
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLine}>Client</Text>
            </View>
          )}
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Authority</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Account Head</Text>
          </View>
        </View>

        {/* ✅ FOOTER */}
        <Text style={styles.footer}>
          This is a system-generated Extra Work document. For any queries contact Bhuvi Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default ExtraWorkPdf;
