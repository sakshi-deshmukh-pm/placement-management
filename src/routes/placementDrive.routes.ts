
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

const router = Router();

// Viewing placement drives: logged-in users
router.get(
  "/placement-drives",
  authenticate,
  fetchPlacementDrives
);

router.get(
  "/placement-drives/:id",
  authenticate,
  fetchPlacementDriveById
);

// Managing placement drives: ADMIN only
router.post(
  "/placement-drives",
  authenticate,
  authorizeRoles("ADMIN"),
  addPlacementDrive
);

router.put(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  editPlacementDrive
);

router.patch(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  partiallyUpdatePlacementDrive
);

router.delete(
  "/placement-drives/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  removePlacementDrive
);

export default router;
