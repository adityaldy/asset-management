import express from "express";
import {
    getSummaryStats,
    getAssetsByCategory,
    getAssetsByLocation,
    getAssetsByStatus,
    getRecentTransactions,
    getAssetsNearWarrantyExpiry,
    getMonthlyTrends
} from "../controllers/DashboardController.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dashboard endpoints
router.get("/summary", getSummaryStats);
router.get("/by-category", getAssetsByCategory);
router.get("/by-location", getAssetsByLocation);
router.get("/by-status", getAssetsByStatus);
router.get("/recent-transactions", getRecentTransactions);
router.get("/warranty-expiry", getAssetsNearWarrantyExpiry);
router.get("/monthly-trends", getMonthlyTrends);

export default router;
