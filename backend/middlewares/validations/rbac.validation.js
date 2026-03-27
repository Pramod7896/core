/**
 * ==========================================
 * VALIDATE UPDATE PAGE PERMISSION
 * ==========================================
 */

export const validateUpdatePagePermission = (req, res, next) => {
  const { role_id, page_id, can_view, can_create, can_edit, can_delete } =
    req.body;

  if (!role_id || !page_id) {
    return res.status(400).json({
      success: false,
      message: "role_id and page_id required",
    });
  }

  /**
   * OPTIONAL BOOLEAN VALIDATION
   */

  const fields = [can_view, can_create, can_edit, can_delete];

  const invalid = fields.some((f) => f !== undefined && typeof f !== "boolean");

  if (invalid) {
    return res.status(400).json({
      success: false,
      message: "Permissions must be boolean",
    });
  }

  next();
};
