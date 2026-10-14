
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client.js";
import { createUser, findUserByEmail } from "../models/user.model.js";
import { findUserForLogin } from "../models/user.model.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8
    ) {
      res.status(400).json({
        message: "Enter a valid email and a password of at least 8 characters",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      res.status(409).json({
        message: "Email is already registered",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      email: normalizedEmail,
      passwordHash,
    });

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "Email is already registered",
      });
      return;
    }

    next(error);
  }
};



export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserForLogin(normalizedEmail);

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "Your account is inactive",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
