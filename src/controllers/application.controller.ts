
import type { Request, Response, NextFunction } from "express";
import { createApplication,getApplications, updateApplicationStatus } from "../models/application.model.js";

export const addApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId, placementDriveId } = req.body;

        if (
            !Number.isInteger(studentId) ||
            studentId <= 0 ||
            !Number.isInteger(placementDriveId) ||
            placementDriveId <= 0
        ) {
            res.status(400).json({
                message: "Valid studentId and placementDriveId are required"
            });
            return;
        }

        const application = await createApplication(
            studentId,
            placementDriveId
        );

        res.status(201).json({
            message: "Application created successfully",
            data: application
        });
    } catch (error) {
        next(error);
    }
};

export const getApplication=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
try{
const applications=await getApplications();
res.status(200).json({
    message:"Applications fetched successfully",
    data:applications
});

}
catch(error){
next(error);
}
}

export const changeApplicationStatus=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
     const id=Number(req.params.id);
     const{status}=req.body;

     const allowedStatuses=[
        "APPLIED",
        "SHORTLISTED",
        "REJECTED",
        "SELECTED"
     ];

     if(!Number.isInteger(id)|| id<=0){
        res.status(400).json({
            message:"Valid application ID is required"
        });
        return;
     }

     if(typeof status!=="string" || !allowedStatuses.includes(status)){
        res.status(400).json({
            message:"Invalid applicatio status"
        });
        return;
     
    }

    const application=await updateApplicationStatus(id,status);
    res.status(200).json({
        message:"Application status updated successfully",
        data:application
    });
    }
    catch(error){
    next(error);
    }
};
