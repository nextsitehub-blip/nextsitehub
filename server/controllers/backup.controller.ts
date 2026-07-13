import { Response } from "express";
import { Backup } from "../services/backup.service";
import { AuthenticatedRequest } from "../middlewares/auth";

export const BackupController = {
  /**
   * Admin: trigger snapshot backup file generation.
   */
  async createBackup(req: AuthenticatedRequest, res: Response) {
    try {
      const manifest = Backup.triggerBackup();
      res.status(201).json(manifest);
    } catch (err: any) {
      res.status(500).json({ error: "Backup creation failed: " + err.message });
    }
  },

  /**
   * Admin: fetch list of backups.
   */
  async getBackups(req: AuthenticatedRequest, res: Response) {
    try {
      const list = Backup.getBackups();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: trigger system rollback from file.
   */
  async rollback(req: AuthenticatedRequest, res: Response) {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Backup ID is required for database rollback." });
    }

    try {
      const success = Backup.rollbackToPoint(id);
      if (success) {
        return res.json({ success: true, message: `System rolled back successfully to ${id}` });
      }
      res.status(404).json({ error: "Backup file not found or corrupted." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: remove backup file.
   */
  async deleteBackup(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = Backup.deleteBackup(id);
      if (success) {
        return res.json({ success: true });
      }
      res.status(404).json({ error: "Backup file not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
