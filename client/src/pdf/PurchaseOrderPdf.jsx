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

const primary = "#2E7D32";
const light = "#F5F9F5";
const border = "#D6D6D6";

const accent = "#4CAF50";
const lightBg = "#f9f9f9";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
    backgroundColor: "#eeffda",
  },

  /* ===========================
      HEADER
  ============================ */

  header: {
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: primary,
    paddingBottom: 10,
    marginBottom: 15,
  },

  logo: {
    width: 75,
    height: 75,
    marginBottom: 6,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: primary,
  },

  companyAddress: {
    marginTop: 2,
    fontSize: 9,
    textAlign: "center",
  },

  companyContact: {
    marginTop: 2,
    fontSize: 9,
    textAlign: "center",
  },

  title: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: primary,
  },

  /* ===========================
      SECTION
  ============================ */

  section: {
    borderWidth: 1,
    borderColor: border,
    marginBottom: 10,
  },

  sectionHeader: {
    backgroundColor: primary,
    color: "#fff",
    padding: 6,
    fontSize: 11,
    fontWeight: "bold",
  },

  sectionBody: {
    padding: 8,
  },

  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  column: {
    width: "48%",
  },

  row: {
    flexDirection: "row",
    marginBottom: 5,
  },

  label: {
    width: "50%",
    fontWeight: "bold",
  },

  value: {
    width: "30%",
  },

  table: {
    marginTop: 8,
    border: `1px solid ${accent}`,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    textStyle: "bold",
  },

  tableHeader: {
    // backgroundColor: accent,
    // color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
  },

  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    textAlign: "center",
    fontSize: 9,
  },
});

