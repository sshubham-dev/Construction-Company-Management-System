const mongoose = require("mongoose");


const levelSchema = new mongoose.Schema({
  key: String, // "G", "F1", "B1"
  label: String,
  area: { type: Number, default: 0 },
  usage: String,
  scope: {
    type: String,
    enum: ["structure", "plaster", "finishing", "custom"],
    default: "finishing",
  },
});

const workLineSchema = new mongoose.Schema({
  code: String,
  levelKey: String,
  description: String,
  unit: String,
  quantity: Number,
  rate: Number,
  amount: Number,
  included: { type: Boolean, default: true },
  meta: Object,
});

const optionalWorkSchema = new mongoose.Schema({
  code: String,
  title: String,
  selected: { type: Boolean, default: false },
  length: Number,
  width: Number,
  height: Number,
  unit: String,
  quantity: Number,
  rate: Number,
  amount: Number,
  meta: Object,
});

const materialSchema = new mongoose.Schema({
  materialCode: String,
  description: String,
  unit: String,
  qtyPerSqft: Number,
  quantity: Number,
  rate: Number,
  amount: Number,
  included: { type: Boolean, default: true },
  source: { type: String, enum: ["default", "package", "override"], default: "package" },
});

const workDetailItemSchema = new mongoose.Schema({
  item: String,
  approved: String,
  description: String,
  default: String,
  notes: String,
});

const workDetailSectionSchema = new mongoose.Schema({
  title: String,
  items: [workDetailItemSchema],
});

const quoteSchema = new mongoose.Schema(
  {
    name: String,
    status: {
      type: String,
      enum: ["draft", "sent", "approved", "rejected"],
      default: "draft",
    },
    version: { type: Number, default: 1 },
    date: { type: Date, default: Date.now },

    lead: {
      leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
      name: String,
      phone: String,
      city: String,
      service: String,
      address: String,
    },

    package: {
      name: String,
      category: String,
      ratesSnapshot: Object,
      // snapshot can contain items, materials, materialOptions, workDetails
    },

    structure: {
      raw: String,
      hasBasement: { type: Boolean, default: false },
      levels: [levelSchema],
    },

    inputs: {
      floorToFloorHeightFt: { type: Number, default: 10 },
      groundLevelAboveRoadFt: { type: Number, default: 2.5 },
      brickType: String,
    },

    workLines: [workLineSchema],
    optionalWorks: [optionalWorkSchema],
    materials: [materialSchema],
    selectedCustomizations: [{ key: String, label: String, description: String, rateImpact: Number }],
    workDetails: [workDetailSectionSchema],

    totals: {
      subtotal: Number,
      gstPercent: Number,
      gstAmount: Number,
      total: Number,
      gstIncluded: { type: Boolean, default: false },
    },

    durationInMonths: Number,

    paymentSchedule: [
      {
        label: String,
        percentage: Number,
        amount: Number,
      },
    ],

    notes: String,
    exclusions: [String],
    inclusions: [String],

    pdf: {
      url: String,
      lastGeneratedAt: Date,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
    },
  },
  { timestamps: true }
);


// const quoteSchema = new mongoose.Schema(
//   {
//     // BASIC INFO
//     name: { type: String, required: true },
//     date: { type: Date, default: Date.now },
//     status: {
//       type: String,
//       enum: ["draft", "sent", "approved", "rejected"],
//       default: "draft",
//     },

//     // PDF LINKS
//     pdf: [
//       {
//         url: String,
//         generatedAt: { type: Date, default: Date.now },
//       },
//     ],

//     // LEAD DETAIL (snapshot)
//     lead: {
//       leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
//       name: String,
//       phone: String,
//       city: String,
//       service: String,
//       projectLocation: String,
//     },

//     // PACKAGE DETAIL
//     package: {
//       packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
//       name: String,
//       ratesSnapshot: Object, // snapshot of package rates at quote time
//     },

//     // PROJECT DURATION
//     durationInMonths: Number,

//     // TOTAL SUMMARY
//     totals: {
//       subtotal: Number,
//       gstPercent: Number,
//       gstAmount: Number,
//       total: Number,
//       gstIncluded: { type: Boolean, default: false },
//     },

