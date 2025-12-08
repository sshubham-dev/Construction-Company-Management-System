// BillPdf.jsx
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

const BillPdf = ({ bill }) => {
  if (!bill) return <Document />;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* ✅ Fix logo src to use public folder */}
          <Image src={logo} style={styles.logo} />
          <Text style={styles.companyName}>Bhuvi Consultants</Text>
          <Text style={styles.contact}>
            The Western Tower, Ratu Road, Ranchi, Jharkhand
          </Text>
          <Text style={styles.contact}>
            Contact: +91 8986699600 | bhuviconsultant@yahoo.in
          </Text>
        </View>

        {/* Bill Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.value}>{bill?.contractor?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Site:</Text>
            <Text style={styles.value}>{bill?.site?.name || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {bill?.dateOfBill
                ? moment(bill.dateOfBill).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bill No:</Text>
            <Text style={styles.value}>
              {bill ? `BHC/${bill?.site?.name}${bill?.billNo || ""}` : "-"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bill Type:</Text>
            <Text style={styles.value}>{bill?.billType?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Work Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Details</Text>
          <View style={styles.table}>
            {/* TABLE HEADER */}
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Description</Text>
              <Text style={styles.tableHeader}>Rate</Text>
              <Text style={styles.tableHeader}>Quantity</Text>
              <Text style={styles.tableHeader}>Total</Text>
            </View>

            {/* WORK ORDER */}
            {bill?.billType === "workorder" && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {bill?.billOf?.workName} ({bill?.billOf?.stageName})
                </Text>
                <Text style={styles.tableCell}>
                  ₹{bill?.billOf?.rate}/{bill?.billOf?.unit}
                </Text>
                <Text style={styles.tableCell}>
                  {bill?.billOf?.qty} {bill?.billOf?.unit}
                </Text>
                <Text style={styles.tableCell}>₹{bill?.toPay}</Text>
              </View>
            )}

            {/* EXTRA WORK */}
            {bill?.billType === "extrawork" && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{bill?.billOf?.workName}</Text>
                <Text style={styles.tableCell}>
                  ₹{bill?.billOf?.rate}/{bill?.billOf?.unit}
                </Text>
                <Text style={styles.tableCell}>
                  {bill?.billOf?.qty} {bill?.billOf?.unit}
                </Text>
                <Text style={styles.tableCell}>₹{bill?.toPay}</Text>
              </View>
            )}

            {/* SUPPLY LABOUR */}
            {bill?.billType === "supplylabour" && (
              <>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Skilled Male</Text>
                  <Text style={styles.tableCell}>
                    ₹{bill?.billOf?.skilledMaleRate}
                  </Text>
                  <Text style={styles.tableCell}>
                    {bill?.billOf?.skilledMale}
                  </Text>
                  <Text style={styles.tableCell}>
                    ₹{bill?.billOf?.skilledMale * bill?.billOf?.skilledMaleRate}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Skilled Female</Text>
                  <Text style={styles.tableCell}>
                    ₹{bill?.billOf?.skilledFemaleRate}
                  </Text>
                  <Text style={styles.tableCell}>
                    {bill?.billOf?.skilledFemale}
                  </Text>
                  <Text style={styles.tableCell}>
                    ₹
                    {bill?.billOf?.skilledFemale *
                      bill?.billOf?.skilledFemaleRate}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Unskilled Male</Text>
                  <Text style={styles.tableCell}>
                    ₹{bill?.billOf?.unskilledMaleRate}
                  </Text>
                  <Text style={styles.tableCell}>
                    {bill?.billOf?.unskilledMale}
                  </Text>
                  <Text style={styles.tableCell}>
                    ₹
                    {bill?.billOf?.unskilledMale *
                      bill?.billOf?.unskilledMaleRate}
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Unskilled Female</Text>
                  <Text style={styles.tableCell}>
                    ₹{bill?.billOf?.unskilledFemaleRate}
                  </Text>
                  <Text style={styles.tableCell}>
                    {bill?.billOf?.unskilledFemale}
                  </Text>
                  <Text style={styles.tableCell}>
                    ₹
                    {bill?.billOf?.unskilledFemale *
                      bill?.billOf?.unskilledFemaleRate}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>
              {bill?.dateOfPayment
                ? moment(bill.dateOfPayment).format("DD-MM-YYYY")
                : "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>₹{bill?.toPay || 0}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Paid:</Text>
            <Text style={styles.value}>₹{bill?.paidAmount || 0}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Due:</Text>
            <Text style={styles.value}>₹{bill?.due || 0}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={styles.value}>{bill?.paymentStatus}</Text>
          </View>
        </View>

        {/* Notes */}
        {bill?.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{bill?.reason}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Contractor</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Billing Manager</Text>
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
          This is a system-generated bill. For any queries contact Bhuvi Consultants office.
        </Text>
      </Page>
    </Document>
  );
};

export default BillPdf;
