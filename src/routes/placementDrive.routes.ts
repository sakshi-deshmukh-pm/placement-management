
import { Router } from "express";

import {
  addPlacementDrive,
  fetchPlacementDriveById,
  fetchPlacementDrives,
  editPlacementDrive,
  partiallyUpdatePlacementDrive,
  removePlacementDrive,
} from "../controllers/placementDrive.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createPlacementDriveSchema } from "../dtos/placement-drive/create-placement-drive.dto.js";
import { updatePlacementDriveSchema } from "../dtos/placement-drive/update-placement-drive.dto.js";
import { studentIdSchema } from "../dtos/student/student-id.dto.js";

const router = Router();

// Viewing placement drives: logged-in users
router.get(
  "/placement-drives",
  authenticate,
  fetchPlacementDrives,
);

router.get(
  "/placement-drives/:id",
  authenticate,
  validate(studentIdSchema, "params"),
  fetchPlacementDriveById,
);

// Managing placement drives: ADMIN only
router.post(
  "/placement-drives",
  authenticate,
  authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(createPlacementDriveSchema),
  addPlacementDrive,
);

router.put(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(createPlacementDriveSchema),
  editPlacementDrive,
);

router.patch(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(updatePlacementDriveSchema),
  partiallyUpdatePlacementDrive,
);

router.delete(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  removePlacementDrive,
);

export default router;
