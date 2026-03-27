import util from "util";
import { logger } from "../config/logger.js";
import { PAGE_LOG_MESSAGES } from "../constant/logMessages.js";
import { getPageDataService } from "../services/pageData.service.js";

/**
 * ==========================================
 * GET PAGE DATA CONTROLLER
 * ==========================================
 */
export const getPageDataController = async (req, res, next) => {
  try {
    await getPageDataService(req, res);
  } catch (error) {
    logger.error(
      util.format(
        PAGE_LOG_MESSAGES.PAGE_FETCH_FAILED,
        req.user?.user_id || 0,
        req.query?.page_code || "N/A",
        error.message,
        req.requestId || "N/A"
      )
    );
    next(error);
  }
};
