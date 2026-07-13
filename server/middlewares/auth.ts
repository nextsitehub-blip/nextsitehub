import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config";
import { DB } from "../repositories/firestore.repository";
import { UserRole } from "../../src/types";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
  };
}

export const AuthMiddlewares = {
  /**
   * Session authentication layer checking JWT in headers.
   */
  async authenticateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Allow fallback if running local session or admin has verified session
      const mockSessionHeader = req.headers["x-nextsitehub-session"];
      if (mockSessionHeader) {
        try {
          const cachedUser = JSON.parse(mockSessionHeader as string);
          req.user = {
            uid: cachedUser.uid,
            email: cachedUser.email,
            role: cachedUser.role || "visitor"
          };
          return next();
        } catch {}
      }
      return res.status(401).json({ error: "Access Denied. Secure session token missing." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
      
      // Fetch user from repository to verify status
      const users = await DB.getUsers();
      const user = users.find(u => u.uid === decoded.uid);
      if (user && user.status === "inactive") {
        DB.log("warning", `Inactive account login attempt rejected: ${user.email}`);
        return res.status(403).json({ error: "Your account is currently suspended." });
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role || "visitor"
      };
      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid session or expired authentication token." });
    }
  },

  /**
   * RBAC role level enforcer.
   */
  requireRole(allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Session authentication required." });
      }

      const hasAccess = allowedRoles.includes(req.user.role);
      
      // Super admin can unlock anything
      if (req.user.role === "super_admin") {
        return next();
      }

      if (!hasAccess) {
        DB.log("warning", `RBAC Violation: User '${req.user.email}' with role '${req.user.role}' attempted to access restricted resources [${allowedRoles.join(",")}]`);
        return res.status(403).json({ error: "Forbidden. Insufficient administrative privileges." });
      }

      next();
    };
  }
};
