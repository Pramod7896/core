/**
 * =====================================================
 * RESOURCE RBAC MIDDLEWARE
 * Based on Permission table
 * =====================================================
 */

export const authorizeResource = (resource, action) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (user.is_super_admin) return next();

      const permissions = user.permissions;

      const allowed = permissions.some(
        (p) => p.resource === resource && p.action === action,
      );

      if (!allowed)
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
