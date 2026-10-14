
import type { Request, Response, NextFunction } from "express";
import { createPlacementDrive, getPlacementDriveById, getPlacementDrives,updatePlacementDrive,
    patchPlacementDrive,deletePlacementDrive} from "../models/placementDrive.model.js";

export const addPlacementDrive = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { role, package: salaryPackage, eligibilityCriteria, deadline, companyId } = req.body;

        if (
            typeof role !== "string" ||
            role.trim() === "" ||
            typeof salaryPackage !== "number" ||
            !Number.isFinite(salaryPackage) ||
            typeof eligibilityCriteria !== "string" ||
            eligibilityCriteria.trim() === "" ||
            !deadline ||
            !Number.isInteger(companyId) ||
            companyId <= 0
        ) {
            res.status(400).json({
                message: "Invalid placement drive details"
            });
            return;
        }

        const placementDrive = await createPlacementDrive({
            role: role.trim(),
            package: salaryPackage,
            eligibilityCriteria: eligibilityCriteria.trim(),
            deadline: new Date(deadline),
            companyId
        });

        res.status(201).json({
            message: "Placement drive created successfully",
            data: placementDrive
        });
    } catch (error) {
        next(error);
    }
};

export const fetchPlacementDrives=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const placementDrives=await getPlacementDrives();

        res.status(200).json({
            message:"Placement drives fetched successfully",
            data:placementDrives
        });
    }
    catch(error){
     next(error);
    }
};

export const fetchPlacementDriveById=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const id=Number(req.params.id);

        if(!Number.isInteger(id)|| id<=0){
            res.status(400).json({
                message:"Invalid placement ID"
            });
            return;
        }

        const placementDrive=await getPlacementDriveById(id);

        if(!placementDrive){
            res.status(404).json({
                message:"Placement drive not found"
            });
            return;
        }

        res.status(200).json({
            message:"Placement drive fetched successfully",
            data:placementDrive
        });

    }
    catch(error){
       next(error);
    }
}


export const editPlacementDrive = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid placement drive ID"
            });
            return;
        }

        const {
            role,
            package: salaryPackage,
            eligibilityCriteria,
            deadline,
            companyId
        } = req.body;

        if (
            typeof role !== "string" ||
            role.trim() === "" ||
            typeof salaryPackage !== "number" ||
            !Number.isFinite(salaryPackage) ||
            salaryPackage <= 0 ||
            typeof eligibilityCriteria !== "string" ||
            eligibilityCriteria.trim() === "" ||
            typeof deadline !== "string" ||
            Number.isNaN(Date.parse(deadline)) ||
            !Number.isInteger(companyId) ||
            companyId <= 0
        ) {
            res.status(400).json({
                message: "Invalid placement drive details"
            });
            return;
        }

        const existingDrive = await getPlacementDriveById(id);

        if (!existingDrive) {
            res.status(404).json({
                message: "Placement drive not found"
            });
            return;
        }

        const updatedDrive = await updatePlacementDrive(id, {
            role: role.trim(),
            package: salaryPackage,
            eligibilityCriteria: eligibilityCriteria.trim(),
            deadline: new Date(deadline),
            companyId
        });

        res.status(200).json({
            message: "Placement drive updated successfully",
            data: updatedDrive
        });
    } catch (error) {
        next(error);
    }
};


export const partiallyUpdatePlacementDrive = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid placement drive ID"
            });
            return;
        }

        const {
            role,
            package: salaryPackage,
            eligibilityCriteria,
            deadline,
            companyId
        } = req.body;

        const data: {
            role?: string;
            package?: number;
            eligibilityCriteria?: string;
            deadline?: Date;
            companyId?: number;
        } = {};

        if (role !== undefined) {
            if (typeof role !== "string" || role.trim() === "") {
                res.status(400).json({ message: "Invalid role" });
                return;
            }
            data.role = role.trim();
        }

        if (salaryPackage !== undefined) {
            if (
                typeof salaryPackage !== "number" ||
                !Number.isFinite(salaryPackage) ||
                salaryPackage <= 0
            ) {
                res.status(400).json({ message: "Invalid package" });
                return;
            }
            data.package = salaryPackage;
        }

        if (eligibilityCriteria !== undefined) {
            if (
                typeof eligibilityCriteria !== "string" ||
                eligibilityCriteria.trim() === ""
            ) {
                res.status(400).json({
                    message: "Invalid eligibility criteria"
                });
                return;
            }
            data.eligibilityCriteria = eligibilityCriteria.trim();
        }

        if (deadline !== undefined) {
            if (
                typeof deadline !== "string" ||
                Number.isNaN(Date.parse(deadline))
            ) {
                res.status(400).json({ message: "Invalid deadline" });
                return;
            }
            data.deadline = new Date(deadline);
        }

        if (companyId !== undefined) {
            if (!Number.isInteger(companyId) || companyId <= 0) {
                res.status(400).json({ message: "Invalid company ID" });
                return;
            }
            data.companyId = companyId;
        }

        if (Object.keys(data).length === 0) {
            res.status(400).json({
                message: "Provide at least one field to update"
            });
            return;
        }

        const existingDrive = await getPlacementDriveById(id);

        if (!existingDrive) {
            res.status(404).json({
                message: "Placement drive not found"
            });
            return;
        }

        const updatedDrive = await patchPlacementDrive(id, data);

        res.status(200).json({
            message: "Placement drive partially updated successfully",
            data: updatedDrive
        });
    } catch (error) {
        next(error);
    }
};


export const removePlacementDrive = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                message: "Invalid placement drive ID"
            });
            return;
        }

        const existingDrive = await getPlacementDriveById(id);

        if (!existingDrive) {
            res.status(404).json({
                message: "Placement drive not found"
            });
            return;
        }

        await deletePlacementDrive(id);

        res.status(200).json({
            message: "Placement drive deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};




