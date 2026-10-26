
import type { Request, Response, NextFunction } from "express";

type Role =
    | "ADMIN"
    | "STUDENT"
    | "PLACEMENT_COORDINATOR"

export const authorizeRoles = (...allowedRoles: Role[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const auth = res.locals.auth as
            | {
                id: number;
                email: string;
                role: Role;
            }
            | undefined;

        if (!auth) {
            res.status(401).json({
                message: "Authentication required"
            });
            return;
        }

        if (!allowedRoles.includes(auth.role)) {
            res.status(403).json({
                message: "You do not have permission to access this resource"
            });
            return;
        }

        next();
    };
};
