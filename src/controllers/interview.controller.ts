
import type { Request, Response, NextFunction } from "express";

import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  patchInterview,
  deleteInterview,
} from "../models/interview.model.js";

type AuthUser = {
  id: number;
  email: string;
  role: "ADMIN" | "STUDENT" | "PLACEMENT_COORDINATOR";
};

// POST /interviews
export const addInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const interview = await createInterview(req.body);

    res.status(201).json({
      message: "Interview scheduled successfully",
      data: interview,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /interviews
export const getAllInterviews = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as AuthUser | undefined;

    if (!auth) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const interviews = await getInterviews();

    const visibleInterviews =
      auth.role === "ADMIN" || auth.role === "PLACEMENT_COORDINATOR"
        ? interviews
        : auth.role === "STUDENT"
          ? interviews.filter(
              (interview) => interview.application.user.id === auth.id,
            )
          : [];

    if (
      auth.role !== "ADMIN" &&
      auth.role !== "PLACEMENT_COORDINATOR" &&
      auth.role !== "STUDENT"
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json({
      message: "Interviews fetched successfully",
      data: visibleInterviews,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /interviews/:id
export const getInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as AuthUser | undefined;

    if (!auth) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const id = Number(req.params.id);
    const interview = await getInterviewById(id);

    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    if (
      auth.role === "STUDENT" &&
      interview.application.user.id !== auth.id
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    if (
      auth.role !== "ADMIN" &&
      auth.role !== "PLACEMENT_COORDINATOR" &&
      auth.role !== "STUDENT"
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json({
      message: "Interview fetched successfully",
      data: interview,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PUT /interviews/:id
export const updateInterviewDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const interview = await updateInterview(id, req.body);

    res.status(200).json({
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PATCH /interviews/:id
export const patchInterviewDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const interview = await patchInterview(id, req.body);

    res.status(200).json({
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// DELETE /interviews/:id
export const removeInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    await deleteInterview(id);

    res.status(200).json({
      message: "Interview deleted successfully",
    });
  } catch (error: unknown) {
    next(error);
  }
};
