import { Request, Response } from "express";
import { Seo } from "../services/seo.service";
import { AuthenticatedRequest } from "../middlewares/auth";

export const SeoController = {
  /**
   * Serve dynamic XML sitemap for search engines.
   */
  async getSitemapXML(req: Request, res: Response) {
    const host = `${req.protocol}://${req.get("host")}`;
    try {
      const xml = Seo.generateSitemapXML(host);
      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (err: any) {
      res.status(500).send("Failed to generate sitemap");
    }
  },

  /**
   * Serve automated Robots.txt for search engines.
   */
  async getRobotsTxt(req: Request, res: Response) {
    const host = `${req.protocol}://${req.get("host")}`;
    try {
      const txt = Seo.generateRobotsTxt(host);
      res.header("Content-Type", "text/plain");
      res.status(200).send(txt);
    } catch (err: any) {
      res.status(500).send("Failed to generate robots.txt");
    }
  },

  /**
   * Admin: evaluate current metadata configurations.
   */
  async calculateSeoHealth(req: AuthenticatedRequest, res: Response) {
    const { title, description, keywords } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required for SEO audit." });
    }

    try {
      const result = Seo.calculateSeoScore({ title, description, keywords });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: fetch redirect map rules.
   */
  async getRedirectRules(req: AuthenticatedRequest, res: Response) {
    try {
      const list = Seo.getRedirects();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: add a redirect map rule.
   */
  async saveRedirectRule(req: AuthenticatedRequest, res: Response) {
    const { from, to, type } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "from and to parameters are required." });
    }

    try {
      Seo.addRedirect({ from, to, type: type === 302 ? 302 : 301 });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Admin: delete a redirect map rule.
   */
  async deleteRedirectRule(req: AuthenticatedRequest, res: Response) {
    const { from } = req.body;
    if (!from) {
      return res.status(400).json({ error: "from parameter is required." });
    }

    try {
      const success = Seo.deleteRedirect(from);
      if (success) {
        return res.json({ success: true });
      }
      res.status(404).json({ error: "Redirect rule not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
