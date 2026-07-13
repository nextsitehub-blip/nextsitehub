import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import { Lead, WebsiteAudit, Project, FAQItem, TestimonialItem, PricingPlan, User, SiteSettings } from "../../src/types";

const DB_FILE_PATH = path.join(process.cwd(), "server", "data", "db.json");

interface SystemLog {
  timestamp: string;
  level: "info" | "warning" | "error" | "action" | "performance";
  message: string;
  details?: any;
}

interface LocalDB {
  leads: Lead[];
  audits: WebsiteAudit[];
  projects: Project[];
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  users: User[];
  settings: SiteSettings;
  logs: SystemLog[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "NextSiteHub",
  contactEmail: "nextsitehub@gmail.com",
  instagram: "https://instagram.com/nextsitehub",
  businessLocation: "San Francisco, CA",
  themeSettings: {
    primaryColor: "#06B6D4",
    accentColor: "#3B82F6",
    isDarkFallback: true
  }
};

class DualEngineRepository {
  private localData: LocalDB;
  private firebaseDb: any = null;
  private isFirebaseReady = false;

  constructor() {
    this.ensureDirectoryExistence();
    this.localData = this.loadLocalDB();
    this.initFirebase();
  }

  private ensureDirectoryExistence() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadLocalDB(): LocalDB {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(content);
        return {
          leads: parsed.leads || [],
          audits: parsed.audits || [],
          projects: parsed.projects || [],
          faqs: parsed.faqs || [],
          testimonials: parsed.testimonials || [],
          users: parsed.users || [],
          settings: parsed.settings || DEFAULT_SETTINGS,
          logs: parsed.logs || []
        };
      }
    } catch (e) {
      console.error("Failed to parse local DB file:", e);
    }

