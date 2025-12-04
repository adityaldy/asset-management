import { Asset, User, Transaction, Category, Location } from "../models/index.js";
import { successResponse, errorResponse, paginationMeta, ErrorCodes } from "../utils/responseHelper.js";
import { validateTransition, getCheckinAction, ActionType, AssetStatus, ConditionStatus } from "../utils/stateMachine.js";
import { Op } from "sequelize";
import { db } from "../models/index.js";

/**
 * Checkout asset to employee
 * POST /api/transactions/checkout
 */
export const checkoutAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, userId, transactionDate, notes } = req.validatedBody;

        // Find asset
        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Find employee
        const employee = await User.findOne({ 
            where: { uuid: userId },
            transaction: t 
        });

        if (!employee) {
            await t.rollback();
            return errorResponse(res, "Employee not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.CHECKOUT);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Update asset status and holder
        await asset.update({
            status: transition.newStatus,
            current_holder_id: employee.id
        }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: employee.id,
            admin_id: req.user.id,
            action_type: ActionType.CHECKOUT,
            transaction_date: transactionDate || new Date(),
            condition_status: null,
            notes: notes || null
        }, { transaction: t });

        await t.commit();

        // Fetch complete transaction data
        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { 
                    model: Asset, 
                    as: "asset", 
                    attributes: ["uuid", "name", "asset_tag", "status"] 
                },
                { 
                    model: User, 
                    as: "employee", 
                    attributes: ["uuid", "name", "email", "department"] 
                },
                { 
                    model: User, 
                    as: "admin", 
                    attributes: ["uuid", "name"] 
                }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset checked out successfully", 201);
    } catch (error) {
        await t.rollback();
        console.error("Checkout asset error:", error);
        return errorResponse(res, "Failed to checkout asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Checkin asset from employee
 * POST /api/transactions/checkin
 */
export const checkinAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, conditionStatus, transactionDate, notes } = req.validatedBody;

        // Find asset with current holder
        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            include: [{ model: User, as: "holder", attributes: ["id", "uuid", "name"] }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Get the appropriate action based on condition
        const action = getCheckinAction(conditionStatus);
        
        // Validate state transition
        const transition = validateTransition(asset.status, action);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Store previous holder for transaction record
        const previousHolderId = asset.current_holder_id;

        // Update asset status
        const updateData = {
            status: transition.newStatus
        };

        // Clear holder unless going to repair (holder info might still be relevant)
        if (transition.newStatus === AssetStatus.AVAILABLE) {
            updateData.current_holder_id = null;
        }

        await asset.update(updateData, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: previousHolderId,
            admin_id: req.user.id,
            action_type: ActionType.CHECKIN,
            transaction_date: transactionDate || new Date(),
            condition_status: conditionStatus,
            notes: notes || null
        }, { transaction: t });

        await t.commit();

        // Fetch complete transaction data
        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { 
                    model: Asset, 
                    as: "asset", 
                    attributes: ["uuid", "name", "asset_tag", "status"] 
                },
                { 
                    model: User, 
                    as: "employee", 
                    attributes: ["uuid", "name", "email", "department"] 
                },
                { 
                    model: User, 
                    as: "admin", 
                    attributes: ["uuid", "name"] 
                }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset checked in successfully", 201);
    } catch (error) {
        await t.rollback();
        console.error("Checkin asset error:", error);
        return errorResponse(res, "Failed to checkin asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Send asset to repair
 * POST /api/transactions/repair
 */
export const sendToRepair = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, transactionDate, notes } = req.validatedBody;

        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.REPAIR);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Update asset status
        await asset.update({ status: transition.newStatus }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: asset.current_holder_id,
            admin_id: req.user.id,
            action_type: ActionType.REPAIR,
            transaction_date: transactionDate || new Date(),
            condition_status: ConditionStatus.DAMAGED,
            notes: notes || null
        }, { transaction: t });

        await t.commit();

        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { model: Asset, as: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { model: User, as: "admin", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset sent to repair successfully", 201);
    } catch (error) {
        await t.rollback();
        console.error("Send to repair error:", error);
        return errorResponse(res, "Failed to send asset to repair", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Complete repair and return asset to available
 * POST /api/transactions/complete-repair
 */
export const completeRepair = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, transactionDate, notes } = req.validatedBody;

        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.COMPLETE_REPAIR);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Update asset status and clear holder
        await asset.update({ 
            status: transition.newStatus,
            current_holder_id: null
        }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: null,
            admin_id: req.user.id,
            action_type: ActionType.COMPLETE_REPAIR,
            transaction_date: transactionDate || new Date(),
            condition_status: ConditionStatus.GOOD,
            notes: notes || "Repair completed"
        }, { transaction: t });

        await t.commit();

        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { model: Asset, as: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { model: User, as: "admin", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Repair completed successfully", 201);
    } catch (error) {
        await t.rollback();
        console.error("Complete repair error:", error);
        return errorResponse(res, "Failed to complete repair", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Report asset as lost
 * POST /api/transactions/report-lost
 */
export const reportLost = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, transactionDate, notes } = req.validatedBody;

        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.LOST);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Store previous holder
        const previousHolderId = asset.current_holder_id;

        // Update asset status (keep holder info for tracking)
        await asset.update({ status: transition.newStatus }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: previousHolderId,
            admin_id: req.user.id,
            action_type: ActionType.LOST,
            transaction_date: transactionDate || new Date(),
            condition_status: ConditionStatus.LOST,
            notes: notes || null
        }, { transaction: t });

        await t.commit();

        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { model: Asset, as: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { model: User, as: "employee", attributes: ["uuid", "name", "email"] },
                { model: User, as: "admin", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset reported as lost", 201);
    } catch (error) {
        await t.rollback();
        console.error("Report lost error:", error);
        return errorResponse(res, "Failed to report asset as lost", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Report asset as found
 * POST /api/transactions/report-found
 */
export const reportFound = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, transactionDate, notes } = req.validatedBody;

        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.FOUND);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Update asset status and clear holder
        await asset.update({ 
            status: transition.newStatus,
            current_holder_id: null
        }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: null,
            admin_id: req.user.id,
            action_type: ActionType.FOUND,
            transaction_date: transactionDate || new Date(),
            condition_status: ConditionStatus.GOOD,
            notes: notes || "Asset recovered"
        }, { transaction: t });

        await t.commit();

        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { model: Asset, as: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { model: User, as: "admin", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset reported as found", 201);
    } catch (error) {
        await t.rollback();
        console.error("Report found error:", error);
        return errorResponse(res, "Failed to report asset as found", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Dispose/retire asset
 * POST /api/transactions/dispose
 */
export const disposeAsset = async (req, res) => {
    const t = await db.transaction();
    
    try {
        const { assetId, transactionDate, notes } = req.validatedBody;

        const asset = await Asset.findOne({ 
            where: { uuid: assetId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!asset) {
            await t.rollback();
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validate state transition
        const transition = validateTransition(asset.status, ActionType.DISPOSE);
        if (!transition.valid) {
            await t.rollback();
            return errorResponse(res, transition.error, 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Update asset status and clear holder
        await asset.update({ 
            status: transition.newStatus,
            current_holder_id: null
        }, { transaction: t });

        // Create transaction record
        const transaction = await Transaction.create({
            asset_id: asset.id,
            user_id: null,
            admin_id: req.user.id,
            action_type: ActionType.DISPOSE,
            transaction_date: transactionDate || new Date(),
            condition_status: null,
            notes: notes || null
        }, { transaction: t });

        await t.commit();

        const result = await Transaction.findOne({
            where: { id: transaction.id },
            include: [
                { model: Asset, as: "asset", attributes: ["uuid", "name", "asset_tag", "status"] },
                { model: User, as: "admin", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { 
            transaction: result,
            message: transition.description
        }, "Asset disposed/retired successfully", 201);
    } catch (error) {
        await t.rollback();
        console.error("Dispose asset error:", error);
        return errorResponse(res, "Failed to dispose asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get all transactions with pagination and filtering
 * GET /api/transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Filters
        const actionType = req.query.actionType || "";
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";
        const search = req.query.search || "";

        // Build where clause
        const whereClause = {};

        if (actionType && Object.values(ActionType).includes(actionType)) {
            whereClause.action_type = actionType;
        }

        if (startDate || endDate) {
            whereClause.transaction_date = {};
            if (startDate) {
                whereClause.transaction_date[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.transaction_date[Op.lte] = new Date(endDate);
            }
        }

        // Build asset search include
        const assetInclude = {
            model: Asset,
            as: "asset",
            attributes: ["uuid", "name", "asset_tag", "serial_number", "status"],
            include: [
                { model: Category, as: "category", attributes: ["uuid", "name"] }
            ]
        };

        if (search) {
            assetInclude.where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { asset_tag: { [Op.like]: `%${search}%` } },
                    { serial_number: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where: whereClause,
            include: [
                assetInclude,
                { 
                    model: User, 
                    as: "employee", 
                    attributes: ["uuid", "name", "email", "department"],
                    required: false
                },
                { 
                    model: User, 
                    as: "admin", 
                    attributes: ["uuid", "name"] 
                }
            ],
            order: [["transaction_date", "DESC"]],
            limit,
            offset,
            distinct: true
        });

        return successResponse(res, {
            transactions: rows,
            pagination: paginationMeta(count, page, limit)
        }, "Transactions retrieved successfully");
    } catch (error) {
        console.error("Get all transactions error:", error);
        return errorResponse(res, "Failed to retrieve transactions", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            where: { uuid: req.params.id },
            include: [
                { 
                    model: Asset, 
                    as: "asset", 
                    attributes: ["uuid", "name", "asset_tag", "serial_number", "status"],
                    include: [
                        { model: Category, as: "category", attributes: ["uuid", "name"] },
                        { model: Location, as: "location", attributes: ["uuid", "name"] }
                    ]
                },
                { 
                    model: User, 
                    as: "employee", 
                    attributes: ["uuid", "name", "email", "department"],
                    required: false
                },
                { 
                    model: User, 
                    as: "admin", 
                    attributes: ["uuid", "name"] 
                }
            ]
        });

        if (!transaction) {
            return errorResponse(res, "Transaction not found", 404, ErrorCodes.NOT_FOUND);
        }

        return successResponse(res, { transaction }, "Transaction retrieved successfully");
    } catch (error) {
        console.error("Get transaction by ID error:", error);
        return errorResponse(res, "Failed to retrieve transaction", 500, ErrorCodes.SERVER_ERROR);
    }
};
