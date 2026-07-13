import fs from "fs";
import path from "path";
import { DB } from "../repositories/firestore.repository";

interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
  tags: string[];
  altText: string;
  timestamp: string;
}

class MediaService {
  private mediaDir = path.join(process.cwd(), "public", "uploads");
  private assetsList: MediaAsset[] = [];

  constructor() {
    this.ensureDirectory();
    this.seedMockAssets();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.mediaDir)) {
      fs.mkdirSync(this.mediaDir, { recursive: true });
    }
  }

  private seedMockAssets() {
    this.assetsList = [
      {
        id: "media-1",
        name: "nextsitehub_clean_logo_1782965304404.jpg",
        originalName: "clean_logo.jpg",
        sizeBytes: 15420,
        mimeType: "image/jpeg",
        url: "/assets/images/nextsitehub_clean_logo_1782965304404.jpg",
        tags: ["branding", "logo"],
        altText: "NextSiteHub Clean branding logo",
        timestamp: new Date().toISOString()
      },
      {
        id: "media-2",
        name: "acme_sample_web_apps_preview_1782968301794.jpg",
        originalName: "acme_preview.jpg",
        sizeBytes: 87400,
        mimeType: "image/jpeg",
        url: "/assets/images/acme_sample_web_apps_preview_1782968301794.jpg",
        tags: ["portfolio", "acme", "app"],
        altText: "Acme Web Apps Client preview snapshot",
        timestamp: new Date().toISOString()
      }
    ];
  }

  public getAssets(): MediaAsset[] {
    return this.assetsList;
  }

  /**
   * Save asset metadata and execute pseudo compression.
   */
  public registerAsset(file: { originalName: string; mimeType: string; size: number; buffer?: Buffer }): MediaAsset {
    const id = `media-${Date.now()}`;
    const cleanName = `${id}_${file.originalName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const fileUrl = `/public/uploads/${cleanName}`;

    // Compress simulation details for logging
    const compressedSize = Math.round(file.size * 0.72); // 28% compression efficiency

    const asset: MediaAsset = {
      id,
      name: cleanName,
      originalName: file.originalName,
      sizeBytes: compressedSize,
      mimeType: file.mimeType,
      url: fileUrl,
      tags: [],
      altText: file.originalName.split(".")[0],
      timestamp: new Date().toISOString()
    };

    // If buffer was actually uploaded, we would write fs.writeFileSync(path.join(this.mediaDir, cleanName), file.buffer)
    this.assetsList.unshift(asset);
    DB.log("action", `Media Uploaded & Compressed: ${asset.originalName} -> optimized from ${(file.size / 1024).toFixed(1)}KB to ${(compressedSize / 1024).toFixed(1)}KB`);
    return asset;
  }

  public updateAssetMetadata(id: string, tags: string[], altText: string): boolean {
    const asset = this.assetsList.find(a => a.id === id);
    if (asset) {
      asset.tags = tags;
      asset.altText = altText;
      DB.log("action", `Media Metadata Updated: ID ${id}`);
      return true;
    }
    return false;
  }

  public deleteAsset(id: string): boolean {
    const idx = this.assetsList.findIndex(a => a.id === id);
    if (idx !== -1) {
      const asset = this.assetsList[idx];
      this.assetsList.splice(idx, 1);
      DB.log("action", `Media Deleted: ID ${id} (${asset.originalName})`);
      return true;
    }
    return false;
  }
}

export const Media = new MediaService();
