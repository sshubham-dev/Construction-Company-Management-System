// utils/dateFilter.js

export const formatDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const getCurrentMonth = () => {
    const today = new Date();

    return {
        fromDate: formatDate(
            new Date(today.getFullYear(), today.getMonth(), 1)
        ),
        toDate: formatDate(today),
    };
};

export const getLastMonth = () => {
    const today = new Date();

    return {
        fromDate: formatDate(
            new Date(today.getFullYear(), today.getMonth() - 1, 1)
        ),
        toDate: formatDate(
            new Date(today.getFullYear(), today.getMonth(), 0)
        ),
    };
};

export const getCurrentYear = () => {
    const today = new Date();

    return {
        fromDate: formatDate(
            new Date(today.getFullYear(), 0, 1)
        ),
        toDate: formatDate(today),
    };
};

export const getDateRange = (period) => {
    const today = new Date();

    switch (period) {
        case "today":
            return {
                fromDate: today.toLocaleDateString("en-CA"),
                toDate: today.toLocaleDateString("en-CA"),
            };

        case "week": {
            const start = new Date(today);
            start.setDate(today.getDate() - today.getDay());

            return {
                fromDate: start.toLocaleDateString("en-CA"),
                toDate: today.toLocaleDateString("en-CA"),
            };
        }

        case "month": {
            const start = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

            return {
                fromDate: start.toLocaleDateString("en-CA"),
                toDate: today.toLocaleDateString("en-CA"),
            };
        }

        case "lastMonth": {
            const start = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
            );

            const end = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );

            return {
                fromDate: start.toLocaleDateString("en-CA"),
                toDate: end.toLocaleDateString("en-CA"),
            };
        }

        case "quarter": {
            const quarter = Math.floor(today.getMonth() / 3);

            const start = new Date(
                today.getFullYear(),
                quarter * 3,
                1
            );

            return {
                fromDate: start.toLocaleDateString("en-CA"),
                toDate: today.toLocaleDateString("en-CA"),
            };
        }

        case "fy": {
            const fy =
                today.getMonth() >= 3
                    ? today.getFullYear()
                    : today.getFullYear() - 1;

            return {
                fromDate: `${fy}-04-01`,
                toDate: today.toLocaleDateString("en-CA"),
            };
        }

        default:
            return {
                fromDate: "",
                toDate: "",
            };
    }
};