import prisma from "../prisma.js";

type CreateUserInput = {
    name: string;
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
        where: { email }
    });
};

export const findUserForLogin = async (email: string) => {
    return prisma.user.findUnique({
        where: { email }
    });
};

export const findUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true
        }
    });
};

export const createUser = async ({
    name,
    email,
    passwordHash
}: CreateUserInput) => {
    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: "STUDENT"
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    });
};



// Register a student directly in the User table.
export const registerStudentWithProfile = async ({
    name,
    email,
    passwordHash,
    rollNumber,
    branch,
    year
}: RegisterStudentInput) => {
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: "STUDENT",
            rollNumber,
            branch,
            year
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            rollNumber: true,
            branch: true,
            year: true,
            createdAt: true
        }
    });

    return { user };
};

// Fetch the profile of the authenticated user.
export const getUserProfileById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
            city: true,
            state: true,
            pincode: true,
            rollNumber: true,
            branch: true,
            year: true
        }
    });
};

export type UpdateUserProfileInput = {
    name: string;
    phone: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
};

// Update editable profile fields for the authenticated user.
export const updateUserProfileById = async (
    id: number,
    data: UpdateUserProfileInput
) => {
    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            phone: true,
            gender: true,
            dateOfBirth: true,
            city: true,
            state: true,
            pincode: true,
            rollNumber: true,
            branch: true,
            year: true
        }
    });
};
