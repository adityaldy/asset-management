import express from "express";
import {
    getAllAssets,
    searchAssets,
    getAssetById,
    getAssetHistory,
    createAsset,
    updateAsset,
    deleteAsset,
    getAvailableAssets,
    getAssignedAssets
} from "../controllers/AssetController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { staffAndAdmin } from "../middleware/AuthorizeRole.js";
import { validateCreateAsset, validateUpdateAsset } from "../middleware/AssetValidation.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Special routes (must be before :id routes)
router.get("/search", searchAssets);
router.get("/available", getAvailableAssets);
router.get("/assigned", getAssignedAssets);

// CRUD routes
router.get("/", getAllAssets);
router.get("/:id", getAssetById);
router.get("/:id/history", getAssetHistory);
router.post("/", staffAndAdmin, validateCreateAsset, createAsset);
router.put("/:id", staffAndAdmin, validateUpdateAsset, updateAsset);
router.delete("/:id", staffAndAdmin, deleteAsset);

export default router;
