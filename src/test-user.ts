
import bcrypt from "bcrypt";
import prisma from "./prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("TempPass123!", 10);

  // 1. Create an ADMIN account
  const admin = await prisma.user.upsert({
    where: {
      email: "admin-test@example.com",
    },
    update: {},
    create: {
      name: "Test Admin",
      email: "admin-test@example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  // 2. Create a STUDENT account with profile details in User
  const studentUser = await prisma.user.upsert({
    where: {
      email: "student-test@example.com",
    },
    update: {},
    create: {
      name: "Test Student",
      email: "student-test@example.com",
      passwordHash,
      role: "STUDENT",
      rollNumber: "TEST2026001",
      branch: "CSE",
      year: "4th Year",
    },
  });

  console.log("Student account created:", {
    id: studentUser.id,
    name: studentUser.name,
    email: studentUser.email,
    role: studentUser.role,
    rollNumber: studentUser.rollNumber,
    branch: studentUser.branch,
    year: studentUser.year,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
