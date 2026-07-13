import { Response } from "express";
import { DB } from "../repositories/firestore.repository";
import { Validators } from "../models/validators";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Email } from "../services/email.service";

export const CrmController = {
  /**
   * Submit contact form inquiry lead.
   */
  async submitContact(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = Validators.validateLead(req.body);
      const saved = await DB.saveLead({
        ...validated,
        timestamp: new Date().toISOString()
      } as any);

      // Trigger Email alerts asynchronously
      await Promise.all([
        // Send receipt to client
        Email.sendEmail(saved.email, "Inquiry Proposal Received", "inquiry_received", {
          name: saved.name,
          company: saved.company,
          services: saved.services.join(", "),
          budget: `${saved.budget} ${saved.currency}`
        }),
        // Send alert to admin roster
        Email.sendEmail("nextsitehub@gmail.com", "Alert: New Agency Lead Submitted", "admin_notification", {
          name: saved.name,
          email: saved.email,
          message: saved.message,
          dashboardUrl: "https://nextsitehub.com/#admin"
        })
      ]);

      res.status(201).json(saved);
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: "Validation failed", fields: err.fields });
      }
      res.status(500).json({ error: "CRM write failure: " + err.message });
    }
  },

  /**
   * Retrieve list of leads.
   */
  async getLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const leads = await DB.getLeads();
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Update priority or status of a lead.
   */
  async updateLead(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required." });
    }

    try {
      const success = await DB.updateLeadStatus(id, status);
      if (success) {
        return res.json({ success: true, message: "Lead status updated." });
      }
      res.status(404).json({ error: "Lead record not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Submit / save website audit reports.
   */
  async submitAudit(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = Validators.validateAudit(req.body);
      const saved = await DB.saveAudit({
        ...validated,
        timestamp: new Date().toISOString()
      } as any);

      res.status(201).json(saved);
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: "Validation failed", fields: err.fields });
      }
      res.status(500).json({ error: "Audit write failure: " + err.message });
    }
  },

  /**
   * Fetch all audit reports.
   */
  async getAudits(req: AuthenticatedRequest, res: Response) {
    try {
      const audits = await DB.getAudits();
      res.json(audits);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Update audit status.
   */
  async updateAudit(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required." });
    }

    try {
      const success = await DB.updateAuditStatus(id, status);
      if (success) {
        return res.json({ success: true, message: "Audit status updated." });
      }
      res.status(404).json({ error: "Audit record not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Export leads registry in raw CSV format.
   */
  async exportLeadsCSV(req: AuthenticatedRequest, res: Response) {
    try {
      const leads = await DB.getLeads();
      const headers = ["ID", "Name", "Email", "Company", "Services", "Budget", "Currency", "Timestamp", "Status", "Type"];
      
      const csvRows = [headers.join(",")];
      for (const l of leads) {
        const row = [
          l.id || "",
          `"${l.name.replace(/"/g, '""')}"`,
          l.email,
          `"${(l.company || "").replace(/"/g, '""')}"`,
          `"${l.services.join("; ")}"`,
          l.budget,
          l.currency,
          l.timestamp,
          l.status,
          l.type
        ];
        csvRows.push(row.join(","));
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=nextsitehub_leads_export.csv");
      res.status(200).send(csvRows.join("\n"));
    } catch (err: any) {
      res.status(500).json({ error: "CSV compiling error: " + err.message });
    }
  }
};
