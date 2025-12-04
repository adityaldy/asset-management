import { Location, Asset } from "../models/index.js";
import { successResponse, errorResponse, paginationMeta, ErrorCodes } from "../utils/responseHelper.js";
import { Op } from "sequelize";

/**
 * Get all locations with pagination
 * GET /api/locations
 */
export const getAllLocations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";

        // Build where clause
        const whereClause = search
            ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } }
                ]
            }
            : {};

        const { count, rows } = await Location.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["name", "ASC"]],
            attributes: ["id", "uuid", "name", "address", "createdAt", "updatedAt"]
        });

        return successResponse(res, {
            locations: rows,
            pagination: paginationMeta(count, page, limit)
        }, "Locations retrieved successfully");
    } catch (error) {
        console.error("Get all locations error:", error);
        return errorResponse(res, "Failed to retrieve locations", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
export const getLocationById = async (req, res) => {
    try {
        const location = await Location.findOne({
            where: { uuid: req.params.id },
            attributes: ["id", "uuid", "name", "address", "createdAt", "updatedAt"],
            include: [
                {
                    model: Asset,
                    as: "assets",
                    attributes: ["uuid", "name", "assetTag", "status"]
                }
            ]
        });

        if (!location) {
            return errorResponse(res, "Location not found", 404, ErrorCodes.NOT_FOUND);
        }

        return successResponse(res, { location }, "Location retrieved successfully");
    } catch (error) {
        console.error("Get location by ID error:", error);
        return errorResponse(res, "Failed to retrieve location", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Create new location
 * POST /api/locations
 */
export const createLocation = async (req, res) => {
    try {
        const { name, address } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return errorResponse(res, "Location name is required", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Check if location name already exists
        const existingLocation = await Location.findOne({
            where: { name: name.trim() }
        });

        if (existingLocation) {
            return errorResponse(res, "Location name already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
        }

        const location = await Location.create({
            name: name.trim(),
            address: address?.trim() || null
        });

        return successResponse(res, {
            location: {
                uuid: location.uuid,
                name: location.name,
                address: location.address,
                createdAt: location.createdAt
            }
        }, "Location created successfully", 201);
    } catch (error) {
        console.error("Create location error:", error);
        return errorResponse(res, "Failed to create location", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Update location
 * PUT /api/locations/:id
 */
export const updateLocation = async (req, res) => {
    try {
        const { name, address } = req.body;

        const location = await Location.findOne({
            where: { uuid: req.params.id }
        });

        if (!location) {
            return errorResponse(res, "Location not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validation
        if (name !== undefined && name.trim() === "") {
            return errorResponse(res, "Location name cannot be empty", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Check if new name already exists (excluding current location)
        if (name && name.trim() !== location.name) {
            const existingLocation = await Location.findOne({
                where: {
                    name: name.trim(),
                    id: { [Op.ne]: location.id }
                }
            });

            if (existingLocation) {
                return errorResponse(res, "Location name already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
            }
        }

        // Update location
        await location.update({
            name: name?.trim() || location.name,
            address: address !== undefined ? address?.trim() : location.address
        });

        return successResponse(res, {
            location: {
                uuid: location.uuid,
                name: location.name,
                address: location.address,
                updatedAt: location.updatedAt
            }
        }, "Location updated successfully");
    } catch (error) {
        console.error("Update location error:", error);
        return errorResponse(res, "Failed to update location", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Delete location
 * DELETE /api/locations/:id
 */
export const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findOne({
            where: { uuid: req.params.id }
        });

        if (!location) {
            return errorResponse(res, "Location not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Check if location is being used by any assets
        const assetCount = await Asset.count({
            where: { locationId: location.id }
        });

        if (assetCount > 0) {
            return errorResponse(
                res,
                `Cannot delete location. It is currently used by ${assetCount} asset(s)`,
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        await location.destroy();

        return successResponse(res, null, "Location deleted successfully");
    } catch (error) {
        console.error("Delete location error:", error);
        return errorResponse(res, "Failed to delete location", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get all locations for dropdown (no pagination)
 * GET /api/locations/dropdown
 */
export const getLocationsDropdown = async (req, res) => {
    try {
        const locations = await Location.findAll({
            attributes: ["uuid", "name"],
            order: [["name", "ASC"]]
        });

        return successResponse(res, { locations }, "Locations retrieved successfully");
    } catch (error) {
        console.error("Get locations dropdown error:", error);
        return errorResponse(res, "Failed to retrieve locations", 500, ErrorCodes.SERVER_ERROR);
    }
};
