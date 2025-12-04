import { errorResponse, ErrorCodes } from "../utils/responseHelper.js";

/**
 * Role-Based Access Control (RBAC) Middleware
 * Mengotorisasi akses berdasarkan role user
 */

// Permission matrix - role yang diizinkan per resource
const rolePermissions = {
    admin: ['*'], // Full access
    staff: [
        'assets:read', 'assets:create', 'assets:update',
        'transactions:read', 'transactions:create',
        'categories:read',
        'locations:read',
        'users:read', // Hanya baca untuk dropdown employee
        'dashboard:read',
        'reports:read'
    ],
    employee: [
        'assets:read', // Read-only untuk fase selanjutnya
        'profile:read', 'profile:update'
    ]
};

/**
 * Authorize Roles Middleware
 * Mengecek apakah user memiliki role yang diizinkan
 * @param  {...string} allowedRoles - Role yang diizinkan (e.g., 'admin', 'staff')
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return errorResponse(
                res,
                'Unauthorized: Role tidak ditemukan',
                401,
                ErrorCodes.FORBIDDEN
            );
        }

        if (!allowedRoles.includes(req.userRole)) {
            return errorResponse(
                res,
                `Forbidden: Anda tidak memiliki akses untuk resource ini. Role yang diizinkan: ${allowedRoles.join(', ')}`,
                403,
                ErrorCodes.INSUFFICIENT_ROLE
            );
        }

        next();
    };
};

/**
 * Authorize Permission Middleware
 * Mengecek apakah user memiliki permission tertentu
 * @param {string} permission - Permission yang dibutuhkan (e.g., 'assets:create')
 */
export const authorizePermission = (permission) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return errorResponse(
                res,
                'Unauthorized: Role tidak ditemukan',
                401,
                ErrorCodes.FORBIDDEN
            );
        }

        const userPermissions = rolePermissions[req.userRole] || [];

        // Admin has all permissions
        if (userPermissions.includes('*')) {
            return next();
        }

        if (!userPermissions.includes(permission)) {
            return errorResponse(
                res,
                `Forbidden: Anda tidak memiliki permission '${permission}'`,
                403,
                ErrorCodes.INSUFFICIENT_ROLE
            );
        }

        next();
    };
};

/**
 * Admin Only Middleware
 * Shortcut untuk endpoint yang hanya bisa diakses admin
 */
export const adminOnly = authorizeRoles('admin');

/**
 * Staff and Admin Middleware
 * Shortcut untuk endpoint yang bisa diakses staff dan admin
 */
export const staffAndAdmin = authorizeRoles('admin', 'staff');

export default authorizeRoles;
