import { Request, Response, NextFunction } from "express";
import { DB } from "../repositories/firestore.repository";

const blacklistIPs = new Set<string>();
const ipRequestCounts = new Map<string, { count: number; firstRequest: number }>();
const RATE_LIMIT_MAX = 100; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

export const SecurityMiddlewares = {
  /**
   * Enterprise security headers configuration.
   */
  securityHeaders(req: Request, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Strict MIME type sniffing protection
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Cross-site scripting shield
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Referrer policy control
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Enable HSTS in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }
    // Clean Content-Security-Policy
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com;"
    );
    next();
  },

  /**
   * Client IP rate limiter and spam protection.
   */
  rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

    if (blacklistIPs.has(ip)) {
      DB.log("warning", `Intrusion prevention: request rejected from blacklisted IP ${ip}`);
      return res.status(403).json({ error: "Access denied. IP has been temporarily locked due to suspicious activity." });
    }

    const now = Date.now();
    const clientData = ipRequestCounts.get(ip);

    if (!clientData) {
      ipRequestCounts.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    if (now - clientData.firstRequest > RATE_LIMIT_WINDOW_MS) {
      // Reset rate limit window
      ipRequestCounts.set(ip, { count: 1, firstRequest: now });
      return next();
    }

    clientData.count += 1;
    if (clientData.count > RATE_LIMIT_MAX) {
      DB.log("warning", `Rate limit triggered: IP ${ip} made ${clientData.count} requests in 1 min`);
      blacklistIPs.add(ip); // Lock account / IP out to prevent denial of wallet attacks
      return res.status(429).json({ error: "Too many requests. Your connection has been locked for 60 seconds." });
    }

    next();
  },

  /**
   * Block specific malicious payload parameters (SQLi and XSS protection).
   */
  sanitizePayload(req: Request, res: Response, next: NextFunction) {
    const inspectStr = (str: string): boolean => {
      const threats = [
        /union\s+select/i,
        /select\s+.*\s+from/i,
        /insert\s+into/i,
        /delete\s+from/i,
        /drop\s+table/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
        /javascript:/i,
        /onload=/i,
        /onerror=/i
      ];
      return threats.some(regex => regex.test(str));
    };

    const searchPayload = (obj: any): boolean => {
      if (!obj) return false;
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
          if (inspectStr(obj[key])) return true;
        } else if (typeof obj[key] === "object") {
          if (searchPayload(obj[key])) return true;
        }
      }
      return false;
    };

    if (searchPayload(req.body) || searchPayload(req.query) || searchPayload(req.params)) {
      DB.log("warning", "WAF Blocked payload matching SQLi or XSS signature.", {
        ip: req.socket.remoteAddress,
        url: req.originalUrl,
        body: req.body
      });
      return res.status(400).json({ error: "Suspicious payload blocked. Transaction logged." });
    }

    next();
  },

  /**
   * Admin tools to manage blacklists.
   */
  blacklistIp(ip: string) {
    blacklistIPs.add(ip);
  },

  removeBlacklistedIp(ip: string) {
    blacklistIPs.delete(ip);
  },

  getBlacklistedIps(): string[] {
    return Array.from(blacklistIPs);
  }
};
