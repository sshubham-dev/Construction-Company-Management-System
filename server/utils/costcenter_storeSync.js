const {
    Store,
} = require("../models/store.models");
const { Stock, Item } = require("../models/stock.models");
const BusinessUnit = require("../models/businessunit.models");
const { syncCostCenter } = require("../services/ERP/costcenter.service");
const User = require("../models/user.models");

const SyncStore_CostCenter = async (site) => {
    try {
        const {
            businessUnitId,
            address,
            storeHead,
            storeIncharge,
            companyId,
            type,
            name,
            isActive,
        } = site;

        if (!businessUnitId) throw new Error("Business Unit required");
        if (!storeHead) throw new Error("Store Head required");
        if (!type) throw new Error("Store type required");

        if (!["WAREHOUSE", "SITE"].includes(type)) {
            throw new Error("Invalid store type");
        }

        const bu = await BusinessUnit.findById(businessUnitId);
        if (!bu) throw new Error("Invalid Business Unit");

        const head = await User.findById(storeHead);
        const incharge = await User.findById(storeIncharge);

        if (!head) {
            throw new Error("Invalid employee");
        }

        const city = address?.city || "NA";
        const finalName = name || `${bu.name} ${type} - ${city}`;

        /* =========================
           CHECK EXISTING STORE (FIX)
        ========================== */
        let store = await Store.findOne({
            businessUnitId,
            type,
            name: finalName,
        });

        if (store) {
            console.log("Store already exists → reusing");

            store.storeHead = head._id || store.storeHead;
            store.storeIncharge = incharge._id || store.storeIncharge;
            store.businessUnitId = businessUnitId || store.businessUnitId;

            if (!store.costCenterId) {
                let costCenterId = site.costCenterId;

                if (!costCenterId) {
                    console.log("Cost Center not exist creating one.");
                    const costCenter = await syncCostCenter(site, "SITE");

                    costCenterId = costCenter._id;
                }

                store.costCenterId = costCenterId;
            }
            store.isActive = isActive || store.isActive;

            await store.save();

            return store;
        }

        /* =========================
           CREATE NEW STORE
        ========================== */
        const finalCode = `STR-${bu.code}-${city.substring(0, 3)}`
            .toUpperCase()
            .trim();

        store = await Store.create({
            name: finalName,
            code: finalCode,
            type,
            businessUnitId,
            companyId,
            address,
            storeHead,
            storeIncharge: incharge ? incharge._id : null,
            isActive: true
        });

        /* =========================
           REUSE SITE COST CENTER
        ========================= */

        let costCenterId = site.costCenterId;

        /* =========================
           CREATE ONLY IF NOT EXISTS
        ========================= */

        if (!costCenterId) {
            const costCenter = await syncCostCenter(site, "SITE");

            costCenterId = costCenter._id;
        }

        /* =========================
           ASSIGN TO STORE
        ========================= */

        store.costCenterId = costCenterId;

        await store.save();

        /* =========================
           AUTO CREATE STOCK
        ========================== */
        const items = await Item.find({ isActive: true }).select("_id");

        if (items.length) {
            const bulk = items.map((item) => ({
                insertOne: {
                    document: {
                        itemId: item._id,
                        storeId: store._id,
                        quantity: 0,
                        reservedQty: 0,
                        avgRate: 0,
                        stockValue: 0,
                        isActive: true,
                    },
                },
            }));

            try {
                await Stock.bulkWrite(bulk, { ordered: false });
            } catch (err) {
                if (err.code !== 11000) throw err;
            }
        }

        return store;

    } catch (err) {
        throw err;
    }
};

module.exports = SyncStore_CostCenter;