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

const accent = "#4CAF50";
const lightBg = "#f9f9f9";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
    backgroundColor: "#eeffda",
  },

  header: {
    borderBottom: `2px solid ${accent}`,
    paddingBottom: 10,
    marginBottom: 18,
    alignItems: "center",
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 6,
  },

  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  contact: {
    fontSize: 9,
    color: "#444",
  },

  section: {
    marginBottom: 16,
    padding: 10,
    border: "1px solid #e0e0e0",
    backgroundColor: lightBg,
    borderRadius: 6,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4CAF50",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  label: {
    fontWeight: "bold",
  },

  table: {
    marginTop: 8,
    border: `1px solid ${accent}`,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
  },

  tableHeader: {
    backgroundColor: accent,
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
  },

  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    flex: 1,
    textAlign: "center",
    fontSize: 9,
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
    marginTop: 26,
    borderTop: "1px solid #ddd",
    paddingTop: 8,
    fontSize: 9,
    textAlign: "center",
    color: "#555",
  },
});

const WorkOrderPdf = ({ workOrder }) => {
  if (!workOrder) {
    return (
      <Document>
        <Page size="A4">
          <Text>Loading work order...</Text>
        </Page>
      </Document>
    );
  }

  const works = Array.isArray(workOrder?.works) ? workOrder.works : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ✅ SAFEST IMAGE USAGE */}
          {/* Put bhuvihomes.png inside public folder */}
          <Image src={logo} style={styles.logo} />

          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            The Western Tower, Ratu Road, Ranchi, Jharkhand
          </Text>
          <Text style={styles.contact}>
            Contact: +91 8986699600 | bhuviconsultant@yahoo.in
          </Text>
        </View>

        {/* Work Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Order Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Work Order:</Text>
            <Text>{workOrder.workOrderName || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>WO No:</Text>
            <Text>{workOrder.workOrderNo || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Contractor:</Text>
            <Text>{workOrder.contractor?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text>{workOrder.site?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text>
              {moment(
                workOrder?.startDate?.$date || workOrder?.startDate,
              ).isValid()
                ? moment(
                    workOrder?.startDate?.$date || workOrder?.startDate,
                  ).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
        </View>

        {/* Works & Stages */}
        {works.map((work, index) => {
          const stages = Array.isArray(work?.stages) ? work.stages : [];

          return (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {index + 1}. {work?.name || "-"}
              </Text>

              <View style={styles.row}>
                <Text>Unit: {work?.unit || "-"}</Text>
                <Text>Qty: {Number(work?.qty || 0)}</Text>
                <Text>Rate: ₹{Number(work?.rate || 0)}</Text>
              </View>

              <View style={styles.row}>
                <Text>Total: ₹{Number(work?.amount || 0).toFixed(2)}</Text>
                <Text>Paid: ₹{Number(work?.paid || 0).toFixed(2)}</Text>
                <Text>Due: ₹{Number(work?.due || 0).toFixed(2)}</Text>
              </View>

              {/* Stage Table */}
              {stages.length > 0 && (
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableHeader, { flex: 2 }]}>Stage</Text>
                    <Text style={styles.tableHeader}>%</Text>
                    <Text style={styles.tableHeader}>Amount</Text>
                    <Text style={styles.tableHeader}>Paid</Text>
                    <Text style={styles.tableHeader}>Due</Text>
                    <Text style={styles.tableHeader}>Status</Text>
                  </View>

                  {stages.map((stage, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 2, textAlign: "left" },
                        ]}
                      >
                        {stage?.name || "-"}
                      </Text>
                      <Text style={styles.tableCell}>
                        {Number(stage?.percentage || 0)}%
                      </Text>
                      <Text style={styles.tableCell}>
                        ₹{Number(stage?.amount || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.tableCell}>
                        ₹{Number(stage?.paid || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.tableCell}>
                        ₹{Number(stage?.due || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {stage?.status || "-"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.row}>
            <Text>Total Value:</Text>
            <Text>₹{Number(workOrder.totalValue || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text>Total Paid:</Text>
            <Text>₹{Number(workOrder.totalPaid || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text>Total Due:</Text>
            <Text>₹{Number(workOrder.totalDue || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Approvals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approvals</Text>

          <View style={styles.row}>
            <Text>Account:</Text>
            <Text>{workOrder.accountheadApprove || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text>Contractor:</Text>
            <Text>{workOrder.contractorApprove || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text>Authority:</Text>
            <Text>{workOrder.adminApprove || "-"}</Text>
          </View>
        </View>

        {/* =====================================
                TERMS & CONDITIONS
        ===================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Terms & Conditions</Text>

          <View style={styles.sectionBody}>
            <Text style={{ marginBottom: 5 }}>
              1. Material shall be supplied strictly as per the specifications
              and quantity mentioned in this Purchase Order.
            </Text>

            <Text style={{ marginBottom: 5 }}>
              2. Supplier shall clearly mention the Purchase Order Number on all
              Challans, Tax Invoices and Transport Documents.
            </Text>

            <Text style={{ marginBottom: 5 }}>
              3. Material shall be inspected at the delivery location. Any
              damaged, defective or short supplied material may be rejected.
            </Text>

            <Text style={{ marginBottom: 5 }}>
              4. Payment shall be processed only after successful receipt,
              verification and approval of material.
            </Text>

            <Text style={{ marginBottom: 5 }}>
              5. GST shall be charged as applicable under prevailing Government
              regulations.
            </Text>

            <Text style={{ marginBottom: 5 }}>
              6. Any deviation from this Purchase Order requires prior written
              approval from Bhuvi Consultants.
            </Text>
          </View>
        </View>

        {/* ✅ Signatures */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Contractor</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Authority</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Account Head</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a system-generated work order. For queries, contact Bhuvi
          Consultants.
        </Text>
      </Page>
    </Document>
  );
};

export default WorkOrderPdf;
