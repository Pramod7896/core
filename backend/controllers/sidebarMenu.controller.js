import {
  getSidebarMenuOrderService,
  updateSidebarMenuOrderService,
} from "../services/sidebarMenu.service.js";

export const getSidebarMenuOrderController = async (req, res, next) => {
  try {
    const role = req.query.role;
    const order = await getSidebarMenuOrderService(req, role);

    return res.status(200).json({
      success: true,
      message: "Sidebar menu order fetched successfully",
      data: { role: String(role || "").toLowerCase(), order },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSidebarMenuOrderController = async (req, res, next) => {
  try {
    const role = req.body.role ?? req.query.role;
    const order = req.body.order;

    const record = await updateSidebarMenuOrderService(req, role, order);

    return res.status(200).json({
      success: true,
      message: "Sidebar menu order updated successfully",
      data: {
        role: record.role_name,
        order: record.menu_order,
      },
    });
  } catch (error) {
    next(error);
  }
};

