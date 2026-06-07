const FiscalYear = require("../models/fiscalyear.models.js");

const validateFiscalYear = async (req, res, next) => {
    try {
        const fy = await getFYByDate(req.body.company, req.body.date);

        if (!fy) {
            return res
                .status(400)
                .json({ message: "No Fiscal Year" });

        }

        if (fy.isClosed) {

            return res
                .status(400)
                .json({

                    message:
                        "Fiscal Year Closed"

                });

        }
        req.fiscalYear =
            fy;
        next();
    }
    catch (err) {
        next(err);
    }

};

module.exports = validateFiscalYear;