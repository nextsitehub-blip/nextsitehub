import { Response } from "express";
import { Media } from "../services/media.service";
import { AuthenticatedRequest } from "../middlewares/auth";

export const MediaController = {
  /**
   * Admin: fetch uploaded media file manifests.
   */
  async getMediaAssets(req: AuthenticatedRequest, res: Response) {
    try {
      const assets = Media.getAssets();
      res.json(assets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: process file metadata tags or alt descriptions.
   */
  async updateMediaMetadata(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { tags, altText } = req.body;

    try {
      const success = Media.updateAssetMetadata(id, tags || [], altText || "");
      if (success) {
        return res.json({ success: true, message: "Asset parameters modified." });
      }
      res.status(404).json({ error: "Media item not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: trigger optimization and save uploads.
   */
  async uploadMediaMock(req: AuthenticatedRequest, res: Response) {
    const { name, size, mimeType } = req.body;

    if (!name || !size || !mimeType) {
      return res.status(400).json({ error: "File name, size, and mimeType parameters are required." });
    }

    try {
      const asset = Media.registerAsset({
        originalName: name,
        mimeType,
        size
      });
      res.status(201).json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: remove media asset metadata and files.
   */
  async deleteMediaAsset(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = Media.deleteAsset(id);
      if (success) {
        return res.json({ success: true, message: "Media deleted successfully." });
      }
      res.status(404).json({ error: "Asset not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
