const { Rate, Quote, Package } = require("../models/quote.models");
const Lead = require("../models/lead.models");
const { sendNotification } = require("./notification.controller.js");

const PACKAGES = [
  {
    _id: "signature",
    name: "Signature (Premium)",
    type: "construction",

    // 1) RATE ITEMS (these drive calculateQuote)
    items: [
      { label: "Footing", unit: "SQFT", rate: 700 },
      { label: "Basement (per sqft)", unit: "SQFT", rate: 1900 },
      { label: "Parking", unit: "SQFT", rate: 1200 },

      // MAIN FLOOR WORK
      { label: "Floor (Residential)", unit: "SQFT", rate: 1800 },
      { label: "Floor (Commercial)", unit: "SQFT", rate: 1400 },

      // HEADROOM & PARAPET
      { label: "Headroom", unit: "SQFT", rate: 1800 },
      { label: "Parapet Wall", unit: "SQFT", rate: 217 },

      // WALLS & TANKS
      { label: "Boundary Wall", unit: "SQFT", rate: 350 },
      { label: "Septic Tank", unit: "CFT", rate: 170 },
      { label: "Underground Water Tank", unit: "CFT", rate: 344 },
    ],

    // 2) MATERIAL OPTIONS (drives selectedCustomizations)
    materialOptions: [
      {
        key: "bricks",
        title: "Bricks",
        default: { label: "AAC Blocks", rateImpact: 0 },
        options: [
          { label: "AAC Blocks", rateImpact: 0 },
          { label: "Fly Ash Bricks", rateImpact: 0 },
          { label: "Red Bricks", rateImpact: 40 },
        ],
      },
      {
        key: "floorHeight",
        title: "Floor Height",
        default: { label: "10ft", rateImpact: 0 },
        options: [
          { label: "10ft", rateImpact: 0 },
          { label: "11ft", rateImpact: 50 },
          { label: "12ft", rateImpact: 90 },
        ],
      },
      {
        key: "groundFill",
        title: "Ground Level From Road",
        default: { label: "2.5ft", rateImpact: 0 },
        options: [
          { label: "2.5ft", rateImpact: 0 },
          { label: "3ft", rateImpact: 50 },
          { label: "4ft", rateImpact: 90 },
        ],
      },
    ],

    // 3) STRUCTURE META FOR DISPLAY
    structure: {
      steel: "TATA Tiscon 550D",
      cement: "ACC F2R/HPC",
      bricks: "AAC blocks (10 inch exterior, 5 inch interior)",
      sand: "Brickwork sand & P-sand",
      aggregate: "20mm & 40mm",
      rcc: "M20 Design Mix",

      // HEIGHT ADJUSTMENTS
      floorHeight: 10,
      extraFloorHeightRate: 50,

      // GROUND FILL
      groundLevelFromRoad: "2.5 ft above road",
      extraGroundFillRate: 50,

      waterproofing: "Dr. Fixit",
      antitermite: "Terminator",
    },

    // 4) OTHER SECTIONS (unchanged)
    kitchen: {
      floorTiles: "₹60/sqft",
      counterSlab: "Granite ₹110/sqft",
      sink: "SS up to ₹4000",
      faucet: "₹2500 (Cera/Jaquar/Hindware)",
      wallTiles: "₹60/sqft",
      provisions: "RO, geyser, exhaust, washing machine",
    },

    bathroom: {
      pipes: "Ashirwad / Supreme CPVC/PVC",
      door: "Aluminium / PVC / WPC waterproof",
      sanitary: "₹25000 per washroom",
      make: "Cera / Hindware / Jaquar",
      floorTiles: "₹60/sqft",
      wallTiles: "₹60/sqft",
      tank: "2000L triple layer",
    },

    doorsWindows: {
      mainDoor: "Solid wood ₹25000, Grill/Tata Parvesh ₹35000",
      internalDoor: "Century Ply Sanik 710 BWP",
      laminate: "₹1800/sheet",
      fittings: "₹1000",
      railing: "SS 304 grade ₹650/rft",
      lock: "₹2000",
      upvcWindow: "₹550/sqft",
      grill: "Galvanized MS",
      glass: "Saint Gobain tinted/reflective",
    },

    painting: {
      interiorPaint: "Asian Apcolite",
      putty: "Birla putty 2 coats",
      primer: "Asian/Berger/Nerolac",
      rustic: "1 coat German Rustic",
      exteriorPaint: "Asian Apex weatherproof",
    },

    flooring: {
      masterBedroom: "Vitrified ₹60/sqft",
      bedroom: "Vitrified ₹60/sqft",
      livingDining: "Tiles ₹60/sqft",
      balcony: "₹45/sqft",
      staircase: "Granite/Marble ₹110/sqft",
      parking: "Anti-skid ₹45/sqft",
    },

    electrical: {
      wires: "Havells / Anchor",
      switches: "Anchor Penta/Roma",
      giBox: "Anchor",
      conduit: "Anchor",
      mcb: "Anchor",
      rccb: "₹2000/₹2500",
      subMeter: "₹600",
      changeOver: "₹3000/₹5000",
      bedroomPoints: "...as per PDF",
      hallPoints: "...as per PDF",
      kitchenPoints: "...as per PDF",
      bathroomPoints: "...as per PDF",
    },
    others: {
      earthingPit: 6000,
      lift: "As per vendor",
      rccChajja: "₹400/sqft",
      boundaryWall: "₹350/sqft",
      rainWaterHarvesting: 150000,
      undergroundTank: "₹500/sqft",
      kaddappa: "₹100/sqft",
      graniteSelf: "₹150/sqft",
    },
  },

  // SMART PACKAGE (same structure)
  {
    _id: "smart",
    name: "Smart (Basic)",
    type: "construction",

    items: [
      { label: "Footing", unit: "SQFT", rate: 550 },
      { label: "Basement (per sqft)", unit: "SQFT", rate: 1700 },
      { label: "Parking", unit: "SQFT", rate: 1100 },

      { label: "Floor (Residential)", unit: "SQFT", rate: 1600 },
      { label: "Floor (Commercial)", unit: "SQFT", rate: 1200 },

      { label: "Headroom", unit: "SQFT", rate: 1600 },
      { label: "Parapet Wall", unit: "SQFT", rate: 217 },

      { label: "Boundary Wall", unit: "SQFT", rate: 350 },
      { label: "Septic Tank", unit: "CFT", rate: 170 },
      { label: "Underground Water Tank", unit: "CFT", rate: 344 },
    ],

    materialOptions: [
      {
        key: "bricks",
        title: "Bricks",
        default: { label: "AAC Blocks", rateImpact: 0 },
        options: [
          { label: "Fly Ash Bricks", rateImpact: 0 },
          { label: "AAC Blocks", rateImpact: 0 },
          { label: "Red Bricks", rateImpact: 40 },
        ],
      },
      {
        key: "floorHeight",
        title: "Floor Height",
        default: { label: "10ft", rateImpact: 0 },
        options: [
          { label: "10ft", rateImpact: 0 },
          { label: "11ft", rateImpact: 40 },
          { label: "12ft", rateImpact: 70 },
        ],
      },
      {
        key: "groundFill",
        title: "Ground Fill Level",
        default: { label: "2.5ft", rateImpact: 0 },
        options: [{ label: "1ft", rateImpact: 50 }],
      },
    ],

    structure: {
      steel: "Rungta / Mongia",
      cement: "Bangur / Shree",
      bricks: "Fly Ash / Red Bricks",
      sand: "Brickwork sand & P-sand",
      aggregate: "20mm & 40mm",
      rcc: "M20 Design Mix",

      floorHeight: 10,
      extraFloorHeightRate: 40,

      groundLevelFromRoad: "2.5 ft above road",
      extraGroundFillRate: 50,

      waterproofing: "Dr. Fixit",
      antitermite: "Terminator",
    },

    kitchen: {
      floorTiles: "₹50/sqft",
      counterSlab: "Granite ₹90/sqft",
      sink: "SS up to ₹3500",
      faucet: "₹2000",
      wallTiles: "₹50/sqft",
      provisions: "RO, geyser, exhaust, washing machine",
    },

    bathroom: {
      pipes: "Ashirwad / Supreme",
      door: "Aluminium",
      sanitary: "₹20000 per washroom",
      make: "Cera / Hindware",
      floorTiles: "₹50/sqft",
      wallTiles: "₹50/sqft",
      tank: "2000L triple layer",
    },

    doorsWindows: {
      internalDoor: "Flush Door BWP",
      laminate: "₹700/sheet",
      fittings: "₹1000",
      railing: "SS 202 grade",
      window: "Aluminium 3-track",
      grill: "MS grill",
      glass: "Saint Gobain",
    },

    painting: {
      interiorPaint: "Tractor Emulsion/Nerolac/Berger/JSW",
      putty: "Berger Putty",
      primer: "Berger/Nerolac",
      rustic: "1 coat",
      exteriorPaint: "Weatherproof Emulsion",
    },

    flooring: {
      masterBedroom: "Vitrified ₹50/sqft",
      bedroom: "Vitrified ₹50/sqft",
      livingDining: "Tiles ₹50/sqft",
      balcony: "₹45/sqft",
      staircase: "Granite ₹90/sqft",
      parking: "Anti-skid ₹45/sqft",
    },

    electrical: {
      wires: "Polycab / Anchor",
      switches: "Anchor Penta/Roma",
      giBox: "Anchor",
      conduit: "Anchor",
      mcb: "Anchor",
      rccb: "₹2000/₹2500",
      subMeter: "₹600",
      changeOver: "₹2000/₹2500",
      bedroomPoints: "...as per PDF",
      hallPoints: "...as per PDF",
      kitchenPoints: "...as per PDF",
      bathroomPoints: "...as per PDF",
    },

    others: {
      earthingPit: 6000,
      lift: "As per vendor",
      rccChajja: "₹400/sqft",
      boundaryWall: "₹350/sqft",
      rainWaterHarvesting: 150000,
      undergroundTank: "₹500/sqft",
      kaddappa: "₹100/sqft",
      graniteSelf: "₹150/sqft",
    },
  },
];

