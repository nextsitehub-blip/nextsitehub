import { Response } from "express";
import { DB } from "../repositories/firestore.repository";
import { Validators } from "../models/validators";
import { AuthenticatedRequest } from "../middlewares/auth";

export const CmsController = {
  // --- Projects API ---
  async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const projects = await DB.getProjects();
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveProject(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = Validators.validateProject(req.body);
      const saved = await DB.saveProject(validated);
      res.json(saved);
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: "Validation failed", fields: err.fields });
      }
      res.status(500).json({ error: err.message });
    }
  },

  async deleteProject(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = await DB.deleteProject(id);
      if (success) {
        return res.json({ success: true });
      }
      res.status(404).json({ error: "Project not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // --- FAQs API ---
  async getFAQs(req: AuthenticatedRequest, res: Response) {
    try {
      const faqs = await DB.getFAQs();
      res.json(faqs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveFAQ(req: AuthenticatedRequest, res: Response) {
    const { id, question, answer, category } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ error: "question, answer, and category are required." });
    }

    try {
      const saved = await DB.saveFAQ({
        id: id || `faq-${Date.now()}`,
        question,
        answer,
        category
      });
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteFAQ(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = await DB.deleteFAQ(id);
      if (success) {
        return res.json({ success: true });
      }
      res.status(404).json({ error: "FAQ item not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // --- Testimonials API ---
  async getTestimonials(req: AuthenticatedRequest, res: Response) {
    try {
      const testimonials = await DB.getTestimonials();
      res.json(testimonials);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveTestimonial(req: AuthenticatedRequest, res: Response) {
    const { id, name, role, company, content, avatar, rating } = req.body;
    if (!name || !role || !content) {
      return res.status(400).json({ error: "name, role, and content are required." });
    }

    try {
      const saved = await DB.saveTestimonial({
        id: id || `testimonial-${Date.now()}`,
        name,
        role,
        company: company || "Independent",
        content,
        avatar: avatar || "",
        rating: rating || 5
      });
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteTestimonial(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    try {
      const success = await DB.deleteTestimonial(id);
      if (success) {
        return res.json({ success: true });
      }
      res.status(404).json({ error: "Testimonial not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // --- Settings API ---
  async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await DB.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const saved = await DB.saveSettings(req.body);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
