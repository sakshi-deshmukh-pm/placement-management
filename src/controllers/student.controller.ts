
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import type { Prisma } from "../generated/prisma/client.js";

import {
  getAllStudents,
  countStudents,
  getStudentById as findStudentById,
  createStudent,
  updateStudent as updateStudentModel,
  deleteStudent as deleteStudentModel,
  type StudentSortField,
  type SortOrder,
} from "../models/student.model.js";

// GET /students
export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pageValue = req.query.page ?? "1";
    const pageSizeValue = req.query.pageSize ?? req.query.limit ?? "10";

    if (
      typeof pageValue !== "string" ||
      typeof pageSizeValue !== "string" ||
      !/^\d+$/.test(pageValue) ||
      !/^\d+$/.test(pageSizeValue)
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Page and pageSize must be positive integers",
      });
      return;
    }

    const page = Number(pageValue);
    const pageSize = Number(pageSizeValue);

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isSafeInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Page must be positive and pageSize must be between 1 and 100",
      });
      return;
    }

    const allowedSortFields: StudentSortField[] = [
      "id",
      "name",
      "email",
      "rollNumber",
      "branch",
      "year",
      "city",
    ];

    const sortByValue = req.query.sortBy ?? "id";
    const sortOrderValue = req.query.sortOrder ?? "asc";

    if (
      typeof sortByValue !== "string" ||
      !allowedSortFields.includes(sortByValue as StudentSortField)
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "Invalid sortBy field",
        allowedFields: allowedSortFields,
      });
      return;
    }

    if (
      typeof sortOrderValue !== "string" ||
      !["asc", "desc"].includes(sortOrderValue)
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "sortOrder must be either asc or desc",
      });
      return;
    }

    const sortBy = sortByValue as StudentSortField;
    const sortOrder = sortOrderValue as SortOrder;

    const where: Prisma.UserWhereInput = {
      role: "STUDENT",
    };

    // Search by name, email, or roll number.
    if (req.query.search !== undefined) {
      if (typeof req.query.search !== "string") {
        res.status(400).json({
          statusCode: 400,
          message: "Search must be a string",
        });
        return;
      }

      const search = req.query.search.trim();

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            rollNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }
    }

    // Filter by branch.
    if (req.query.branch !== undefined) {
      if (typeof req.query.branch !== "string") {
        res.status(400).json({
          statusCode: 400,
          message: "Branch must be a string",
        });
        return;
      }

      const branch = req.query.branch.trim();

      if (branch) {
        where.branch = {
          equals: branch,
          mode: "insensitive",
        };
      }
    }

    // Filter by year.
    if (req.query.year !== undefined) {
      if (typeof req.query.year !== "string") {
        res.status(400).json({
          statusCode: 400,
          message: "Year must be a string",
        });
        return;
      }

      const year = req.query.year.trim();

      if (year) {
        where.year = year;
      }
    }

    // Filter by city.
    if (req.query.city !== undefined) {
      if (typeof req.query.city !== "string") {
        res.status(400).json({
          statusCode: 400,
          message: "City must be a string",
        });
        return;
      }

      const city = req.query.city.trim();

      if (city) {
        where.city = {
          equals: city,
          mode: "insensitive",
        };
      }
    }

    const skip = (page - 1) * pageSize;

    if (!Number.isSafeInteger(skip)) {
      res.status(400).json({
        statusCode: 400,
        message: "Requested page is too large",
      });
      return;
    }

    const [students, total] = await Promise.all([
      getAllStudents(where, skip, pageSize, sortBy, sortOrder),
      countStudents(where),
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Students fetched successfully",
      data: students,
      pagination: {
        page,
        pageSize,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      sorting: {
        sortBy,
        sortOrder,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
};

// POST /students
export const addStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      branch,
      year,
      phone,
      gender,
      dateOfBirth,
      city,
      state,
      pincode,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
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
          "Provide valid name, email, password (minimum 8 characters), roll number, branch and year",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({
        statusCode: 400,
        message: "Enter a valid email address",
      });
      return;
    }

    let parsedDate: Date | null | undefined;

    if (dateOfBirth === null || dateOfBirth === "") {
      parsedDate = null;
    } else if (dateOfBirth !== undefined) {
      if (
        typeof dateOfBirth !== "string" ||
        Number.isNaN(Date.parse(dateOfBirth))
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Enter a valid date of birth",
        });
        return;
      }

      parsedDate = new Date(dateOfBirth);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await createStudent({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      rollNumber: rollNumber.trim(),
      branch: branch.trim(),
      year: year.trim(),
      ...(phone !== undefined && { phone }),
      ...(gender !== undefined && { gender }),
      ...(parsedDate !== undefined && { dateOfBirth: parsedDate }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
    });

    res.status(201).json({
      statusCode: 201,
      message: "Student created successfully",
      data: student,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /students/:id
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid student ID is required",
      });
      return;
    }

    const student = await findStudentById(id);

    if (!student) {
      res.status(404).json({
        statusCode: 404,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PUT /students/:id
export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid student ID is required",
      });
      return;
    }

    const {
      name,
      email,
      rollNumber,
      branch,
      year,
      phone,
      gender,
      dateOfBirth,
      city,
      state,
      pincode,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      typeof branch !== "string" ||
      !branch.trim() ||
      typeof year !== "string" ||
      !year.trim()
    ) {
      res.status(400).json({
        statusCode: 400,
        message: "PUT requires name, email, roll number, branch and year",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({
        statusCode: 400,
        message: "Enter a valid email address",
      });
      return;
    }

    let parsedDate: Date | null | undefined;

    if (dateOfBirth === null || dateOfBirth === "") {
      parsedDate = null;
    } else if (dateOfBirth !== undefined) {
      if (
        typeof dateOfBirth !== "string" ||
        Number.isNaN(Date.parse(dateOfBirth))
      ) {
        res.status(400).json({
          statusCode: 400,
          message: "Enter a valid date of birth",
        });
        return;
      }

      parsedDate = new Date(dateOfBirth);
    }

    const data: Prisma.UserUpdateInput = {
      name: name.trim(),
      email: normalizedEmail,
      rollNumber: rollNumber.trim(),
      branch: branch.trim(),
      year: year.trim(),
      ...(phone !== undefined && { phone }),
      ...(gender !== undefined && { gender }),
      ...(parsedDate !== undefined && { dateOfBirth: parsedDate }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
    };

    const student = await updateStudentModel(id, data);

    if (!student) {
      res.status(404).json({
        statusCode: 404,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// PATCH /students/:id
export const patchStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid student ID is required",
      });
      return;
    }

    const body = req.body as Record<string, unknown>;

    const allowedFields = [
      "name",
      "email",
      "rollNumber",
      "branch",
      "year",
      "phone",
      "gender",
      "dateOfBirth",
      "city",
      "state",
      "pincode",
    ];

    const keys = Object.keys(body);

    if (
      keys.length === 0 ||
      keys.some((key) => !allowedFields.includes(key))
    ) {
      res.status(400).json({
        statusCode: 400,
        message:
          keys.length === 0
            ? "Provide at least one field to update"
            : "One or more fields cannot be updated",
      });
      return;
    }

    const data: Prisma.UserUpdateInput = {};

    for (const key of keys) {
      const value = body[key];

      if (key === "dateOfBirth") {
        if (value === null || value === "") {
          data.dateOfBirth = null;
        } else if (
          typeof value === "string" &&
          !Number.isNaN(Date.parse(value))
        ) {
          data.dateOfBirth = new Date(value);
        } else {
          res.status(400).json({
            statusCode: 400,
            message: "Enter a valid date of birth",
          });
          return;
        }

        continue;
      }

      if (
        ["name", "email", "rollNumber", "branch", "year"].includes(key) &&
        (typeof value !== "string" || !value.trim())
      ) {
        res.status(400).json({
          statusCode: 400,
          message: `${key} must be a non-empty string`,
        });
        return;
      }

      if (
        ["phone", "gender", "city", "state", "pincode"].includes(key) &&
        value !== null &&
        value !== undefined &&
        typeof value !== "string"
      ) {
        res.status(400).json({
          statusCode: 400,
          message: `${key} must be a string or null`,
        });
        return;
      }

      if (typeof value === "string") {
        const cleanValue = value.trim();

        if (key === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
            res.status(400).json({
              statusCode: 400,
              message: "Enter a valid email address",
            });
            return;
          }

          data.email = cleanValue.toLowerCase();
        } else {
          (data as Record<string, unknown>)[key] = cleanValue;
        }
      } else if (value === null) {
        (data as Record<string, unknown>)[key] = null;
      }
    }

    const student = await updateStudentModel(id, data);

    if (!student) {
      res.status(404).json({
        statusCode: 404,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// DELETE /students/:id
export const deleteStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        statusCode: 400,
        message: "Valid student ID is required",
      });
      return;
    }

    const student = await findStudentById(id);

    if (!student) {
      res.status(404).json({
        statusCode: 404,
        message: "Student not found",
      });
      return;
    }

    const deletedStudent = await deleteStudentModel(id);

    if (!deletedStudent) {
      res.status(404).json({
        statusCode: 404,
        message: "Student not found",
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (error: unknown) {
    next(error);
  }
};

// GET /test-error
export const testError = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new Error("Test error"));
};
