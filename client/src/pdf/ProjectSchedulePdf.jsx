// ProjectSchedulePdf.jsx
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import logo from "../asset/bhuvihomes.png";

const accent = "#4CAF50"; // modern green accent
const lightBg = "#f9f9f9";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333",
    backgroundColor: "#eeffda",
  },
  header: {
    borderBottom: `2px solid ${accent}`,
    paddingBottom: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: accent,
  },
  contact: {
    fontSize: 10,
    color: "#555",
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: lightBg,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: accent,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    color: "#444",
  },
  value: {
    textAlign: "right",
  },
  table: {
    marginTop: 6,
    border: `1px solid ${accent}`,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
  },
  tableHeader: {
    backgroundColor: accent,
    color: "#fff",
    fontWeight: "bold",
    padding: 6,
    flex: 1,
    fontSize: 11,
    textAlign: "center",
  },
  tableCell: {
    padding: 6,
    flex: 1,
    fontSize: 11,
    textAlign: "center",
  },
  notes: {
    fontSize: 10,
    marginTop: 8,
    fontStyle: "italic",
    color: "#666",
  },
  footer: {
    marginTop: 30,
    borderTop: "1px solid #eee",
    paddingTop: 8,
    fontSize: 9,
    textAlign: "center",
    color: "#777",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBox: {
    width: "22%", // 4 boxes fit in one row with spacing
    alignItems: "center",
  },
  signatureLine: {
    borderTop: "1px solid #444",
    width: "100%",
    textAlign: "center",
    paddingTop: 4,
    fontSize: 10,
  },
});

const ProjectSchedulePdf = ({ ProjectSchedule }) => {
  if (!ProjectSchedule) return <Document />;
console.log(ProjectSchedule)
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ✅ Fix logo src to use public folder */}
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>123 Main Street, Ranchi, Jharkhand</Text>
          <Text style={styles.contact}>
            Contact: +91 9876543210 | info@bhuvi.com
          </Text>
        </View>

        {/* ProjectSchedule Info */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>ProjectSchedule Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ProjectSchedule To:</Text>
            <Text style={styles.value}>{ProjectSchedule?.contractor?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text style={styles.value}>{ProjectSchedule?.site?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {ProjectSchedule?.startdate
                ? moment(ProjectSchedule.startdate).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>
              {ProjectSchedule?.duration
                ? moment(ProjectSchedule.duration).format("MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ProjectSchedule No:</Text>
            <Text style={styles.value}>
              {ProjectSchedule.ProjectScheduleNo ? `BHC/${ProjectSchedule?.ProjectScheduleNo}` : "-"}
            </Text>
          </View>
        </View> */}

        {/* Work Details */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Description</Text>
              <Text style={styles.tableHeader}>Rate</Text>
              <Text style={styles.tableHeader}>Quantity</Text>
              <Text style={styles.tableHeader}>Total</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {ProjectSchedule?.ProjectScheduleOf?.workDetail || "-"}
              </Text>
              <Text style={styles.tableCell}>
                ₹{ProjectSchedule?.ProjectScheduleOf?.rate || "0"}/{ProjectSchedule?.ProjectScheduleOf?.unit}
              </Text>
              <Text style={styles.tableCell}>
                {ProjectSchedule?.ProjectScheduleOf?.area || "0"} {ProjectSchedule?.ProjectScheduleOf?.unit}
              </Text>
              <Text style={styles.tableCell}>
                ₹{ProjectSchedule?.ProjectScheduleOf?.amount || "0"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>
              {ProjectSchedule?.dateOfPayment
                ? moment(ProjectSchedule.dateOfPayment).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>₹{ProjectSchedule?.amount || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To Pay:</Text>
            <Text style={styles.value}>₹{ProjectSchedule?.toPay || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paid:</Text>
            <Text style={styles.value}>₹{ProjectSchedule?.paidAmount || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due:</Text>
            <Text style={styles.value}>₹{ProjectSchedule?.dueAmount || "0"}</Text>
          </View>
        </View> */}

        {/* Notes */}
        {/* {ProjectSchedule?.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{ProjectSchedule?.reason}</Text>
          </View>
        )} */}

        {/* Signature */}
        {/* <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Contractor</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>ProjectScheduleing Manager</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Quality</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Authority</Text>
          </View>
        </View>  */}

        {/* Footer */}
        <Text style={styles.footer}>
          This is a system-generated ProjectSchedule. For any queries contact Bhuvi
          Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default ProjectSchedulePdf;
