import express from "express";

import {
  addStudent,
  deleteStudentById,
  getStudentById,
  getStudents,
  patchStudent,
  testError,
  updateStudent,
} from "../controllers/student.controller.js";

import studentValidation from "../middleware/studentValidation.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { authorizeStudentAccess } from "../middleware/studentAccess.middleware.js";

const router = express.Router();

// View all students: Admin and Placement Coordinator only
router.get(
  "/students",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  getStudents
);

// Add a student: Admin and Placement Coordinator only
router.post(
  "/students",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  studentValidation,
  addStudent
);

// View a student: Admin/Coordinator can view any; student can view their own
router.get(
  "/students/:id",
  authenticate,
  authorizeStudentAccess,
  getStudentById
);

// Update a student: Admin/Coordinator can update any; student can access their own
router.put(
  "/students/:id",
  authenticate,
  authorizeStudentAccess,
  updateStudent
);

router.patch(
  "/students/:id",
  authenticate,
  authorizeStudentAccess,
  patchStudent
);

// Delete a student: Admin and Placement Coordinator only
router.delete(
  "/students/:id",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  deleteStudentById
);


router.get("/test-error", testError);

export default router;