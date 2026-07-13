import { Response } from "express";
import { Analytics } from "../services/analytics.service";
import { AuthenticatedRequest } from "../middlewares/auth";
import { DB } from "../repositories/firestore.repository";

export const AnalyticsController = {
  /**
   * Tracks a live client-side page view action.
   */
  async trackPageView(req: AuthenticatedRequest, res: Response) {
    const { url, referrer } = req.body;
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "";

    if (!url) {
      return res.status(400).json({ error: "URL path is required for tracking." });
    }

    try {
      Analytics.trackView(ip, url, referrer, userAgent);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin dashboard stats.
   */
  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const summary = await Analytics.getMetricsSummary();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin-only: retrieve server log files.
   */
  async getSystemLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = DB.getLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin-only: clear server log file.
   */
  async clearSystemLogs(req: AuthenticatedRequest, res: Response) {
    try {
      DB.clearLogs();
      res.json({ success: true, message: "System logs flushed." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
