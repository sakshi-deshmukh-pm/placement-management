
import prisma from "../prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

// Allowed fields for student sorting.
export type StudentSortField =
  | "id"
  | "name"
  | "email"
  | "rollNumber"
  | "branch"
  | "year"
  | "city";

export type SortOrder = "asc" | "desc";

// Fetch students with pagination, filters, and sorting.
export const getAllStudents = async (
  where: Prisma.UserWhereInput = {},
  skip = 0,
  take = 10,
  sortBy: StudentSortField = "id",
  sortOrder: SortOrder = "asc"
) => {
  return prisma.user.findMany({
    where: {
      ...where,
      role: "STUDENT",
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      rollNumber: true,
      branch: true,
      year: true,
      gender: true,
      dateOfBirth: true,
      city: true,
      state: true,
      pincode: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Count students matching the same filters.
export const countStudents = async (
  where: Prisma.UserWhereInput = {}
) => {
  return prisma.user.count({
    where: {
      ...where,
      role: "STUDENT",
    },
  });
};

// Find one student by User ID.
export const getStudentById = async (id: number) => {
  return prisma.user.findFirst({
    where: {
      id,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      rollNumber: true,
      branch: true,
      year: true,
      gender: true,
      dateOfBirth: true,
      city: true,
      state: true,
      pincode: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// Create a student account.
export const createStudent = async (
  data: Prisma.UserUncheckedCreateInput
) => {
  return prisma.user.create({
    data: {
      ...data,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      branch: true,
      year: true,
      createdAt: true,
    },
  });
};

// Update an existing student account.
export const updateStudent = async (
  id: number,
  data: Prisma.UserUpdateInput
) => {
  const result = await prisma.user.updateMany({
    where: {
      id,
      role: "STUDENT",
    },
    data,
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      rollNumber: true,
      branch: true,
      year: true,
      gender: true,
      dateOfBirth: true,
      city: true,
      state: true,
      pincode: true,
      isActive: true,
      updatedAt: true,
    },
  });
};

// Delete a student account.
export const deleteStudent = async (id: number) => {
  const result = await prisma.user.deleteMany({
    where: {
      id,
      role: "STUDENT",
    },
  });

  if (result.count === 0) {
    return null;
  }

  return { id };
};
