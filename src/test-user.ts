import bcrypt from "bcrypt";
import prisma from "./prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("TempPass123!", 10);

  // 1. Create an ADMIN account without a Student profile
  const admin = await prisma.user.upsert({
    where: {
      email: "admin-test@example.com",
    },
    update: {},
    create: {
      email: "admin-test@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    studentId: admin.studentId,
  });

  // 2. Find the existing Student
  const existingStudent = await prisma.student.findFirst();

  if (!existingStudent) {
    throw new Error("No Student record found");
  }

  // 3. Create a STUDENT account linked to that Student
  const studentUser = await prisma.user.upsert({
    where: {
      email: "student-test@example.com",
    },
    update: {},
    create: {
      email: "student-test@example.com",
      passwordHash,
      role: "STUDENT",
      studentId: existingStudent.id,
    },
  });

  console.log("Student account created:", {
    id: studentUser.id,
    email: studentUser.email,
    role: studentUser.role,
    studentId: studentUser.studentId,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });