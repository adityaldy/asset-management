import express from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesDropdown
} from "../controllers/CategoryController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { staffAndAdmin } from "../middleware/AuthorizeRole.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dropdown route (must be before :id route)
router.get("/dropdown", getCategoriesDropdown);

// CRUD routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", staffAndAdmin, createCategory);
router.put("/:id", staffAndAdmin, updateCategory);
router.delete("/:id", staffAndAdmin, deleteCategory);

export default router;
