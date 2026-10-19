
import { Router } from "express";
import {addApplication, changeApplicationStatus, getApplication } from "../controllers/application.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
const router = Router();

router.post("/applications", authenticate,authorizeRoles("STUDENT"),addApplication);
router.get("/applications",authenticate,getApplication);
router.patch("/applications/:id",authenticate,authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),changeApplicationStatus);

export default router;
