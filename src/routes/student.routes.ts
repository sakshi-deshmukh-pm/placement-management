import express from "express";

import {
    addStudent,
    deleteStudentById,
    getStudentById,
    getStudents,
    patchStudent,
    testError,
    updateStudent
} from "../controllers/student.controller.js";

import studentValidation from "../middleware/studentValidation.middleware.js";

const router = express.Router();

router.get("/students", getStudents);

router.post(
    "/students",
    studentValidation,
    addStudent
);

router.get(
    "/students/:id",
    getStudentById
);

router.put(
    "/students/:id",
    updateStudent
);

router.delete(
    "/students/:id",
    deleteStudentById
);

router.patch(
    "/students/:id",
    patchStudent
);

router.get(
    "/test-error",
    testError
);

export default router;