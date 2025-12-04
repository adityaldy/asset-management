import express from "express";
import { 
    register, 
    login, 
    logout, 
    refreshToken, 
    getMe 
} from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { adminOnly } from "../middleware/AuthorizeRole.js";

const router = express.Router();

// Public routes
router.post('/login', login);
router.get('/token', refreshToken);
router.delete('/logout', logout);

// Protected routes
router.post('/register', verifyToken, adminOnly, register);
router.get('/me', verifyToken, getMe);

export default router;
