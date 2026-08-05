import { body } from "express-validator";

export const registerValidator = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Enter a valid email address"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must contain at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain one number"),
];

export const loginValidator = [

    body("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),
];