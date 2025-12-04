import { Asset } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Generate unique asset tag based on category prefix and sequence number
 * Format: {PREFIX}-{YEAR}-{SEQUENCE}
 * Example: LPT-2025-0001 (Laptop), MON-2025-0001 (Monitor)
 */

// Category prefix mapping
const categoryPrefixes = {
    "laptop": "LPT",
    "monitor": "MON",
    "server": "SRV",
    "printer": "PRT",
    "scanner": "SCN",
    "keyboard": "KBD",
    "mouse": "MOU",
    "headset": "HST",
    "webcam": "WBC",
    "router": "RTR",
    "switch": "SWT",
    "ups": "UPS",
    "projector": "PRJ",
    "phone": "PHN",
    "tablet": "TAB",
    "desktop": "DSK",
    "storage": "STR",
    "cable": "CBL",
    "adapter": "ADP",
    "other": "OTH"
};

/**
 * Get prefix from category name
 * @param {string} categoryName - Category name
 * @returns {string} - Prefix (3 characters)
 */
export const getCategoryPrefix = (categoryName) => {
    if (!categoryName) return "AST"; // Default prefix

    const normalizedName = categoryName.toLowerCase().trim();
    
    // Check exact match first
    if (categoryPrefixes[normalizedName]) {
        return categoryPrefixes[normalizedName];
    }

    // Check partial match
    for (const [key, prefix] of Object.entries(categoryPrefixes)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return prefix;
        }
    }

    // Generate prefix from first 3 characters if no match
    return categoryName.substring(0, 3).toUpperCase();
};

/**
 * Generate unique asset tag
 * @param {string} categoryName - Category name for prefix
 * @returns {Promise<string>} - Generated asset tag
 */
export const generateAssetTag = async (categoryName = "Asset") => {
    const prefix = getCategoryPrefix(categoryName);
    const year = new Date().getFullYear();
    const tagPattern = `${prefix}-${year}-%`;

    try {
        // Find the highest sequence number for this prefix and year
        const lastAsset = await Asset.findOne({
            where: {
                assetTag: {
                    [Op.like]: tagPattern
                }
            },
            order: [["assetTag", "DESC"]],
            attributes: ["assetTag"]
        });

        let sequence = 1;

        if (lastAsset && lastAsset.assetTag) {
            // Extract sequence number from last asset tag
            const parts = lastAsset.assetTag.split("-");
            if (parts.length === 3) {
                const lastSequence = parseInt(parts[2], 10);
                if (!isNaN(lastSequence)) {
                    sequence = lastSequence + 1;
                }
            }
        }

        // Format sequence with leading zeros (4 digits)
        const sequenceStr = sequence.toString().padStart(4, "0");
        const newTag = `${prefix}-${year}-${sequenceStr}`;

        // Verify uniqueness (edge case handling)
        const existingAsset = await Asset.findOne({
            where: { assetTag: newTag }
        });

        if (existingAsset) {
            // If tag already exists, recursively try next sequence
            return generateAssetTag(categoryName);
        }

        return newTag;
    } catch (error) {
        console.error("Error generating asset tag:", error);
        // Fallback: generate random tag
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
        return `${prefix}-${year}-${randomNum}`;
    }
};

/**
 * Validate asset tag format
 * @param {string} assetTag - Asset tag to validate
 * @returns {boolean} - True if valid format
 */
export const isValidAssetTagFormat = (assetTag) => {
    if (!assetTag) return false;
    
    // Format: XXX-YYYY-NNNN
    const pattern = /^[A-Z]{3}-\d{4}-\d{4}$/;
    return pattern.test(assetTag);
};

export default {
    generateAssetTag,
    getCategoryPrefix,
    isValidAssetTagFormat,
    categoryPrefixes
};
