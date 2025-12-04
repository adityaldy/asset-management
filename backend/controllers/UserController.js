import { User, Asset, Transaction } from "../models/index.js";
import { successResponse, errorResponse, paginationMeta, ErrorCodes } from "../utils/responseHelper.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

/**
 * Get all users with pagination
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";
        const role = req.query.role || "";

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { department: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && ["admin", "staff", "employee"].includes(role)) {
            whereClause.role = role;
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["name", "ASC"]],
            attributes: ["id", "uuid", "name", "email", "role", "department", "createdAt", "updatedAt"]
        });

        return successResponse(res, {
            users: rows,
            pagination: paginationMeta(count, page, limit)
        }, "Users retrieved successfully");
    } catch (error) {
        console.error("Get all users error:", error);
        return errorResponse(res, "Failed to retrieve users", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { uuid: req.params.id },
            attributes: ["id", "uuid", "name", "email", "role", "department", "createdAt", "updatedAt"],
            include: [
                {
                    model: Asset,
                    as: "heldAssets",
                    attributes: ["uuid", "name", "assetTag", "status"]
                }
            ]
        });

        if (!user) {
            return errorResponse(res, "User not found", 404, ErrorCodes.NOT_FOUND);
        }

        return successResponse(res, { user }, "User retrieved successfully");
    } catch (error) {
        console.error("Get user by ID error:", error);
        return errorResponse(res, "Failed to retrieve user", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Create new user
 * POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return errorResponse(res, "Name is required", 400, ErrorCodes.VALIDATION_ERROR);
        }

        if (!email || email.trim() === "") {
            return errorResponse(res, "Email is required", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(res, "Invalid email format", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        });

        if (existingUser) {
            return errorResponse(res, "Email already registered", 400, ErrorCodes.DUPLICATE_ENTRY);
        }

        // Role validation
        const validRoles = ["admin", "staff", "employee"];
        if (role && !validRoles.includes(role)) {
            return errorResponse(res, "Invalid role. Must be admin, staff, or employee", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Password validation (optional for employees)
        let hashedPassword = null;
        if (password) {
            if (password.length < 6) {
                return errorResponse(res, "Password must be at least 6 characters", 400, ErrorCodes.VALIDATION_ERROR);
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role || "employee",
            department: department?.trim() || null
        });

        return successResponse(res, {
            user: {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                createdAt: user.createdAt
            }
        }, "User created successfully", 201);
    } catch (error) {
        console.error("Create user error:", error);
        return errorResponse(res, "Failed to create user", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        const user = await User.findOne({
            where: { uuid: req.params.id }
        });

        if (!user) {
            return errorResponse(res, "User not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Prevent non-admin from updating admin users
        if (user.role === "admin" && req.user.role !== "admin") {
            return errorResponse(res, "Not authorized to update admin users", 403, ErrorCodes.FORBIDDEN);
        }

        // Validation
        if (name !== undefined && name.trim() === "") {
            return errorResponse(res, "Name cannot be empty", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Email validation
        if (email !== undefined) {
            if (email.trim() === "") {
                return errorResponse(res, "Email cannot be empty", 400, ErrorCodes.VALIDATION_ERROR);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return errorResponse(res, "Invalid email format", 400, ErrorCodes.VALIDATION_ERROR);
            }

            // Check if new email already exists (excluding current user)
            if (email.trim().toLowerCase() !== user.email) {
                const existingUser = await User.findOne({
                    where: {
                        email: email.trim().toLowerCase(),
                        id: { [Op.ne]: user.id }
                    }
                });

                if (existingUser) {
                    return errorResponse(res, "Email already registered", 400, ErrorCodes.DUPLICATE_ENTRY);
                }
            }
        }

        // Role validation
        if (role !== undefined) {
            const validRoles = ["admin", "staff", "employee"];
            if (!validRoles.includes(role)) {
                return errorResponse(res, "Invalid role. Must be admin, staff, or employee", 400, ErrorCodes.VALIDATION_ERROR);
            }
        }

        // Password validation
        let hashedPassword = user.password;
        if (password) {
            if (password.length < 6) {
                return errorResponse(res, "Password must be at least 6 characters", 400, ErrorCodes.VALIDATION_ERROR);
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update user
        await user.update({
            name: name?.trim() || user.name,
            email: email?.trim().toLowerCase() || user.email,
            password: hashedPassword,
            role: role || user.role,
            department: department !== undefined ? department?.trim() : user.department
        });

        return successResponse(res, {
            user: {
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                updatedAt: user.updatedAt
            }
        }, "User updated successfully");
    } catch (error) {
        console.error("Update user error:", error);
        return errorResponse(res, "Failed to update user", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { uuid: req.params.id }
        });

        if (!user) {
            return errorResponse(res, "User not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Prevent deleting yourself
        if (user.uuid === req.user.uuid) {
            return errorResponse(res, "Cannot delete your own account", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Prevent non-admin from deleting admin users
        if (user.role === "admin" && req.user.role !== "admin") {
            return errorResponse(res, "Not authorized to delete admin users", 403, ErrorCodes.FORBIDDEN);
        }

        // Check if user is currently holding any assets
        const heldAssetsCount = await Asset.count({
            where: { currentHolderId: user.id }
        });

        if (heldAssetsCount > 0) {
            return errorResponse(
                res,
                `Cannot delete user. They are currently holding ${heldAssetsCount} asset(s). Please return all assets first.`,
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        // Check if user has transaction history (optional: just warn, don't block)
        const transactionCount = await Transaction.count({
            where: {
                [Op.or]: [
                    { userId: user.id },
                    { adminId: user.id }
                ]
            }
        });

        if (transactionCount > 0) {
            // Soft delete or just warn
            // For now, we allow deletion but the transactions will have null references
            console.warn(`Deleting user with ${transactionCount} transaction records`);
        }

        await user.destroy();

        return successResponse(res, null, "User deleted successfully");
    } catch (error) {
        console.error("Delete user error:", error);
        return errorResponse(res, "Failed to delete user", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get employees for dropdown (users with role 'employee')
 * GET /api/users/employees
 */
