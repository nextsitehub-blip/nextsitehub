import { Request, Response, NextFunction } from "express";
import { DB } from "../repositories/firestore.repository";

export const LoggingMiddlewares = {
  /**
   * Performance and execution tracker logger.
   */
  requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = process.hrtime();
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

    res.on("finish", () => {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      const logMessage = `API request: ${req.method} ${req.originalUrl} - Status ${res.statusCode} [${durationMs}ms] from IP ${ip}`;
      
      // Determine logging tier
      if (res.statusCode >= 500) {
        DB.log("error", logMessage, { ip, method: req.method, url: req.originalUrl, statusCode: res.statusCode });
      } else if (res.statusCode >= 400) {
        DB.log("warning", logMessage, { ip, method: req.method, url: req.originalUrl, statusCode: res.statusCode });
      } else {
        DB.log("performance", logMessage, { durationMs, path: req.originalUrl, method: req.method });
      }
    });

    next();
  },

  /**
   * Enterprise central error handler.
   */
  errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error("Central Exception Handler Caught:", err);
    
    const statusCode = err.status || 500;
    const errorMessage = err.message || "An unexpected system exception occurred.";
    const correlationId = `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    DB.log("error", `Exception ID ${correlationId} thrown: ${errorMessage}`, {
      stack: err.stack,
      path: req.originalUrl,
      body: req.body
    });

    res.status(statusCode).json({
      error: errorMessage,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
};
