import { Asset, Category, Location, Transaction, User } from "../models/index.js";
import { successResponse, errorResponse, paginatedResponse } from "../utils/responseHelper.js";
import { Sequelize } from "sequelize";

const { Op } = Sequelize;

/**
 * Get Asset Report with filters
 * Export-ready format
 */
export const getAssetReport = async (req, res) => {
    try {
        const {
            category_id,
            location_id,
            status,
            start_date,
            end_date,
            format = 'json' // json or csv
        } = req.query;

        // Build where clause
        const where = {};

        if (category_id) where.category_id = category_id;
        if (location_id) where.location_id = location_id;
        if (status) where.status = status;

        if (start_date || end_date) {
            where.purchase_date = {};
            if (start_date) where.purchase_date[Op.gte] = new Date(start_date);
            if (end_date) where.purchase_date[Op.lte] = new Date(end_date);
        }

        const assets = await Asset.findAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                },
                {
                    model: Location,
                    as: 'location',
                    attributes: ['name', 'building', 'floor']
                },
                {
                    model: User,
                    as: 'currentHolder',
                    attributes: ['name', 'email', 'department']
                }
            ],
            order: [['asset_tag', 'ASC']]
        });

        // Format for CSV if requested
        if (format === 'csv') {
            const csvData = assets.map(asset => ({
                asset_tag: asset.asset_tag,
                name: asset.name,
                serial_number: asset.serial_number || '',
                category: asset.category?.name || '',
                location: asset.location?.name || '',
                building: asset.location?.building || '',
                floor: asset.location?.floor || '',
                status: asset.status,
                condition: asset.condition_status,
                purchase_date: asset.purchase_date || '',
                purchase_price: asset.purchase_price || 0,
                current_holder: asset.currentHolder?.name || '',
                holder_department: asset.currentHolder?.department || ''
            }));

            return successResponse(res, {
                data: csvData,
                headers: [
                    'asset_tag', 'name', 'serial_number', 'category', 'location',
                    'building', 'floor', 'status', 'condition', 'purchase_date',
                    'purchase_price', 'current_holder', 'holder_department'
                ]
            }, "Asset report generated successfully");
        }

        return successResponse(res, assets, "Asset report generated successfully");
    } catch (error) {
        console.error("Get asset report error:", error);
        return errorResponse(res, "Failed to generate asset report", 500);
    }
};

/**
 * Get Transaction Report with filters
 */
export const getTransactionReport = async (req, res) => {
    try {
        const {
            action_type,
            asset_id,
            user_id,
            start_date,
            end_date,
            page = 1,
            limit = 50,
            format = 'json'
        } = req.query;

        // Build where clause
        const where = {};

        if (action_type) where.action_type = action_type;
        if (asset_id) where.asset_id = asset_id;
        if (user_id) {
            where[Op.or] = [
                { performed_by: user_id },
                { assigned_to: user_id }
            ];
        }

        if (start_date || end_date) {
            where.transaction_date = {};
            if (start_date) where.transaction_date[Op.gte] = new Date(start_date);
            if (end_date) where.transaction_date[Op.lte] = new Date(end_date);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where,
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['asset_tag', 'name', 'serial_number']
                },
                {
                    model: User,
                    as: 'performedBy',
                    attributes: ['name', 'email']
                },
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['name', 'email']
                }
            ],
            order: [['transaction_date', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // Format for CSV if requested
        if (format === 'csv') {
            const csvData = transactions.map(tx => ({
                transaction_date: tx.transaction_date,
                action_type: tx.action_type,
                asset_tag: tx.asset?.asset_tag || '',
                asset_name: tx.asset?.name || '',
                performed_by: tx.performedBy?.name || '',
                assigned_to: tx.assignedTo?.name || '',
                condition_before: tx.condition_before || '',
                condition_after: tx.condition_after || '',
                notes: tx.notes || ''
            }));

            return successResponse(res, {
                data: csvData,
                headers: [
                    'transaction_date', 'action_type', 'asset_tag', 'asset_name',
                    'performed_by', 'assigned_to', 'condition_before', 'condition_after', 'notes'
                ]
            }, "Transaction report generated successfully");
        }

        return paginatedResponse(res, transactions, page, limit, count, "Transaction report generated successfully");
    } catch (error) {
        console.error("Get transaction report error:", error);
        return errorResponse(res, "Failed to generate transaction report", 500);
    }
};

/**
 * Get Audit Log - Full activity trail
 */
export const getAuditLog = async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            user_id,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        if (user_id) where.performed_by = user_id;

        if (start_date || end_date) {
            where.createdAt = {};
            if (start_date) where.createdAt[Op.gte] = new Date(start_date);
            if (end_date) where.createdAt[Op.lte] = new Date(end_date);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: logs } = await Transaction.findAndCountAll({
            where,
            include: [
                {
                    model: Asset,
                    as: 'asset',
                    attributes: ['id', 'asset_tag', 'name']
                },
                {
                    model: User,
                    as: 'performedBy',
                    attributes: ['id', 'name', 'email', 'role']
                },
                {
                    model: User,
                    as: 'assignedTo',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return paginatedResponse(res, logs, page, limit, count, "Audit log retrieved successfully");
    } catch (error) {
        console.error("Get audit log error:", error);
        return errorResponse(res, "Failed to get audit log", 500);
    }
};

/**
 * Get Asset Summary Report
 */
export const getAssetSummaryReport = async (req, res) => {
    try {
        // Total value by category
        const valueByCategory = await Asset.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('purchase_price')), 'totalValue'],
                [Sequelize.fn('COUNT', Sequelize.col('Asset.id')), 'count']
            ],
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }],
            group: ['category.id'],
            raw: true,
            nest: true
        });

        // Total value by status
        const valueByStatus = await Asset.findAll({
            attributes: [
                'status',
                [Sequelize.fn('SUM', Sequelize.col('purchase_price')), 'totalValue'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Assets by condition
        const byCondition = await Asset.findAll({
            attributes: [
                'condition_status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['condition_status'],
            raw: true
        });

        // Overall totals
        const totalAssets = await Asset.count();
        const totalValue = await Asset.sum('purchase_price') || 0;

        return successResponse(res, {
            totalAssets,
            totalValue,
            valueByCategory,
            valueByStatus,
            byCondition
        }, "Asset summary report generated successfully");
    } catch (error) {
        console.error("Get asset summary report error:", error);
        return errorResponse(res, "Failed to generate asset summary report", 500);
    }
};
