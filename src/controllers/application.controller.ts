
import type { Request, Response, NextFunction } from "express";

import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  findEligiblePlacementDrive,
} from "../models/application.model.js";

const isPrismaErrorCode = (
  error: unknown,
  code: string,
): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === code;

// GET /applications
export const getApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as
      | { id: number; role: string }
      | undefined;

    if (!auth) {
      res.status(401).json({
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    const { role, id } = auth;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(401).json({
        statusCode: 401,
        message: "Valid authenticated user ID is required",
      });
      return;
    }

    if (
      role !== "ADMIN" &&
      role !== "PLACEMENT_COORDINATOR" &&
      role !== "STUDENT"
    ) {
      res.status(403).json({
        statusCode: 403,
        message: "You do not have permission to view applications",
      });
      return;
    }

    // Admins and placement coordinators can view all applications.
    // Students can view only their own applications.
    const applications =
      role === "ADMIN" || role === "PLACEMENT_COORDINATOR"
        ? await getApplications()
        : await getApplications(id);

    res.status(200).json({
      statusCode: 200,
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// POST /applications
export const addApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as
      | { id: number; role: string }
      | undefined;

    if (!auth) {
      res.status(401).json({
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    const { id, role } = auth;
    const { placementDriveId } = req.body;

    if (role !== "STUDENT") {
      res.status(403).json({
        statusCode: 403,
        message: "Only students can submit applications",
      });
      return;
    }

    if (!Number.isInteger(id) || id <= 0) {
      res.status(401).json({
        statusCode: 401,
        message: "Valid authenticated user ID is required",
      });
      return;
    }

    const driveId = Number(placementDriveId);

    if (!Number.isInteger(driveId) || driveId <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid placement drive ID is required",
      });
      return;
    }

    const eligibility = await findEligiblePlacementDrive(driveId);

    if (!eligibility.eligible) {
      const statusCode = eligibility.statusCode ?? 400;

      res.status(statusCode).json({
        statusCode,
        message: eligibility.reason,
      });
      return;
    }

    // Use the authenticated user's ID, not an ID supplied by the client.
    const application = await createApplication(id, driveId);

    res.status(201).json({
      statusCode: 201,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error: unknown) {
    if (isPrismaErrorCode(error, "P2002")) {
      res.status(409).json({
        statusCode: 409,
        message: "You have already applied for this placement drive",
      });
      return;
    }

    next(error);
  }
};

// PATCH /applications/:id/status
export const changeApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth = res.locals.auth as
      | { id: number; role: string }
      | undefined;

    if (!auth) {
      res.status(401).json({
        statusCode: 401,
        message: "Authentication required",
      });
      return;
    }

    // Only admins and placement coordinators may change application status.
    if (
      auth.role !== "ADMIN" &&
      auth.role !== "PLACEMENT_COORDINATOR"
    ) {
      res.status(403).json({
        statusCode: 403,
        message: "You do not have permission to update application status",
      });
      return;
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "APPLIED",
      "SHORTLISTED",
      "REJECTED",
      "SELECTED",
    ];

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid application ID is required",
      });
      return;
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid application status",
      });
      return;
    }

    const application = await updateApplicationStatus(id, status);

    if (!application) {
      res.status(404).json({
        statusCode: 404,
        message: "Application not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error: unknown) {
    next(error);
  }
};
