// PurchaseRequestPdf.jsx
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

const PurchaseRequestPdf = ({ PurchaseRequest }) => {
  if (!PurchaseRequest) return <Document />;
  console.log(PurchaseRequest);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ✅ Fix logo src to use public folder */}
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            3rd floor, The WestendTower, Ranchi, Jharkhand
          </Text>
          <Text style={styles.contact}>
            Contact: +91 8986699600 | bhuvihomes@gmail.com
          </Text>
        </View>

        {/* PR INFORMATION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase Request Information</Text>

          <View style={styles.row}>
            <Text style={styles.label}>PR No</Text>
            <Text>{PurchaseRequest?.prNumber || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text>
              {PurchaseRequest?.reqDate
                ? moment(PurchaseRequest.reqDate).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text>{PurchaseRequest?.status || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Site</Text>
            <Text>{PurchaseRequest?.site?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Store</Text>
            <Text>{PurchaseRequest?.store?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <Text>{PurchaseRequest?.category?.name || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Requirement For</Text>
            <Text>{PurchaseRequest?.requirementFor || "-"}</Text>
          </View>
        </View>

        {/* REQUESTED MATERIALS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested Materials</Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, { flex: 0.5 }]}>#</Text>

              <Text style={[styles.tableHeader, { flex: 3 }]}>Item</Text>

              <Text style={[styles.tableHeader, { flex: 1 }]}>Unit</Text>

              <Text style={[styles.tableHeader, { flex: 1 }]}>Req</Text>

              <Text style={[styles.tableHeader, { flex: 1 }]}>Issued</Text>

              <Text style={[styles.tableHeader, { flex: 1 }]}>Pending</Text>
            </View>

            {PurchaseRequest?.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>
                  {index + 1}
                </Text>

                <Text style={[styles.tableCell, { flex: 3 }]}>
                  {item?.itemId?.name}
                </Text>

                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item?.unit}
                </Text>

                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item?.requestedQty}
                </Text>

                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item?.issuedQty}
                </Text>

                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item?.pendingQty}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Total Items</Text>

            <Text>{PurchaseRequest?.items?.length || 0}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Requested Qty</Text>

            <Text>
              {PurchaseRequest?.items?.reduce(
                (a, i) => a + (i.requestedQty || 0),
                0,
              )}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Issued Qty</Text>

            <Text>
              {PurchaseRequest?.items?.reduce(
                (a, i) => a + (i.issuedQty || 0),
                0,
              )}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Pending Qty</Text>

            <Text>
              {PurchaseRequest?.items?.reduce(
                (a, i) => a + (i.pendingQty || 0),
                0,
              )}
            </Text>
          </View>
        </View>

        {PurchaseRequest?.narration && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Narration</Text>

            <Text>{PurchaseRequest.narration}</Text>
          </View>
        )}

        <View style={styles.signatures}>
          {/* <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Requested By</Text>
          </View> */}

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Site Incharge</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Store Incharge</Text>
          </View>

          {/* <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Approved By</Text>
          </View> */}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a system-generated PurchaseRequest. For any queries contact
          Bhuvi Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default PurchaseRequestPdf;
