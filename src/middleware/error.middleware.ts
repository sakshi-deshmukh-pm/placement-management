
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";

const errorMiddleware = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Error:", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                res.status(409).json({
                    message: "A record with this value already exists"
                });
                return;

            case "P2003":
                res.status(400).json({
                    message: "Related record does not exist or violates a relationship constraint"
                });
                return;

            case "P2025":
                res.status(404).json({
                    message: "Record not found"
                });
                return;
        }
    }

    res.status(500).json({
        message: "Internal server error"
    });
};

export default errorMiddleware;
