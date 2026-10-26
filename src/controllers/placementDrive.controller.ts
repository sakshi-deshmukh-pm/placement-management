
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
      status,
    } = req.body;

    const placementDrive = await createPlacementDrive({
      role,
      package: salaryPackage,
      eligibilityCriteria,
      deadline: new Date(deadline),
      companyId,
      ...(status !== undefined && { status }),
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
  _req: Request,
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
    const existingDrive = await getPlacementDriveById(id);

    if (!existingDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
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

    const updatedDrive = await updatePlacementDrive(id, {
      role,
      package: salaryPackage,
      eligibilityCriteria,
      deadline: new Date(deadline),
      companyId,
      ...(status !== undefined && { status }),
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
    const existingDrive = await getPlacementDriveById(id);

    if (!existingDrive) {
      res.status(404).json({
        statusCode: 404,
        message: "Placement drive not found",
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

    const data: {
      role?: string;
      package?: number;
      eligibilityCriteria?: string;
      deadline?: Date;
      companyId?: number;
      status?: "OPEN" | "CLOSED";
    } = {};

    if (role !== undefined) data.role = role;
    if (salaryPackage !== undefined) data.package = salaryPackage;
    if (eligibilityCriteria !== undefined) {
      data.eligibilityCriteria = eligibilityCriteria;
    }
    if (deadline !== undefined) data.deadline = new Date(deadline);
    if (companyId !== undefined) data.companyId = companyId;
    if (status !== undefined) data.status = status;

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
