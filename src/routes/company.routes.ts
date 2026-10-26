
import { Router } from "express";

import {
  addCompany,
  editComapny,
  fetchCompanies,
  partialUpdateCompany,
  fetchCompanyById,
  removeCompany,
} from "../controllers/company.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";

import { createCompanySchema } from "../dtos/company/create-company.dto.js";
import { updateCompanySchema } from "../dtos/company/update-company.dto.js";
import { studentIdSchema } from "../dtos/student/student-id.dto.js";



const router = Router();

router.post(
  "/companies",
  authenticate,
  authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(createCompanySchema),
  addCompany,
);

router.get("/companies", authenticate, fetchCompanies);

router.put(
  "/companies/:id",
  authenticate,
   authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(createCompanySchema),
  editComapny,
);

router.patch(
  "/companies/:id",
  authenticate,
   authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  validate(updateCompanySchema),
  partialUpdateCompany,
);

router.get(
  "/companies/:id",
  authenticate,
  validate(studentIdSchema, "params"),
  fetchCompanyById,
);

router.delete(
  "/companies/:id",
  authenticate,
   authorizeRoles("ADMIN","PLACEMENT_COORDINATOR"),
  validate(studentIdSchema, "params"),
  removeCompany,
);

export default router;
