import prisma from "../prisma.js";

export const createCompany = async (data: {
    name: string;
    website?: string;
    industry?: string;
    location?: string;
}) => {
    return await prisma.company.create({
        data: {
            name: data.name,
            ...(data.website !== undefined && {
                website: data.website
            }),
            ...(data.industry !== undefined && {
                industry: data.industry
            }),
            ...(data.location !== undefined && {
                location: data.location
            })
        }
    });
};

export const getCompanies=async()=>{
    return await prisma.company.findMany();
}

export const updateComapny=async(
    id:number,
    data:{
        name:string;
        website?:string;
        industry?:string;
        location?:string;
    }
)=>{
    return await prisma.company.update({
        where:{id},
        data:{
            name: data.name,
            ...(data.website !== undefined && {
                website: data.website
            }),
            ...(data.industry !== undefined && {
                industry: data.industry
            }),
            ...(data.location !== undefined && {
                location: data.location
            })
        }

    });

};

export const patchCompany=async(
    id:number,
    data:{
        name?:string;
        website?:string|null;
        industry?:string|null;
        location?:string|null;
    }

)=>{
    return await prisma.company.update({
        where:{id},
        data
    })

};

export const getCompanyById=async(
    id:number)=>{
        return await prisma.company.findUnique({
            where:{id}
        });
    };

export const deleteCompany=async(id:number)=>{
    return await prisma.company.delete({
        where:{id}
    })
}


