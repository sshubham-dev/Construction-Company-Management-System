const FiscalYear = require("../../models/fiscalyear.models.js");

exports.createFiscalYear = async (
    payload,
    user
) => {

    const overlap = await FiscalYear.findOne({
        company: payload.company,

        $or: [
            {
                startDate: {
                    $lte: payload.endDate,
                },

                endDate: {
                    $gte: payload.startDate,
                },
            },
        ],
    });

    if (overlap) {
        throw new Error(
            "Fiscal year already exists in this period"
        );
    }

    const fy = await FiscalYear.create({
        ...payload,
        createdBy: user._id,
    });

    return fy;
};

exports.closeFiscalYear = async (id) => {

    const fy =
        await FiscalYear.findById(id);

    if (!fy) {
        throw new Error(
            "Fiscal year not found"
        );
    }

    fy.isClosed = true;

    await fy.save();

    return fy;
};

exports.getFY = async (company) => {

    return FiscalYear
        .find({
            company
        })
        .sort({
            startDate: -1
        });

};

exports.reopenFY = async (id) => {

    return FiscalYear
        .findByIdAndUpdate(

            id,

            {
                isClosed: false
            },

            {
                new: true
            }

        );

};

exports.deleteFY = async (id) => {

    return FiscalYear
        .findByIdAndDelete(
            id
        );

};

exports.getFYByDate = async (
    company,
    date
) => {

    return FiscalYear.findOne({

        company,

        startDate: {
            $lte: date
        },

        endDate: {
            $gte: date
        }

    });

};