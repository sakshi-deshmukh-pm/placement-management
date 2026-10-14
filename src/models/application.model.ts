
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


export const getApplications = async () => {
    return await prisma.application.findMany({
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
