
import prisma from "../prisma.js";

export const createPlacementDrive = async (data: {
    role: string;
    package: number;
    eligibilityCriteria: string;
    deadline: Date;
    companyId: number;
}) => {
    return await prisma.placementDrive.create({
        data: {
            role: data.role,
            package: data.package,
            eligibilityCriteria: data.eligibilityCriteria,
            deadline: data.deadline,
            companyId: data.companyId
        }
    });
};

export const getPlacementDrives=async()=>{
    return await prisma.placementDrive.findMany();
}

export const getPlacementDriveById=async(id:number)=>{
    return await prisma.placementDrive.findUnique({
        where:{
            id:id
        }
    })
}


export const updatePlacementDrive = async (
    id: number,
    data: {
        role: string;
        package: number;
        eligibilityCriteria: string;
        deadline: Date;
        companyId: number;
    }
) => {
    return await prisma.placementDrive.update({
        where: { id },
        data: {
            role: data.role,
            package: data.package,
            eligibilityCriteria: data.eligibilityCriteria,
            deadline: data.deadline,
            companyId: data.companyId
        }
    });
};


export const patchPlacementDrive = async (
    id: number,
    data: {
        role?: string;
        package?: number;
        eligibilityCriteria?: string;
        deadline?: Date;
        companyId?: number;
    }
) => {
    return await prisma.placementDrive.update({
        where: { id },
        data
    });
};


export const deletePlacementDrive = async (id: number) => {
    return await prisma.placementDrive.delete({
        where: { id }
    });
};
