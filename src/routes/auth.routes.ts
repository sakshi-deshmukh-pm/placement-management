
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { loginSchema } from "../dtos/auth/login.dto.js";
import { registerSchema } from "../dtos/auth/register.dto.js";
import { updateProfileSchema } from "../dtos/auth/update-profile.dto.js";

import {
  register,
  login,
  getMyProfile,
  updateMyProfile,
} from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/auth/register",
  validate(registerSchema),
  register
);

router.post(
  "/auth/login",
  validate(loginSchema),
  login
);

router.get("/auth/me", authenticate, getMyProfile);
router.patch(
  "/auth/me",
  authenticate,
  validate(updateProfileSchema),
  updateMyProfile
);

export default router;
