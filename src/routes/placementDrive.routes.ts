
import { Router } from "express";
import {
    addPlacementDrive,
    fetchPlacementDriveById,
    fetchPlacementDrives,
    editPlacementDrive,
    partiallyUpdatePlacementDrive,
    removePlacementDrive
} from "../controllers/placementDrive.controller.js";

const router = Router();

router.get("/placement-drives", fetchPlacementDrives);
router.get("/placement-drives/:id", fetchPlacementDriveById);
router.post("/placement-drives", addPlacementDrive);
router.put("/placement-drives/:id", editPlacementDrive);
router.patch("/placement-drives/:id", partiallyUpdatePlacementDrive);
router.delete("/placement-drives/:id", removePlacementDrive);


export default router;
