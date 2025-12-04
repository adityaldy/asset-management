import jwt from "jsonwebtoken";
import { errorResponse, ErrorCodes } from "../utils/responseHelper.js";

/**
 * Verify Access Token Middleware
 * Memverifikasi JWT access token dari header Authorization
 */
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return errorResponse(
            res,
            'Access token tidak ditemukan',
            401,
            ErrorCodes.NO_TOKEN
        );
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return errorResponse(
                    res,
                    'Access token sudah kadaluarsa',
                    401,
                    ErrorCodes.TOKEN_EXPIRED
                );
            }
            return errorResponse(
                res,
                'Access token tidak valid',
                403,
                ErrorCodes.TOKEN_INVALID
            );
        }

        // Simpan data user dari token ke request
        req.userId = decoded.userId;
        req.userUuid = decoded.uuid;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;

        next();
    });
};

/**
 * Optional Token Verification
 * Untuk endpoint yang bisa diakses dengan atau tanpa token
 */
export const optionalToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (!err) {
            req.userId = decoded.userId;
            req.userUuid = decoded.uuid;
            req.userRole = decoded.role;
            req.userEmail = decoded.email;
        }
        next();
    });
};

export default verifyToken;
