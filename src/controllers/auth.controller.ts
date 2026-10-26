
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

// POST /auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, rollNumber, branch, year } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await registerStudentWithProfile({
      name,
      email,
      passwordHash,
      rollNumber,
      branch,
      year,
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

    const user = await findUserForLogin(email);

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
      statusCode: 200,
      message: "Login successful",
      token,
      tokenType: "Bearer",
      user: {
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
      user,
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

    const parsedDate =
      dateOfBirth === null ||
      dateOfBirth === undefined ||
      dateOfBirth === ""
        ? null
        : new Date(dateOfBirth);

    const optionalString = (
      value: string | null | undefined,
    ): string | null => {
      if (value === null || value === undefined || value === "") {
        return null;
      }

      return value.trim() || null;
    };

    const profileData = {
      name,
      phone: optionalString(phone),
      gender: optionalString(gender),
      dateOfBirth: parsedDate,
      city: optionalString(city),
      state: optionalString(state),
      pincode: optionalString(pincode),
    };

    const user = await updateUserProfileById(auth.id, profileData);

    res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully",
      user,
    });
  } catch (error: unknown) {
    next(error);
  }
};
