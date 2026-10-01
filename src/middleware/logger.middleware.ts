import type { Request, Response, NextFunction } from "express";

const middleware=(req:Request,res:Response,next:NextFunction)=>{
    console.log("Middleware executed");
    next();
};

export default middleware;