import { Router } from "express";

import authRateLimiter from "../../shared/middlewares/rateLimiter.middleware.js";

import { registerValidator, loginValidator } from "../../shared/validators/auth.validator.js";

import validate from "../../shared/middlewares/validate.middleware.js";

import { register, login } from "./auth.controller.js";

const router = Router();

router.post("/register", authRateLimiter, registerValidator, validate, register);

router.post("/login", authRateLimiter, loginValidator, validate, login);

export default router;
