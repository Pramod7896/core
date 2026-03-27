export const validateUpdateSidebarMenuOrder = (req, res, next) => {
  const role = req.body.role ?? req.query.role;
  const order = req.body.order;

  if (!role || String(role).trim() === "") {
    return res.status(400).json({ error: "role is required" });
  }

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "order must be an array" });
  }

  if (order.length > 200) {
    return res.status(400).json({ error: "order too large" });
  }

  next();
};

