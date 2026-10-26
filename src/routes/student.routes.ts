import express from "express";

import { validate } from "../middleware/validate.middleware.js";
import { createStudentSchema } from "../dtos/student/create-student.dto.js";

import {
  addStudent,
  deleteStudentById,
  getStudentById,
  getStudents,
  patchStudent,
  testError,
  updateStudent,
} from "../controllers/student.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { authorizeStudentAccess } from "../middleware/studentAccess.middleware.js";
import { studentQuerySchema } from "../dtos/student/student-query.dto.js";
import { studentIdSchema } from "../dtos/student/student-id.dto.js";
import { updateStudentSchema,replaceStudentSchema } from "../dtos/student/update-student.dto.js";

const router = express.Router();

// View all students: Admin and Placement Coordinator only
router.get(
  "/students",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(studentQuerySchema,"query"),
  getStudents
);

// Add a student: Admin and Placement Coordinator only
router.post(
  "/students",
  authenticate,
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  validate(createStudentSchema),
  addStudent
);

// View a student: Admin/Coordinator can view any; student can view their own
router.get(
  "/students/:id",
  authenticate,
  authorizeStudentAccess,
  validate(studentIdSchema,"params"),
  getStudentById
);

// Update a student: Admin/Coordinator can update any; student can access their own
router.put(
  "/students/:id",
  authenticate,
  validate(studentIdSchema,"params"),
  authorizeStudentAccess,
  validate(replaceStudentSchema),
  updateStudent
);

router.patch(
  "/students/:id",
  authenticate,
  validate(studentIdSchema,"params"),
  authorizeStudentAccess,
  validate(updateStudentSchema),
  patchStudent
);

// Delete a student: Admin and Placement Coordinator only
router.delete(
  "/students/:id",
  authenticate,
  validate(studentIdSchema,"params"),
  authorizeRoles("ADMIN", "PLACEMENT_COORDINATOR"),
  deleteStudentById
);


router.get("/test-error", testError);

export default router;