//     // PAYMENT SCHEDULE
//     paymentSchedule: [
//       {
//         label: String,
//         percentage: Number,
//         amount: Number,
//       },
//     ],

//     // STRUCTURE DETAILS
//     structure: {
//       code: String, // "G+2", "B+G+3", etc.

//       floors: [
//         {
//           floorKey: String, // "G", "F1", "F2"
//           name: String, // "Ground Floor", "First Floor"
//           usage: String, // "residential", "commercial", etc.
//           scope: String, // "structure", "finishing", etc.
//           area: Number,
//           unit: String, // "sqft"
//           rate: Number,
//           amount: Number,
//           description: String,
//           breakdown: Object,
//         },
//       ],
//     },

//     includedItems: [
//       {
//         title: String,
//         description: String,
//       },
//     ],

//     excludedItems: [
//       {
//         title: String,
//         description: String,
//       },
//     ],

//     // OTHER WORKS
//     otherWorks: [
//       {
//         code: String, // "PARAPET", "STAIR_HEADROOM_PARAPET"
//         title: String, // "Parapet Wall"
//         floorKey: String, // "F1", "Terrace" - helps identify where it belongs

//         // Dimensions
//         length: Number,
//         height: Number,
//         width: Number, // optional

//         area: Number, // auto-calculated: length * height (if applicable)
//         quantity: Number, // optional
//         unit: String,

//         rate: Number,
//         amount: Number,

//         description: String,
//         breakdown: Object,
//       },
//     ],
//   },
//   { timestamps: true }
// );



quoteSchema.pre("save", function (next) {
  if (!this.name) {
    const clientName = this.lead?.name || "Client";
    const structureName = this.structure?.raw || "Structure";

    // Format date: 26 Nov 2025
    const today = this.date;
    const day = today.getDate().toString().padStart(2, "0");
    const month = today.toLocaleString("en-US", { month: "short" });
    const year = today.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    this.name = `${clientName} – Quotation for ${structureName} – ${formattedDate}`;
  }

  // Generate PDF name based on quote name
  const pdfFileName = `${this.name}.pdf`
    .replace(/[\\/:*?"<>|]/g, "") // remove invalid file characters
    .trim();

  // Set PDF object if not exists
  if (!this.pdf) this.pdf = {};

  this.pdf.url = pdfFileName;
  this.pdf.lastGeneratedAt = new Date();

  next();
});

const rateItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  unit: { type: String, required: true },
  rate: { type: Number, required: true },
  isOptional: { type: Boolean, default: false },
});

