import { Asset, Category, Location, Transaction, User } from "../models/index.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { Sequelize } from "sequelize";

const { Op, fn, col, literal } = Sequelize;

/**
 * Get summary statistics
 * Total assets by status, total categories, locations, users
 */
export const getSummaryStats = async (req, res) => {
    try {
        // Count assets by status
        const statusCounts = await Asset.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Transform to object
        const assetsByStatus = {
            available: 0,
            assigned: 0,
            repair: 0,
            retired: 0,
            missing: 0
        };

        statusCounts.forEach(item => {
            assetsByStatus[item.status] = parseInt(item.count);
        });

        // Total counts
        const totalAssets = await Asset.count();
        const totalCategories = await Category.count();
        const totalLocations = await Location.count();
        const totalUsers = await User.count();

        // Calculate total value
        const totalValue = await Asset.sum('purchase_price') || 0;

        // Assets added this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const assetsThisMonth = await Asset.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfMonth
                }
            }
        });

        // Transactions today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const transactionsToday = await Transaction.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfDay
                }
            }
        });

        return successResponse(res, {
            totalAssets,
            assetsByStatus,
            totalCategories,
            totalLocations,
            totalUsers,
            totalValue,
            assetsThisMonth,
            transactionsToday
        }, "Dashboard summary retrieved successfully");
    } catch (error) {
        console.error("Get summary stats error:", error);
        return errorResponse(res, "Failed to get dashboard summary", 500);
    }
};

/**
 * Get asset count by category
 */
export const getAssetsByCategory = async (req, res) => {
    try {
        const data = await Category.findAll({
            attributes: [
                'id',
                'name',
                [fn('COUNT', col('assets.id')), 'assetCount']
            ],
            include: [{
                model: Asset,
                as: 'assets',
                attributes: []
            }],
            group: ['Category.id'],
            order: [[literal('assetCount'), 'DESC']],
            raw: true
        });

        return successResponse(res, data, "Assets by category retrieved successfully");
    } catch (error) {
        console.error("Get assets by category error:", error);
        return errorResponse(res, "Failed to get assets by category", 500);
    }
};

/**
 * Get asset count by location
 */
export const getAssetsByLocation = async (req, res) => {
    try {
        const data = await Location.findAll({
            attributes: [
                'id',
                'name',
                'building',
                [fn('COUNT', col('assets.id')), 'assetCount']
            ],
            include: [{
                model: Asset,
                as: 'assets',
                attributes: []
            }],
            group: ['Location.id'],
            order: [[literal('assetCount'), 'DESC']],
            raw: true
        });

        return successResponse(res, data, "Assets by location retrieved successfully");
    } catch (error) {
        console.error("Get assets by location error:", error);
        return errorResponse(res, "Failed to get assets by location", 500);
    }
};

/**
 * Get asset count by status
 */
export const getAssetsByStatus = async (req, res) => {
    try {
        const data = await Asset.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        return successResponse(res, data, "Assets by status retrieved successfully");
    } catch (error) {
        console.error("Get assets by status error:", error);
        return errorResponse(res, "Failed to get assets by status", 500);
    }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const transactions = await Transaction.findAll({
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['id', 'asset_tag', 'name']
                },
                {
                    model: User,
                    as: 'performedBy',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit
        });

        return successResponse(res, transactions, "Recent transactions retrieved successfully");
    } catch (error) {
        console.error("Get recent transactions error:", error);
        return errorResponse(res, "Failed to get recent transactions", 500);
    }
};

/**
 * Get assets near warranty expiry (within next 30 days)
 */
export const getAssetsNearWarrantyExpiry = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const assets = await Asset.findAll({
            where: {
                warranty_expiry_date: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.lte]: futureDate },
                        { [Op.gte]: new Date() }
                    ]
                },
                status: {
                    [Op.notIn]: ['retired']
                }
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Location,
                    as: 'location',
                    attributes: ['id', 'name']
                }
            ],
            order: [['warranty_expiry_date', 'ASC']]
        });

        return successResponse(res, assets, "Assets near warranty expiry retrieved successfully");
    } catch (error) {
        console.error("Get assets near warranty expiry error:", error);
        return errorResponse(res, "Failed to get assets near warranty expiry", 500);
    }
};

/**
 * Get monthly transaction trends (last 6 months)
 */
export const getMonthlyTrends = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const data = await Transaction.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('transaction_date'), '%Y-%m'), 'month'],
                'action_type',
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                transaction_date: {
                    [Op.gte]: startDate
                }
            },
            group: [literal("DATE_FORMAT(transaction_date, '%Y-%m')"), 'action_type'],
            order: [[literal('month'), 'ASC']],
            raw: true
        });

        return successResponse(res, data, "Monthly trends retrieved successfully");
    } catch (error) {
        console.error("Get monthly trends error:", error);
        return errorResponse(res, "Failed to get monthly trends", 500);
    }
};
