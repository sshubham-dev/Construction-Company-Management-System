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
    paddingTop: 15,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingHorizontal: 30,
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
    marginTop: 15,
    borderTop: "1px solid #eee",
    paddingTop: 6,
    fontSize: 9,
    textAlign: "center",
    color: "#777",
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
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
  console.log(ProjectSchedule);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ✅ Fix logo src to use public folder */}
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            3rd floor, The Westend Tower Ratu Road, Ranchi, Jharkhand 834001
          </Text>
          <Text style={styles.contact}>
            Contact: +91-8986699600, +91-7019943376 | homes.bhuvi@gmail.com
          </Text>
        </View>

        {/* ProjectSchedule Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Schedule Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Site</Text>
            <Text style={styles.value}>
              {ProjectSchedule?.site?.name || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Schedule Date</Text>
            <Text style={styles.value}>
              {moment(ProjectSchedule?.date).format("DD-MM-YYYY")}
            </Text>
          </View>

          {/* <View style={styles.row}>
            <Text style={styles.label}>Approval Status</Text>
            <Text style={styles.value}>{ProjectSchedule?.approvalStatus}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Incharge</Text>
            <Text style={styles.value}>{ProjectSchedule?.inchargeApprove}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Account Head</Text>
            <Text style={styles.value}>
              {ProjectSchedule?.accountheadApprove}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Admin</Text>
            <Text style={styles.value}>{ProjectSchedule?.adminApprove}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{ProjectSchedule?.clientApprove}</Text>
          </View> */}
        </View>

        {/* Work Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, { flex: 2 }]}>Activity</Text>
              <Text style={styles.tableHeader}>Planned</Text>
              {/* <Text style={styles.tableHeader}>Actual</Text>
              <Text style={styles.tableHeader}>Status</Text> */}
            </View>

            {ProjectSchedule?.projectDetail?.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {item.workDetail}
                </Text>

                <Text style={styles.tableCell}>
                  {item.planned ? moment(item.planned).format("DD-MM-YY") : "-"}
                </Text>

                {/* <Text style={styles.tableCell}>
                  {item.actual ? moment(item.actual).format("DD-MM-YY") : "-"}
                </Text>

                <Text style={styles.tableCell}>{item.status}</Text> */}
              </View>
            ))}
          </View>
        </View>

        {/* Payment Details */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delay / Remarks</Text>

          {ProjectSchedule.projectDetail.map(
            (item, index) =>
              item.reason && (
                <View
                  key={index}
                  style={{
                    marginBottom: 8,
                    borderBottom: "1 solid #ddd",
                    paddingBottom: 4,
                  }}
                >
                  <Text>
                    <Text style={styles.label}>{item.workDetail}</Text>
                  </Text>

                  <Text>Reason : {item.reason}</Text>
                </View>
              ),
          )}
        </View> */}

        {/* Notes */}
        {ProjectSchedule?.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{ProjectSchedule?.reason}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Contractor</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Project Manager</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Quality</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Authority</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a system-generated ProjectSchedule. For any queries contact
          Bhuvi Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default ProjectSchedulePdf;
