
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  registerStudentWithProfile,
  findUserForLogin,
  getUserProfileById,
  updateUserProfileById,
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

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
      !isValidEmail(email) ||
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
        statusCode: 400,
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
      statusCode: 201,
      message: "Registration successful",
      data: {
        user: result.user,
      },
    });
  } catch (error: unknown) {
    if (isPrismaErrorCode(error, "P2002")) {
      res.status(409).json({
        statusCode: 409,
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
      !isValidEmail(email) ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "A valid email and password are required.",
      });
      return;
    }

    const user = await findUserForLogin(email.trim().toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        statusCode: 401,
        message: "Invalid email or password.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        statusCode: 403,
        message: "This account is inactive.",
      });
      return;
    }

    const expiresIn = "1d";

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      getJwtSecret(),
      {
        expiresIn,
        algorithm: "HS256",
      },
    );

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      tokenType: "Bearer",
      expiresIn,
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        rollNumber: user.rollNumber,
        branch: user.branch,
        year: user.year,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /auth/me
export const getMyProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as { id: number } | undefined;

    if (!auth) {
      res.status(401).json({
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    const user = await getUserProfileById(auth.id);

    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: "User profile not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Profile fetched successfully",
      data: { user },
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PATCH /auth/me
export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as { id: number } | undefined;

    if (!auth) {
      res.status(401).json({
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    const {
      name,
      phone,
      gender,
      dateOfBirth,
      city,
      state,
      pincode,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        statusCode: 400,
        message: "Name is required",
      });
      return;
    }

    let parsedDate: Date | null = null;

    if (
      dateOfBirth !== null &&
      dateOfBirth !== undefined &&
      dateOfBirth !== ""
    ) {
      if (
        typeof dateOfBirth !== "string" ||
        Number.isNaN(Date.parse(dateOfBirth))
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Invalid date of birth",
        });
        return;
      }

      parsedDate = new Date(dateOfBirth);
    }

    const optionalString = (
      value: unknown,
      fieldName: string,
    ): string | null => {
      if (value === null || value === undefined || value === "") {
        return null;
      }

      if (typeof value !== "string") {
        throw new Error(`${fieldName} must be a string`);
      }

      return value.trim() || null;
    };

    let profileData;

    try {
      profileData = {
        name: name.trim(),
        phone: optionalString(phone, "Phone"),
        gender: optionalString(gender, "Gender"),
        dateOfBirth: parsedDate,
        city: optionalString(city, "City"),
        state: optionalString(state, "State"),
        pincode: optionalString(pincode, "Pincode"),
      };
    } catch (error: unknown) {
      res.status(400).json({
        statusCode: 400,
        message:
          error instanceof Error
            ? error.message
            : "Invalid profile data",
      });
      return;
    }

    const user = await updateUserProfileById(auth.id, profileData);

    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: "User profile not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error: unknown) {
    next(error);
  }
};
