import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import prisma from "../prisma.js";

const isValidId = (id: number) =>
  Number.isInteger(id) && id > 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const handleDatabaseError = (
  error: unknown,
  res: Response,
  next: NextFunction
) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      message: "Email or roll number already exists"
    });
    return;
  }

  next(error);
};

export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const skip = (page - 1) * limit;
  const search = String(req.query.search || "").trim();
  const branch=String(req.query.branch || "").trim();
  const year=String(req.query.year|| "").trim();

const where: Prisma.StudentWhereInput = {
  ...(search && {
    name: {
      contains: search,
      mode: "insensitive"
    }
  }),
  ...(branch && {
    branch: {
      equals: branch,
      mode: "insensitive"
    }
  }),
  ...(year && {
    year: {
      equals: year,
      mode: "insensitive"
    }
  })
};


  try {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "asc"
        }
      }),
      prisma.student.count({
        where
      })
    ]);

    res.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


export const addStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    email,
    phone,
    rollNumber,
    branch,
    year,
    gender,
    dateOfBirth,
    city,
    state,
    pincode
  } = req.body;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(rollNumber) ||
    !isNonEmptyString(branch) ||
    !isNonEmptyString(year)
  ) {
    res.status(400).json({
      message: "Name, email, roll number, branch and year are required"
    });
    return;
  }

  if (
    (phone !== undefined && phone !== null && typeof phone !== "string") ||
    (gender !== undefined && gender !== null && typeof gender !== "string") ||
    (city !== undefined && city !== null && typeof city !== "string") ||
    (state !== undefined && state !== null && typeof state !== "string") ||
    (pincode !== undefined && pincode !== null && typeof pincode !== "string")
  ) {
    res.status(400).json({
      message: "Optional text fields must be strings"
    });
    return;
  }

  let parsedDate: Date | undefined;

  if (
    dateOfBirth !== undefined &&
    dateOfBirth !== null &&
    dateOfBirth !== ""
  ) {
    if (typeof dateOfBirth !== "string") {
      res.status(400).json({
        message: "Date of birth must be a valid date string"
      });
      return;
    }

    parsedDate = new Date(dateOfBirth);

    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: "Date of birth must be a valid date"
      });
      return;
    }
  }

  try {
    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        rollNumber: rollNumber.trim(),
        branch: branch.trim(),
        year: year.trim(),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(parsedDate !== undefined && {
          dateOfBirth: parsedDate
        })
      }
    });

    res.status(201).json(student);
  } catch (error) {
    handleDatabaseError(error, res, next);
  }
};


export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    res.status(400).json({
      message: "Invalid student ID"
    });
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      res.status(404).json({
        message: "Student not found"
      });
      return;
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    phone,
    rollNumber,
    branch,
    year,
    gender,
    dateOfBirth,
    city,
    state,
    pincode
  } = req.body;

  if (!isValidId(id)) {
    res.status(400).json({
      message: "Invalid student ID"
    });
    return;
  }

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(rollNumber) ||
    !isNonEmptyString(branch) ||
    !isNonEmptyString(year)
  ) {
    res.status(400).json({
      message: "Name, email, roll number, branch and year are required"
    });
    return;
  }

  let parsedDate: Date | null | undefined;

  if (dateOfBirth === null || dateOfBirth === "") {
    parsedDate = null;
  } else if (dateOfBirth !== undefined) {
    if (typeof dateOfBirth !== "string") {
      res.status(400).json({
        message: "Date of birth must be a valid date string"
      });
      return;
    }

    parsedDate = new Date(dateOfBirth);

    if (Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: "Date of birth must be a valid date"
      });
      return;
    }
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.trim(),
        rollNumber: rollNumber.trim(),
        branch: branch.trim(),
        year: year.trim(),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(parsedDate !== undefined && {
          dateOfBirth: parsedDate
        })
      }
    });

    res.json(student);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        message: "Student not found"
      });
      return;
    }

    handleDatabaseError(error, res, next);
  }
};

export const deleteStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    res.status(400).json({
      message: "Invalid student ID"
    });
    return;
  }

  try {
    await prisma.student.delete({
      where: { id }
    });

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        message: "Student not found"
      });
      return;
    }

    next(error);
  }
};


export const patchStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);

  const {
    name,
    email,
    phone,
    rollNumber,
    branch,
    year,
    gender,
    dateOfBirth,
    city,
    state,
    pincode
  } = req.body;

  if (!isValidId(id)) {
    res.status(400).json({
      message: "Invalid student ID"
    });
    return;
  }

  const data: Prisma.StudentUpdateInput = {};

  const textFields = {
    name,
    email,
    phone,
    rollNumber,
    branch,
    year,
    gender,
    city,
    state,
    pincode
  };

  for (const [field, value] of Object.entries(textFields)) {
    if (value === undefined) continue;

    if (value !== null && typeof value !== "string") {
      res.status(400).json({
        message: `${field} must be a string`
      });
      return;
    }

    if (
      ["name", "email", "rollNumber", "branch", "year"].includes(field) &&
      (typeof value !== "string" || value.trim().length === 0)
    ) {
      res.status(400).json({
        message: `${field} cannot be empty`
      });
      return;
    }

    if (
      value === null &&
      ["name", "email", "rollNumber", "branch", "year"].includes(field)
    ) {
      res.status(400).json({
        message: `${field} cannot be null`
      });
      return;
    }

    if (value === null || value === undefined) continue;

    switch (field) {
      case "name":
        data.name = value.trim();
        break;
      case "email":
        data.email = value.trim();
        break;
      case "phone":
        data.phone = value;
        break;
      case "rollNumber":
        data.rollNumber = value.trim();
        break;
      case "branch":
        data.branch = value.trim();
        break;
      case "year":
        data.year = value.trim();
        break;
      case "gender":
        data.gender = value;
        break;
      case "city":
        data.city = value;
        break;
      case "state":
        data.state = value;
        break;
      case "pincode":
        data.pincode = value;
        break;
    }
  }

  if (dateOfBirth !== undefined) {
    if (dateOfBirth === null || dateOfBirth === "") {
      data.dateOfBirth = null;
    } else if (typeof dateOfBirth === "string") {
      const parsedDate = new Date(dateOfBirth);

      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({
          message: "Date of birth must be a valid date"
        });
        return;
      }

      data.dateOfBirth = parsedDate;
    } else {
      res.status(400).json({
        message: "Date of birth must be a valid date string"
      });
      return;
    }
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({
      message: "Provide at least one field to update"
    });
    return;
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data
    });

    res.json(student);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        message: "Student not found"
      });
      return;
    }

    handleDatabaseError(error, res, next);
  }
};

export const testError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new Error("Test error"));
};
