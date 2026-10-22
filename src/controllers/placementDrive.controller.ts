
import type { Request, Response, NextFunction } from "express";

import {
  createPlacementDrive,
  getPlacementDriveById,
  getPlacementDrives,
  updatePlacementDrive,
  patchPlacementDrive,
  deletePlacementDrive,
  countDriveApplications,
} from "../models/placementDrive.model.js";

// POST /placement-drives
export const addPlacementDrive = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      role,
      package: salaryPackage,
      eligibilityCriteria,
      deadline,
      companyId,
    } = req.body;

    if (
      typeof role !== "string" ||
      !role.trim() ||
      typeof salaryPackage !== "number" ||
      !Number.isFinite(salaryPackage) ||
      salaryPackage <= 0 ||
      typeof eligibilityCriteria !== "string" ||
      !eligibilityCriteria.trim() ||
      typeof deadline !== "string" ||
      Number.isNaN(Date.parse(deadline)) ||
      !Number.isInteger(companyId) ||
      companyId <= 0
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive details",
      });
      return;
    }

    const placementDrive = await createPlacementDrive({
      role: role.trim(),
      package: salaryPackage,
      eligibilityCriteria: eligibilityCriteria.trim(),
      deadline: new Date(deadline),
      companyId,
    });

    res.status(201).json({
      statusCode: 201,
      message: "Placement drive created successfully",
      data: placementDrive,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /placement-drives
export const fetchPlacementDrives = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const placementDrives = await getPlacementDrives();

    res.status(200).json({
      statusCode: 200,
      message: "Placement drives fetched successfully",
      data: placementDrives,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /placement-drives/:id
export const fetchPlacementDriveById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive ID",
      });
      return;
    }

    const placementDrive = await getPlacementDriveById(id);

    if (!placementDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Placement drive fetched successfully",
      data: placementDrive,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PUT /placement-drives/:id
export const editPlacementDrive = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive ID",
      });
      return;
    }

    const {
      role,
      package: salaryPackage,
      eligibilityCriteria,
      deadline,
      companyId,
    } = req.body;

    if (
      typeof role !== "string" ||
      !role.trim() ||
      typeof salaryPackage !== "number" ||
      !Number.isFinite(salaryPackage) ||
      salaryPackage <= 0 ||
      typeof eligibilityCriteria !== "string" ||
      !eligibilityCriteria.trim() ||
      typeof deadline !== "string" ||
      Number.isNaN(Date.parse(deadline)) ||
      !Number.isInteger(companyId) ||
      companyId <= 0
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive details",
      });
      return;
    }

    const existingDrive = await getPlacementDriveById(id);

    if (!existingDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
      });
      return;
    }

    const updatedDrive = await updatePlacementDrive(id, {
      role: role.trim(),
      package: salaryPackage,
      eligibilityCriteria: eligibilityCriteria.trim(),
      deadline: new Date(deadline),
      companyId,
    });

    res.status(200).json({
      statusCode: 200,
      message: "Placement drive updated successfully",
      data: updatedDrive,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PATCH /placement-drives/:id
export const partiallyUpdatePlacementDrive = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive ID",
      });
      return;
    }

    const {
      role,
      package: salaryPackage,
      eligibilityCriteria,
      deadline,
      companyId,
      status,
    } = req.body;

    const allowedFields = [
      "role",
      "package",
      "eligibilityCriteria",
      "deadline",
      "companyId",
      "status",
    ];

    const suppliedFields = Object.keys(req.body);

    if (
      suppliedFields.length === 0 ||
      suppliedFields.some((field) => !allowedFields.includes(field))
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Provide at least one valid field to update",
      });
      return;
    }

    const data: {
      role?: string;
      package?: number;
      eligibilityCriteria?: string;
      deadline?: Date;
      companyId?: number;
      status?: "OPEN" | "CLOSED";
    } = {};

    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        res.status(400).json({
          statusCode: 400,
          message: "Role must be a non-empty string",
        });
        return;
      }

      data.role = role.trim();
    }

    if (salaryPackage !== undefined) {
      if (
        typeof salaryPackage !== "number" ||
        !Number.isFinite(salaryPackage) ||
        salaryPackage <= 0
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Package must be a positive number",
        });
        return;
      }

      data.package = salaryPackage;
    }

    if (eligibilityCriteria !== undefined) {
      if (
        typeof eligibilityCriteria !== "string" ||
        !eligibilityCriteria.trim()
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Eligibility criteria must be a non-empty string",
        });
        return;
      }

      data.eligibilityCriteria = eligibilityCriteria.trim();
    }

    if (deadline !== undefined) {
      if (
        typeof deadline !== "string" ||
        Number.isNaN(Date.parse(deadline))
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Invalid deadline",
        });
        return;
      }

      data.deadline = new Date(deadline);
    }

    if (companyId !== undefined) {
      if (!Number.isInteger(companyId) || companyId <= 0) {
        res.status(400).json({
          statusCode: 400,
          message: "Invalid company ID",
        });
        return;
      }

      data.companyId = companyId;
    }

    if (status !== undefined) {
      if (status !== "OPEN" && status !== "CLOSED") {
        res.status(400).json({
          statusCode: 400,
          message: "Status must be OPEN or CLOSED",
        });
        return;
      }

      data.status = status;
    }

    const existingDrive = await getPlacementDriveById(id);

    if (!existingDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
      });
      return;
    }

    const updatedDrive = await patchPlacementDrive(id, data);

    res.status(200).json({
      statusCode: 200,
      message: "Placement drive partially updated successfully",
      data: updatedDrive,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// DELETE /placement-drives/:id
export const removePlacementDrive = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid placement drive ID",
      });
      return;
    }

    const existingDrive = await getPlacementDriveById(id);

    if (!existingDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
      });
      return;
    }

    const applicationCount = await countDriveApplications(id);

    if (applicationCount > 0) {
      res.status(409).json({
        statusCode: 409,
        message:
          "Cannot delete this drive because students have applied. Close the drive instead.",
      });
      return;
    }

    await deletePlacementDrive(id);

    res.status(200).json({
      statusCode: 200,
      message: "Placement drive deleted successfully",
      data: { id },
    });
  } catch (error: unknown) {
    next(error);
  }
};
