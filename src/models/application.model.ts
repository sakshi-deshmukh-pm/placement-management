
import prisma from "../prisma.js";

export const createApplication = async (
    studentId: number,
    placementDriveId: number
) => {
    return await prisma.application.create({
        data: {
            studentId,
            placementDriveId
        }
    });
};

export const getApplications = async (
    studentId?: number
) => {
    return await prisma.application.findMany({
        ...(studentId !== undefined ? {
            where: { studentId }
        } : {}),
        select: {
            id: true,
            status: true,
            appliedAt: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            placementDrive: {
                select: {
                    id: true,
                    role: true,
                    package: true,
                    deadline: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            location: true
                        }
                    }
                }
            }
        }
    });
};


export const updateApplicationStatus=async(
    id:number,
    status:string
)=>{
    return await prisma.application.update({
        where:{id},
        data:{status}
    });
};


export const findEligiblePlacementDrive = async (
    placementDriveId: number
) => {
    const drive = await prisma.placementDrive.findUnique({
        where: { id: placementDriveId }
    });

    if (!drive) {
        return {
            eligible: false,
            reason: "Placement drive not found",
            statusCode: 404
        };
    }

    if (drive.status !== "OPEN") {
        return {
            eligible: false,
            reason: "This placement drive is not open",
            statusCode: 400
        };
    }

    if (drive.deadline <= new Date()) {
        return {
            eligible: false,
            reason: "The application deadline has passed",
            statusCode: 400
        };
    }

    return {
        eligible: true,
        drive
    };
};