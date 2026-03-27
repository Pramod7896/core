import express from "express";
import { getPageDataController } from "../../controllers/page.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateGetPageData } from "../../middlewares/validations/page.validation.js"; // optional validation

const router = express.Router();

// ============================
// GET PAGE DATA
// ============================
router.get(
  "/get-page-data",
  authenticate,            // ✅ Auth middleware ensures valid token & session
  validateGetPageData,     // optional validation for query params
  getPageDataController
);

export default router;
