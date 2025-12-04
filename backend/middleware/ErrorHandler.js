import { errorResponse, ErrorCodes } from "../utils/responseHelper.js";

/**
 * Global Error Handler Middleware
 * Menangani semua error yang tidak tertangkap
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        return errorResponse(
            res,
            'Validation error',
            400,
            ErrorCodes.VALIDATION_ERROR,
            errors
        );
    }

    // Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: `${e.path} sudah digunakan`
        }));
        return errorResponse(
            res,
            'Data sudah ada',
            400,
            ErrorCodes.DUPLICATE_ENTRY,
            errors
        );
    }

    // Sequelize Foreign Key Constraint Error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return errorResponse(
            res,
            'Referensi data tidak valid',
            400,
            ErrorCodes.VALIDATION_ERROR
        );
    }

    // Sequelize Database Error
    if (err.name === 'SequelizeDatabaseError') {
        return errorResponse(
            res,
            'Database error',
            500,
            ErrorCodes.DATABASE_ERROR
        );
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(
            res,
            'Token tidak valid',
            403,
            ErrorCodes.TOKEN_INVALID
        );
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(
            res,
            'Token sudah kadaluarsa',
            401,
            ErrorCodes.TOKEN_EXPIRED
        );
    }

    // Syntax Error (Bad JSON)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return errorResponse(
            res,
            'Invalid JSON format',
            400,
            ErrorCodes.INVALID_INPUT
        );
    }

    // Default Internal Server Error
    return errorResponse(
        res,
        process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error',
        500,
        ErrorCodes.INTERNAL_ERROR
    );
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
    return errorResponse(
        res,
        `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
        404,
        ErrorCodes.NOT_FOUND
    );
};

export default errorHandler;
