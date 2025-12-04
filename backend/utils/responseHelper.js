/**
 * Response Helper
 * Standardisasi format response JSON untuk seluruh API
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Optional meta data for pagination
 */
export const successResponse = (res, data, message = "Success", statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    if (meta !== null) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} errorCode - Custom error code
 * @param {Array} errors - Array of validation errors
 */
export const errorResponse = (res, message, statusCode = 400, errorCode = null, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errorCode) {
        response.error_code = errorCode;
    }

    if (errors && errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Pagination Meta Generator
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalRecords - Total records in database
 */
export const paginationMeta = (page, limit, totalRecords) => {
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total_records: totalRecords,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
    };
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalRecords - Total records in database
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const paginatedResponse = (res, data, page, limit, totalRecords, message = "Success", statusCode = 200) => {
    const meta = paginationMeta(page, limit, totalRecords);
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta
    });
};

// Error Codes
export const ErrorCodes = {
    // Validation Errors (VAL_ERR_XXX)
    VALIDATION_ERROR: 'VAL_ERR_001',
    INVALID_INPUT: 'VAL_ERR_002',
    MISSING_FIELD: 'VAL_ERR_003',
    DUPLICATE_ENTRY: 'VAL_ERR_004',

    // Authentication Errors (AUTH_ERR_XXX)
    INVALID_CREDENTIALS: 'AUTH_ERR_001',
    TOKEN_EXPIRED: 'AUTH_ERR_002',
    TOKEN_INVALID: 'AUTH_ERR_003',
    NO_TOKEN: 'AUTH_ERR_004',
    REFRESH_TOKEN_INVALID: 'AUTH_ERR_005',

    // Authorization Errors (AUTHZ_ERR_XXX)
    FORBIDDEN: 'AUTHZ_ERR_001',
    INSUFFICIENT_ROLE: 'AUTHZ_ERR_002',

    // Resource Errors (RES_ERR_XXX)
    NOT_FOUND: 'RES_ERR_001',
    ALREADY_EXISTS: 'RES_ERR_002',

    // Transaction Errors (TRX_ERR_XXX)
    INVALID_STATUS_TRANSITION: 'TRX_ERR_001',
    ASSET_NOT_AVAILABLE: 'TRX_ERR_002',
    ASSET_NOT_ASSIGNED: 'TRX_ERR_003',

    // Server Errors (SRV_ERR_XXX)
    INTERNAL_ERROR: 'SRV_ERR_001',
    DATABASE_ERROR: 'SRV_ERR_002'
};
