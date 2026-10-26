
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import type { Prisma } from "../generated/prisma/client.js";
import type { StudentQueryDto } from "../dtos/student/student-query.dto.js";
import type { ReplaceStudentDto } from "../dtos/student/update-student.dto.js";
import type{ UpdateStudentDto } from "../dtos/student/update-student.dto.js";
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
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = res.locals.validated?.query as StudentQueryDto;

    const { page, pageSize, sortBy, sortOrder, search, branch, year, city } =
      query;

    const where: Prisma.UserWhereInput = {
      role: "STUDENT",
    };

    // Search by name, email, or roll number.
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

    // Filter by branch.
    if (branch) {
      where.branch = {
        equals: branch,
        mode: "insensitive",
      };
    }

    // Filter by year.
    if (year) {
      where.year = year;
    }

    // Filter by city.
    if (city) {
      where.city = {
        equals: city,
        mode: "insensitive",
      };
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
      getAllStudents(
        where,
        skip,
        pageSize,
        sortBy as StudentSortField,
        sortOrder as SortOrder,
      ),
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

    // Request body is validated by Zod middleware.
    const normalizedEmail = email;

    let parsedDate: Date | null | undefined;

    if (dateOfBirth === null || dateOfBirth === "") {
      parsedDate = null;
    } else if (dateOfBirth !== undefined) {
      parsedDate = new Date(dateOfBirth);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await createStudent({
      name,
      email: normalizedEmail,
      passwordHash,
      rollNumber,
      branch,
      year,
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
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = (res.locals.validated?.params as { id: number }).id;

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
    const id = (res.locals.validated?.params as { id: number }).id;

    // The Zod middleware has already validated this body.
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
    } = req.body as ReplaceStudentDto;

    // Convert the date string into a Date for Prisma.
    const parsedDate =
      dateOfBirth === undefined
        ? undefined
        : dateOfBirth === null || dateOfBirth === ""
          ? null
          : new Date(dateOfBirth);

    const data: Prisma.UserUpdateInput = {
      name,
      email,
      rollNumber,
      branch,
      year,
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
    const id = (res.locals.validated?.params as { id: number }).id;

    // The Zod middleware has already validated the request body.
    const body = req.body as UpdateStudentDto;
    const data: Prisma.UserUpdateInput = {};

    for (const [key, value] of Object.entries(body)) {
      if (key === "dateOfBirth") {
  if (value === null || value === "") {
    data.dateOfBirth = null;
  } else if (value !== undefined) {
    data.dateOfBirth = new Date(value);
  }
} else if (key === "email" && typeof value === "string") {
        data.email = value;
      } else if (value !== undefined) {
        (data as Record<string, unknown>)[key] = value;
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
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = (res.locals.validated?.params as { id: number }).id;

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
