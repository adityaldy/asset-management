import express from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getEmployees,
    getUsersDropdown,
    resetPassword
} from "../controllers/UserController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { adminOnly, staffAndAdmin } from "../middleware/AuthorizeRole.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dropdown routes (must be before :id route)
router.get("/dropdown", getUsersDropdown);
router.get("/employees", getEmployees);

// CRUD routes (Admin only)
router.get("/", adminOnly, getAllUsers);
router.get("/:id", adminOnly, getUserById);
router.post("/", adminOnly, createUser);
router.put("/:id", adminOnly, updateUser);
router.delete("/:id", adminOnly, deleteUser);
router.post("/:id/reset-password", adminOnly, resetPassword);

export default router;
