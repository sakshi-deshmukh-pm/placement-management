
import type { Request, Response, NextFunction } from "express";
import type { ApplicationStatus } from "../generated/prisma/client.js";

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

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const rawStatus =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const validStatuses: ApplicationStatus[] = [
      "APPLIED",
      "SHORTLISTED",
      "SELECTED",
      "REJECTED",
    ];

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      res.status(400).json({
        statusCode: 400,
        message:
          "Page must be at least 1 and pageSize must be between 1 and 100",
      });
      return;
    }

    if (
      rawStatus !== undefined &&
      rawStatus !== "ALL" &&
      !validStatuses.includes(rawStatus as ApplicationStatus)
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid application status",
      });
      return;
    }

    const status =
      rawStatus && rawStatus !== "ALL"
        ? (rawStatus as ApplicationStatus)
        : undefined;

    const result =
      role === "ADMIN" || role === "PLACEMENT_COORDINATOR"
        ? await getApplications(
            undefined,
            page,
            pageSize,
            search,
            status,
          )
        : await getApplications(
            id,
            page,
            pageSize,
            search,
            status,
          );

    res.status(200).json({
      statusCode: 200,
      message: "Applications fetched successfully",
      data: result.applications,
      pagination: result.pagination,
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

    if (auth.role !== "STUDENT") {
      res.status(403).json({
        statusCode: 403,
        message: "Only students can submit applications",
      });
      return;
    }

    const { placementDriveId } = req.body;

    // Always use the authenticated student's ID.
    const eligibility = await findEligiblePlacementDrive(placementDriveId);

    if (!eligibility.eligible) {
      const statusCode = eligibility.statusCode ?? 400;

      res.status(statusCode).json({
        statusCode,
        message: eligibility.reason,
      });
      return;
    }

    const application = await createApplication(auth.id, placementDriveId);

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

// PATCH /applications/:id
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

    const application = await updateApplicationStatus(
      id,
      status as ApplicationStatus,
    );

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
