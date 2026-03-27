import express from "express";

import {
  createDynamicRecordController,
  updateDynamicRecordController,
  deleteDynamicRecordController,
  changeStatusController,
} from "../../controllers/pageCrud.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/uploadMiddleware.js";

import {
  validateCreateDynamicRecord,
  validateUpdateDynamicRecord,
  validateDeleteDynamicRecord,
} from "../../middlewares/validations/pageCRUD.validation.js";

import { autoAuthorize } from "../../middlewares/authorizePage.middleware.js";

const router = express.Router();

/**
 * ==========================================
 * CREATE RECORD
 * ==========================================
 */
router.post(
  "/create",
  authenticate,
  upload.any(), // ✅ allow multiple/dynamic file fields
  autoAuthorize, // ✅ requires parsed multipart fields (model_name)
  // validateCreateDynamicRecord,
  createDynamicRecordController,
);

/**
 * ==========================================
 * UPDATE RECORD
 * ==========================================
 */
router.put(
  "/update",
  authenticate,
  upload.any(), // ✅ dynamic file upload support
  autoAuthorize, // ✅ requires parsed multipart fields (model_name)
  // validateUpdateDynamicRecord,
  updateDynamicRecordController,
);

/**
 * ==========================================
 * DELETE RECORD
 * ==========================================
 */
router.delete(
  "/delete",
  authenticate,
  autoAuthorize,
  validateDeleteDynamicRecord,
  deleteDynamicRecordController,
);

/**
 * ==========================================
 * CHANGE STATUS
 * ==========================================
 */
router.put(
  "/change-status",
  authenticate,
  autoAuthorize,
  changeStatusController,
);

export default router;
