import { body, validationResult } from "express-validator";

/**
 * COMMON VALIDATION HANDLER
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: errors.array(),
    });
  }

  next();
};

/**
 * CREATE VALIDATION
 */
export const validateCreateDynamicRecord = [
  body("model_name")
    .notEmpty()
    .withMessage("model_name is required"),
  
  body("data")
    .notEmpty()
    .withMessage("data is required")
    .isObject()
    .withMessage("data must be a valid object"),

  // Optional: validate file fields if known
  body("data.user_profile_pic")
    .optional()
    .isString()
    .withMessage("user_profile_pic should be a file path string"),

  handleValidation,
];

/**
 * UPDATE VALIDATION
 */
export const validateUpdateDynamicRecord = [
  body("model_name")
    .notEmpty()
    .withMessage("model_name is required"),

  body("id")
    .notEmpty()
    .withMessage("id is required"),

  body("primaryKey")
    .notEmpty()
    .withMessage("primaryKey is required"),

  body("data")
    .notEmpty()
    .withMessage("data is required")
    .isObject()
    .withMessage("data must be a valid object"),

  // Optional: validate file fields if known
  body("data.user_profile_pic")
    .optional()
    .isString()
    .withMessage("user_profile_pic should be a file path string"),

  handleValidation,
];

/**
 * DELETE VALIDATION
 */
export const validateDeleteDynamicRecord = [
  body("model_name")
    .notEmpty()
    .withMessage("model_name is required"),

  body("id")
    .notEmpty()
    .withMessage("id is required"),

  body("primaryKey")
    .notEmpty()
    .withMessage("primaryKey is required"),

  handleValidation,
];