const PurchaseOrderPdf = ({ PurchaseOrder }) => {
  if (!PurchaseOrder) return <Document />;

  const supplier = PurchaseOrder.supplierId;
  const site = PurchaseOrder.siteId;
  const store = PurchaseOrder.storeId;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* =====================================
                HEADER
        ===================================== */}

        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />

          <Text style={styles.companyName}>Bhuvi Consultants</Text>

          <Text style={styles.companyAddress}>
            3rd Floor, The Westend Tower, Ratu Road, Ranchi, Jharkhand - 834001
          </Text>

          <Text style={styles.companyContact}>
            +91-8986699600, +91-7019943376
          </Text>

          <Text style={styles.companyContact}>homes.bhuvi@gmail.com</Text>

          <Text style={styles.title}>PURCHASE ORDER</Text>
        </View>

        {/* =====================================
            SUPPLIER + PO DETAILS
        ===================================== */}

        <View style={styles.twoColumn}>
          {/* Supplier */}

          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionHeader}>Supplier Details</Text>

            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>

                <Text style={styles.value}>{supplier?.name || "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Contact</Text>

                <Text style={styles.value}>
                  {supplier?.mailingDetails?.phone || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>GSTIN</Text>

                <Text style={styles.value}>{supplier?.gstNo || "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>

                <Text style={styles.value}>
                  {supplier?.mailingDetails?.email || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>

                <Text style={styles.value}>
                  {supplier?.mailingDetails?.address || "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* PO */}

          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionHeader}>Purchase Order Details</Text>

            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.label}>PO No</Text>
                <Text style={styles.value}>{PurchaseOrder.poNo}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>PO Date</Text>
                <Text style={styles.value}>
                  {moment(PurchaseOrder.createdAt).format("DD-MM-YYYY")}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{PurchaseOrder.status}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Delivery</Text>
                <Text style={styles.value}>{PurchaseOrder.deliveryType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================
            DELIVERY DETAILS
        ===================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Delivery Details</Text>

          <View style={styles.sectionBody}>
            {PurchaseOrder.deliveryType === "SITE" ? (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Deliver To</Text>

                  <Text style={styles.value}>Site</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Site Name</Text>

                  <Text style={styles.value}>{site?.name || "-"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Address</Text>

                  <Text style={styles.value}>
                    {site?.address?.line1 || "-"}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Deliver To</Text>

                  <Text style={styles.value}>Warehouse</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Store</Text>

                  <Text style={styles.value}>{store?.name || "-"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Address</Text>

                  <Text style={styles.value}>
                    {store?.address?.line1 || "-"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Procurement References</Text>

          <View style={styles.sectionBody}>
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Purchase Request</Text>

                  <Text style={styles.value}>
                    {PurchaseOrder.purchaseRequestId?.prNumber || "-"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>RFQ</Text>

                  <Text style={styles.value}>
                    {PurchaseOrder.rfqId?.rfqNo || "-"}
                  </Text>
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Supplier Ref.</Text>

                  <Text style={styles.value}>____________________</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================
        ITEM TABLE
===================================== */}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Material Details</Text>

          <View style={styles.sectionBody}>
            {/* TABLE HEADER */}

            <View style={[styles.tableRow]}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>#</Text>

              <Text style={[styles.tableCell, { flex: 3.5 }]}>
                Item Description
              </Text>

              <Text style={[styles.tableCell, { flex: 1 }]}>Unit</Text>

              <Text style={[styles.tableCell, { flex: 1 }]}>Qty</Text>

              <Text style={[styles.tableCell, { flex: 1.2 }]}>Rate</Text>

              <Text style={[styles.tableCell, { flex: 1.3 }]}>Amount</Text>
            </View>

            {/* ITEMS */}

            {PurchaseOrder.items?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>
                  {index + 1}
                </Text>

                <View style={{ flex: 3.5, padding: 4 }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    {item.itemId?.name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 8,
                      color: "#777",
                      marginTop: 2,
                    }}
                  >
                    Category : {item.itemId?.categoryId?.name || "-"}
                  </Text>
                </View>

                <Text style={[styles.tableCell, { flex: 1 }]}>{item.unit}</Text>

                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item.quantity}
                </Text>

                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                  ₹{Number(item.rate || 0).toLocaleString()}
                </Text>

                <Text style={[styles.tableCell, { flex: 1.3 }]}>
                  ₹{Number(item.amount || 0).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* =====================================
        TOTAL SUMMARY
===================================== */}

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
            gap: 2,
          }}
        >
          {/* LEFT */}
          <View
            style={{
              width: "40%",
            }}
          >
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Purchase Summary</Text>

              <View style={styles.sectionBody}>
                <View style={styles.row}>
                  <Text style={styles.label}>Total Items</Text>

                  <Text style={styles.value}>
                    {PurchaseOrder.items?.length}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Total Quantity</Text>

                  <Text style={styles.value}>
                    {PurchaseOrder.items?.reduce(
                      (sum, i) => sum + Number(i.quantity),
                      0,
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Financial Summary</Text>

            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.label}>Material Value</Text>

                <Text style={styles.value}>
                  Rs {Number(PurchaseOrder.totalAmount || 0).toLocaleString()}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Freight</Text>

                <Text style={styles.value}>
                  Rs {Number(PurchaseOrder.freightAmount || 0).toLocaleString()}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Discount</Text>

                <Text style={styles.value}>
                  Rs{" "}
                  {Number(PurchaseOrder.discountAmount || 0).toLocaleString()}
                </Text>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#999",
                  marginTop: 8,
                  paddingTop: 8,
                }}
              >
                <View style={styles.row}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: primary,
                    }, styles.label}
                  >
                    Grand Total
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: primary,
                    }, styles.value}
                  >
                    {" "}
                    Rs{" "}
                    {Number(
                      PurchaseOrder.grandTotal ?? PurchaseOrder.totalAmount,
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================
        NARRATION
===================================== */}

        {PurchaseOrder.narration && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Special Instructions</Text>

            <View style={styles.sectionBody}>
              <Text>{PurchaseOrder.narration}</Text>
            </View>
          </View>
        )}

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

        {/* =====================================
        SIGNATURES
===================================== */}

        <View
          style={{
            marginTop: 30,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "22%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#666",
                width: "100%",
              }}
            />

            <Text
              style={{
                marginTop: 6,
                fontSize: 9,
              }}
            >
              Prepared By
            </Text>
          </View>

          <View
            style={{
              width: "22%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#666",
                width: "100%",
              }}
            />

            <Text
              style={{
                marginTop: 6,
                fontSize: 9,
              }}
            >
              Purchase Head
            </Text>
          </View>

          <View
            style={{
              width: "22%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#666",
                width: "100%",
              }}
            />

            <Text
              style={{
                marginTop: 6,
                fontSize: 9,
              }}
            >
              Supplier
            </Text>
          </View>

          <View
            style={{
              width: "22%",
              alignItems: "center",
            }}
          >
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#666",
                width: "100%",
              }}
            />

            <Text
              style={{
                marginTop: 6,
                fontSize: 9,
              }}
            >
              Authorized Signatory
            </Text>
          </View>
        </View>

        {/* =====================================
              FOOTER
        ===================================== */}

        <View
          fixed
          style={{
            position: "absolute",
            bottom: 10,
            left: 30,
            right: 30,
            borderTopWidth: 1,
            borderTopColor: "#d9d9d9",
            paddingTop: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 8,
            color: "#777",
          }}
        >
          <Text>
            This Purchase Order is System generated and does not require a physical signature.
          </Text>

          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export default PurchaseOrderPdf;
