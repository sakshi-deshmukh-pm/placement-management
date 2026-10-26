                                                        
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type RequestPart = "body" | "params" | "query";

export const validate = (
  schema: ZodType,
  part: RequestPart = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      res.status(400).json({
        statusCode: 400,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (part === "body") {
      req.body = result.data;
    } else {
      res.locals.validated ??= {};
      res.locals.validated[part] = result.data;
    }

    next();
  };
};
            