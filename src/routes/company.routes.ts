
import { Router } from "express";
import { addCompany ,editComapny,fetchCompanies, partialUpdateCompany,fetchCompanyById, removeCompany} from "../controllers/company.controller.js";

const router = Router();

router.post("/companies", addCompany);
router.get("/companies",fetchCompanies);
router.put("/companies/:id",editComapny);
router.patch("/companies/:id",partialUpdateCompany);
router.get("/companies/:id",fetchCompanyById);
router.delete("/companies/:id",removeCompany);

export default router;