const rateSchema = new mongoose.Schema(
  {
    packageType: { type: String, enum: ["Smart", "Signature"], required: true },
    items: [rateItemSchema],
    surchargePercentage: {
      staffSalaryPercent: Number,
      marketingPercent: Number,
      profitPercent: Number,
      officePercent: Number,
      investmentPercent: Number,
      taxPercent: Number,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// const packageSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true }, // Signature / Smart
//     description: String,

//     structure: {
//       steel: String,
//       cement: String,
//       bricks: String,
//       sand: String,
//       aggregate: String,
//       rcc: String,
//       floorHeight: Number,
//       extraFloorHeightRate: Number,
//       groundLevelFromRoad: String,
//       extraGroundFillRate: Number,
//       waterproofing: String,
//       antitermite: String,
//     },

//     kitchen: Object,
//     bathroom: Object,
//     doorsWindows: Object,
//     painting: Object,
//     flooring: Object,
//     electrical: Object,

//     others: Object,
//   },
//   { timestamps: true }
// );

const packageSchema = new mongoose.Schema(
  {
    // BASIC PACKAGE INFORMATION ------------------------------------------
    name: { type: String, required: true }, // "Budget Package" / "Premium Package"
    category: String, // "residential" | "commercial" | "mixed"
    description: String,
    type: { type: String, enum: ["standard", "custom"], default: "standard" },

    // MASTER RATE RULE SNAPSHOT (COPIED FROM RATE RULE MODEL) -------------
    rateRuleSnapshot: {
      // Materials (full research-based list)
      materials: [
        {
          materialCode: String,
          title: String,
          unit: String,
          qtyPerSqft: Number,
          defaultRate: Number,
          wastagePercent: Number,
        },
      ],

      // Scope logic: structure / plaster / finishing
      scopeRules: {
        structure: {
          includeMaterials: [String], // ["CEMENT", "STEEL"]
          excludeMaterials: [String], // ["PAINT", "TILES"]
          multiplier: Number, // e.g. 0.7
        },
        plaster: {
          includeMaterials: [String],
          excludeMaterials: [String],
          multiplier: Number,
        },
        finishing: {
          includeMaterials: [String], // ["ALL"]
          excludeMaterials: [],
          multiplier: Number, // 1.0
        },
      },

      // Overheads & rate builder
      rateRules: {
        applyOverheads: {
          staff: Number,
          office: Number,
          marketing: Number,
          investment: Number,
          wastage: Number,
          profit: Number,
        },
      },

      // Height rules & ground level rules
      surchargeRules: {
        height: {
          thresholdFt: Number,
          surchargePerExtraFt: Number,
        },
        groundLevel: {
          thresholdFt: Number,
          surchargePerExtraFt: Number,
        },
      },
    },

    // MAIN WORK DEFINITIONS (FULL CONSTRUCTION SCOPE) --------------------
    floorWorkDetails: [
      {
        code: String, // "FOOTING", "BMS_RCC", "GF_CIVIL", "F1_CIVIL"
        name: String, // "Footing Civil Work"
        description: String, // Text for PDF
        unit: { type: String, default: "sqft" }, // sqft, rft, cuft, ls

        scope: {
          // Determines material set
          type: String,
          enum: ["structure", "plaster", "finishing"],
          default: "structure",
        },

        baseRate: Number, // Base rate BEFORE adding impact rules

        materials: [
          // Minimal items needed for this work
          {
            materialCode: String, // CEMENT, STEEL
            qtyPerSqft: Number,
          },
        ],

        appliesTo: {
          // Controls which floors use this item
          type: String,
          enum: [
            "basementOnly",
            "groundOnly",
            "typicalFloors",
            "roofOnly",
            "allFloors",
          ],
          default: "allFloors",
        },

        usage: {
          type: String,
          enum: ["residential", "commercial", "both"],
          default: "both",
        },

        rateImpactRules: {
          height: {
            enable: { type: Boolean, default: false },
            thresholdFtBefore: Number,
            surchargePerExtraFt: Number,
          },
          groundLevel: {
            enable: { type: Boolean, default: false },
            thresholdFtBefore: Number,
            surchargePerExtraFt: Number,
          },
          customMaterialImpact: {
            enable: { type: Boolean, default: false },
            refersTo: [String], // ["bricks", "tiles"]
          },
        },
      },
    ],

    // CUSTOMIZABLE MATERIAL / BRAND SECTION -------------------------------
    workDetails: [
      {
        title: String, // Structure / Kitchen / Bathroom
        usage: {
          type: String,
          enum: ["residential", "commercial", "both"],
          default: "both",
        },

        items: [
          {
            key: String, // "bricks", "tiles", "cement"
            item: String, // "Brick Work", "Floor Tiles"
            type: {
              type: String,
              enum: ["fixed", "selectable"],
              default: "fixed",
            },

            default: {
              label: String, // "AAC Blocks"
              description: String, // AAC Blocks 9 inch exterior...
              rateImpact: Number,
            },

            options: [
              {
                label: String, // "Red Bricks"
                description: String,
                rateImpact: Number, // +40
              },
            ],
          },
        ],
      },
    ],

    // OPTIONAL WORKS (ADDED ONLY IF USER SELECTS IN QUOTE) ----------------
    optionalWorks: [
      {
        code: String, // "SEPTIC_TANK"
        title: String,
        descriptionTemplate: String, // PDF text
        unit: String,
        rate: Number,
      },
    ],

    // GST RULES -----------------------------------------------------------
    gst: {
      percent: Number,
      includedInRate: { type: Boolean, default: false },
    },

    // META ----------------------------------------------------------------
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Quote = mongoose.model("Quote", quoteSchema);
const Rate = mongoose.model("Rate", rateSchema);
const Package = mongoose.model("Package", packageSchema);

module.exports = { Quote, Rate, Package };