const calculateQuote = async (req, res) => {
  try {
    const body = req.body || {};

    // -------- incoming data --------
    const packageSnapshot = body.packageSnapshot || body.pkg || null;
    const floorsData = body.floorsData || {};
    const structureRaw =
      (body.structure && (body.structure.raw || body.structure)) ||
      body.structureCode ||
      "";
    const parsedFloors = Array.isArray(body.parsedFloors)
      ? body.parsedFloors
      : null;

    const parkingEnabled = Boolean(body.parkingEnabled);
    const parkingArea = Number(body.parkingArea || 0);

    const septicEnabled = Boolean(body.septicEnabled);
    const septicDims = body.septicDims || null;

    const ugwtEnabled = Boolean(body.ugwtEnabled);
    const ugwtDims = body.ugwtDims || null;

    const boundaryWall = body.boundaryWall || null;

    const selectedCustomizations = Array.isArray(body.selectedCustomizations)
      ? body.selectedCustomizations
      : body.customizations || [];

    const gstIncluded = Boolean(body.gstIncluded);

    if (!packageSnapshot) {
      return res.status(400).json({ error: "packageSnapshot required" });
    }

    // -------- helpers --------
    const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

    const candidatesFromPkg = () =>
      []
        .concat(packageSnapshot.items || [])
        .concat(packageSnapshot.floorWorkDetails || [])
        .concat(packageSnapshot.rateItems || []);

    function findRateItem(label) {
      if (!label) return null;
      const key = String(label).trim().toLowerCase();
      const candidates = candidatesFromPkg();
      // exact match
      for (const it of candidates) {
        if (!it?.label) continue;
        const lab = String(it.label).trim().toLowerCase();
        if (lab === key) return it;
      }
      // partial match
      for (const it of candidates) {
        if (!it?.label) continue;
        const lab = String(it.label).trim().toLowerCase();
        if (lab.includes(key) || key.includes(lab)) return it;
      }
      return null;
    }

    function computeAmount(qty, rate, unit) {
      const q = Number(qty || 0);
      const r = Number(rate || 0);
      const u = String(unit || "")
        .trim()
        .toUpperCase();
      if (!r) return 0;
      if (u === "LS" || u === "LUMPSUM") return r;
      if (!q) return 0;
      return q * r;
    }

    function parseStructure(code) {
      if (!code) return [];
      const parts = String(code || "")
        .split("+")
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean);

      const floors = [];
      const ordinal = (n) => {
        const map = [
          "Zero",
          "First",
          "Second",
          "Third",
          "Fourth",
          "Fifth",
          "Sixth",
          "Seventh",
          "Eighth",
          "Ninth",
          "Tenth",
        ];
        return map[n] || `${n}th`;
      };

      for (const p of parts) {
        const bm = p.match(/^(\d*)B$/);
        if (bm) {
          const n = bm[1] ? Number(bm[1]) : 1;
          for (let i = n; i >= 1; i--) {
            floors.push(i === 1 ? "Basement floor" : `Basement ${i} floor`);
          }
          continue;
        }
        if (p === "B") {
          floors.push("Basement floor");
          continue;
        }
        if (p === "G") {
          floors.push("Ground floor");
          continue;
        }
        if (/^\d+$/.test(p)) {
          const n = Number(p);
          for (let i = 1; i <= n; i++) floors.push(`${ordinal(i)} floor`);
          continue;
        }
        if (!p.toLowerCase().includes("floor")) floors.push(`${p} floor`);
        else floors.push(p);
      }
      return floors;
    }

    function calculateProjectDuration(code) {
      if (!code) return 0;

      const parts = code.split("+").map((p) => p.trim().toUpperCase());

      // Count basements
      let basementCount = 0;
      const bm = code.match(/(\d*)B/i);
      if (bm) basementCount = bm[1] ? Number(bm[1]) : 1;

      // Count above-ground floors (including G as 1)
      let aboveFloors = 0;
      parts.forEach((p) => {
        if (p === "G") aboveFloors += 1;
        else if (!p.includes("B") && /^\d+$/.test(p)) aboveFloors += Number(p);
      });

      let duration = 0;

      // CASE 1: Starts with Basement
      if (parts[0].includes("B")) {
        // each basement = 5 months
        if (basementCount >= 1) duration += basementCount * 5;
        // floors above basement = 4.5 months each
        if (aboveFloors > 0) duration += aboveFloors * 4.5;
        return duration;
      }

      // CASE 2: Starts with Ground or only Ground
      if (parts[0] === "G") {
        // Ground floor = 6 months
        duration += 6;
        // additional above floors (if any) = 4.5 months each
        if (aboveFloors > 1) duration += (aboveFloors - 1) * 4.5;
        return duration;
      }

      // CASE 3: Starts directly with numeric floors (no G/B)
      if (aboveFloors >= 1) {
        duration += aboveFloors * 4.5;
      }

      return duration;
    }

    const floorsList =
      Array.isArray(parsedFloors) && parsedFloors.length
        ? parsedFloors
        : parseStructure(structureRaw);

    const hasBasement = String(structureRaw || "")
      .toUpperCase()
      .includes("B");

    // determine last non-basement floor
    let lastFloorName = null;
    for (let i = floorsList.length - 1; i >= 0; i--) {
      if (!/basement/i.test(floorsList[i])) {
        lastFloorName = floorsList[i];
        break;
      }
    }
    if (!lastFloorName) {
      lastFloorName = floorsList[floorsList.length - 1] || null;
    }
    const lastArea = lastFloorName ? Number(floorsData[lastFloorName] || 0) : 0;

    // -------- BRICK IMPACT --------
    let brickRateImpact = 0;
    const brickCustomization = (selectedCustomizations || []).find(
      (c) => c.key === "bricks" || /brick/i.test(String(c.key || ""))
    );
    if (brickCustomization)
      brickRateImpact = Number(brickCustomization.rateImpact || 0);
    if (!brickRateImpact && packageSnapshot.materialOptions) {
      const bricksOpt = packageSnapshot.materialOptions.find((m) =>
        /brick/i.test(m.title || m.key || "")
      );
      if (bricksOpt) {
        const chosen = bricksOpt.default || bricksOpt.options?.[0];
        brickRateImpact = Number(chosen?.rateImpact || 0);
      }
    }
    if (
      !brickRateImpact &&
      String(packageSnapshot.brickType || "")
        .toLowerCase()
        .includes("red")
    ) {
      brickRateImpact = 40;
    }

    // -------- HEIGHT IMPACT --------
    const floorToFloor = Number(body.inputs?.floorToFloorHeightFt || 10);
    const groundLevel = Number(body.inputs?.groundLevelAboveRoadFt || 2.5);

    const defaultFloorToFloor = 10;
    const defaultGroundLevel = 2.5;
    const ftImpact = 50; // Rs/ft

    const floorHeightImpact = (floorToFloor - defaultFloorToFloor) * ftImpact;
    const groundHeightImpact = (groundLevel - defaultGroundLevel) * ftImpact;

    // -------- BUILD OUTPUTS --------
    const workLines = [];
    const optionalWorks = [];
    const materials = [];
    let total = 0;

    // -------- FOOTING --------
    if (!hasBasement) {
      const footingArea = Number(
        floorsData.Footing || floorsData["Footing"] || 0
      );
      if (footingArea > 0) {
        const item = findRateItem("Footing");
        const baseRate = item ? Number(item.rate || item.baseRate || 0) : 0;
        const unit = item ? item.unit || "SQFT" : "SQFT";
        const rate = round2(baseRate + groundHeightImpact);
        const amount = round2(computeAmount(footingArea, rate, unit));
        workLines.push({
          code: "FOOTING",
          levelKey: "Footing & Tie Beam",
          description: `Rate of all civil work from Footing upto Tie Beam in roof slab covered area. Ground level from road - ${groundLevel} ft above existing road.`,
          unit,
          quantity: footingArea,
          rate,
          amount,
          included: true,
        });
        total += amount;
      }
    }

    // -------- FLOORS LOOP (including basement floors) --------
    for (const floorName of floorsList) {
      const areaRaw = floorsData[floorName];
      const area = Number(areaRaw || 0);
      if (!area || area <= 0) continue;

      const isBasement = /basement/i.test(floorName);

      // usage, scope, unit
      let usage = floorsData.__usage?.[floorName] || "Residential";
      let scope = floorsData.__scope?.[floorName] || "finishing";
      let unit = floorsData.__units?.[floorName]
        ? String(floorsData.__units[floorName]).toUpperCase()
        : "SQFT";

      // choose rate item:
      // - basement floors: prefer basement rate items
      // - non-basement: floor rates
      let item = null;
      if (isBasement) {
        item =
          findRateItem("Basement (per sqft)") ||
          findRateItem("Basement") ||
          findRateItem("Basement floor") ||
          findRateItem("Floor");
      } else {
        item =
          findRateItem(`Floor (${usage})`) ||
          findRateItem("Floor (Residential)") ||
          findRateItem("Floor") ||
          findRateItem(`${usage} Floor`);
      }

      const baseRate = item ? Number(item.rate || item.baseRate || 0) : 0;

      // If this is ground floor and parking is enabled => create parking workLine first and subtract area
      if (/ground/i.test(floorName) && parkingEnabled && parkingArea > 0) {
        const parkItem =
          findRateItem("Parking") ||
          findRateItem("Covered Parking") ||
          findRateItem("Parking (covered)") ||
          findRateItem("Parking (per sqft)");
        const parkRate = parkItem
          ? Number(parkItem.rate || parkItem.baseRate || 0)
          : 0;
        const parkUnit = parkItem ? parkItem.unit || "SQFT" : "SQFT";
        const parkQty = Math.min(parkingArea, area); // ensure not exceeding ground area
        const parkAmount = round2(computeAmount(parkQty, parkRate, parkUnit));

        // parking as a proper workLine (not optional)
        workLines.push({
          code: "PARKING_COVERED",
          levelKey: `Covered parking`,
          description: `Rate of all civil work for Covered parking area on ${floorName} upto roof slab covered area.`,
          unit: parkUnit,
          quantity: parkQty,
          rate: round2(parkRate),
          amount: parkAmount,
          included: true,
          meta: { parkingOf: floorName },
        });
        total += parkAmount;

        // reduce ground area for normal floor rate
        const remainingArea = Math.max(0, area - parkQty);
        if (remainingArea > 0) {
          const rate = round2(
            baseRate +
              (isBasement ? 0 : brickRateImpact) +
              (isBasement ? 0 : floorHeightImpact)
          );
          const amount = round2(computeAmount(remainingArea, rate, unit));
          workLines.push({
            code: `FLOOR_${floorName.replace(/\s+/g, "_").toUpperCase()}`,
            levelKey: floorName,
            description: `Rate of all civil work of ${floorName} for ${usage} use upto roof slab covered area (remaining after parking), with floor to floor height of ${floorToFloor}'.`,
            unit,
            quantity: remainingArea,
            rate,
            amount,
            included: true,
            meta: {
              usage,
              scope,
              brickImpact: isBasement ? 0 : brickRateImpact,
              heightImpact: isBasement ? 0 : floorHeightImpact,
            },
          });
          total += amount;
        }
        // done ground floor processing
        continue;
      }

      // normal floor processing (basement or non-ground without parking)
      const rate = round2(
        baseRate +
          (isBasement ? 0 : brickRateImpact) +
          (isBasement ? 0 : floorHeightImpact)
      );
      const amount = round2(computeAmount(area, rate, unit));

      workLines.push({
        code: `FLOOR_${floorName.replace(/\s+/g, "_").toUpperCase()}`,
        levelKey: floorName,
        description: `Rate of all civil work of ${floorName} for ${usage} use upto roof slab covered area, with floor to floor height of ${floorToFloor}'.`,
        unit,
        quantity: area,
        rate,
        amount,
        included: true,
        meta: {
          usage,
          scope,
          brickImpact: isBasement ? 0 : brickRateImpact,
          heightImpact: isBasement ? 0 : floorHeightImpact,
        },
      });

      total += amount;
    } // end floors loop

    // -------- HEADROOM (only once for last non-basement floor) --------
    // Use manual value if provided; otherwise auto = 12.5% of last non-basement area
    const headroomManual = Boolean(floorsData.__headroomManual);
    const manualVal = Number(floorsData.Headroom || 0);
    const autoVal = Math.round(lastArea * 0.125);
    const headroomArea = headroomManual && manualVal > 0 ? manualVal : autoVal;

    if (headroomArea > 0) {
      const hrItem =
        findRateItem("Headroom") ||
        findRateItem("Headroom Wall") ||
        findRateItem("Headroom (per sqft)");
      const hrBaseRate = hrItem
        ? Number(hrItem.rate || hrItem.baseRate || 0)
        : 0;
      const hrRate = round2(hrBaseRate + brickRateImpact); // bricks impact applies to headroom
      const hrUnit = hrItem ? hrItem.unit || "SQFT" : "SQFT";
      const hrAmount = round2(computeAmount(headroomArea, hrRate, hrUnit));

      workLines.push({
        code: "HEADROOM",
        levelKey: "Staircase Headroom",
        description: `Rate of all civil work for Staircase Headroom upto roof slab covered area.`,
        unit: hrUnit,
        quantity: headroomArea,
        rate: hrRate,
        amount: hrAmount,
        included: true,
        meta: { auto: !headroomManual },
      });

      total += hrAmount;
    }

    // -------- PARAPET (only once on last non-basement floor) --------
    if (lastFloorName && Number(floorsData[lastFloorName] || 0) > 0) {
      const parapetHeight = Number(floorsData.__parapetHeight || 3);
      if (parapetHeight > 0) {
        const baseLength = lastArea ? lastArea / 40 : 0;
        const offset = lastArea > 4000 ? 50 : 40;
        const rft = lastArea ? 2 * baseLength + offset + offset : 0;
        const parapetSqft = rft * parapetHeight;

        const paraItem =
          findRateItem("Parapet Wall") || findRateItem("Parapet");
        const paraBaseRate = paraItem
          ? Number(paraItem.rate || paraItem.baseRate || 0)
          : 0;
        const paraRate = round2(paraBaseRate + brickRateImpact);
        const paraUnit = paraItem ? paraItem.unit || "SQFT" : "SQFT";
        const paraAmount = round2(
          computeAmount(parapetSqft, paraRate, paraUnit)
        );

        workLines.push({
          code: "PARAPET_WALL",
          levelKey: 'Parapet wall',
          description: `Rate of all civil work for Parapet wall of ${rft} RFT.`,
          unit: paraUnit,
          quantity: round2(parapetSqft),
          rate: paraRate,
          amount: paraAmount,
          included: true,
          meta: { parapetHeight, rft: round2(rft) },
        });

        total += paraAmount;
      }
    }

    // -------- OPTIONAL WORKS: SEPTIC --------
    if (septicEnabled && septicDims) {
      const L = Number(septicDims.l ?? septicDims.length ?? 0);
      const W = Number(septicDims.w ?? septicDims.width ?? 0);
      const H = Number(septicDims.h ?? septicDims.height ?? 0);

      const vol = round2(L * W * H);

      if (vol > 0) {
        const item = findRateItem("Septic Tank") || findRateItem("Septic");
        const rate = item ? Number(item.rate || item.baseRate || 0) : 0;
        const amount = round2(computeAmount(vol, rate, "CFT"));

        optionalWorks.push({
          code: "SEPTIC_TANK",
          title: "Septic Tank",
          selected: true,
          length: L,
          width: W,
          height: H,
          quantity: vol,
          unit: "CFT",
          rate,
          amount,
        });

        total += amount;
      }
    }

    // -------- OPTIONAL WORKS: UGWT --------
    if (ugwtEnabled && ugwtDims) {
      const L = Number(ugwtDims.l ?? ugwtDims.length ?? 0);
      const W = Number(ugwtDims.w ?? ugwtDims.width ?? 0);
      const H = Number(ugwtDims.h ?? ugwtDims.height ?? 0);

      const vol = round2(L * W * H);

      if (vol > 0) {
        const item =
          findRateItem("Underground Water Tank") ||
          findRateItem("UGWT") ||
          findRateItem("Water Tank");
        const rate = item ? Number(item.rate || item.baseRate || 0) : 0;
        const amount = round2(computeAmount(vol, rate, "CFT"));

        optionalWorks.push({
          code: "UGWT",
          title: "Underground Water Tank",
          selected: true,
          length: L,
          width: W,
          height: H,
          quantity: vol,
          unit: "CFT",
          rate,
          amount,
        });

        total += amount;
      }
    }

    // -------- OPTIONAL WORKS: BOUNDARY --------
    if (boundaryWall?.length > 0 && boundaryWall?.height > 0) {
      const length = Number(boundaryWall.length || 0);
      const height = Number(boundaryWall.height || 0);
      const area = round2(length * height);

      if (area > 0) {
        const item = findRateItem("Boundary Wall") || findRateItem("Boundary");
        const rate = item ? Number(item.rate || item.baseRate || 0) : 0;
        const amount = round2(computeAmount(area, rate, "SQFT"));

        optionalWorks.push({
          code: "BOUNDARY_WALL",
          title: "Boundary Wall",
          selected: true,
          length,
          height,
          unit: "SQFT",
          quantity: area,
          rate,
          amount,
        });

        total += amount;
      }
    }

    // -------- MATERIALS (not included in total) --------
    const coveredArea = Number(floorsData.totalCoveredArea || lastArea || 0);

    if (Array.isArray(packageSnapshot.materials)) {
      for (const m of packageSnapshot.materials) {
        const qtyPerSqft = Number(m.qtyPerSqft || 0);
        const qty = round2(qtyPerSqft * coveredArea);
        const rate = Number(m.rate || 0);
        const amount = round2(qty * rate);

        materials.push({
          materialCode: m.code || "",
          description: m.description || m.name || "",
          unit: m.unit || "NOS",
          qtyPerSqft,
          quantity: qty,
          rate,
          amount,
        });
      }
    }

    // -------- TOTALS --------
    const subtotal = round2(total);
    const gstPercent = 18;
    const gstAmount = gstIncluded ? round2(subtotal * (gstPercent / 100)) : 0;
    const finalTotal = gstIncluded ? round2(subtotal + gstAmount) : subtotal;

    return res.json({
      workLines,
      optionalWorks,
      materials,
      totals: {
        subtotal,
        gstPercent,
        gstAmount,
        total: finalTotal,
        gstIncluded,
      },
      selectedCustomizations,
      workDetails: packageSnapshot.workDetails || [],
      durationInMonths: calculateProjectDuration(structureRaw),
    });
  } catch (err) {
    console.error("calculateQuote error:", err);
    res.status(500).json({
      error: "Calculation failed",
      details: err.message,
    });
  }
};