export const getEmployees = async (req, res) => {
    try {
        const search = req.query.search || "";

        const whereClause = {
            role: "employee"
        };

        if (search) {
            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { department: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const employees = await User.findAll({
            where: whereClause,
            attributes: ["uuid", "name", "email", "department"],
            order: [["name", "ASC"]],
            limit: 50 // Limit for performance
        });

        return successResponse(res, { employees }, "Employees retrieved successfully");
    } catch (error) {
        console.error("Get employees error:", error);
        return errorResponse(res, "Failed to retrieve employees", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get all users for dropdown (no pagination)
 * GET /api/users/dropdown
 */
export const getUsersDropdown = async (req, res) => {
    try {
        const role = req.query.role || "";

        const whereClause = {};
        if (role && ["admin", "staff", "employee"].includes(role)) {
            whereClause.role = role;
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ["uuid", "name", "email", "role", "department"],
            order: [["name", "ASC"]]
        });

        return successResponse(res, { users }, "Users retrieved successfully");
    } catch (error) {
        console.error("Get users dropdown error:", error);
        return errorResponse(res, "Failed to retrieve users", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Reset user password (Admin only)
 * POST /api/users/:id/reset-password
 */
export const resetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        const user = await User.findOne({
            where: { uuid: req.params.id }
        });

        if (!user) {
            return errorResponse(res, "User not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Password validation
        if (!newPassword || newPassword.length < 6) {
            return errorResponse(res, "New password must be at least 6 characters", 400, ErrorCodes.VALIDATION_ERROR);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password: hashedPassword,
            refreshToken: null // Invalidate existing sessions
        });

        return successResponse(res, null, "Password reset successfully");
    } catch (error) {
        console.error("Reset password error:", error);
        return errorResponse(res, "Failed to reset password", 500, ErrorCodes.SERVER_ERROR);
    }
};
