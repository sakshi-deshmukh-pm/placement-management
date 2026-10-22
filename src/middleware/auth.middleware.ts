import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "../models/user.model.js";

type TokenPayload = {
  userId: number;
  email: string;
  role: string;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication token is required",
      });
      return;
    }

    const token = authHeader.slice("Bearer ".length);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({
        message: "Authentication configuration error",
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    const payload = decoded as TokenPayload;
    const user = await findUserById(payload.userId);

    if (!user) {
      res.status(401).json({
        message: "User no longer exists",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "Your account is inactive",
      });
      return;
    }


    res.locals.auth = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid or expired authentication token",
      });
      return;
    }

    next(error);
  }
};