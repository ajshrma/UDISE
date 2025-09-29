import { Router } from "express";
import {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  getDistributionData,
  getFilterOptions,
} from "../controllers/schoolController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes (no authentication required for viewing data)
router.get("/", getAllSchools);
router.get("/distribution", getDistributionData);
router.get("/filters", getFilterOptions);
router.get("/:id", getSchoolById);

// Protected routes (authentication required for modifications)
router.post("/", isLoggedIn, createSchool);
router.put("/:id", isLoggedIn, updateSchool);
router.delete("/:id", isLoggedIn, deleteSchool);

export default router;
