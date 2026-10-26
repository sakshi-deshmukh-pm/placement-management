
import { Router } from "express";

import {
  addInterview,
  getAllInterviews,
  getInterview,
  updateInterviewDetails,
  patchInterviewDetails,
  removeInterview,
} from "../controllers/interview.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createInterviewSchema } from "../dtos/interview/create-interview.dto.js";
import { updateInterviewSchema } from "../dtos/interview/update-interview.dto.js";
import { studentIdSchema } from "../dtos/student/student-id.dto.js";

const router = Router();

// Viewing interviews: logged-in users
router.get("/interviews", authenticate, getAllInterviews);

router.get(
  "/interviews/:id",
  authenticate,
  validate(studentIdSchema, "params"),
  getInterview,
);

// Managing interviews: ADMIN and PLACEMENT_COORDINATOR
router.post(
  "/interviews",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(createInterviewSchema),
  addInterview,
);

router.put(
  "/interviews/:id",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(createInterviewSchema),
  updateInterviewDetails,
);

router.patch(
  "/interviews/:id",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(updateInterviewSchema),
  patchInterviewDetails,
);

router.delete(
  "/interviews/:id",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  removeInterview,
);

export default router;
