
import type { Request, Response, NextFunction } from "express";

type UserRole =
    | "ADMIN"
    | "STUDENT"
    | "PLACEMENT_COORDINATOR"
    | "RECRUITER";

type AuthUser = {
    id: number;
    email: string;
    role: UserRole;
};

export const authorizeStudentAccess = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const auth = res.locals.auth as AuthUser | undefined;

    if (!auth) {
        res.status(401).json({
            message: "Authentication required",
        });
        return;
    }

    // Admins and placement coordinators can access any student profile.
    if (
        auth.role === "ADMIN" ||
        auth.role === "PLACEMENT_COORDINATOR"
    ) {
        next();
        return;
    }

    // Students can access only their own User profile.
    const requestedUserId = Number(req.params.id);

    if (
        auth.role === "STUDENT" &&
        Number.isInteger(requestedUserId) &&
        requestedUserId === auth.id
    ) {
        next();
        return;
    }

    res.status(403).json({
        message: "You do not have permission to access this student profile",
    });
};
