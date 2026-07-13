import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { CrmController } from "../controllers/crm.controller";
import { CmsController } from "../controllers/cms.controller";
import { AnalyticsController } from "../controllers/analytics.controller";
import { SeoController } from "../controllers/seo.controller";
import { BackupController } from "../controllers/backup.controller";
import { MediaController } from "../controllers/media.controller";
import { AuthMiddlewares } from "../middlewares/auth";
import { SecurityMiddlewares } from "../middlewares/security";

const apiRouter = Router();

// Apply sanitization globally to API requests
apiRouter.use(SecurityMiddlewares.sanitizePayload);

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Analytics Tracker (Page views)
apiRouter.post("/analytics/track", AnalyticsController.trackPageView);

// CRM pipelines
apiRouter.post("/crm/leads", CrmController.submitContact);
apiRouter.post("/crm/audits", CrmController.submitAudit);

// CMS Fetch operations (Portfolio, Testimonials, FAQs)
apiRouter.get("/cms/projects", CmsController.getProjects);
apiRouter.get("/cms/faqs", CmsController.getFAQs);
apiRouter.get("/cms/testimonials", CmsController.getTestimonials);
apiRouter.get("/cms/settings", CmsController.getSettings);

// Authentication Entrypoints
apiRouter.post("/auth/login", AuthController.login);
apiRouter.post("/auth/register", AuthController.register);


// ==========================================
// SECURE ENDPOINTS (Requires Session Token)
// ==========================================
const authenticate = AuthMiddlewares.authenticateSession as any;
const restrictToAdmin = AuthMiddlewares.requireRole(["admin", "super_admin"]) as any;
const restrictToSuperAdmin = AuthMiddlewares.requireRole(["super_admin"]) as any;

// CRM Pipelines operations
apiRouter.get("/crm/leads", authenticate, restrictToAdmin, CrmController.getLeads);
apiRouter.put("/crm/leads/:id", authenticate, restrictToAdmin, CrmController.updateLead);
apiRouter.get("/crm/leads-csv", authenticate, restrictToAdmin, CrmController.exportLeadsCSV);

apiRouter.get("/crm/audits", authenticate, restrictToAdmin, CrmController.getAudits);
apiRouter.put("/crm/audits/:id", authenticate, restrictToAdmin, CrmController.updateAudit);

// CMS administration
apiRouter.post("/cms/projects", authenticate, restrictToAdmin, CmsController.saveProject);
apiRouter.delete("/cms/projects/:id", authenticate, restrictToAdmin, CmsController.deleteProject);

apiRouter.post("/cms/faqs", authenticate, restrictToAdmin, CmsController.saveFAQ);
apiRouter.delete("/cms/faqs/:id", authenticate, restrictToAdmin, CmsController.deleteFAQ);

apiRouter.post("/cms/testimonials", authenticate, restrictToAdmin, CmsController.saveTestimonial);
apiRouter.delete("/cms/testimonials/:id", authenticate, restrictToAdmin, CmsController.deleteTestimonial);

apiRouter.post("/cms/settings", authenticate, restrictToAdmin, CmsController.saveSettings);

// Media Library operations
apiRouter.get("/media", authenticate, restrictToAdmin, MediaController.getMediaAssets);
apiRouter.post("/media/upload-mock", authenticate, restrictToAdmin, MediaController.uploadMediaMock);
apiRouter.put("/media/:id", authenticate, restrictToAdmin, MediaController.updateMediaMetadata);
apiRouter.delete("/media/:id", authenticate, restrictToAdmin, MediaController.deleteMediaAsset);

// SEO scoring
apiRouter.post("/seo/score", authenticate, restrictToAdmin, SeoController.calculateSeoHealth);
apiRouter.get("/seo/redirects", authenticate, restrictToAdmin, SeoController.getRedirectRules);
apiRouter.post("/seo/redirects", authenticate, restrictToAdmin, SeoController.saveRedirectRule);
apiRouter.delete("/seo/redirects", authenticate, restrictToAdmin, SeoController.deleteRedirectRule);

// Analytics Dashboard summary and system logs
apiRouter.get("/analytics/dashboard-stats", authenticate, restrictToAdmin, AnalyticsController.getDashboardStats);
apiRouter.get("/system/logs", authenticate, restrictToAdmin, AnalyticsController.getSystemLogs);
apiRouter.delete("/system/logs", authenticate, restrictToAdmin, AnalyticsController.clearSystemLogs);

// Backup and Disaster Recovery rollback
apiRouter.get("/backups", authenticate, restrictToAdmin, BackupController.getBackups);
apiRouter.post("/backups", authenticate, restrictToAdmin, BackupController.createBackup);
apiRouter.post("/backups/rollback", authenticate, restrictToAdmin, BackupController.rollback);
apiRouter.delete("/backups/:id", authenticate, restrictToAdmin, BackupController.deleteBackup);

// Super-Admin user provisioning operations
apiRouter.post("/users/provision", authenticate, restrictToSuperAdmin, AuthController.adminProvisionUser);
apiRouter.put("/users/:uid", authenticate, restrictToSuperAdmin, AuthController.adminUpdateUser);
apiRouter.delete("/users/:uid", authenticate, restrictToSuperAdmin, AuthController.adminDeleteUser);

export { apiRouter };
