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

const accent = "#4CAF50"; // same as BillPdf
const lightBg = "#f9f9f9";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333",
    backgroundColor: "#eeffda", // same as BillPdf
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
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: accent,
  },
  tableHeaderCell: {
    padding: 6,
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: 6,
    fontSize: 11,
    textAlign: "center",
  },

  colSno: { width: "7%" },
  colWork: { width: "55%" },
  colStatus: { width: "15%" },
  colRemark: { width: "23%" },

  notes: {
    fontSize: 10,
    marginTop: 4,
    color: "#666",
  },

  ratingBox: {
    border: `1px solid ${accent}`,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },

  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    borderTop: "1px solid #444",
    width: "100%",
    textAlign: "center",
    paddingTop: 4,
    fontSize: 10,
  },

  footer: {
    marginTop: 24,
    borderTop: "1px solid #444",
    paddingTop: 8,
    fontSize: 9,
    textAlign: "center",
    color: "#000",
  },
});

const ChecklistPdf = ({ checklist }) => {
  if (!checklist) return <Document />;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER (Same as BillPdf) */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            The Western Tower, Ratu Road, Ranchi, Jharkhand
          </Text>
          <Text style={styles.contact}>
            Contact: +91 8986699600 | bhuviconsultant@yahoo.in
          </Text>
        </View>

        {/* CHECKLIST INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Checklist Name:</Text>
            <Text style={styles.value}>{checklist?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Check For:</Text>
            <Text style={styles.value}>{checklist?.checkFor || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text style={styles.value}>{checklist?.site?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Supervisor:</Text>
            <Text style={styles.value}>{checklist?.supervisor?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {checklist?.createdAt
                ? moment(checklist.createdAt).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{checklist?.approvalStatus || "Pending"}</Text>
          </View>
        </View>

        {/* CHECK WORK TABLE – same layout as your previous checklist PDF */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Checklist</Text>

          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colSno]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.colWork]}>
                Work Description
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colRemark]}>
                Remarks
              </Text>
            </View>

            {/* Rows */}
            {checklist?.checkWork?.map((item, index) => (
              <View key={item._id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colSno]}>
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colWork,
                    { textAlign: "left" },
                  ]}
                >
                  {item.work}
                </Text>
                <Text style={[styles.tableCell, styles.colStatus]}>
                  {item.status}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colRemark,
                    { textAlign: "left" },
                  ]}
                >
                  {item.remarks}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* OBSERVATION */}
        {checklist?.observation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observation</Text>
            <Text style={styles.notes}>{checklist.observation}</Text>
          </View>
        ) : null}

        {/* RATINGS */}
        {checklist?.rating?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ratings</Text>
            {checklist.rating.map((rate) => (
              <View key={rate._id} style={styles.ratingBox}>
                <Text>
                  <Text style={styles.label}>{rate.category}:</Text>{" "}
                  {rate.stars} Star
                </Text>
                <Text style={styles.notes}>Remark: {rate.remarks}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* SIGNATURES – layout same as earlier (Authority / Contractor / Client) */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>
              Authority 
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>
              Contractor
              
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>
              Client
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          This is a system-generated site inspection checklist. For any queries
          contact Bhuvi Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default ChecklistPdf;