    const defaultDB: LocalDB = {
      leads: [],
      audits: [],
      projects: [],
      faqs: [],
      testimonials: [],
      users: [],
      settings: DEFAULT_SETTINGS,
      logs: []
    };
    this.saveLocalDB(defaultDB);
    return defaultDB;
  }

  private saveLocalDB(data: LocalDB) {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to local DB file:", e);
    }
  }

  private initFirebase() {
    try {
      // Use client-side configuration
      const config = {
        projectId: "gen-lang-client-0211186368",
        appId: "1:951089319484:web:bccb13f448d1528071bd39",
        apiKey: "AIzaSyDrYQKDdcLDcEFiq4SddpooZDsOV31D8jw",
        authDomain: "gen-lang-client-0211186368.firebaseapp.com",
        firestoreDatabaseId: "ai-studio-nextsitehub-bd316d10-7fe8-4f7a-be98-06261be836fe",
        storageBucket: "gen-lang-client-0211186368.firebasestorage.app",
        messagingSenderId: "951089319484"
      };

      const app = initializeApp(config);
      this.firebaseDb = getFirestore(app, config.firestoreDatabaseId);
      this.isFirebaseReady = true;
      this.log("info", "Firebase server-side connection established successfully.");
    } catch (e) {
      console.error("Firebase connection failed server-side. Local-Only Mode:", e);
      this.log("warning", "Firebase server-side initialization failed; running in secure local-only mode.");
    }
  }

  // General Logging helper
  public log(level: SystemLog["level"], message: string, details?: any) {
    const newLog: SystemLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined
    };
    this.localData.logs.unshift(newLog);
    // Limit to last 2000 logs to prevent memory or file bloating
    if (this.localData.logs.length > 2000) {
      this.localData.logs = this.localData.logs.slice(0, 2000);
    }
    this.saveLocalDB(this.localData);
  }

  public getLogs(): SystemLog[] {
    return this.localData.logs;
  }

  public clearLogs() {
    this.localData.logs = [];
    this.saveLocalDB(this.localData);
    this.log("action", "System logs cleared by administrative command");
  }

  // --- CRM Operations ---
  public async getLeads(): Promise<Lead[]> {
    return this.localData.leads;
  }

  public async saveLead(lead: Lead): Promise<Lead> {
    const id = lead.id || `lead-${Date.now()}`;
    const newLead = { ...lead, id };
    
    // Check for duplicate lead by email
    const duplicate = this.localData.leads.find(l => l.email.toLowerCase() === lead.email.toLowerCase() && l.type === lead.type && l.status === "New");
    if (duplicate) {
      this.log("info", `Duplicate lead detection: existing open lead found for ${lead.email}`);
      return duplicate;
    }

    this.localData.leads.unshift(newLead);
    this.saveLocalDB(this.localData);
    this.log("action", `New Lead saved to repository: ${lead.name} (${lead.type})`);

    // Cloud sync
    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "leads", id), newLead);
      } catch (err) {
        this.log("error", "Firebase sync fail for lead save", err);
      }
    }
    return newLead;
  }

  public async updateLeadStatus(id: string, status: Lead["status"]): Promise<boolean> {
    const idx = this.localData.leads.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.localData.leads[idx].status = status;
      this.saveLocalDB(this.localData);
      this.log("action", `Lead status updated in repository: ID ${id} is now ${status}`);
      
      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await updateDoc(doc(this.firebaseDb, "leads", id), { status });
        } catch (err) {
          this.log("error", `Firebase lead update status fail: ${id}`, err);
        }
      }
      return true;
    }
    return false;
  }

  // --- Audits Operations ---
  public async getAudits(): Promise<WebsiteAudit[]> {
    return this.localData.audits;
  }

  public async saveAudit(audit: WebsiteAudit): Promise<WebsiteAudit> {
    const id = audit.id || `audit-${Date.now()}`;
    const newAudit = { ...audit, id };
    this.localData.audits.unshift(newAudit);
    this.saveLocalDB(this.localData);
    this.log("action", `Audit saved: url ${audit.url} to ${audit.email}`);

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "audits", id), newAudit);
      } catch (err) {
        this.log("error", "Firebase sync fail for audit save", err);
      }
    }
    return newAudit;
  }

  public async updateAuditStatus(id: string, status: WebsiteAudit["status"]): Promise<boolean> {
    const idx = this.localData.audits.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.localData.audits[idx].status = status;
      this.saveLocalDB(this.localData);
      this.log("action", `Audit status updated in repository: ID ${id} is now ${status}`);
      
      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await updateDoc(doc(this.firebaseDb, "audits", id), { status });
        } catch (err) {
          this.log("error", `Firebase audit update status fail: ${id}`, err);
        }
      }
      return true;
    }
    return false;
  }

  // --- Portfolio Operations ---
  public async getProjects(): Promise<Project[]> {
    return this.localData.projects;
  }

  public async saveProject(project: Project): Promise<Project> {
    const idx = this.localData.projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      this.localData.projects[idx] = project;
    } else {
      this.localData.projects.push(project);
    }
    this.saveLocalDB(this.localData);
    this.log("action", `CMS Project saved/updated: ${project.title}`);

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "projects", project.id), project);
      } catch (err) {
        this.log("error", "Firebase save project fail", err);
      }
    }
    return project;
  }

  public async deleteProject(id: string): Promise<boolean> {
    const beforeLength = this.localData.projects.length;
    this.localData.projects = this.localData.projects.filter(p => p.id !== id);
    if (this.localData.projects.length < beforeLength) {
      this.saveLocalDB(this.localData);
      this.log("action", `CMS Project deleted: ${id}`);
      
      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await deleteDoc(doc(this.firebaseDb, "projects", id));
        } catch (err) {
          this.log("error", `Firebase delete project fail: ${id}`, err);
        }
      }
      return true;
    }
    return false;
  }

  // --- FAQs Operations ---
  public async getFAQs(): Promise<FAQItem[]> {
    return this.localData.faqs;
  }

  public async saveFAQ(faq: FAQItem): Promise<FAQItem> {
    const idx = this.localData.faqs.findIndex(f => f.id === faq.id);
    if (idx !== -1) {
      this.localData.faqs[idx] = faq;
    } else {
      this.localData.faqs.push(faq);
    }
    this.saveLocalDB(this.localData);
    this.log("action", `CMS FAQ saved: ${faq.question}`);

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "faqs", faq.id), faq);
      } catch (err) {
        this.log("error", "Firebase save FAQ fail", err);
      }
    }
    return faq;
  }

  public async deleteFAQ(id: string): Promise<boolean> {
    const beforeLength = this.localData.faqs.length;
    this.localData.faqs = this.localData.faqs.filter(f => f.id !== id);
    if (this.localData.faqs.length < beforeLength) {
      this.saveLocalDB(this.localData);
      this.log("action", `CMS FAQ deleted: ${id}`);

      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await deleteDoc(doc(this.firebaseDb, "faqs", id));
        } catch (err) {
          this.log("error", "Firebase delete FAQ fail", err);
        }
      }
      return true;
    }
    return false;
  }

  // --- Testimonials Operations ---
  public async getTestimonials(): Promise<TestimonialItem[]> {
    return this.localData.testimonials;
  }

  public async saveTestimonial(testimonial: TestimonialItem): Promise<TestimonialItem> {
    const idx = this.localData.testimonials.findIndex(t => t.id === testimonial.id);
    if (idx !== -1) {
      this.localData.testimonials[idx] = testimonial;
    } else {
      this.localData.testimonials.push(testimonial);
    }
    this.saveLocalDB(this.localData);
    this.log("action", `CMS Testimonial saved: ${testimonial.name}`);

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "testimonials", testimonial.id), testimonial);
      } catch (err) {
        this.log("error", "Firebase save Testimonial fail", err);
      }
    }
    return testimonial;
  }

  public async deleteTestimonial(id: string): Promise<boolean> {
    const beforeLength = this.localData.testimonials.length;
    this.localData.testimonials = this.localData.testimonials.filter(t => t.id !== id);
    if (this.localData.testimonials.length < beforeLength) {
      this.saveLocalDB(this.localData);
      this.log("action", `CMS Testimonial deleted: ${id}`);

      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await deleteDoc(doc(this.firebaseDb, "testimonials", id));
        } catch (err) {
          this.log("error", "Firebase delete Testimonial fail", err);
        }
      }
      return true;
    }
    return false;
  }

  // --- User Operations ---
  public async getUsers(): Promise<User[]> {
    return this.localData.users;
  }

  public async saveUser(user: User): Promise<User> {
    const idx = this.localData.users.findIndex(u => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      this.localData.users[idx] = { ...this.localData.users[idx], ...user };
    } else {
      this.localData.users.push(user);
    }
    this.saveLocalDB(this.localData);
    this.log("action", `User saved/updated in register: ${user.email} (Role: ${user.role})`);

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "users", user.uid), user);
      } catch (err) {
        this.log("error", "Firebase save user fail", err);
      }
    }
    return user;
  }

  public async deleteUser(uid: string): Promise<boolean> {
    const beforeLength = this.localData.users.length;
    this.localData.users = this.localData.users.filter(u => u.uid !== uid);
    if (this.localData.users.length < beforeLength) {
      this.saveLocalDB(this.localData);
      this.log("action", `User permanently removed: ${uid}`);

      if (this.isFirebaseReady && this.firebaseDb) {
        try {
          await deleteDoc(doc(this.firebaseDb, "users", uid));
        } catch (err) {
          this.log("error", "Firebase delete user fail", err);
        }
      }
      return true;
    }
    return false;
  }

  // --- Settings Operations ---
  public async getSettings(): Promise<SiteSettings> {
    return this.localData.settings;
  }

  public async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    this.localData.settings = settings;
    this.saveLocalDB(this.localData);
    this.log("action", "Corporate configurations updated successfully.");

    if (this.isFirebaseReady && this.firebaseDb) {
      try {
        await setDoc(doc(this.firebaseDb, "settings", "global"), settings);
      } catch (err) {
        this.log("error", "Firebase save settings fail", err);
      }
    }
    return settings;
  }

  // --- Database backup / restore triggers ---
  public getCompleteBackupData(): string {
    return JSON.stringify(this.localData, null, 2);
  }

  public restoreCompleteBackup(backupJson: string): boolean {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.leads && parsed.audits && parsed.projects && parsed.faqs) {
        this.localData = parsed;
        this.saveLocalDB(this.localData);
        this.log("action", "Database complete restoration successfully applied.");
        return true;
      }
    } catch (e) {
      this.log("error", "Restoration logic fail", e);
    }
    return false;
  }
}

export const DB = new DualEngineRepository();
