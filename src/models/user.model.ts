import prisma from "../prisma.js";

type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export type RegisterStudentInput = {
  name: string;
  email: string;
  passwordHash: string;
  rollNumber: string;
  branch: string;
  year: string;
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserForLogin = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      studentId: true,
    },
  });
};

export const createUser = async ({
  email,
  passwordHash,
}: CreateUserInput) => {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "STUDENT",
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const createAdminUser = async ({
  email,
  passwordHash,
}: CreateUserInput) => {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
};

// Register a student and link the user account in one transaction.
export const registerStudentWithProfile = async ({
  name,
  email,
  passwordHash,
  rollNumber,
  branch,
  year,
}: RegisterStudentInput) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.create({
      data: {
        name,
        email,
        rollNumber,
        branch,
        year,
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
        studentId: student.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        studentId: true,
        createdAt: true,
      },
    });

    return {
      user,
      student,
    };
  });
};

export const linkUserToStudent = async (
  userId: number,
  studentId: number
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { studentId },
    select: {
      id: true,
      email: true,
      role: true,
      studentId: true,
    },
  });
};