import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google Gen AI Client
  let ai: GoogleGenAI | null = null;
  function getAI() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
        return null;
      }
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  }

  // API endpoints
  app.post("/api/audit", async (req, res) => {
    let { url, description, industry, servicesNeeded } = req.body;
    
    if (!url) {
      url = "No Website (Strategy Audit)";
    }

    const aiClient = getAI();
    if (!aiClient) {
      // High-quality mock report when GEMINI_API_KEY is not available
      return res.json({
        mocked: true,
        scores: { seo: 68, performance: 59, ux: 74, conversion: 61 },
        summary: `Complete audit report generated for ${url}. Your site exhibits strong foundational attributes but suffers from standard modern bottlenecks: high script latency, non-optimized image assets, and missing structured SEO markup.`,
        positives: [
          "Branding has clear potential with solid core messaging",
          "Responsive viewport structures are working across standard screen resolutions",
          "Clear typography hierarchy that communicates professional intent"
        ],
        seoAudit: {
          status: "Needs Improvement",
          issues: [
            {
              title: "Missing Structured Schema Markup",
              impact: "High",
              description: "Search engines are struggling to parse the contextual hierarchy of your business because of missing JSON-LD schema files.",
              solution: "Implement structured LocalBusiness and Service schema markups in your header elements."
            },
            {
              title: "Suboptimal Meta tags",
              impact: "Medium",
              description: "The primary page title and meta descriptions lack keyword density and clear call-to-actions, reducing your search engine click-through rate.",
              solution: "Optimize title tag to 'Core Keyword | Primary Brand Name' under 60 characters."
            }
          ]
        },
        uxAudit: {
          status: "Needs Improvement",
          issues: [
            {
              title: "Suboptimal Contrast Ratio & Tiny Targets",
              impact: "High",
              description: "Main navigational triggers and sub-menus do not adhere to WCAG AAA standards for visual separation on mobile viewports.",
              solution: "Increase core touch interactive targets to a minimum of 44x44px and darken body description classes."
            },
            {
              title: "Unstablised Cumulative Layout Shift (CLS)",
              impact: "Medium",
              description: "Dynamic script loading and banner renders cause visual structural shifts during the initial page viewport sequence.",
              solution: "Declare specific image aspect ratio boxes and pre-allocate container dimensions for ads/headers."
            }
          ]
        },
        conversionAudit: {
          status: "Critical",
          issues: [
            {
              title: "Single Friction Call-to-Action",
              impact: "High",
              description: "Most interactive sections redirect users to a massive multi-field form, adding immediate psychological friction and slashing conversion rates.",
              solution: "Implement a clean, low-barrier single-field inquiry sequence (e.g., email or quick text audit) directly on high-traffic headers."
            }
          ]
        },
        actionPlan: [
          { step: 1, title: "Optimize Core Layout Shifts & Critical Rendering Paths", duration: "1-2 Days", priority: "High", details: "Compress static assets, remove render-blocking stylesheets, and declare explicit dimensions." },
          { step: 2, title: "Inject Contextual Schema & Fine-tune Keyword Tagging", duration: "2-3 Days", priority: "High", details: "Write localized service tags and optimize viewport meta elements for rich snippet validation." },
          { step: 3, title: "Deploy Streamlined Single-field Interactive Contact Triggers", duration: "2 Days", priority: "Medium", details: "Lower cognitive barrier for entry and pair it with a visual incentive or immediate value drop." }
        ],
        estimatedImpact: "+42% search engine traffic growth & +35% conversion inquiries within 30 days"
      });
    }

    try {
      const prompt = `You are a world-class digital agency Auditor and Strategist at NextSiteHub.
      Analyze this website request and generate a premium, professional audit report:
      Website URL: ${url}
      Business Description: ${description || "Not provided"}
      Industry: ${industry || "Not provided"}
      Interested Services: ${servicesNeeded ? servicesNeeded.join(", ") : "Not provided"}

      Generate a detailed JSON object with the following schema:
      {
        "scores": { "seo": number (1-100), "performance": number (1-100), "ux": number (1-100), "conversion": number (1-100) },
        "summary": "Brief executive summary (2-3 sentences)",
        "positives": ["3 strong points about their current branding, layout or idea"],
        "seoAudit": {
          "status": "Needs Improvement" | "Good" | "Critical",
          "issues": [{"title": "string", "impact": "High" | "Medium" | "Low", "description": "string", "solution": "string"}]
        },
        "uxAudit": {
          "status": "Needs Improvement" | "Good" | "Critical",
          "issues": [{"title": "string", "impact": "High" | "Medium" | "Low", "description": "string", "solution": "string"}]
        },
        "conversionAudit": {
          "status": "Needs Improvement" | "Good" | "Critical",
          "issues": [{"title": "string", "impact": "High" | "Medium" | "Low", "description": "string", "solution": "string"}]
        },
        "actionPlan": [
          {"step": number, "title": "string", "duration": "string", "priority": "High" | "Medium" | "Low", "details": "string"}
        ],
        "estimatedImpact": "e.g., +45% conversion increase, +80% SEO visibility"
      }

      Return ONLY raw valid JSON matching this schema, without any backticks, markdown, or extra text. Make the issues highly professional, personalized to their inputs, and constructive. Ensure it reads like a premium, human audit from a high-end $20k/month consulting firm.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      let reportData;
      try {
        reportData = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse JSON from model response:", responseText);
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        reportData = JSON.parse(cleanedText);
      }

      return res.json(reportData);
    } catch (error: any) {
      console.error("AI Audit error:", error);
      return res.status(500).json({ error: "Failed to generate AI Audit: " + error.message });
    }
  });

  // Robots.txt Route for SEO indexability
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://nextsitehub.com/sitemap.xml");
  });

  // Sitemap.xml Route for search bots
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nextsitehub.com/</loc>
    <lastmod>2026-06-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
