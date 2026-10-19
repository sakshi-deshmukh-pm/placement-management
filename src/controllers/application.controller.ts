
import type { Request, Response, NextFunction } from "express";
import { createApplication,getApplications, updateApplicationStatus,findEligiblePlacementDrive } from "../models/application.model.js";


export const getApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { role, studentId } = res.locals.auth;

        if (role === "STUDENT" && !studentId) {
            res.status(403).json({
                message: "No student profile is linked to this account"
            });
            return;
        }

        const applications =
            role === "ADMIN" || role === "PLACEMENT_COORDINATOR"
                ? await getApplications()
                : role === "STUDENT"
                    ? await getApplications(studentId)
                    : [];

        res.status(200).json({
            message: "Applications fetched successfully",
            data: applications
        });
    } catch (error) {
        next(error);
    }
};


export const addApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId } = res.locals.auth;
        const { placementDriveId } = req.body;

        if (!studentId) {
            res.status(403).json({
                message: "No student profile is linked to this account"
            });
            return;
        }

        const driveId = Number(placementDriveId);

        if (!Number.isInteger(driveId) || driveId <= 0) {
            res.status(400).json({
                message: "Valid placement drive ID is required"
            });
            return;
        }

        const drive = await findEligiblePlacementDrive(driveId);

        if (!drive) {
            res.status(404).json({
                message: "Placement drive not found or not eligible"
            });
            return;
        }

        const application = await createApplication(studentId, driveId);

        res.status(201).json({
            message: "Application submitted successfully",
            data: application
        });
    } catch (error) {
        next(error);
    }
};


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
