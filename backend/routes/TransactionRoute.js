import express from "express";
import {
    checkoutAsset,
    checkinAsset,
    sendToRepair,
    completeRepair,
    reportLost,
    reportFound,
    disposeAsset,
    getAllTransactions,
    getTransactionById
} from "../controllers/TransactionController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { staffAndAdmin } from "../middleware/AuthorizeRole.js";
import {
    validateCheckout,
    validateCheckin,
    validateRepair,
    validateCompleteRepair,
    validateDispose,
    validateReportLost,
    validateReportFound
} from "../middleware/TransactionValidation.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Transaction action routes (staff and admin only)
router.post("/checkout", staffAndAdmin, validateCheckout, checkoutAsset);
router.post("/checkin", staffAndAdmin, validateCheckin, checkinAsset);
router.post("/repair", staffAndAdmin, validateRepair, sendToRepair);
router.post("/complete-repair", staffAndAdmin, validateCompleteRepair, completeRepair);
router.post("/report-lost", staffAndAdmin, validateReportLost, reportLost);
router.post("/report-found", staffAndAdmin, validateReportFound, reportFound);
router.post("/dispose", staffAndAdmin, validateDispose, disposeAsset);

// Read routes (all authenticated users)
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);

export default router;
