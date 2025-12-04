import Joi from "joi";
import { errorResponse, ErrorCodes } from "../utils/responseHelper.js";
import { ConditionStatus } from "../utils/stateMachine.js";

/**
 * Joi schema for checkout transaction
 */
const checkoutSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    userId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid user/employee ID format",
            "any.required": "Employee ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format",
            "date.format": "Transaction date must be in ISO format"
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
 * Joi schema for checkin transaction
 */
const checkinSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    conditionStatus: Joi.string()
        .valid(ConditionStatus.GOOD, ConditionStatus.DAMAGED, ConditionStatus.LOST)
        .required()
        .messages({
            "any.only": "Condition status must be 'good', 'damaged', or 'lost'",
            "any.required": "Condition status is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format",
            "date.format": "Transaction date must be in ISO format"
        }),
    
    notes: Joi.string()
        .max(1000)
        .when("conditionStatus", {
            is: Joi.valid(ConditionStatus.DAMAGED, ConditionStatus.LOST),
            then: Joi.required(),
            otherwise: Joi.optional().allow("", null)
        })
        .messages({
            "string.max": "Notes cannot exceed 1000 characters",
            "any.required": "Notes are required when condition is damaged or lost"
        })
});

/**
 * Joi schema for repair transaction
 */
const repairSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format"
        }),
    
    notes: Joi.string()
        .max(1000)
        .required()
        .messages({
            "string.max": "Notes cannot exceed 1000 characters",
            "any.required": "Repair notes/reason is required"
        })
});

/**
 * Joi schema for complete repair transaction
 */
const completeRepairSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format"
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
 * Joi schema for dispose transaction
 */
const disposeSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format"
        }),
    
    notes: Joi.string()
        .max(1000)
        .required()
        .messages({
            "string.max": "Notes cannot exceed 1000 characters",
            "any.required": "Disposal reason/notes is required"
        })
});

/**
 * Joi schema for report lost transaction
 */
const reportLostSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format"
        }),
    
    notes: Joi.string()
        .max(1000)
        .required()
        .messages({
            "string.max": "Notes cannot exceed 1000 characters",
            "any.required": "Details about the lost asset is required"
        })
});

/**
 * Joi schema for report found transaction
 */
const reportFoundSchema = Joi.object({
    assetId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.guid": "Invalid asset ID format",
            "any.required": "Asset ID is required"
        }),
    
    transactionDate: Joi.date()
        .iso()
        .default(() => new Date())
        .messages({
            "date.base": "Invalid transaction date format"
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
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} - Express middleware
 */
const createValidator = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
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
};

// Export middleware validators
export const validateCheckout = createValidator(checkoutSchema);
export const validateCheckin = createValidator(checkinSchema);
export const validateRepair = createValidator(repairSchema);
export const validateCompleteRepair = createValidator(completeRepairSchema);
export const validateDispose = createValidator(disposeSchema);
export const validateReportLost = createValidator(reportLostSchema);
export const validateReportFound = createValidator(reportFoundSchema);

export default {
    validateCheckout,
    validateCheckin,
    validateRepair,
    validateCompleteRepair,
    validateDispose,
    validateReportLost,
    validateReportFound
};