// createQuotation: persist quote document to DB; expects controller payload aligned with frontend
const createQuotation = async (req, res) => {
  try {
    const {
      lead,
      package: pkg,
      packageSnapshot,
      structure,
      floorsData,
      inputs,
      optionalWorks,
      workLines,
      materials,
      selectedCustomizations,
      workDetails,
      totals,
      durationInMonths,
      notes,
      inclusions,
      exclusions,
      paymentSchedule,
      action,
      sendChannels,
    } = req.body;
    const user = req.user

    // Validate and build lead snapshot
    let leadSnapshot = {};
    let existingLead = null;
    if (lead?.leadId) {
      existingLead = await Lead.findById(lead.leadId);
      if (!existingLead)
        return res.status(400).json({ error: "Lead not found" });
      leadSnapshot = {
        leadId: existingLead._id,
        name: existingLead.name,
        phone: existingLead.phoneNo || "",
        city: existingLead.location?.city || "",
        address:
          existingLead.location?.address || existingLead.location?.city || "",
        service: existingLead.requirement?.service || "",
      };
    } else {
      leadSnapshot = {
        name: lead?.name || "",
        phone: lead?.phone || "",
        city: lead?.city || lead?.address || "",
        address: lead?.address || lead?.city || "",
        service: lead?.service || "",
      };
    }

    // Build structure snapshot (levels should be provided as array or from floorsData)
    const levelsInput =
      structure && Array.isArray(structure.levels) && structure.levels.length
        ? structure.levels
        : Array.isArray(req.body.structure?.levels)
        ? req.body.structure.levels
        : null;

    const parsedLevels =
      levelsInput && Array.isArray(levelsInput) && levelsInput.length
        ? levelsInput.map((f) => ({
            key:
              f.key ||
              String(f.label || "")
                .replace(/\s+/g, "_")
                .toUpperCase(),
            label: f.label || f.key || "",
            area: Number(
              f.area ||
                (floorsData && floorsData[f.label] ? floorsData[f.label] : 0)
            ),
            usage:
              f.usage ||
              (floorsData && floorsData.__usage && floorsData.__usage[f.label]
                ? floorsData.__usage[f.label]
                : "Residential"),
            scope:
              f.scope ||
              (floorsData && floorsData.__scope && floorsData.__scope[f.label]
                ? floorsData.__scope[f.label]
                : "finishing"),
          }))
        : // fallback: build from floorsData keys and structure.raw
          (function () {
            const structureRaw =
              structure?.raw || structure || req.body.structureCode || "";
            const parseStructure = (code) => {
              if (!code) return [];
              const parts = String(code || "")
                .split("+")
                .map((p) => p.trim().toUpperCase())
                .filter(Boolean);
              // simple fallback mapping (same as UI parse)
              const out = [];
              for (const p of parts) {
                if (p === "B") out.push("Basement floor");
                else if (p === "G") out.push("Ground floor");
                else if (/^\d+$/.test(p)) {
                  const n = Number(p);
                  for (let i = 1; i <= n; i++) out.push(`${i}th floor`);
                } else out.push(`${p} floor`);
              }
              return out;
            };
            const parsed = parseStructure(structureRaw);
            return parsed.map((label) => ({
              key: String(label).replace(/\s+/g, "_").toUpperCase(),
              label,
              area: Number((floorsData && floorsData[label]) || 0),
              usage:
                (floorsData &&
                  floorsData.__usage &&
                  floorsData.__usage[label]) ||
                "Residential",
              scope:
                (floorsData &&
                  floorsData.__scope &&
                  floorsData.__scope[label]) ||
                "finishing",
            }));
          })();

    // Package snapshot
    const pkgSnapshot = pkg
      ? {
          name: pkg.name || pkgSnapshot?.name || "",
          category: pkg.category || "",
          ratesSnapshot:
            pkg.snapshot || packageSnapshot || pkg.ratesSnapshot || {},
        }
      : {
          name: packageSnapshot?.name || "",
          category: packageSnapshot?.category || "",
          ratesSnapshot:
            packageSnapshot?.ratesSnapshot || packageSnapshot || {},
        };

    // Optional works - prefer optionalInputs payload else use optionalWorks passed
    let optionalWorksArr = [];

    if (Array.isArray(req.body.optionalWorks)) {
      // Prefer calculated optional works from calculateQuote
      optionalWorksArr = req.body.optionalWorks;
    } else if (optionalInputs && typeof optionalInputs === "object") {
      // Fallback for older clients
      if (optionalInputs.septic?.enabled) {
        const L = Number(optionalInputs.septic.length || 0);
        const W = Number(optionalInputs.septic.width || 0);
        const H = Number(optionalInputs.septic.height || 0);
        const vol = L * W * H;

        optionalWorksArr.push({
          code: "SEPTIC_TANK",
          title: "Septic Tank",
          selected: true,
          length: L,
          width: W,
          height: H,
          unit: "CFT",
          quantity: vol,
          rate: Number(optionalInputs.septic.rate || 0),
          amount: Number(optionalInputs.septic.amount || 0),
        });
      }

      if (optionalInputs.ugwt?.enabled) {
        const L = Number(optionalInputs.ugwt.length || 0);
        const W = Number(optionalInputs.ugwt.width || 0);
        const H = Number(optionalInputs.ugwt.height || 0);
        const vol = L * W * H;

        optionalWorksArr.push({
          code: "UGWT",
          title: "Underground Water Tank",
          selected: true,
          length: L,
          width: W,
          height: H,
          unit: "CFT",
          quantity: vol,
          rate: Number(optionalInputs.ugwt.rate || 0),
          amount: Number(optionalInputs.ugwt.amount || 0),
        });
      }

      if (optionalInputs.boundaryWall?.enabled) {
        const len = Number(optionalInputs.boundaryWall.length || 0);
        const height = Number(optionalInputs.boundaryWall.height || 0);
        const area = len * height;

        optionalWorksArr.push({
          code: "BOUNDARY_WALL",
          title: "Boundary Wall",
          selected: true,
          length: len,
          height: height,
          unit: "SQFT",
          quantity: area,
          rate: Number(optionalInputs.boundaryWall.rate || 0),
          amount: Number(optionalInputs.boundaryWall.amount || 0),
        });
      }
    }

    // Totals snapshot
    const totalsSnapshot = {
      subtotal: Number(totals?.subtotal || 0),
      gstPercent: Number(totals?.gstPercent || 18),
      gstAmount: Number(totals?.gstAmount || 0),
      total: Number(totals?.total || 0),
      gstIncluded: Boolean(totals?.gstIncluded || false),
    };

    // assemble quote
    const newQuote = new Quote({
      status: action === "send" ? "sent" : "draft",
      lead: leadSnapshot,
      package: pkgSnapshot,
      structure: {
        raw: structure?.raw || structure || req.body.structureCode || "",
        hasBasement:
          Boolean(structure?.hasBasement) ||
          String(structure?.raw || req.body.structureCode || "")
            .toUpperCase()
            .includes("B"),
        levels: parsedLevels,
      },
      inputs: {
        floorToFloorHeightFt:
          (inputs && Number(inputs.floorToFloorHeightFt)) || 10,
        groundLevelAboveRoadFt:
          (inputs && Number(inputs.groundLevelAboveRoadFt)) || 2.5,
        brickType: inputs.brickType,
      },
      workLines: Array.isArray(workLines) ? workLines : [],
      optionalWorks: optionalWorksArr,
      materials: Array.isArray(materials)
        ? materials
        : Array.isArray(materials)
        ? materials
        : [],
      selectedCustomizations: Array.isArray(selectedCustomizations)
        ? selectedCustomizations
        : [],
      workDetails: Array.isArray(workDetails)
        ? workDetails
        : pkgSnapshot.ratesSnapshot?.workDetails || [],
      totals: totalsSnapshot,
      durationInMonths: Number(durationInMonths || 0),
      notes: notes || "",
      inclusions: Array.isArray(inclusions) ? inclusions : [],
      exclusions: Array.isArray(exclusions) ? exclusions : [],
      paymentSchedule: Array.isArray(paymentSchedule) ? paymentSchedule : [],
      pdf: {},
      createdBy: user._id
    });

    const saved = await newQuote.save();

    // If lead exists, update status
    if (leadSnapshot.leadId) {
      try {
        const ex = await Lead.findById(leadSnapshot.leadId);
        if (ex) {
          ex.status =
            action === "send" ? "Quotation Sent" : "Quotation Created";
          await ex.save();
        }
      } catch (e) {
        // ignore lead update error
      }
    }

    // If send requested, you can trigger send workflows here (email/whatsapp)
    // sendChannels can be processed by background job or immediate service

    return res.status(201).json(saved);
  } catch (err) {
    console.error("Create Quote error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create Quote", details: err.message });
  }
};

