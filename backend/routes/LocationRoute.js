import express from "express";
import {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationsDropdown
} from "../controllers/LocationController.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { staffAndAdmin } from "../middleware/AuthorizeRole.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Dropdown route (must be before :id route)
router.get("/dropdown", getLocationsDropdown);

// CRUD routes
router.get("/", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", staffAndAdmin, createLocation);
router.put("/:id", staffAndAdmin, updateLocation);
router.delete("/:id", staffAndAdmin, deleteLocation);

export default router;
