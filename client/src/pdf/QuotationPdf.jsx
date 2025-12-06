// src/pdf/QuotationPdf.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../asset/bhuvihomes.png";

// ----------------------- UTILITIES -----------------------
const cleanNumber = (v) => {
  if (v === undefined || v === null) return 0;

  return (
    Number(
      String(v)
        .replace(/['"]/g, "") // remove normal ' and "
        .replace(/[^\d.-]/g, "") // remove anything not a digit, minus, or dot
        .replace(/(\..*)\./g, "$1") // avoid double decimal
    ) || 0
  );
};

const safe = (v, f = "—") => (!v && v !== 0 ? f : String(v));

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-IN");
  } catch {
    return "";
  }
};

// Add 3 months validity
const addMonths = (dateStr, m = 3) => {
  try {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + m);
    return d.toLocaleDateString("en-IN");
  } catch {
    return "";
  }
};

// ----------------------- STYLES -----------------------
const green = "#14532D";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#eeffda",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: { width: 70, height: 75, marginLeft: 8 },
  headerRight: { textAlign: "right" },

  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: green,
  },
  companySub: {
    fontSize: 10,
    color: "green",
  },

  // TITLE SECTION
  titleWrap: {
    marginVertical: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: green,
  },
  title: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: green,
  },

  // META
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaCol: { width: "48%" },
  metaLabel: {
    fontSize: 9,
    color: green,
    fontWeight: "bold",
    marginBottom: 2,
  },
  metaText: { fontSize: 9, marginBottom: 2 },

  // SECTION
  section: { marginTop: 14 },
  sectionHeader: {
    backgroundColor: green,
    color: "white",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableWrap: {
    borderWidth: 1,
    borderColor: "#000000",
    borderTopWidth: 0,
  },

  // TABLE
  table: { width: "100%" },
  row: { flexDirection: "row" },
  headerRow: { backgroundColor: "#ffffff" },

  td: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    overflow: "hidden",
    maxWidth: "100%",
  },

  th: {
    padding: 5,
    fontSize: 9,
    fontWeight: "bold",
    color: green,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    overflow: "hidden",
    maxWidth: "100%",
  },

  center: { textAlign: "center" },
  right: { textAlign: "right" },

  // TOTALS
totalBox: {
  marginTop: 10,
  alignSelf: "flex-end",
  width: 220,
  borderWidth: 1,
  borderColor: green,
  breakInside: "avoid",  // <-- prevents splitting
},


  totalRow: {
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },

  totalLast: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 0,
    fontWeight: "bold",
  },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    textAlign: "center",
    color: "#000000",
  },
});

