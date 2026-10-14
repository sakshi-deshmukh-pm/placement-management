
import { Router } from "express";
import { addApplication, changeApplicationStatus, getApplication } from "../controllers/application.controller.js";

const router = Router();

router.post("/applications", addApplication);
router.get("/applications",getApplication);
router.patch("/applications/:id",changeApplicationStatus);

export default router;
