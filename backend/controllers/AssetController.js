import { Asset, Category, Location, User, Transaction } from "../models/index.js";
import { successResponse, errorResponse, paginationMeta, ErrorCodes } from "../utils/responseHelper.js";
import { generateAssetTag } from "../utils/generateAssetTag.js";
import { Op } from "sequelize";

/**
 * Get all assets with pagination, filtering, sorting, and search
 * GET /api/assets
 */
export const getAllAssets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Search
        const search = req.query.search || "";
        
        // Filters
        const categoryId = req.query.category || "";
        const locationId = req.query.location || "";
        const status = req.query.status || "";
        const holderId = req.query.holder || "";
        
        // Date range filter
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";
        
        // Sorting
        const sortBy = req.query.sortBy || "createdAt";
        const order = req.query.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Build where clause
        const whereClause = {};

        // Search across multiple fields
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { assetTag: { [Op.like]: `%${search}%` } },
                { serialNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        // Status filter
        if (status && ["available", "assigned", "repair", "retired", "missing"].includes(status)) {
            whereClause.status = status;
        }

        // Date range filter (purchase date)
        if (startDate || endDate) {
            whereClause.purchaseDate = {};
            if (startDate) {
                whereClause.purchaseDate[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                whereClause.purchaseDate[Op.lte] = new Date(endDate);
            }
        }

        // Build include for category and location filters
        const includeOptions = [
            {
                model: Category,
                as: "category",
                attributes: ["uuid", "name"],
                ...(categoryId && {
                    where: { uuid: categoryId }
                })
            },
            {
                model: Location,
                as: "location",
                attributes: ["uuid", "name"],
                ...(locationId && {
                    where: { uuid: locationId }
                })
            },
            {
                model: User,
                as: "holder",
                attributes: ["uuid", "name", "email", "department"],
                required: false,
                ...(holderId && {
                    where: { uuid: holderId }
                })
            }
        ];

        // Valid sort fields
        const validSortFields = ["name", "assetTag", "serialNumber", "status", "purchaseDate", "price", "createdAt", "updatedAt"];
        const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

        const { count, rows } = await Asset.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit,
            offset,
            order: [[sortField, order]],
            distinct: true
        });

        // Format response
        const assets = rows.map(asset => ({
            uuid: asset.uuid,
            name: asset.name,
            assetTag: asset.assetTag,
            serialNumber: asset.serialNumber,
            status: asset.status,
            purchaseDate: asset.purchaseDate,
            price: asset.price,
            category: asset.category ? {
                uuid: asset.category.uuid,
                name: asset.category.name
            } : null,
            location: asset.location ? {
                uuid: asset.location.uuid,
                name: asset.location.name
            } : null,
            holder: asset.holder ? {
                uuid: asset.holder.uuid,
                name: asset.holder.name,
                department: asset.holder.department
            } : null,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt
        }));

        return successResponse(res, {
            assets,
            pagination: paginationMeta(count, page, limit)
        }, "Assets retrieved successfully");
    } catch (error) {
        console.error("Get all assets error:", error);
        return errorResponse(res, "Failed to retrieve assets", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Search assets (dedicated search endpoint)
 * GET /api/assets/search
 */
export const searchAssets = async (req, res) => {
    try {
        const query = req.query.q || "";
        const status = req.query.status || "";
        const limit = parseInt(req.query.limit) || 20;

        if (!query || query.length < 2) {
            return errorResponse(res, "Search query must be at least 2 characters", 400, ErrorCodes.VALIDATION_ERROR);
        }

        const whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${query}%` } },
                { assetTag: { [Op.like]: `%${query}%` } },
                { serialNumber: { [Op.like]: `%${query}%` } }
            ]
        };

        // Filter by status if provided
        if (status && ["available", "assigned", "repair", "retired", "missing"].includes(status)) {
            whereClause.status = status;
        }

        const assets = await Asset.findAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["uuid", "name"]
                },
                {
                    model: Location,
                    as: "location",
                    attributes: ["uuid", "name"]
                },
                {
                    model: User,
                    as: "holder",
                    attributes: ["uuid", "name"],
                    required: false
                }
            ],
            attributes: ["uuid", "name", "assetTag", "serialNumber", "status"],
            limit,
            order: [["name", "ASC"]]
        });

        return successResponse(res, { assets }, "Search completed successfully");
    } catch (error) {
        console.error("Search assets error:", error);
        return errorResponse(res, "Failed to search assets", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get asset by ID with full details
 * GET /api/assets/:id
 */
export const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findOne({
            where: { uuid: req.params.id },
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["uuid", "name", "description"]
                },
                {
                    model: Location,
                    as: "location",
                    attributes: ["uuid", "name", "address"]
                },
                {
                    model: User,
                    as: "holder",
                    attributes: ["uuid", "name", "email", "department"],
                    required: false
                }
            ]
        });

        if (!asset) {
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        return successResponse(res, { asset }, "Asset retrieved successfully");
    } catch (error) {
        console.error("Get asset by ID error:", error);
        return errorResponse(res, "Failed to retrieve asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get asset transaction history
 * GET /api/assets/:id/history
 */
export const getAssetHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // First, verify asset exists
        const asset = await Asset.findOne({
            where: { uuid: req.params.id },
            attributes: ["id", "uuid", "name", "assetTag"]
        });

        if (!asset) {
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Get transaction history
        const { count, rows } = await Transaction.findAndCountAll({
            where: { assetId: asset.id },
            include: [
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
            ],
            order: [["transactionDate", "DESC"]],
            limit,
            offset
        });

        const history = rows.map(tx => ({
            uuid: tx.uuid,
            actionType: tx.actionType,
            transactionDate: tx.transactionDate,
            conditionStatus: tx.conditionStatus,
            notes: tx.notes,
            employee: tx.employee ? {
                uuid: tx.employee.uuid,
                name: tx.employee.name,
                department: tx.employee.department
            } : null,
            processedBy: tx.admin ? {
                uuid: tx.admin.uuid,
                name: tx.admin.name
            } : null,
            createdAt: tx.createdAt
        }));

        return successResponse(res, {
            asset: {
                uuid: asset.uuid,
                name: asset.name,
                assetTag: asset.assetTag
            },
            history,
            pagination: paginationMeta(count, page, limit)
        }, "Asset history retrieved successfully");
    } catch (error) {
        console.error("Get asset history error:", error);
        return errorResponse(res, "Failed to retrieve asset history", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Create new asset
 * POST /api/assets
 */
export const createAsset = async (req, res) => {
    try {
        const { name, assetTag, serialNumber, categoryId, locationId, purchaseDate, price, specifications, notes } = req.validatedBody;

        // Verify category exists
        const category = await Category.findOne({ where: { uuid: categoryId } });
        if (!category) {
            return errorResponse(res, "Category not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Verify location exists
        const location = await Location.findOne({ where: { uuid: locationId } });
        if (!location) {
            return errorResponse(res, "Location not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Check serial number uniqueness
        const existingSerial = await Asset.findOne({ where: { serialNumber } });
        if (existingSerial) {
            return errorResponse(res, "Serial number already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
        }

        // Generate or validate asset tag
        let finalAssetTag = assetTag;
        if (!assetTag || assetTag.trim() === "") {
            // Auto-generate asset tag based on category
            finalAssetTag = await generateAssetTag(category.name);
        } else {
            // Check asset tag uniqueness
            const existingTag = await Asset.findOne({ where: { assetTag: assetTag.trim() } });
            if (existingTag) {
                return errorResponse(res, "Asset tag already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
            }
            finalAssetTag = assetTag.trim();
        }

        // Create asset
        const asset = await Asset.create({
            name: name.trim(),
            assetTag: finalAssetTag,
            serialNumber: serialNumber.trim(),
            categoryId: category.id,
            locationId: location.id,
            purchaseDate: new Date(purchaseDate),
            price: price || 0,
            specifications: specifications || null,
            status: "available",
            currentHolderId: null
        });

        // Fetch created asset with relations
        const createdAsset = await Asset.findOne({
            where: { id: asset.id },
            include: [
                { model: Category, as: "category", attributes: ["uuid", "name"] },
                { model: Location, as: "location", attributes: ["uuid", "name"] }
            ]
        });

        return successResponse(res, { asset: createdAsset }, "Asset created successfully", 201);
    } catch (error) {
        console.error("Create asset error:", error);
        return errorResponse(res, "Failed to create asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Update asset
 * PUT /api/assets/:id
 */
export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findOne({ where: { uuid: req.params.id } });

        if (!asset) {
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        const { name, assetTag, serialNumber, categoryId, locationId, purchaseDate, price, specifications, notes } = req.validatedBody;

        // Prepare update data
        const updateData = {};

        if (name) updateData.name = name.trim();
        if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
        if (price !== undefined) updateData.price = price;
        if (specifications !== undefined) updateData.specifications = specifications;

        // Validate and update asset tag if provided
        if (assetTag && assetTag.trim() !== asset.assetTag) {
            const existingTag = await Asset.findOne({
                where: {
                    assetTag: assetTag.trim(),
                    id: { [Op.ne]: asset.id }
                }
            });
            if (existingTag) {
                return errorResponse(res, "Asset tag already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
            }
            updateData.assetTag = assetTag.trim();
        }

        // Validate and update serial number if provided
        if (serialNumber && serialNumber.trim() !== asset.serialNumber) {
            const existingSerial = await Asset.findOne({
                where: {
                    serialNumber: serialNumber.trim(),
                    id: { [Op.ne]: asset.id }
                }
            });
            if (existingSerial) {
                return errorResponse(res, "Serial number already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
            }
            updateData.serialNumber = serialNumber.trim();
        }

        // Validate and update category if provided
        if (categoryId) {
            const category = await Category.findOne({ where: { uuid: categoryId } });
            if (!category) {
                return errorResponse(res, "Category not found", 404, ErrorCodes.NOT_FOUND);
            }
            updateData.categoryId = category.id;
        }

        // Validate and update location if provided
        if (locationId) {
            const location = await Location.findOne({ where: { uuid: locationId } });
            if (!location) {
                return errorResponse(res, "Location not found", 404, ErrorCodes.NOT_FOUND);
            }
            updateData.locationId = location.id;
        }

        // Update asset
        await asset.update(updateData);

        // Fetch updated asset with relations
        const updatedAsset = await Asset.findOne({
            where: { id: asset.id },
            include: [
                { model: Category, as: "category", attributes: ["uuid", "name"] },
                { model: Location, as: "location", attributes: ["uuid", "name"] },
                { model: User, as: "holder", attributes: ["uuid", "name"], required: false }
            ]
        });

        return successResponse(res, { asset: updatedAsset }, "Asset updated successfully");
    } catch (error) {
        console.error("Update asset error:", error);
        return errorResponse(res, "Failed to update asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Delete/Retire asset
 * DELETE /api/assets/:id
 */
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findOne({ where: { uuid: req.params.id } });

        if (!asset) {
            return errorResponse(res, "Asset not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Check if asset is currently assigned
        if (asset.status === "assigned") {
            return errorResponse(
                res,
                "Cannot delete assigned asset. Please check-in the asset first.",
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        // Soft delete: change status to retired instead of hard delete
        const forceDelete = req.query.force === "true";

        if (forceDelete) {
            // Check for transaction history
            const transactionCount = await Transaction.count({ where: { assetId: asset.id } });
            
            if (transactionCount > 0) {
                return errorResponse(
                    res,
                    `Cannot permanently delete asset with ${transactionCount} transaction records. Use soft delete instead.`,
                    400,
                    ErrorCodes.VALIDATION_ERROR
                );
            }

            await asset.destroy();
            return successResponse(res, null, "Asset permanently deleted");
        } else {
            // Soft delete - retire the asset
            await asset.update({ status: "retired" });
            return successResponse(res, { 
                asset: {
                    uuid: asset.uuid,
                    name: asset.name,
                    status: "retired"
                }
            }, "Asset retired successfully");
        }
    } catch (error) {
        console.error("Delete asset error:", error);
        return errorResponse(res, "Failed to delete asset", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get available assets for dropdown (for checkout)
 * GET /api/assets/available
 */
export const getAvailableAssets = async (req, res) => {
    try {
        const search = req.query.search || "";
        const limit = parseInt(req.query.limit) || 50;

        const whereClause = {
            status: "available"
        };

        if (search) {
            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { assetTag: { [Op.like]: `%${search}%` } },
                        { serialNumber: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const assets = await Asset.findAll({
            where: whereClause,
            include: [
                { model: Category, as: "category", attributes: ["uuid", "name"] },
                { model: Location, as: "location", attributes: ["uuid", "name"] }
            ],
            attributes: ["uuid", "name", "assetTag", "serialNumber"],
            order: [["name", "ASC"]],
            limit
        });

        return successResponse(res, { assets }, "Available assets retrieved successfully");
    } catch (error) {
        console.error("Get available assets error:", error);
        return errorResponse(res, "Failed to retrieve available assets", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get assigned assets for dropdown (for checkin)
 * GET /api/assets/assigned
 */
export const getAssignedAssets = async (req, res) => {
    try {
        const search = req.query.search || "";
        const limit = parseInt(req.query.limit) || 50;

        const whereClause = {
            status: "assigned"
        };

        if (search) {
            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { assetTag: { [Op.like]: `%${search}%` } },
                        { serialNumber: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const assets = await Asset.findAll({
            where: whereClause,
            include: [
                { model: Category, as: "category", attributes: ["uuid", "name"] },
                { model: Location, as: "location", attributes: ["uuid", "name"] },
                { model: User, as: "holder", attributes: ["uuid", "name", "email", "department"] }
            ],
            attributes: ["uuid", "name", "assetTag", "serialNumber"],
            order: [["name", "ASC"]],
            limit
        });

        return successResponse(res, { assets }, "Assigned assets retrieved successfully");
    } catch (error) {
        console.error("Get assigned assets error:", error);
        return errorResponse(res, "Failed to retrieve assigned assets", 500, ErrorCodes.SERVER_ERROR);
    }
};
