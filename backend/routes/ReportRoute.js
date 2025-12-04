import express from "express";
import {
    getAssetReport,
    getTransactionReport,
    getAuditLog,
    getAssetSummaryReport
} from "../controllers/ReportController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { staffAndAdmin } from "../middleware/AuthorizeRole.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Report endpoints (staff and admin only)
router.get("/assets", staffAndAdmin, getAssetReport);
router.get("/transactions", staffAndAdmin, getTransactionReport);
router.get("/audit-log", staffAndAdmin, getAuditLog);
router.get("/summary", staffAndAdmin, getAssetSummaryReport);

export default router;
