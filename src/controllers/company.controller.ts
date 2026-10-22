
import type { Request, Response, NextFunction } from "express";

import {
  createCompany,
  getCompanies,
  updateComapny,
  patchCompany,
  getCompanyById,
  deleteCompany,
} from "../models/company.model.js";

// POST /companies
export const addCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const company = await createCompany(req.body);

    res.status(201).json({
      statusCode: 201,
      message: "Company created successfully",
      data: company,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /companies
export const fetchCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const companies = await getCompanies();

    res.status(200).json({
      statusCode: 200,
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PUT /companies/:id
export const editComapny = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid company ID",
      });
      return;
    }

    const { name, website, industry, location } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      res.status(400).json({
        statusCode: 400,
        message: "Company name is required",
      });
      return;
    }

    const companyExists = await getCompanyById(id);

    if (!companyExists) {
      res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
      return;
    }

    const company = await updateComapny(id, {
      name: name.trim(),
      ...(website !== undefined && { website }),
      ...(industry !== undefined && { industry }),
      ...(location !== undefined && { location }),
    });

    res.status(200).json({
      statusCode: 200,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PATCH /companies/:id
export const partialUpdateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid company ID",
      });
      return;
    }

    const { name, website, industry, location } = req.body;

    const allowedFields = ["name", "website", "industry", "location"];
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

    if (
      name !== undefined &&
      (typeof name !== "string" || name.trim() === "")
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Name must be a non-empty string",
      });
      return;
    }

    for (const [field, value] of Object.entries({
      website,
      industry,
      location,
    })) {
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== "string"
      ) {
        res.status(400).json({
          statusCode: 400,
          message: `${field} must be a string or null`,
        });
        return;
      }
    }

    const companyExists = await getCompanyById(id);

    if (!companyExists) {
      res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
      return;
    }

    const company = await patchCompany(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(website !== undefined && { website }),
      ...(industry !== undefined && { industry }),
      ...(location !== undefined && { location }),
    });

    res.status(200).json({
      statusCode: 200,
      message: "Company partially updated successfully",
      data: company,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /companies/:id
export const fetchCompanyById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid company ID",
      });
      return;
    }

    const company = await getCompanyById(id);

    if (!company) {
      res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Company fetched successfully",
      data: company,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// DELETE /companies/:id
export const removeCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid company ID",
      });
      return;
    }

    const company = await getCompanyById(id);

    if (!company) {
      res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
      return;
    }

    await deleteCompany(id);

    res.status(200).json({
      statusCode: 200,
      message: "Company deleted successfully",
      data: { id },
    });
  } catch (error: unknown) {
    next(error);
  }
};
