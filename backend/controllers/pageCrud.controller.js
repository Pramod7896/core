import util from "util";
import { logger } from "../config/logger.js";
import { PAGE_CRUD_LOG_MESSAGES } from "../constant/logMessages.js";

import {
  createDynamicRecordService,
  updateDynamicRecordService,
  deleteDynamicRecordService,
  changeStatusService,
} from "../services/pageCrud.service.js";

/**
 * =====================================================
 * CREATE CONTROLLER
 * =====================================================
 */
export const createDynamicRecordController = async (req, res, next) => {
  try {
    const { model_name, data } = req.body;

    // ===========================
    // Attach uploaded files to data
    // ===========================
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const key = file.fieldname;
        // Save only the file path for DB
        data[key] = file.path;
        logger.debug(
          `[CONTROLLER] Attached file: field=${key}, originalName=${file.originalname}, savedPath=${file.path}`,
        );
      }
    }
    // Single file fallback (if req.file is used instead of req.files)
    else if (req.file) {
      const key = req.body.uploadFieldName || req.file.fieldname;
      data[key] = req.file.path;
      logger.debug(
        `[CONTROLLER] Attached single file: field=${key}, savedPath=${req.file.path}`,
      );
    }

    // Call dynamic create service
    const result = await createDynamicRecordService(req, { model_name, data });

    logger.info(
      util.format(
        PAGE_CRUD_LOG_MESSAGES.CREATE_SUCCESS,
        req.user.user_id,
        model_name,
        req.requestId,
      ),
    );

    return res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: result,
    });
  } catch (error) {
    logger.error(
      util.format(
        PAGE_CRUD_LOG_MESSAGES.CREATE_FAILED,
        req.user?.user_id,
        req.body?.model_name,
        error.message,
        req.requestId,
      ),
    );
    next(error);
  }
};

/**
 * =====================================================
 * UPDATE CONTROLLER
 * =====================================================
 */
export const updateDynamicRecordController = async (req, res, next) => {
  try {
    const { model_name, id, data, primaryKey } = req.body;

    if (!primaryKey) {
      return res.status(400).json({
        success: false,
        message: "primaryKey is required for update",
      });
    }

    logger.debug(
      `[CONTROLLER] updateDynamicRecordController called for model=${model_name}, id=${id}`,
    );
    logger.debug(`[CONTROLLER] Original data: ${JSON.stringify(data)}`);

    // ===========================
    // Attach uploaded files to data
    // ===========================
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const key = file.fieldname;
        // Save only the file path for DB
        data[key] = file.path;
        logger.debug(
          `[CONTROLLER] Attached file: field=${key}, originalName=${file.originalname}, savedPath=${file.path}`,
        );
      }
    }
    // Single file fallback (if req.file is used instead of req.files)
    else if (req.file) {
      const key = req.body.uploadFieldName || req.file.fieldname;
      data[key] = req.file.path;
      logger.debug(
        `[CONTROLLER] Attached single file: field=${key}, savedPath=${req.file.path}`,
      );
    }

    // Call dynamic update service
    await updateDynamicRecordService(req, { model_name, id, data, primaryKey });

    logger.info(
      `[CONTROLLER] Record updated successfully for model=${model_name}, id=${id}`,
    );

    return res.status(200).json({
      success: true,
      message: "Record updated successfully",
    });
  } catch (error) {
    logger.error(
      `[CONTROLLER] Failed to update record for model=${req.body.model_name}, id=${req.body.id}, error=${error.message}`,
    );
    next(error);
  }
};

/**
 * =====================================================
 * DELETE CONTROLLER
 * =====================================================
 */
export const deleteDynamicRecordController = async (req, res, next) => {
  try {
    const { model_name, id, primaryKey } = req.body;

    if (!primaryKey) {
      return res.status(400).json({
        success: false,
        message: "primaryKey is required for delete",
      });
    }

    await deleteDynamicRecordService(req, { model_name, id, primaryKey });

    logger.info(
      util.format(
        PAGE_CRUD_LOG_MESSAGES.DELETE_SUCCESS,
        req.user.user_id,
        model_name,
        id,
        req.requestId,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    logger.error(
      util.format(
        PAGE_CRUD_LOG_MESSAGES.DELETE_FAILED,
        req.user?.user_id,
        req.body?.model_name,
        req.body?.id,
        error.message,
        req.requestId,
      ),
    );
    next(error);
  }
};

/**
 * =====================================================
 * CHANGE STATUS CONTROLLER
 * =====================================================
 */
export const changeStatusController = async (req, res, next) => {
  try {
    const { model_name, id, primaryKey, status } = req.body;

    if (!primaryKey) {
      return res.status(400).json({
        success: false,
        message: "primaryKey is required",
      });
    }

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    await changeStatusService(req, { model_name, id, primaryKey, status });

    logger.info(
      util.format(
        "STATUS_CHANGE_SUCCESS: user %d changed %s status to %s for id %d",
        req.user.user_id,
        model_name,
        status,
        id,
      ),
    );

    return res.status(200).json({
      success: true,
      message: `Status of ${model_name} updated successfully`,
    });
  } catch (error) {
    logger.error(
      util.format(
        "STATUS_CHANGE_FAILED: user %d failed to change %s status for id %d - %s",
        req.user?.user_id,
        req.body?.model_name,
        req.body?.id,
        error.message,
      ),
    );
    next(error);
  }
};
