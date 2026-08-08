import { body, validationResult } from "express-validator";

//  Helper Middleware: for throw  Validation Errors 
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("[VALIDATION ERROR] Bad Request:", errors.array());
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ==========================================
// 1. REGISTER VALIDATION ARRAY
// ==========================================
export const validateRegister = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("contact")
    .notEmpty()
    .withMessage("Contact number is required")
    .isNumeric()
    .withMessage("Contact number must contain only numbers")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact number must be exactly 10 digits"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["Admin", "Agent"])
    .withMessage("Invalid role specified"),

  body("position")
    .optional()
    .isIn(["left", "right", null])
    .withMessage("Position must be either 'left' or 'right'"),

  // Validation execution handler
  handleValidationErrors,
];

// ==========================================
// 2. LOGIN VALIDATION ARRAY
// ==========================================
export const validateLogin = [
  // User 'identifier' (Email/Phone/AgentID) ya 'distributerId' me se kuch bhi bhej sakta hai
  body("identifier")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Identifier cannot be empty"),

  body("distributerId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Distributer ID cannot be empty"),

  // Custom validation to ensure at least one identifier is provided
  body().custom((value, { req }) => {
    if (!req.body.identifier && !req.body.distributerId) {
      throw new Error("Please provide Email, Agent ID, or Contact Number");
    }
    return true;
  }),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  // Validation execution handler
  handleValidationErrors,
];