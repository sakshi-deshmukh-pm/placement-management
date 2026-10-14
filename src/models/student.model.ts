
import prisma from "../prisma.js";

export const getAllStudents = async () => {
  return await prisma.student.findMany();
};
