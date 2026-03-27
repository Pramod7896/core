export const validateGetPageData = (req, res, next) => {
  const { page_code } = req.query;
  if (!page_code) {
    return res.status(400).json({ error: "page_code is required" });
  }
  next();
};
