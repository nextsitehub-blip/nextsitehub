import fs from "fs";
import path from "path";
import { DB } from "../repositories/firestore.repository";

interface BackupManifest {
  id: string;
  timestamp: string;
  sizeBytes: number;
  recordCount: number;
  filePath: string;
}

class BackupService {
  private backupsDir = path.join(process.cwd(), "server", "backups");
  private backupsList: BackupManifest[] = [];

  constructor() {
    this.ensureDirectory();
    this.scanExistingBackups();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  private scanExistingBackups() {
    try {
      if (fs.existsSync(this.backupsDir)) {
        const files = fs.readdirSync(this.backupsDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const filePath = path.join(this.backupsDir, file);
            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, "utf-8");
            let count = 0;
            try {
              const data = JSON.parse(content);
              count = (data.leads?.length || 0) + (data.audits?.length || 0) + (data.projects?.length || 0) + (data.users?.length || 0);
            } catch {}

            this.backupsList.push({
              id: file.replace(".json", ""),
              timestamp: stats.mtime.toISOString(),
              sizeBytes: stats.size,
              recordCount: count,
              filePath
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to scan existing backups:", e);
    }
  }

  /**
   * Execute manual/automatic system backup snapshot.
   */
  public triggerBackup(): BackupManifest {
    this.ensureDirectory();
    const id = `backup-${Date.now()}`;
    const filename = `${id}.json`;
    const targetPath = path.join(this.backupsDir, filename);

    const completeData = DB.getCompleteBackupData();
    fs.writeFileSync(targetPath, completeData, "utf-8");

    const stats = fs.statSync(targetPath);
    const parsed = JSON.parse(completeData);
    const count = (parsed.leads?.length || 0) + (parsed.audits?.length || 0) + (parsed.projects?.length || 0) + (parsed.users?.length || 0);

    const manifest: BackupManifest = {
      id,
      timestamp: new Date().toISOString(),
      sizeBytes: stats.size,
      recordCount: count,
      filePath: targetPath
    };

    this.backupsList.unshift(manifest);
    DB.log("action", `System database backup created successfully: ${id} (${(stats.size / 1024).toFixed(2)} KB)`);
    return manifest;
  }

  public getBackups(): BackupManifest[] {
    return this.backupsList;
  }

  /**
   * Performs database rollback using an existing backup ID.
   */
  public rollbackToPoint(id: string): boolean {
    const backup = this.backupsList.find(b => b.id === id);
    if (backup && fs.existsSync(backup.filePath)) {
      try {
        const content = fs.readFileSync(backup.filePath, "utf-8");
        const success = DB.restoreCompleteBackup(content);
        if (success) {
          DB.log("action", `System database rollback triggered to restore point: ${id}`);
          return true;
        }
      } catch (e) {
        DB.log("error", `Rollback operation failed for ID: ${id}`, e);
      }
    }
    return false;
  }

  /**
   * Remove a backup file from the repository.
   */
  public deleteBackup(id: string): boolean {
    const backupIdx = this.backupsList.findIndex(b => b.id === id);
    if (backupIdx !== -1) {
      const backup = this.backupsList[backupIdx];
      if (fs.existsSync(backup.filePath)) {
        try {
          fs.unlinkSync(backup.filePath);
        } catch (e) {
          console.error("Failed to delete file", e);
        }
      }
      this.backupsList.splice(backupIdx, 1);
      DB.log("action", `Backup record deleted permanently: ${id}`);
      return true;
    }
    return false;
  }
}

export const Backup = new BackupService();
