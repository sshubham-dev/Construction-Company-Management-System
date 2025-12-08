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
    marginBottom: 4,
  },
  label: { fontWeight: "bold", color: "#333" },

  /* ---------- TABLE ---------- */
  table: { marginTop: 6 },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    paddingVertical: 5,
  },
  tableHeader: {
    flex: 1,
    fontWeight: "bold",
    color: accent,
  },
  tableCell: {
    flex: 1,
    color: "#333",
  },

  /* ---------- SUMMARY ---------- */
  summaryBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTop: `1px solid ${accent}`,
  },

  /* ---------- SIGNATURE ---------- */
  signatures: {
    marginTop: 26,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: { width: "22%", textAlign: "center" },
  signatureLine: {
    marginTop: 28,
    borderTop: "1px solid #000",
    paddingTop: 4,
    fontSize: 9,
  },

  footer: {
    position: "absolute",
    bottom: 20,
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
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Work</Text>
              <Text style={styles.tableHeader}>Rate</Text>
              <Text style={styles.tableHeader}>Qty</Text>
              <Text style={styles.tableHeader}>Amount</Text>
              <Text style={styles.tableHeader}>Paid</Text>
              <Text style={styles.tableHeader}>Due</Text>
              <Text style={styles.tableHeader}>Status</Text>
            </View>

            {Work.WorkDetail?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.work}</Text>
                <Text style={styles.tableCell}>
                  ₹{item.rate}/{item.unit}
                </Text>
                <Text style={styles.tableCell}>{item.area}</Text>
                <Text style={styles.tableCell}>₹{item.amount}</Text>
                <Text style={styles.tableCell}>₹{item.paid || 0}</Text>
                <Text style={styles.tableCell}>₹{item.due || 0}</Text>
                <Text style={styles.tableCell}>{item.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ✅ FINANCIAL SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>

          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Total Amount:</Text>
              <Text>₹{Work.totalAmount}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total Paid:</Text>
              <Text>₹{Work.paid}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total Due:</Text>
              <Text>₹{Work.due}</Text>
            </View>
          </View>
        </View>

        {/* ✅ APPROVAL TRACKING */}
        <View style={styles.section}>
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
        </View>

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
