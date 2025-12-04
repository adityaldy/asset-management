import express from "express";
import { processQuery, getStatus } from "../controllers/ChatController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { chatRateLimiter, chatValidation } from "../middleware/ChatMiddleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// Chat query endpoint with rate limiting and validation
router.post("/query", chatRateLimiter, chatValidation, processQuery);

// Get chat service status
router.get("/status", getStatus);

export default router;
