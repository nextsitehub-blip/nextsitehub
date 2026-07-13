import { Lead, WebsiteAudit, Project, FAQItem, TestimonialItem, PricingPlan, User } from "../../src/types";

export class ValidationError extends Error {
  constructor(public fields: { [key: string]: string }) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export const Validators = {
  validateLead(data: any): Omit<Lead, "id" | "timestamp"> {
    const errors: { [key: string]: string } = {};

    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (data.message && (typeof data.message !== "string" || data.message.length > 5000)) {
      errors.message = "Message must be a string and cannot exceed 5000 characters.";
    }
    if (!Array.isArray(data.services) || data.services.some((s: any) => typeof s !== "string")) {
      errors.services = "Services must be an array of strings.";
    }
    if (!data.budget || typeof data.budget !== "string") {
      errors.budget = "Budget must be a string.";
    }
    if (data.type !== "contact" && data.type !== "audit") {
      errors.type = "Type must be 'contact' or 'audit'.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      name: data.name.trim(),
      email: data.email.trim(),
      company: data.company ? String(data.company).trim() : undefined,
      message: data.message ? String(data.message).trim() : "",
      services: data.services,
      budget: data.budget,
      currency: data.currency || "USD",
      status: data.status || "New",
      type: data.type || "contact",
    };
  },

  validateAudit(data: any): Omit<WebsiteAudit, "id" | "timestamp"> {
    const errors: { [key: string]: string } = {};

    if (data.url && (typeof data.url !== "string" || data.url.length < 3)) {
      errors.url = "Invalid website URL format.";
    }
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (data.industry && typeof data.industry !== "string") {
      errors.industry = "Industry must be a string.";
    }
    if (data.description && typeof data.description !== "string") {
      errors.description = "Description must be a string.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      url: data.url ? data.url.trim() : "No Website (Strategy Audit)",
      description: data.description ? data.description.trim() : "",
      industry: data.industry ? data.industry.trim() : "",
      servicesNeeded: Array.isArray(data.servicesNeeded) ? data.servicesNeeded : [],
      email: data.email.trim(),
      scores: data.scores || { seo: 50, performance: 50, ux: 50, conversion: 50 },
      summary: data.summary || "",
      positives: Array.isArray(data.positives) ? data.positives : [],
      seoAudit: data.seoAudit || { status: "Needs Improvement", issues: [] },
      uxAudit: data.uxAudit || { status: "Needs Improvement", issues: [] },
      conversionAudit: data.conversionAudit || { status: "Needs Improvement", issues: [] },
      actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan : [],
      estimatedImpact: data.estimatedImpact || "",
      status: data.status || "New",
    };
  },

  validateProject(data: any): Project {
    const errors: { [key: string]: string } = {};

    if (!data.id || typeof data.id !== "string") {
      errors.id = "Project ID is required.";
    }
    if (!data.title || typeof data.title !== "string" || data.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    }
    if (!data.client || typeof data.client !== "string") {
      errors.client = "Client name is required.";
    }
    if (!data.category || typeof data.category !== "string") {
      errors.category = "Category is required.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      id: data.id,
      title: data.title.trim(),
      client: data.client.trim(),
      category: data.category,
      description: data.description || "",
      fullDetails: data.fullDetails || "",
      metrics: data.metrics || "",
      metricsLabel: data.metricsLabel || "",
      image: data.image || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      liveUrl: data.liveUrl || "#",
    };
  },

  validateUser(data: any): User {
    const errors: { [key: string]: string } = {};

    if (!data.uid || typeof data.uid !== "string") {
      errors.uid = "User UID is required.";
    }
    if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
      errors.email = "Valid email is required.";
    }
    if (!data.fullName || typeof data.fullName !== "string") {
      errors.fullName = "Full name is required.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      uid: data.uid,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      role: data.role || "visitor",
      profileImage: data.profileImage || "",
      createdAt: data.createdAt || new Date().toISOString(),
      lastLogin: data.lastLogin || new Date().toISOString(),
      status: data.status || "active",
      username: data.username,
      hashedPassword: data.hashedPassword,
      lastCredentialUpdate: data.lastCredentialUpdate,
      loginHistory: data.loginHistory,
      failedAttempts: data.failedAttempts,
    };
  },
};
