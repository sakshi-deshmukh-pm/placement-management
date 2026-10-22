import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  register,
  login,
  getMyProfile,
  updateMyProfile,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);

router.get("/auth/me", authenticate, getMyProfile);
router.patch("/auth/me", authenticate, updateMyProfile);

export default router;
