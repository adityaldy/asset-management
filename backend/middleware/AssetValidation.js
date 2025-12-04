import Joi from "joi";
import { errorResponse, ErrorCodes } from "../utils/responseHelper.js";

/**
 * Joi schema for creating a new asset
 */
const createAssetSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(150)
        .required()
        .messages({
            "string.base": "Name must be a string",
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 150 characters",
            "any.required": "Name is required"
        }),
    
    assetTag: Joi.string()
        .max(50)
        .optional()
        .allow("", null)
        .messages({
            "string.max": "Asset tag cannot exceed 50 characters"
        }),
    
    serialNumber: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            "string.base": "Serial number must be a string",
            "string.empty": "Serial number is required",
            "string.max": "Serial number cannot exceed 100 characters",
            "any.required": "Serial number is required"
        }),
    
    categoryId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid category ID format",
            "any.required": "Category is required"
        }),
    
    locationId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid location ID format",
            "any.required": "Location is required"
        }),
    
    purchaseDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "Invalid purchase date format",
            "date.format": "Purchase date must be in ISO format (YYYY-MM-DD)",
            "any.required": "Purchase date is required"
        }),
    
    price: Joi.number()
        .min(0)
        .precision(2)
        .default(0)
        .messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative"
        }),
    
    specifications: Joi.object()
        .optional()
        .allow(null)
        .messages({
            "object.base": "Specifications must be a valid JSON object"
        }),
    
    notes: Joi.string()
        .max(1000)
        .optional()
        .allow("", null)
        .messages({
            "string.max": "Notes cannot exceed 1000 characters"
        })
});

/**
 * Joi schema for updating an asset
 */
const updateAssetSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(150)
        .optional()
        .messages({
            "string.base": "Name must be a string",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name cannot exceed 150 characters"
        }),
    
    assetTag: Joi.string()
        .max(50)
        .optional()
        .messages({
            "string.max": "Asset tag cannot exceed 50 characters"
        }),
    
    serialNumber: Joi.string()
        .min(1)
        .max(100)
        .optional()
        .messages({
            "string.base": "Serial number must be a string",
            "string.max": "Serial number cannot exceed 100 characters"
        }),
    
    categoryId: Joi.string()
        .uuid()
        .optional()
        .messages({
            "string.guid": "Invalid category ID format"
        }),
    
    locationId: Joi.string()
        .uuid()
        .optional()
        .messages({
            "string.guid": "Invalid location ID format"
        }),
    
    purchaseDate: Joi.date()
        .iso()
        .optional()
        .messages({
            "date.base": "Invalid purchase date format",
            "date.format": "Purchase date must be in ISO format (YYYY-MM-DD)"
        }),
    
    price: Joi.number()
        .min(0)
        .precision(2)
        .optional()
        .messages({
            "number.base": "Price must be a number",
            "number.min": "Price cannot be negative"
        }),
    
    specifications: Joi.object()
        .optional()
        .allow(null)
        .messages({
            "object.base": "Specifications must be a valid JSON object"
        }),
    
    notes: Joi.string()
        .max(1000)
        .optional()
        .allow("", null)
        .messages({
            "string.max": "Notes cannot exceed 1000 characters"
        })
}).min(1).messages({
    "object.min": "At least one field must be provided for update"
});

/**
 * Middleware to validate create asset request
 */
export const validateCreateAsset = (req, res, next) => {
    const { error, value } = createAssetSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return errorResponse(
            res,
            errorMessages.join(", "),
            400,
            ErrorCodes.VALIDATION_ERROR,
            { fields: error.details.map(d => ({ field: d.path.join("."), message: d.message })) }
        );
    }

    req.validatedBody = value;
    next();
};

/**
 * Middleware to validate update asset request
 */
export const validateUpdateAsset = (req, res, next) => {
    const { error, value } = updateAssetSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return errorResponse(
            res,
            errorMessages.join(", "),
            400,
            ErrorCodes.VALIDATION_ERROR,
            { fields: error.details.map(d => ({ field: d.path.join("."), message: d.message })) }
        );
    }

    req.validatedBody = value;
    next();
};

export default {
    validateCreateAsset,
    validateUpdateAsset,
    createAssetSchema,
    updateAssetSchema
};
