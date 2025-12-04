import { Category, Asset } from "../models/index.js";
import { successResponse, errorResponse, paginationMeta, ErrorCodes } from "../utils/responseHelper.js";
import { Op } from "sequelize";

/**
 * Get all categories with pagination
 * GET /api/categories
 */
export const getAllCategories = async (req, res) => {
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
                    { description: { [Op.like]: `%${search}%` } }
                ]
            }
            : {};

        const { count, rows } = await Category.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["name", "ASC"]]
        });

        return successResponse(res, {
            categories: rows,
            pagination: paginationMeta(count, page, limit)
        }, "Categories retrieved successfully");
    } catch (error) {
        console.error("Get all categories error:", error);
        return errorResponse(res, "Failed to retrieve categories", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { uuid: req.params.id },
            include: [
                {
                    model: Asset,
                    as: "assets",
                    attributes: ["uuid", "name", "asset_tag", "status"]
                }
            ]
        });

        if (!category) {
            return errorResponse(res, "Category not found", 404, ErrorCodes.NOT_FOUND);
        }

        return successResponse(res, { category }, "Category retrieved successfully");
    } catch (error) {
        console.error("Get category by ID error:", error);
        return errorResponse(res, "Failed to retrieve category", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Create new category
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || name.trim() === "") {
            return errorResponse(res, "Category name is required", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({
            where: { name: name.trim() }
        });

        if (existingCategory) {
            return errorResponse(res, "Category name already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
        }

        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || null
        });

        return successResponse(res, {
            category: {
                uuid: category.uuid,
                name: category.name,
                description: category.description,
                createdAt: category.createdAt
            }
        }, "Category created successfully", 201);
    } catch (error) {
        console.error("Create category error:", error);
        return errorResponse(res, "Failed to create category", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.findOne({
            where: { uuid: req.params.id }
        });

        if (!category) {
            return errorResponse(res, "Category not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Validation
        if (name !== undefined && name.trim() === "") {
            return errorResponse(res, "Category name cannot be empty", 400, ErrorCodes.VALIDATION_ERROR);
        }

        // Check if new name already exists (excluding current category)
        if (name && name.trim() !== category.name) {
            const existingCategory = await Category.findOne({
                where: {
                    name: name.trim(),
                    id: { [Op.ne]: category.id }
                }
            });

            if (existingCategory) {
                return errorResponse(res, "Category name already exists", 400, ErrorCodes.DUPLICATE_ENTRY);
            }
        }

        // Update category
        await category.update({
            name: name?.trim() || category.name,
            description: description !== undefined ? description?.trim() : category.description
        });

        return successResponse(res, {
            category: {
                uuid: category.uuid,
                name: category.name,
                description: category.description,
                updatedAt: category.updatedAt
            }
        }, "Category updated successfully");
    } catch (error) {
        console.error("Update category error:", error);
        return errorResponse(res, "Failed to update category", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { uuid: req.params.id }
        });

        if (!category) {
            return errorResponse(res, "Category not found", 404, ErrorCodes.NOT_FOUND);
        }

        // Check if category is being used by any assets
        const assetCount = await Asset.count({
            where: { category_id: category.id }
        });

        if (assetCount > 0) {
            return errorResponse(
                res,
                `Cannot delete category. It is currently used by ${assetCount} asset(s)`,
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        await category.destroy();

        return successResponse(res, null, "Category deleted successfully");
    } catch (error) {
        console.error("Delete category error:", error);
        return errorResponse(res, "Failed to delete category", 500, ErrorCodes.SERVER_ERROR);
    }
};

/**
 * Get all categories for dropdown (no pagination)
 * GET /api/categories/dropdown
 */
export const getCategoriesDropdown = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ["uuid", "name"],
            order: [["name", "ASC"]]
        });

        return successResponse(res, { categories }, "Categories retrieved successfully");
    } catch (error) {
        console.error("Get categories dropdown error:", error);
        return errorResponse(res, "Failed to retrieve categories", 500, ErrorCodes.SERVER_ERROR);
    }
};