// ----------------------- MAIN PDF -----------------------
const QuotationPDF = ({ quote }) => {
  const lead = quote?.lead || {};
  const pkg = quote?.package || {};
  const totals = quote?.totals || {};
  const structure = quote?.structure || {};
  const inputs = quote?.inputs || {};

  const workLines = quote?.workLines || [];
  const optionalWorks = quote?.optionalWorks || [];

  const title =
    quote?.name ||
    `Quotation – ${safe(lead.name, "Client")} (${safe(structure.raw)})`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />

          <View>
            <Text style={styles.companyName}>Bhuvi Homes</Text>
            <Text style={styles.companySub}>Design • Build • Interiors</Text>
            <Text style={[styles.companySub, { fontSize: 8 }]}>
              The Western Tower, Ratu Road, Ranchi, Jharkhand
            </Text>
            <Text style={[styles.companySub, { fontSize: 8 }]}>
              Contact: +91 8986699600 | bhuviconsultant@yahoo.in
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={{ fontSize: 9 }}>
              Date: {formatDate(quote?.createdAt)}
            </Text>
            <Text style={{ fontSize: 9 }}>
              Quote No: {String(quote?._id).slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* TITLE */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* META SECTION */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Client details</Text>
            <Text style={styles.metaText}>Name: {safe(lead.name)}</Text>
            <Text style={styles.metaText}>Phone: {safe(lead.phone)}</Text>
            <Text style={styles.metaText}>City: {safe(lead.city)}</Text>
            <Text style={styles.metaText}>Address: {safe(lead.address)}</Text>
          </View>

          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Project details</Text>
            <Text style={styles.metaText}>Package: {safe(pkg.name)}</Text>
            <Text style={styles.metaText}>
              Structure: {safe(structure.raw)}
            </Text>
            <Text style={styles.metaText}>
              Brick Type: {inputs.brickType || "AAC Block"}
            </Text>
            <Text style={styles.metaText}>
              Floor Height: {inputs.floorToFloorHeightFt || 10} ft
            </Text>
            <Text style={styles.metaText}>
              Ground Level: {inputs.groundLevelAboveRoadFt || 2.5} ft
            </Text>
          </View>
        </View>

        {/* WORK BREAKDOWN */}
        {workLines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Work Detail</Text>

            <View style={styles.tableWrap}>
              <View style={styles.table}>
                {/* HEADER */}
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.th, styles.center, { width: "7%" }]}>
                    SI. No
                  </Text>
                  <Text style={[styles.th, { width: "44%" }]}>Description</Text>
                  <Text style={[styles.th, styles.center, { width: "11%" }]}>
                    Unit
                  </Text>
                  <Text style={[styles.th, styles.center, { width: "12%" }]}>
                    Qty
                  </Text>
                  <Text style={[styles.th, styles.right, { width: "12%" }]}>
                    Rate
                  </Text>
                  <Text style={[styles.th, styles.right, { width: "14%" }]}>
                    Amount
                  </Text>
                </View>

                {workLines.map((w, i) => (
                  <View style={styles.row} key={i}>
                    <Text style={[styles.td, styles.center, { width: "7%" }]}>
                      {i + 1}
                    </Text>

                    <Text style={[styles.td, { width: "44%" }]} wrap>
                      {w.description}
                    </Text>

                    <Text style={[styles.td, styles.center, { width: "11%" }]}>
                      {w.unit}
                    </Text>

                    <Text style={[styles.td, styles.center, { width: "12%" }]}>
                      {cleanNumber(w.quantity)}
                    </Text>

                    <Text
                      style={[styles.td, styles.right, { width: "12%" }]}
                      fixed
                    >
                      {cleanNumber(w.rate)}
                    </Text>

                    <Text
                      style={[styles.td, styles.right, { width: "14%" }]}
                      fixed
                    >
                      {cleanNumber(w.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* OPTIONAL WORKS */}
        {optionalWorks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Optional / External Works</Text>

            <View style={styles.tableWrap}>
              <View style={styles.table}>
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.th, styles.center, { width: "7%" }]}>
                    SI. No
                  </Text>
                  <Text style={[styles.th, { width: "44%" }]}>Item</Text>
                  <Text style={[styles.th, styles.center, { width: "11%" }]}>
                    Unit
                  </Text>
                  <Text style={[styles.th, styles.center, { width: "12%" }]}>
                    Qty
                  </Text>
                  <Text style={[styles.th, styles.right, { width: "12%" }]}>
                    Rate
                  </Text>
                  <Text style={[styles.th, styles.right, { width: "14%" }]}>
                    Amount
                  </Text>
                </View>

                {optionalWorks.map((o, i) => (
                  <View style={styles.row} key={i}>
                    <Text style={[styles.td, styles.center, { width: "7%" }]}>
                      {i + 1}
                    </Text>
                    <Text style={[styles.td, { width: "44%" }]}>
                      {o.title} of size - {o.length}' X {o.height}{" "}
                      {o.width ? `X ${o.width}'` : ""}
                    </Text>
                    <Text style={[styles.td, styles.center, { width: "11%" }]}>
                      {o.unit}
                    </Text>
                    <Text style={[styles.td, styles.center, { width: "12%" }]}>
                      {cleanNumber(o.quantity)}
                    </Text>
                    <Text style={[styles.td, styles.right, { width: "12%" }]}>
                      {cleanNumber(o.rate)}
                    </Text>
                    <Text style={[styles.td, styles.right, { width: "14%" }]}>
                      {cleanNumber(o.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TOTAL SUMMARY */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionHeader}>Financial Summary</Text>

          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{cleanNumber(totals.subtotal)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text>GST ({totals.gstPercent || 18}%)</Text>
              <Text>{cleanNumber(totals.gstAmount)}</Text>
            </View>

            <View style={[styles.totalRow, styles.totalLast]}>
              <Text>Total</Text>
              <Text>{cleanNumber(totals.total)}</Text>
            </View>
          </View>

          <Text
            style={{
              marginTop: 6,
              fontSize: 10,
              textAlign: "right",
            }}
          >
            Rate validity: {addMonths(quote?.createdAt)}
          </Text>

          <Text
            style={{
              fontSize: 10,
              textAlign: "right",
              marginTop: 2,
            }}
          >
            Estimated project duration: {quote?.durationInMonths} months
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is an auto-generated quotation from Bhuvi Homes. Final price
            may vary after site inspection.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
