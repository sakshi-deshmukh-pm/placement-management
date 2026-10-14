
import prisma from "../prisma.js";

type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
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

export const findUserForLogin = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

