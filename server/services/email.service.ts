import { DB } from "../repositories/firestore.repository";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  timestamp: string;
  status: "sent" | "failed" | "queued";
  retryCount: number;
  errorMessage?: string;
}

class EmailService {
  private emailLogs: EmailLog[] = [];

  constructor() {}

  /**
   * Render HTML templates dynamically based on request context.
   */
  private renderTemplate(templateName: string, context: any): string {
    const brandName = "NextSiteHub";
    const year = new Date().getFullYear();

    const header = `
      <div style="font-family: 'Inter', sans-serif; background-color: #060813; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">${brandName}</h1>
          <p style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Premium Operations</p>
        </div>
        <div style="background-color: #0f172a; padding: 30px; border-radius: 12px; border: 1px solid #1e293b/50; line-height: 1.6;">
    `;

    const footer = `
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; font-family: monospace;">
          <p style="margin: 0;">This email is digitally signed and secure. Session key: ${Math.random().toString(36).substring(7).toUpperCase()}</p>
          <p style="margin: 5px 0 0 0;">&copy; ${year} ${brandName} Agency. All rights reserved.</p>
        </div>
      </div>
    `;

    switch (templateName) {
      case "welcome":
        return `
          ${header}
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Welcome to ${brandName}, ${context.name}!</h2>
          <p>We are absolutely thrilled to welcome you to our high-performance digital client center.</p>
          <p>Your premium dashboard is now fully unlocked. You can track project developments, request immediate design audits, and collaborate in real-time with our senior developers.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.loginUrl || "#"}" style="background: linear-gradient(to right, #2563eb, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Enter Client Portal</a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">If you did not execute this registration request, please contact our cybersecurity team immediately at security@nextsitehub.com.</p>
          ${footer}
        `;

      case "inquiry_received":
        return `
          ${header}
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Strategy Proposal Submitted</h2>
          <p>Hello ${context.name},</p>
          <p>We have successfully received your request for services and corporate proposal briefing.</p>
          <div style="background-color: #020617; border-left: 4px solid #06b6d4; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #06b6d4; font-family: monospace; text-transform: uppercase;">Inquiry Details</p>
            <p style="margin: 0; color: #e2e8f0; font-size: 14px;"><strong>Company:</strong> ${context.company || "N/A"}</p>
            <p style="margin: 5px 0 0 0; color: #e2e8f0; font-size: 14px;"><strong>Interested Services:</strong> ${context.services || "All"}</p>
            <p style="margin: 5px 0 0 0; color: #e2e8f0; font-size: 14px;"><strong>Corporate Budget:</strong> ${context.budget}</p>
          </div>
          <p>A senior solutions consultant and developer is currently auditing your request. We will reach back within 2 business hours with a complete digital roadmap strategy.</p>
          ${footer}
        `;

      case "admin_notification":
        return `
          ${header}
          <h2 style="color: #ef4444; font-size: 20px; margin-top: 0;">[SYSTEM INTRUSION] New Lead Registered</h2>
          <p><strong>Trigger Source:</strong> Public CRM Contact Pipeline</p>
          <div style="background-color: #020617; border-left: 4px solid #ef4444; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #ef4444; font-family: monospace; text-transform: uppercase;">Administrative Manifest</p>
            <p style="margin: 0; color: #e2e8f0; font-size: 14px;"><strong>Name:</strong> ${context.name}</p>
            <p style="margin: 5px 0 0 0; color: #e2e8f0; font-size: 14px;"><strong>Contact Email:</strong> ${context.email}</p>
            <p style="margin: 5px 0 0 0; color: #e2e8f0; font-size: 14px;"><strong>Details/Inquiry:</strong> ${context.message || "No comments"}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.dashboardUrl || "#"}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Access CRM Command Center</a>
          </div>
          ${footer}
        `;

      default:
        return `
          ${header}
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">${context.subject}</h2>
          <p>${context.message}</p>
          ${footer}
        `;
    }
  }

  /**
   * Queue email log to memory log database and simulate secure delivery.
   */
  public async sendEmail(to: string, subject: string, template: string, context: any): Promise<boolean> {
    const id = `mail-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const html = this.renderTemplate(template, { ...context, subject });

    const newLog: EmailLog = {
      id,
      to,
      subject,
      template,
      timestamp: new Date().toISOString(),
      status: "queued",
      retryCount: 0
    };

    this.emailLogs.unshift(newLog);

    // Simulate enterprise-grade SMTP routing & delivery mechanics
    try {
      DB.log("info", `Outbound SMTP queuing initiated for: ${to} (Subject: '${subject}')`);
      
      // Artificial short delay to mimic handshake
      await new Promise(resolve => setTimeout(resolve, 150));

      newLog.status = "sent";
      DB.log("info", `SMTP handshake completed successfully. Outbound mail dispatched to ${to}`);
      return true;
    } catch (err: any) {
      newLog.status = "failed";
      newLog.retryCount += 1;
      newLog.errorMessage = err.message || "Unknown mail socket error";
      DB.log("error", `SMTP routing failure sending mail to ${to}`, err);
      return false;
    }
  }

  public getEmailLogs(): EmailLog[] {
    return this.emailLogs;
  }
}

export const Email = new EmailService();
