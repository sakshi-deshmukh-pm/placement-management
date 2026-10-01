import type { Request, Response, NextFunction } from "express";

const studentValidation = (req: Request,res: Response,next: NextFunction) => {

    if (
        typeof req.body.id !== "number" ||
        Number.isNaN(req.body.id)
    ) {
        res.status(400).json({
            message: "ID must be a valid number"
        });
        return;
    }

    
    if (
        typeof req.body.name !== "string" ||
        req.body.name.trim().length === 0
    ) {
        res.status(400).json({
            message: "Name should be valid"
        });
        return;
    }

    
    if (
        typeof req.body.branch !== "string" ||
        req.body.branch.trim().length === 0
    ) {
        res.status(400).json({
            message: "Branch should be valid"
        });
        return;
    }

    
    next();
};

export default studentValidation;