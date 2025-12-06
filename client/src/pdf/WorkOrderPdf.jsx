// workOrderPdf.jsx
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

const WorkOrderPdf = ({ workOrder }) => {
  if (!workOrder) return <Document />;
console.log(workOrder)
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

        {/* workOrder Info */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>workOrder Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>workOrder To:</Text>
            <Text style={styles.value}>{workOrder?.contractor?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text style={styles.value}>{workOrder?.site?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {workOrder?.startdate
                ? moment(workOrder.startdate).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>
              {workOrder?.duration
                ? moment(workOrder.duration).format("MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>workOrder No:</Text>
            <Text style={styles.value}>
              {workOrder.workOrderNo ? `BHC/${workOrder?.workOrderNo}` : "-"}
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
                {workOrder?.workOrderOf?.workDetail || "-"}
              </Text>
              <Text style={styles.tableCell}>
                ₹{workOrder?.workOrderOf?.rate || "0"}/{workOrder?.workOrderOf?.unit}
              </Text>
              <Text style={styles.tableCell}>
                {workOrder?.workOrderOf?.area || "0"} {workOrder?.workOrderOf?.unit}
              </Text>
              <Text style={styles.tableCell}>
                ₹{workOrder?.workOrderOf?.amount || "0"}
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
              {workOrder?.dateOfPayment
                ? moment(workOrder.dateOfPayment).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>₹{workOrder?.amount || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To Pay:</Text>
            <Text style={styles.value}>₹{workOrder?.toPay || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Paid:</Text>
            <Text style={styles.value}>₹{workOrder?.paidAmount || "0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due:</Text>
            <Text style={styles.value}>₹{workOrder?.dueAmount || "0"}</Text>
          </View>
        </View> */}

        {/* Notes */}
        {/* {workOrder?.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{workOrder?.reason}</Text>
          </View>
        )} */}

        {/* Signature */}
        {/* <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Contractor</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>workOrdering Manager</Text>
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
          This is a system-generated workOrder. For any queries contact Bhuvi
          Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default WorkOrderPdf;
