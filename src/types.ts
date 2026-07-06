export interface Lead {
  id?: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  services: string[];
  budget: string;
  currency: string;
  timestamp: string;
  status: "New" | "Contacted" | "In Progress" | "Closed";
  type: "contact" | "audit";
}

export interface WebsiteAudit {
  id?: string;
  url: string;
  description: string;
  industry: string;
  servicesNeeded: string[];
  timestamp: string;
  email: string;
  scores: {
    seo: number;
    performance: number;
    ux: number;
    conversion: number;
  };
  summary: string;
  positives: string[];
  seoAudit: {
    status: string;
    issues: AuditIssue[];
  };
  uxAudit: {
    status: string;
    issues: AuditIssue[];
  };
  conversionAudit: {
    status: string;
    issues: AuditIssue[];
  };
  actionPlan: ActionPlanStep[];
  estimatedImpact: string;
  status: "New" | "Contacted" | "In Progress" | "Closed";
}

export interface AuditIssue {
  title: string;
  impact: "High" | "Medium" | "Low";
  description: string;
  solution: string;
}

export interface ActionPlanStep {
  step: number;
  title: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  details: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: "Web Development" | "Web Apps" | "UI/UX Design" | "SEO & Marketing" | "Branding";
  description: string;
  fullDetails: string;
  metrics: string;
  metricsLabel: string;
  image: string;
  tags: string[];
  liveUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  benefits: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "services" | "pricing" | "process" | "general";
}

export interface PricingPlan {
  id: string;
  name: string;
  priceUSD: number;
  priceINR: number;
  priceEUR: number;
  description: string;
  features: string[];
  timeline: string;
  badge?: string;
}

export type UserRole = "super_admin" | "admin" | "visitor";

export interface User {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  profileImage: string;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
}

export interface SiteSettings {
  siteTitle: string;
  contactEmail: string;
  instagram: string;
  businessLocation: string;
  contactPhone?: string;
  github?: string;
  themeSettings: {
    primaryColor: string;
    accentColor: string;
    isDarkFallback: boolean;
  };
}

