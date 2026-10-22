
import { Router } from "express";
import { addCompany ,editComapny,fetchCompanies, partialUpdateCompany,fetchCompanyById, removeCompany} from "../controllers/company.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/companies",authenticate, addCompany);
router.get("/companies",authenticate,fetchCompanies);
router.put("/companies/:id",authenticate,editComapny);
router.patch("/companies/:id",authenticate,partialUpdateCompany);
router.get("/companies/:id",authenticate,fetchCompanyById);
router.delete("/companies/:id",authenticate,removeCompany);

export default router;
