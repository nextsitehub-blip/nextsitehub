import { DB } from "../repositories/firestore.repository";

interface RedirectRule {
  from: string;
  to: string;
  type: 301 | 302;
}

class SeoService {
  private redirects: RedirectRule[] = [];
  private seoScoreCache = { score: 92, lastChecked: "" };

  constructor() {
    this.redirects = [
      { from: "/portfolio-old", to: "/#portfolio", type: 301 },
      { from: "/pricing-tiers", to: "/#pricing", type: 301 },
      { from: "/audit-wizard", to: "/#audit", type: 302 }
    ];
  }

  public getRedirects(): RedirectRule[] {
    return this.redirects;
  }

  public addRedirect(rule: RedirectRule) {
    this.redirects = this.redirects.filter(r => r.from !== rule.from);
    this.redirects.push(rule);
    DB.log("action", `SEO Redirect added: ${rule.from} -> ${rule.to} (${rule.type})`);
  }

  public deleteRedirect(from: string): boolean {
    const beforeLen = this.redirects.length;
    this.redirects = this.redirects.filter(r => r.from !== from);
    if (this.redirects.length < beforeLen) {
      DB.log("action", `SEO Redirect deleted: ${from}`);
      return true;
    }
    return false;
  }

  /**
   * Automatically compile dynamic XML Sitemap.
   */
  public generateSitemapXML(baseUrl: string = "https://nextsitehub.com"): string {
    const today = new Date().toISOString().split("T")[0];
    const pages = [
      { path: "", freq: "daily", priority: "1.0" },
      { path: "services", freq: "weekly", priority: "0.8" },
      { path: "portfolio", freq: "weekly", priority: "0.8" },
      { path: "about", freq: "monthly", priority: "0.5" },
      { path: "pricing", freq: "weekly", priority: "0.8" },
      { path: "contact", freq: "monthly", priority: "0.7" },
      { path: "audit", freq: "daily", priority: "0.9" }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

    for (const page of pages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.freq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Automate robots.txt output.
   */
  public generateRobotsTxt(baseUrl: string = "https://nextsitehub.com"): string {
    return [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/v1/",
      "Disallow: /admin/",
      `Sitemap: ${baseUrl}/sitemap.xml`,
      "Host: nextsitehub.com"
    ].join("\n");
  }

  /**
   * Perform a quick SEO check on key parameters.
   */
  public calculateSeoScore(metadata: { title: string; description: string; keywords?: string }): { score: number; recommendations: string[] } {
    let score = 100;
    const recommendations: string[] = [];

    if (!metadata.title || metadata.title.trim().length < 30) {
      score -= 15;
      recommendations.push("Title tag is too short. Try to make it between 30 and 60 characters for optimal indexing.");
    }
    if (metadata.title && metadata.title.length > 60) {
      score -= 10;
      recommendations.push("Title tag exceeds 60 characters. Search engines might truncate it in the search results.");
    }
    if (!metadata.description || metadata.description.trim().length < 120) {
      score -= 20;
      recommendations.push("Meta description is too short. Ensure it explains your services thoroughly (120-160 characters).");
    }
    if (metadata.description && metadata.description.length > 160) {
      score -= 10;
      recommendations.push("Meta description exceeds 160 characters. Truncations will occur.");
    }
    if (!metadata.keywords || metadata.keywords.split(",").length < 4) {
      score -= 5;
      recommendations.push("Include at least 4 comma-separated focus keywords to aid indexing.");
    }

    this.seoScoreCache = {
      score,
      lastChecked: new Date().toISOString()
    };

    return { score, recommendations };
  }

  public getCachedSeoScore() {
    return this.seoScoreCache;
  }
}

export const Seo = new SeoService();