const getAllQuotations = async (req, res) => {
  try {
    const data = await Quote.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("Get all Quotes error:", err);
    res.status(500).json({ error: "Failed to fetch Quotes" });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: "Not found" });
    res.json(quote);
  } catch (err) {
    console.error("Get Quote error:", err);
    res.status(500).json({ error: "Failed to fetch Quote" });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const updated = await Quote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update Quote error:", err);
    res.status(500).json({ error: "Failed to update Quote" });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Quote error:", err);
    res.status(500).json({ error: "Failed to delete Quote" });
  }
};

const getRates = async (req, res) => {
  const rates = await Rate.find();
  res.json(rates);
};

const createOrUpdateRate = async (req, res) => {
  try {
    const { packageType, items } = req.body;
    const updated = await Rate.findOneAndUpdate(
      { packageType },
      { packageType, items, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPackages = async (req, res) => {
  try {
    if (!PACKAGES || PACKAGES.length === 0) {
      return res.status(500).json({ error: "No packages available" });
    }
    return res.json(PACKAGES);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const updatePackageRates = async (req, res) => {
  try {
    const id = req.params.id || req.body._id;
    if (!id) return res.status(400).json({ error: "Package id required" });

    // accept new fields
    const { items, materialOptions, brickType, materials, name, category } =
      req.body;

    // fetch package
    const pkg = await Package.findById(id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    if (typeof name === "string") pkg.name = name;
    if (typeof category === "string") pkg.category = category;
    if (Array.isArray(items))
      pkg.items = items.map((it) => ({
        label: it.label,
        unit: it.unit || (it.unit === "LS" ? "LS" : it.unit || "SQFT"),
        rate: Number(it.rate || 0),
        description: it.description || "",
      }));
    if (Array.isArray(materialOptions)) pkg.materialOptions = materialOptions;
    if (Array.isArray(materials)) pkg.materials = materials;
    if (brickType) pkg.brickType = brickType;

    await pkg.save();
    return res.json(pkg);
  } catch (err) {
    console.error("updatePackageRates error:", err);
    return res
      .status(500)
      .json({ error: "Failed to update package", details: err.message });
  }
};

module.exports = {
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  calculateQuote,
  getRates,
  createOrUpdateRate,
  getPackages,
  PACKAGES,
};
