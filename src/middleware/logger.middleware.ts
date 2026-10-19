import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
  });

  res.on("finish", () => {
    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
};

export default loggerMiddleware;