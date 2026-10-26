import prisma from "../src/prisma.js";
import { Role } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";
import logger from "../src/utils/logger.js";

async function main(): Promise<void> {
    const passwordHash = await bcrypt.hash("DevPass123!", 10);

    // 1. Create default users safely.
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            passwordHash,
            role: Role.ADMIN,
            name: "System Admin",
        },
    });

    const coordinator = await prisma.user.upsert({
        where: { email: "coordinator@example.com" },
        update: {},
        create: {
            email: "coordinator@example.com",
            passwordHash,
            role: Role.PLACEMENT_COORDINATOR,
            name: "Placement Coordinator",
        },
    });



    const student = await prisma.user.upsert({
        where: { email: "student@example.com" },
        update: {},
        create: {
            email: "student@example.com",
            passwordHash,
            role: Role.STUDENT,
            name: "Rahul Patil",
            rollNumber: "CS2026001",
            branch: "Computer Science",
            year: "Third Year",
            phone: "9000000001",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411001",
        },
    });

    // 2. Sample data for 500 students.
    const firstNames = [
        "Aarav", "Aditi", "Aditya", "Ananya", "Arjun",
        "Diya", "Ishaan", "Kavya", "Neha", "Rahul",
        "Riya", "Rohan", "Sakshi", "Sneha", "Tanvi",
        "Varun", "Priya", "Om", "Pooja", "Yash",
    ];

    const lastNames = [
        "Patil", "Deshmukh", "Jadhav", "Shinde", "Pawar",
        "Kulkarni", "Joshi", "More", "Kadam", "Chavan",
        "Gaikwad", "Bhosale", "Mane", "Salunkhe", "Naik",
        "Sawant", "Ghatge", "Shah", "Verma", "Gupta",
        "Reddy", "Nair", "Mehta", "Mishra",
    ];

    const branches = [
        "Computer Science",
        "Information Technology",
        "Electronics",
        "Mechanical",
        "Electrical",
    ];

    const years = [
        "First Year",
        "Second Year",
        "Third Year",
        "Fourth Year",
    ];

    const genders = ["Female", "Male", "Other"];

    const locations = [
        { city: "Pune", state: "Maharashtra", pincode: "411001" },
        { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
        { city: "Nashik", state: "Maharashtra", pincode: "422001" },
        { city: "Nagpur", state: "Maharashtra", pincode: "440001" },
        { city: "Kolhapur", state: "Maharashtra", pincode: "416001" },
        { city: "Hyderabad", state: "Telangana", pincode: "500001" },
        { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
        { city: "Indore", state: "Madhya Pradesh", pincode: "452001" },
        { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
        { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    ];

    // 3. Generate 500 student objects programmatically.
    const sampleStudents = Array.from({ length: 500 }, (_, index) => {
        const number = index + 1;

        const firstName = firstNames[index % firstNames.length]!;
        const lastName =
            lastNames[Math.floor(index / firstNames.length) % lastNames.length]!;

        const branch = branches[index % branches.length]!;
        const year = years[index % years.length]!;
        const gender = genders[index % genders.length]!;
        const location = locations[index % locations.length]!;

        const serial = String(number).padStart(4, "0");

        return {
            email: `placetrack.student.${serial}@example.com`,
            passwordHash,
            role: Role.STUDENT,
            isActive: true,
            name: `${firstName} ${lastName}`,
            phone: String(9100000000 + number),
            rollNumber: `PT2026S${serial}`,
            branch,
            year,
            gender,
            city: location.city,
            state: location.state,
            pincode: location.pincode,
            dateOfBirth: new Date(
                2002 + (index % 5),
                index % 12,
                (index % 28) + 1,
            ),
        };
    });

    // 4. Find existing generated sample students.
    const existingSampleStudents = await prisma.user.findMany({
        where: {
            role: Role.STUDENT,
            OR: [
                { email: { startsWith: "placetrack.student." } },
                { rollNumber: { startsWith: "PT2026S" } },
            ],
        },
        select: {
            email: true,
            rollNumber: true,
        },
    });

    const existingEmails = new Set(
        existingSampleStudents.map((item) => item.email),
    );

    const existingRollNumbers = new Set(
        existingSampleStudents
            .map((item) => item.rollNumber)
            .filter((value): value is string => value !== null),
    );

    const newStudentRecords = sampleStudents.filter(
        (item) =>
            !existingEmails.has(item.email) &&
            !existingRollNumbers.has(item.rollNumber),
    );

    // 5. Insert missing sample students in bulk.
    if (newStudentRecords.length > 0) {
        await prisma.user.createMany({
            data: newStudentRecords,
            skipDuplicates: true,
        });
    }

    // 6. Verify the sample student count.
    const totalSeededStudents = await prisma.user.count({
        where: {
            role: Role.STUDENT,
            email: { startsWith: "placetrack.student." },
        },
    });

    logger.info("Sample student seeding completed.", {
        attempted: sampleStudents.length,
        insertedThisRun: newStudentRecords.length,
        totalSeededStudents,
    });

    if (totalSeededStudents < 500) {
        throw new Error(
            `Expected 500 sample students, but found ${totalSeededStudents}.`,
        );
    }

    // 7. Create the sample company.
    const company = await prisma.company.upsert({
        where: { name: "Tech Solutions Pvt Ltd" },
        update: {},
        create: {
            name: "Tech Solutions Pvt Ltd",
            website: "https://example.com",
            industry: "Information Technology",
            location: "Pune",
        },
    });

    // 8. Create the placement drive if it does not exist.
    let placementDrive = await prisma.placementDrive.findFirst({
        where: {
            role: "Junior Software Developer",
            companyId: company.id,
        },
    });

    if (!placementDrive) {
        placementDrive = await prisma.placementDrive.create({
            data: {
                role: "Junior Software Developer",
                package: 5.5,
                eligibilityCriteria: "Computer Science students",
                deadline: new Date("2027-03-31T23:59:59.000Z"),
                status: "OPEN",
                companyId: company.id,
            },
        });
    }

    // 9. Create the application if it does not exist.
    await prisma.application.upsert({
        where: {
            userId_placementDriveId: {
                userId: student.id,
                placementDriveId: placementDrive.id,
            },
        },
        update: {},
        create: {
            userId: student.id,
            placementDriveId: placementDrive.id,
            status: "APPLIED",
        },
    });

    logger.info("Seed completed successfully.", {
        admin: admin.email,
        coordinator: coordinator.email,
        student: student.email,
        company: company.name,
        placementDrive: placementDrive.role,
        totalSeededStudents,
    });
}

main()
    .catch((error: unknown) => {
        logger.error("Seed failed:", { error });
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });