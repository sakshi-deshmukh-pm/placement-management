
import { Router } from "express";

import {
  addApplication,
  changeApplicationStatus,
  getApplication,
} from "../controllers/application.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createApplicationSchema } from "../dtos/application/create-application.dto.js";
import { updateApplicationSchema } from "../dtos/application/update-application.dto.js";
import { studentIdSchema } from "../dtos/student/student-id.dto.js";

const router = Router();

router.post(
  "/applications",
  authenticate,
  authorizeRoles("STUDENT"),
  validate(createApplicationSchema),
  addApplication,
);

router.get(
  "/applications",
  authenticate,
  getApplication,
);

router.patch(
  "/applications/:id",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(updateApplicationSchema),
  changeApplicationStatus,
);

export default router;
