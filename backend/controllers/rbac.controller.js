import util from "util";

import { logger } from "../config/logger.js";

import { RBAC_LOG_MESSAGES } from "../constant/logMessages.js";

import {
  getUserRBACService,
  updatePagePermissionService,
  getEnterprizesService,
  getRolesByEnterprizeService,
} from "../services/rbac.service.js";

/**
 * ==========================================
 * GET USER RBAC
 * ==========================================
 */

export const getUserRBACController = async (req, res, next) => {
  try {
    const result = await getUserRBACService(req);

    logger.info(
      util.format(
        RBAC_LOG_MESSAGES.RBAC_FETCH_SUCCESS,
        req.user.user_id,
        req.user.enterprize_id,
        req.requestId,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "RBAC fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.error(
      util.format(
        RBAC_LOG_MESSAGES.RBAC_FETCH_ERROR,
        req.requestId,
        error.message,
      ),
    );

    next(error);
  }
};

/**
 * ==========================================
 * UPDATE PAGE PERMISSION
 * ==========================================
 */

export const updatePagePermissionController = async (req, res, next) => {
  try {
    const { role_id, page_id, can_view, can_create, can_edit, can_delete } =
      req.body;

    const result = await updatePagePermissionService(req, role_id, page_id, {
      can_view,
      can_create,
      can_edit,
      can_delete,
    });

    logger.info(
      util.format(
        RBAC_LOG_MESSAGES.PAGE_PERMISSION_UPDATE,
        role_id,
        page_id,
        req.requestId,
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error(
      util.format(
        RBAC_LOG_MESSAGES.PAGE_PERMISSION_UPDATE_ERROR,
        req.requestId,
        error.message,
      ),
    );

    next(error);
  }
};

/**
 * ==========================================
 * GET ENTERPRIZES (SCOPED)
 * ==========================================
 */

export const getEnterprizesController = async (req, res, next) => {
  try {
    const result = await getEnterprizesService(req);

    return res.status(200).json({
      success: true,
      message: "Enterprizes fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * GET ROLES BY ENTERPRIZE (SCOPED)
 * ==========================================
 */

export const getRolesByEnterprizeController = async (req, res, next) => {
  try {
    const { enterprizeId } = req.params;

    const result = await getRolesByEnterprizeService(req, enterprizeId);

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
