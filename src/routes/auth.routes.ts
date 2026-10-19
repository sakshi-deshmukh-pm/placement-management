import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  register,
  login,
  createAdmin,
  linkStudentAccount
} from "../controllers/auth.controller.js";

import { authorizeRoles } from "../middleware/authorize.middleware.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/create-admin", createAdmin);
router.post("/auth/login", login);
router.get("/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Authentication successful",
    user: res.locals.auth,
  });
});
router.patch(
  "/auth/users/:userId/link-student",
  authenticate,
  authorizeRoles("ADMIN"),
  linkStudentAccount
);

export default router;