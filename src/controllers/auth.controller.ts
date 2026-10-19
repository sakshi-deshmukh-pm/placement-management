
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../prisma.js";
import {
  registerStudentWithProfile,
  findUserForLogin,
  createAdminUser,
  findUserById,
  linkUserToStudent,
} from "../models/user.model.js";

const isPrismaErrorCode = (
  error: unknown,
  code: string,
): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === code;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured in the environment.");
  }

  return secret;
};

// POST /auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, rollNumber, branch, year } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      typeof branch !== "string" ||
      !branch.trim() ||
      typeof year !== "string" ||
      !year.trim()
    ) {
      res.status(400).json({
        message:
          "Name, valid email, password (minimum 8 characters), roll number, branch and year are required.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await registerStudentWithProfile({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      rollNumber: rollNumber.trim(),
      branch: branch.trim(),
      year: year.trim(),
    });

    res.status(201).json({
      message: "Registration successful",
      data: {
        user: result.user,
        student: result.student,
      },
    });
  } catch (error: unknown) {
    if (isPrismaErrorCode(error, "P2002")) {
      res.status(409).json({
        message:
          "Email or roll number already exists. Please use unique details.",
      });
      return;
    }

    next(error);
  }
};

// POST /auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Email and password are required.",
      });
      return;
    }

    const user = await findUserForLogin(email.trim().toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "This account is inactive.",
      });
      return;
    }

    // Must match auth.middleware.ts, which reads decoded.userId.
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: "1d", algorithm: "HS256" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        studentId: user.studentId,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

// POST /auth/create-admin
export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      res.status(400).json({
        message:
          "A valid email and password of at least 8 characters are required.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserForLogin(normalizedEmail);

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await createAdminUser({
      email: normalizedEmail,
      passwordHash,
    });

    res.status(201).json({
      message: "Admin account created successfully.",
      user: admin,
    });
  } catch (error: unknown) {
    if (isPrismaErrorCode(error, "P2002")) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    next(error);
  }
};

// PATCH /auth/users/:userId/link-student
export const linkStudentAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = Number(req.params.userId);
    const { studentId } = req.body;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      res.status(400).json({
        message: "Valid userId and studentId are required.",
      });
      return;
    }

    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    if (user.role !== "STUDENT") {
      res.status(400).json({
        message:
          "Only student accounts can be linked to a student profile.",
      });
      return;
    }

    if (user.studentId !== null) {
      res.status(409).json({
        message: "This user is already linked to a student profile.",
      });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      res.status(404).json({
        message: "Student profile not found.",
      });
      return;
    }

    const linkedUser = await linkUserToStudent(userId, studentId);

    res.status(200).json({
      message: "Student account linked successfully.",
      user: linkedUser,
    });
  } catch (error: unknown) {
    if (isPrismaErrorCode(error, "P2002")) {
      res.status(409).json({
        message:
          "This student profile is already linked to another account.",
      });
      return;
    }

    if (isPrismaErrorCode(error, "P2025")) {
      res.status(404).json({
        message: "User or student record was not found.",
      });
      return;
    }

    next(error);
  }
};
