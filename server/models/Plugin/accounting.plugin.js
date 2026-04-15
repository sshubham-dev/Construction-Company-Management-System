const { syncLedger } = require("../../utils/ledgerSync");

const accountingPlugin = (schema, options) => {
  const {
    category,
    getAddress = () => ({}),
    getTaxDetails = () => ({}),
    recalc = null,
  } = options;

  if (!category) {
    throw new Error("accountingPlugin requires category");
  }

  // ======================================================
  // PRE-SAVE
  // ======================================================
  schema.pre("save", async function () {
    try {
      // optional finance recalculation
      if (recalc) {
        await recalc(this);
      }

      // ledger sync
      const ledgerId = await syncLedger({
        doc: this,
        category,
        getAddress,
        getTaxDetails,
      });

      if (ledgerId) this.ledger = ledgerId;
    } catch (err) {
      console.error(`${category} pre-save error:`, err);
      throw err;
    }
  });

  // ======================================================
  // PRE FIND-AND-UPDATE
  // ======================================================
  schema.pre("findOneAndUpdate", async function () {
    try {
      const doc = await this.model.findOne(this.getQuery());
      if (!doc) return;

      const update = this.getUpdate() || {};

      // ✅ safe merge
      const merged = doc.toObject();

      if (update.$set) {
        Object.assign(merged, update.$set);
      } else {
        Object.assign(merged, update);
      }

      // optional finance recalculation
      if (recalc) {
        await recalc(merged);
      }

      // ensure $set exists
      if (!update.$set) update.$set = {};

      // ledger sync
      const ledgerId = await syncLedger({
        doc: merged,
        category,
        getAddress,
        getTaxDetails,
      });

      if (ledgerId) update.$set.ledger = ledgerId;

      this.setUpdate(update);
    } catch (err) {
      console.error(`${category} pre-update error:`, err);
      throw err;
    }
  });
};

module.exports = accountingPlugin;