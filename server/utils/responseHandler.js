/**
 * Success Response
 */
const successResponse = (
    res,
    data = null,
    message = "Success",
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error Response
 */
const errorResponse = (
    res,
    error,
    statusCode = 500
) => {
    console.error(error);

    // Mongoose Validation Error
    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: Object.values(error.errors).map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    // Duplicate Key Error
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate record found.",
            field: Object.keys(error.keyValue)[0],
            value: Object.values(error.keyValue)[0],
        });
    }

    // Invalid ObjectId
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${error.path}.`,
        });
    }

    // Custom Error
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    // Default Error
    return res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};

module.exports = {
    successResponse,
    errorResponse,
};