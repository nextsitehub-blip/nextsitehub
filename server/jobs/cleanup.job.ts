import fs from "fs";
import path from "path";
import { DB } from "../repositories/firestore.repository";

export class CleanupJob {
  /**
   * Cleans up old log registries and temporary files.
   */
  public static async execute() {
    try {
      DB.log("info", "Background Cleanup Job scheduled task started.");
      
      const tempDir = path.join(process.cwd(), "server", "temp");
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

        let count = 0;
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            count++;
          }
        }
        if (count > 0) {
          DB.log("action", `Background Cleanup Job: Purged ${count} outdated temporary files.`);
        }
      }
      
      DB.log("info", "Background Cleanup Job task completed successfully.");
    } catch (err: any) {
      DB.log("error", "Background Cleanup Job task execution failure: " + err.message);
    }
  }
}
