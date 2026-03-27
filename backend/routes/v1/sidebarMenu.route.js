import express from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  getSidebarMenuOrderController,
  updateSidebarMenuOrderController,
} from "../../controllers/sidebarMenu.controller.js";
import { validateUpdateSidebarMenuOrder } from "../../middlewares/validations/sidebarMenu.validation.js";

const router = express.Router();

router.get("/order", authenticate, getSidebarMenuOrderController);

router.put(
  "/order",
  authenticate,
  validateUpdateSidebarMenuOrder,
  updateSidebarMenuOrderController,
);

export default router;

