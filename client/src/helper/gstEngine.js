export const splitGSTRate = ({
    gstRate = 0,
    companyState,
    partyState,
}) => {
    gstRate = Number(gstRate || 0);

    const intraState =
        companyState?.toLowerCase() === partyState?.toLowerCase();

    if (intraState) {
        return {
            cgstRate: gstRate / 2,
            sgstRate: gstRate / 2,
            igstRate: 0,
        };
    }

    return {
        cgstRate: 0,
        sgstRate: 0,
        igstRate: gstRate,
    };
};

export const calculateGST = ({
    taxableAmount = 0,
    gstRate = 0,
    companyState,
    partyState,
}) => {

    const rates = splitGSTRate({
        gstRate,
        companyState,
        partyState,
    });

    const cgstAmount =
        taxableAmount * (rates.cgstRate / 100);

    const sgstAmount =
        taxableAmount * (rates.sgstRate / 100);

    const igstAmount =
        taxableAmount * (rates.igstRate / 100);

    return {
        ...rates,

        cgstAmount,

        sgstAmount,

        igstAmount,

        total:
            taxableAmount +
            cgstAmount +
            sgstAmount +
            igstAmount,
    };
};