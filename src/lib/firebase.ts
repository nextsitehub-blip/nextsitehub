import { initializeApp } from "firebase/app";
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  limit,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { Lead, WebsiteAudit, PricingPlan, Project, FAQItem, TestimonialItem, User, UserRole } from "../types";
import acmeThumbnail from "../assets/images/acme_sample_web_apps_preview_1782968301794.jpg";
import auraThumbnail from "../assets/images/aura_portfolio_thumbnail_1782968301795_1782969769790.jpg";
import apexThumbnail from "../assets/images/apex_portfolio_thumbnail_1783049532673.jpg";
import ecosphereThumbnail from "../assets/images/ecosphere_portfolio_thumbnail_1783049906603.jpg";

let db: any = null;
let auth: any = null;
let isFirebaseAvailable = false;

try {
  // Config imported dynamically to handle relative location cleanly
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
  auth = getAuth(app);
  
  // Use the custom databaseId provided in the applet config with experimental long-polling detect to handle restricted networks/iframes cleanly
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, config.firestoreDatabaseId || "(default)");
  
  isFirebaseAvailable = true;
  console.log("Firebase & Firestore initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed, falling back to localStorage", error);
}

// ----------------------------------------------------------------
// Firebase error boundaries and structured diagnostic error routing
// ----------------------------------------------------------------
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Exception Caught:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}


// ----------------------------------------------------------------
// Local Storage Backup Data
// ----------------------------------------------------------------
const getLocalLeads = (): Lead[] => {
  try {
    return JSON.parse(localStorage.getItem("nextsitehub_leads") || "[]");
  } catch {
    return [];
  }
};

const saveLocalLead = (lead: Lead) => {
  const leads = getLocalLeads();
  leads.unshift(lead);
  localStorage.setItem("nextsitehub_leads", JSON.stringify(leads));
};

const getLocalAudits = (): WebsiteAudit[] => {
  try {
    return JSON.parse(localStorage.getItem("nextsitehub_audits") || "[]");
  } catch {
    return [];
  }
};

const saveLocalAudit = (audit: WebsiteAudit) => {
  const audits = getLocalAudits();
  audits.unshift(audit);
  localStorage.setItem("nextsitehub_audits", JSON.stringify(audits));
};

// ----------------------------------------------------------------
// Public Operations with Fallbacks
// ----------------------------------------------------------------

export async function submitContactLead(leadData: Omit<Lead, "id" | "timestamp" | "status" | "type">): Promise<string> {
  const fullLead: Lead = {
    ...leadData,
    timestamp: new Date().toISOString(),
    status: "New",
    type: "contact"
  };

  if (isFirebaseAvailable && db) {
    try {
      const docRef = await addDoc(collection(db, "leads"), {
        ...fullLead,
        firebaseTimestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.CREATE, "leads");
      }
      console.warn("Firestore save failed, falling back to local storage", e);
      saveLocalLead(fullLead);
      return "local_" + Date.now();
    }
  } else {
    saveLocalLead(fullLead);
    return "local_" + Date.now();
  }
}

export async function saveAuditReport(auditData: Omit<WebsiteAudit, "id" | "timestamp" | "status">): Promise<string> {
  const fullAudit: WebsiteAudit = {
    ...auditData,
    timestamp: new Date().toISOString(),
    status: "New"
  };

  if (isFirebaseAvailable && db) {
    try {
      const docRef = await addDoc(collection(db, "audits"), {
        ...fullAudit,
        firebaseTimestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.CREATE, "audits");
      }
      console.warn("Firestore save audit failed, falling back to local storage", e);
      saveLocalAudit(fullAudit);
      return "local_" + Date.now();
    }
  } else {
    saveLocalAudit(fullAudit);
    return "local_" + Date.now();
  }
}

export async function fetchAllLeadsAndAudits(): Promise<{ leads: Lead[], audits: WebsiteAudit[] }> {
  let leads: Lead[] = [];
  let audits: WebsiteAudit[] = [];

  // Always load from local storage to merge
  const localLeads = getLocalLeads();
  const localAudits = getLocalAudits();

  if (isFirebaseAvailable && db) {
    try {
      // Fetch leads
      const leadsSnap = await getDocs(query(collection(db, "leads"), orderBy("timestamp", "desc"), limit(50)));
      leadsSnap.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as Lead);
      });

      // Fetch audits
      const auditsSnap = await getDocs(query(collection(db, "audits"), orderBy("timestamp", "desc"), limit(50)));
      auditsSnap.forEach((doc) => {
        audits.push({ id: doc.id, ...doc.data() } as WebsiteAudit);
      });
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.LIST, "leads_audits");
      }
      console.warn("Firestore fetch failed, relying fully on local storage", e);
      leads = localLeads;
      audits = localAudits;
    }
  } else {
    leads = localLeads;
    audits = localAudits;
  }

  // Merge & de-duplicate lists
  const mergedLeads = [...leads];
  localLeads.forEach(local => {
    if (!mergedLeads.some(l => l.email === local.email && l.timestamp === local.timestamp)) {
      mergedLeads.push(local);
    }
  });

  const mergedAudits = [...audits];
  localAudits.forEach(local => {
    if (!mergedAudits.some(a => a.url === local.url && a.timestamp === local.timestamp)) {
      mergedAudits.push(local);
    }
  });

  // Sort merged lists by descending timestamp
  mergedLeads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  mergedAudits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { leads: mergedLeads, audits: mergedAudits };
}

export async function updateLeadStatus(id: string, type: "contact" | "audit", newStatus: Lead["status"]): Promise<boolean> {
  const isLocal = id.startsWith("local_");

  if (isFirebaseAvailable && db && !isLocal) {
    try {
      const collectionName = type === "contact" ? "leads" : "audits";
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { status: newStatus });
      return true;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.UPDATE, type === "contact" ? "leads" : "audits");
      }
      console.error("Firestore update status failed, attempting local fallback", e);
    }
  }

  // Fallback to update local storage
  if (type === "contact") {
    const leads = getLocalLeads();
    const idx = leads.findIndex(l => l.id === id || (!l.id && "local_" + new Date(l.timestamp).getTime() === id));
    if (idx !== -1) {
      leads[idx].status = newStatus;
      localStorage.setItem("nextsitehub_leads", JSON.stringify(leads));
      return true;
    }
  } else {
    const audits = getLocalAudits();
    const idx = audits.findIndex(a => a.id === id || (!a.id && "local_" + new Date(a.timestamp).getTime() === id));
    if (idx !== -1) {
      audits[idx].status = newStatus;
      localStorage.setItem("nextsitehub_audits", JSON.stringify(audits));
      return true;
    }
  }

  return false;
}

// ----------------------------------------------------------------
// Pricing Plans Seeding, Storage and Operations
// ----------------------------------------------------------------

const defaultPricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Launchpad",
    priceUSD: 2500,
    priceINR: 199000,
    priceEUR: 2300,
    description: "Ideal for early-stage startups and high-converting single page validation models.",
    timeline: "5-7 Days",
    features: [
      "1 Custom-designed page",
      "Pixel-perfect responsive coding",
      "Subtle modern page animations",
      "Core SEO schema setup",
      "Bespoke contact form & lead capture",
      "30 Days launch support"
    ]
  },
  {
    id: "growth",
    name: "Growth Framework",
    priceUSD: 5500,
    priceINR: 449000,
    priceEUR: 5100,
    description: "Our signature tier. Full brand transformation, multi-page layout optimization, and core tools.",
    timeline: "10-14 Days",
    features: [
      "Up to 8 custom modular pages",
      "Bespoke illustration/icon sets",
      "Interactive audit wizard setup",
      "Comprehensive technical SEO setup",
      "CRM & lead dashboard sync",
      "90 Days dedicated support"
    ],
    badge: "Best Value"
  },
  {
    id: "premium",
    name: "Custom Premium Suite",
    priceUSD: 12000,
    priceINR: 999000,
    priceEUR: 11000,
    description: "Bespoke digital platforms, high-performance web apps, and ultimate custom features.",
    timeline: "3-5 Weeks",
    features: [
      "Unlimited custom page layouts",
      "Advanced custom API integrations",
      "High-security database pipelines",
      "Premium search optimization suite",
      "Custom analytics or client portals",
      "1 Year full service agreement"
    ]
  }
];

const getLocalPricing = (): PricingPlan[] => {
  try {
    const local = localStorage.getItem("nextsitehub_pricing_plans");
    return local ? JSON.parse(local) : defaultPricingPlans;
  } catch {
    return defaultPricingPlans;
  }
};

const saveLocalPricing = (plans: PricingPlan[]) => {
  try {
    localStorage.setItem("nextsitehub_pricing_plans", JSON.stringify(plans));
  } catch (e) {
    console.error("Local storage pricing save failed", e);
  }
};

export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const local = getLocalPricing();
  if (isFirebaseAvailable && db) {
    try {
      const q = query(collection(db, "pricing"));
      const snap = await getDocs(q);
      if (snap.empty) {
        // Seed the database with defaults
        for (const p of defaultPricingPlans) {
          await setDoc(doc(db, "pricing", p.id), p);
        }
        return defaultPricingPlans;
      }
      const plans: PricingPlan[] = [];
      snap.forEach((d) => {
        plans.push({ id: d.id, ...d.data() } as PricingPlan);
      });
      // Sort to keep order: starter -> growth -> premium
      const order = ["starter", "growth", "premium"];
      plans.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      return plans;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.LIST, "pricing");
      }
      console.warn("Firestore fetch pricing failed, relying on local storage", e);
      return local;
    }
  }
  return local;
}

export async function savePricingPlan(plan: PricingPlan): Promise<boolean> {
  const local = getLocalPricing();
  const idx = local.findIndex(p => p.id === plan.id);
  if (idx !== -1) {
    local[idx] = plan;
  } else {
    local.push(plan);
  }
  saveLocalPricing(local);

  if (isFirebaseAvailable && db) {
    try {
      await setDoc(doc(db, "pricing", plan.id), plan);
      return true;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.WRITE, "pricing/" + plan.id);
      }
      console.error("Firestore save pricing plan failed", e);
      return false;
    }
  }
  return true;
}

// ----------------------------------------------------------------
// Default Data Seeding & CRUD for Projects, FAQs, and Testimonials
// ----------------------------------------------------------------

const defaultProjects: Project[] = [
  {
    id: "proj-1",
    title: "Acme Enterprise SaaS Suite",
    client: "Acme Technologies",
    category: "Web Apps",
    description: "A comprehensive core visual cloud panel and custom analytics board designed for extreme data density.",
    fullDetails: "Built fully custom with React 19, custom micro-components, and secure Firebase synchronization.",
    metrics: "+320% Lead Capture",
    metricsLabel: "Inbound Pipeline Growth",
    image: acmeThumbnail,
    tags: ["React SPA", "TailwindCSS", "Cloud Infrastructure", "Framer Motion"],
    liveUrl: "https://acme-enterprise-saa-s-suite.vercel.app"
  },
  {
    id: "proj-2",
    title: "Aura Luxury Lifestyle Engine",
    client: "Aura Living",
    category: "Web Development",
    description: "A highly immersive, fast-loading, pixel-perfect e-commerce ecosystem presenting curated home art.",
    fullDetails: "Crafted with modular architectural sections, customized layouts, and extreme speed optimizations.",
    metrics: "0.4s Interaction Limit",
    metricsLabel: "Instantaneous Page Load",
    image: auraThumbnail,
    tags: ["Vite Core", "E-Commerce API", "Premium Swiss Grid"],
    liveUrl: "https://aura-luxury-lifestyle-engine.vercel.app"
  },
  {
    id: "proj-3",
    title: "Apex Fintech Dashboard",
    client: "Apex Capital",
    category: "UI/UX Design",
    description: "Bespoke wireframes, high-contrast layouts, and touch interaction designs reducing financial transfer friction.",
    fullDetails: "Comprehensive overhaul of internal workflow tools designed strictly for rapid cross-border processing.",
    metrics: "88% Less Friction",
    metricsLabel: "Customer Onboarding Speedup",
    image: apexThumbnail,
    tags: ["Figma Wireframing", "Contrast Tuning", "WCAG 2.2 AAA"],
    liveUrl: "https://apex-fintech-dashboard-phi.vercel.app"
  },
  {
    id: "proj-4",
    title: "EcoSphere Core Brand Blueprint",
    client: "EcoSphere Group",
    category: "Branding",
    description: "A luxury sustainability brand manual, asset design, vectors, and modular styling definitions.",
    fullDetails: "A comprehensive digital transformation from obsolete web design to absolute visual authority.",
    metrics: "+94% Brand Equity",
    metricsLabel: "Positive Consumer Sentiment",
    image: ecosphereThumbnail,
    tags: ["Brand Identity", "Design Tokens", "Bespoke Typography"],
    liveUrl: "https://eco-sphere-core-brand-blueprint.vercel.app"
  }
];

const defaultTestimonials: TestimonialItem[] = [
  {
    id: "rev-1",
    name: "Marcus Vance",
    role: "VP of Product Development",
    company: "Acme Technologies",
    content: "NextSiteHub engineered our entire visual SaaS stack. Not only does it look identical to elite silicon-valley startups, our organic conversion rates expanded by over +120% in the very first month.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  },
  {
    id: "rev-2",
    name: "Helena Sterling",
    role: "Strategic Branding Lead",
    company: "Aura Living",
    content: "The load speed they achieved is purely magical. Our core home showcase viewport collapsed from 4.8s load latency to under 0.6s. Our technical SEO markups got us to high Google ranks within weeks.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  },
  {
    id: "rev-3",
    name: "David Patel",
    role: "Chief Technology Officer",
    company: "Zenix Analytics",
    content: "Most modern agencies hide behind slow, bloated generic builders. NextSiteHub writes ultra-clean custom React code. The performance metrics and design integrity speak volumes for their talent.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    rating: 5
  }
];

const defaultFAQs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Do you use template drag-and-drop builders like WordPress or Elementor?",
    answer: "Absolutely not. We write custom React components paired with Tailwind CSS compilations. This ensures absolute design independence, flawless Core Web Vitals, and an interface that scales infinitely without bloating script errors.",
    category: "general"
  },
  {
    id: "faq-2",
    question: "What is your typical project turnaround duration?",
    answer: "A standard high-conversion landing page or basic launchpad takes between 7 to 10 working days. Full corporate platforms or custom Web Application systems typically require between 14 to 20 working days, including deep UI/UX wireframing sequences.",
    category: "process"
  },
  {
    id: "faq-3",
    question: "Will I have a direct communication link to the engineering team?",
    answer: "Yes. We create a dedicated Slack workspace and Figma asset folder for your team. You can interact directly with our core visual architect and development leads in real-time, bypassing slow project management gates.",
    category: "general"
  },
  {
    id: "faq-4",
    question: "What currencies do you accept for payment settlements?",
    answer: "We support USD, EUR, GBP, and AUD. You can utilize our built-in navbar Currency Selector to review rates instantly. All invoice milestones are settled securely using standard Stripe or wire transfers.",
    category: "pricing"
  },
  {
    id: "faq-5",
    question: "How do you guarantee a 100/100 Core Web Vitals performance score?",
    answer: "We employ strict code hygiene: pre-caching static assets, compressing graphic elements to WebP formats, avoiding render-blocking stylesheets, and using clean, compiled script loops rather than heavy interactive plugins.",
    category: "services"
  }
];

// --- PORTFOLIO CRUD OPERATIONS ---
export async function fetchProjects(): Promise<Project[]> {
  try {
    const local = localStorage.getItem("nextsitehub_projects");
    let localProjects: Project[] = local ? JSON.parse(local) : [...defaultProjects];
    localProjects = localProjects.map(p => {
      if (p.id === "proj-1") return { ...p, image: acmeThumbnail, liveUrl: "https://acme-enterprise-saa-s-suite.vercel.app" };
      if (p.id === "proj-2") return { ...p, image: auraThumbnail, liveUrl: "https://aura-luxury-lifestyle-engine.vercel.app" };
      if (p.id === "proj-3") return { ...p, image: apexThumbnail, liveUrl: "https://apex-fintech-dashboard-phi.vercel.app" };
      if (p.id === "proj-4") return { ...p, image: ecosphereThumbnail, liveUrl: "https://eco-sphere-core-brand-blueprint.vercel.app" };
      return p;
    });

    if (isFirebaseAvailable && db) {
      const snap = await getDocs(collection(db, "projects"));
      if (snap.empty) {
        for (const p of defaultProjects) {
          await setDoc(doc(db, "projects", p.id), p);
        }
        return defaultProjects;
      }
      const projects: Project[] = [];
      snap.forEach(d => {
        const data = d.data();
        if (d.id === "proj-1") {
          data.image = acmeThumbnail;
          data.liveUrl = "https://acme-enterprise-saa-s-suite.vercel.app";
        }
        if (d.id === "proj-2") {
          data.image = auraThumbnail;
          data.liveUrl = "https://aura-luxury-lifestyle-engine.vercel.app";
        }
        if (d.id === "proj-3") {
          data.image = apexThumbnail;
          data.liveUrl = "https://apex-fintech-dashboard-phi.vercel.app";
        }
        if (d.id === "proj-4") {
          data.image = ecosphereThumbnail;
          data.liveUrl = "https://eco-sphere-core-brand-blueprint.vercel.app";
        }
        projects.push({ id: d.id, ...data } as Project);
      });
      return projects;
    }
    return localProjects;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.LIST, "projects");
    }
    console.warn("fetchProjects failed, using local fallback", e);
    const local = localStorage.getItem("nextsitehub_projects");
    let localProjects: Project[] = local ? JSON.parse(local) : [...defaultProjects];
    return localProjects.map(p => {
      if (p.id === "proj-1") return { ...p, image: acmeThumbnail, liveUrl: "https://acme-enterprise-saa-s-suite.vercel.app" };
      if (p.id === "proj-2") return { ...p, image: auraThumbnail, liveUrl: "https://aura-luxury-lifestyle-engine.vercel.app" };
      if (p.id === "proj-3") return { ...p, image: apexThumbnail, liveUrl: "https://apex-fintech-dashboard-phi.vercel.app" };
      if (p.id === "proj-4") return { ...p, image: ecosphereThumbnail, liveUrl: "https://eco-sphere-core-brand-blueprint.vercel.app" };
      return p;
    });
  }
}

export async function saveProject(project: Project): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_projects");
    const localProjects: Project[] = local ? JSON.parse(local) : [...defaultProjects];
    const idx = localProjects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      localProjects[idx] = project;
    } else {
      localProjects.push(project);
    }
    localStorage.setItem("nextsitehub_projects", JSON.stringify(localProjects));

    if (isFirebaseAvailable && db) {
      await setDoc(doc(db, "projects", project.id), project);
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.WRITE, "projects/" + project.id);
    }
    console.error("saveProject failed", e);
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_projects");
    let localProjects: Project[] = local ? JSON.parse(local) : [...defaultProjects];
    localProjects = localProjects.filter(p => p.id !== id);
    localStorage.setItem("nextsitehub_projects", JSON.stringify(localProjects));

    if (isFirebaseAvailable && db) {
      await deleteDoc(doc(db, "projects", id));
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.DELETE, "projects/" + id);
    }
    console.error("deleteProject failed", e);
    return false;
  }
}

// --- FAQ CRUD OPERATIONS ---
export async function fetchFAQs(): Promise<FAQItem[]> {
  try {
    const local = localStorage.getItem("nextsitehub_faqs");
    const localFAQs = local ? JSON.parse(local) : defaultFAQs;

    if (isFirebaseAvailable && db) {
      const snap = await getDocs(collection(db, "faqs"));
      if (snap.empty) {
        for (const f of defaultFAQs) {
          await setDoc(doc(db, "faqs", f.id), f);
        }
        return defaultFAQs;
      }
      const faqs: FAQItem[] = [];
      snap.forEach(d => {
        faqs.push({ id: d.id, ...d.data() } as FAQItem);
      });
      return faqs;
    }
    return localFAQs;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.LIST, "faqs");
    }
    console.warn("fetchFAQs failed, using local fallback", e);
    const local = localStorage.getItem("nextsitehub_faqs");
    return local ? JSON.parse(local) : defaultFAQs;
  }
}

export async function saveFAQ(faq: FAQItem): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_faqs");
    const localFAQs: FAQItem[] = local ? JSON.parse(local) : [...defaultFAQs];
    const idx = localFAQs.findIndex(f => f.id === faq.id);
    if (idx !== -1) {
      localFAQs[idx] = faq;
    } else {
      localFAQs.push(faq);
    }
    localStorage.setItem("nextsitehub_faqs", JSON.stringify(localFAQs));

    if (isFirebaseAvailable && db) {
      await setDoc(doc(db, "faqs", faq.id), faq);
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.WRITE, "faqs/" + faq.id);
    }
    console.error("saveFAQ failed", e);
    return false;
  }
}

export async function deleteFAQ(id: string): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_faqs");
    let localFAQs: FAQItem[] = local ? JSON.parse(local) : [...defaultFAQs];
    localFAQs = localFAQs.filter(f => f.id !== id);
    localStorage.setItem("nextsitehub_faqs", JSON.stringify(localFAQs));

    if (isFirebaseAvailable && db) {
      await deleteDoc(doc(db, "faqs", id));
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.DELETE, "faqs/" + id);
    }
    console.error("deleteFAQ failed", e);
    return false;
  }
}

// --- TESTIMONIAL CRUD OPERATIONS ---
export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    const local = localStorage.getItem("nextsitehub_testimonials");
    const localTestimonials = local ? JSON.parse(local) : defaultTestimonials;

    if (isFirebaseAvailable && db) {
      const snap = await getDocs(collection(db, "testimonials"));
      if (snap.empty) {
        for (const t of defaultTestimonials) {
          await setDoc(doc(db, "testimonials", t.id), t);
        }
        return defaultTestimonials;
      }
      const testimonials: TestimonialItem[] = [];
      snap.forEach(d => {
        testimonials.push({ id: d.id, ...d.data() } as TestimonialItem);
      });
      return testimonials;
    }
    return localTestimonials;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.LIST, "testimonials");
    }
    console.warn("fetchTestimonials failed, using local fallback", e);
    const local = localStorage.getItem("nextsitehub_testimonials");
    return local ? JSON.parse(local) : defaultTestimonials;
  }
}

export async function saveTestimonial(testimonial: TestimonialItem): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_testimonials");
    const localTestimonials: TestimonialItem[] = local ? JSON.parse(local) : [...defaultTestimonials];
    const idx = localTestimonials.findIndex(t => t.id === testimonial.id);
    if (idx !== -1) {
      localTestimonials[idx] = testimonial;
    } else {
      localTestimonials.push(testimonial);
    }
    localStorage.setItem("nextsitehub_testimonials", JSON.stringify(localTestimonials));

    if (isFirebaseAvailable && db) {
      await setDoc(doc(db, "testimonials", testimonial.id), testimonial);
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.WRITE, "testimonials/" + testimonial.id);
    }
    console.error("saveTestimonial failed", e);
    return false;
  }
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  try {
    const local = localStorage.getItem("nextsitehub_testimonials");
    let localTestimonials: TestimonialItem[] = local ? JSON.parse(local) : [...defaultTestimonials];
    localTestimonials = localTestimonials.filter(t => t.id !== id);
    localStorage.setItem("nextsitehub_testimonials", JSON.stringify(localTestimonials));

    if (isFirebaseAvailable && db) {
      await deleteDoc(doc(db, "testimonials", id));
    }
    return true;
  } catch (e: any) {
    if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
      handleFirestoreError(e, OperationType.DELETE, "testimonials/" + id);
    }
    console.error("deleteTestimonial failed", e);
    return false;
  }
}

export async function recordVisitorAndGetCount(monthId: string, increment: boolean): Promise<number> {
  const fallbackKey = `nextsitehub_fallback_visitors_${monthId}`;
  
  if (isFirebaseAvailable && db) {
    try {
      const docRef = doc(db, "visitors", monthId);
      const finalCount = await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists()) {
          // If the record doesn't exist, we start with 21 as mandated.
          const initialValue = 21;
          transaction.set(docRef, {
            monthId,
            count: initialValue,
            updatedAt: new Date().toISOString()
          });
          return initialValue;
        } else {
          const currentData = docSnap.data();
          const currentCount = currentData.count || 21;
          const nextCount = increment ? currentCount + 1 : currentCount;
          transaction.update(docRef, {
            count: nextCount,
            updatedAt: new Date().toISOString()
          });
          return nextCount;
        }
      });
      // Synchronize with local storage fallback
      localStorage.setItem(fallbackKey, finalCount.toString());
      return finalCount;
    } catch (e: any) {
      if (e instanceof Error && (e.message.includes("permission") || e.message.includes("Permission") || e.message.includes("denied"))) {
        handleFirestoreError(e, OperationType.WRITE, "visitors/" + monthId);
      }
      console.warn("Firestore visitor transaction failed, using local storage fallback", e);
    }
  }

  // Local storage fallback for offline/disabled states
  const cachedCount = localStorage.getItem(fallbackKey);
  let count = cachedCount ? parseInt(cachedCount, 10) : 21;
  if (increment) {
    count += 1;
  }
  localStorage.setItem(fallbackKey, count.toString());
  return count;
}

// ----------------------------------------------------------------
// Firebase Authentication & Role-Based Access Control (RBAC)
// ----------------------------------------------------------------

export async function getCurrentUserProfile(uid: string): Promise<User | null> {
  if (isFirebaseAvailable && db) {
    try {
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        return docSnap.data() as User;
      }
    } catch (e: any) {
      console.warn("Failed to retrieve user profile from Firestore, falling back", e);
    }
  }
  // Local fallback
  try {
    const cachedUsers = JSON.parse(localStorage.getItem("nextsitehub_users_fallback") || "[]") as User[];
    return cachedUsers.find(u => u.uid === uid) || null;
  } catch {
    return null;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (isFirebaseAvailable && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      let profile = await getCurrentUserProfile(firebaseUser.uid);
      
      if (!profile) {
        // If this is the very first user OR email is owner, boost to super_admin
        const usersSnap = await getDocs(collection(db, "users"));
        const isEmpty = usersSnap.empty;
        const isOwner = email.toLowerCase() === "nextsitehub@gmail.com";
        const role: UserRole = (isEmpty || isOwner) ? "super_admin" : "admin";
        
        profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || email.split("@")[0],
          email: firebaseUser.email || email,
          role: role,
          profileImage: firebaseUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: "active"
        };
        await setDoc(doc(db, "users", firebaseUser.uid), profile);
      } else {
        // Update last login timestamp
        profile.lastLogin = new Date().toISOString();
        await setDoc(doc(db, "users", firebaseUser.uid), profile, { merge: true });
      }
      
      if (profile.status === "inactive") {
        throw new Error("This administrator account has been deactivated. Please contact the Super Admin.");
      }
      
      return profile;
    } catch (e: any) {
      console.error("Firebase Auth Sign-In Failure:", e);
      throw e;
    }
  } else {
    // Local storage mock authentication for local playground mode
    if (password === "admin123" || email.includes("nextsitehub")) {
      const mockUid = "local_admin_uid";
      const profile: User = {
        uid: mockUid,
        fullName: "NextSiteHub Owner",
        email: email,
        role: "super_admin",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active"
      };
      const fallbackList = [profile];
      localStorage.setItem("nextsitehub_users_fallback", JSON.stringify(fallbackList));
      return profile;
    }
    throw new Error("Local fallback authentication failed. Please enter admin credentials.");
  }
}

export async function loginWithGoogle(): Promise<User> {
  if (isFirebaseAvailable && auth && db) {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      let profile = await getCurrentUserProfile(firebaseUser.uid);
      const userEmail = firebaseUser.email || "";
      
      if (!profile) {
        // First user or owner email => super_admin
        const usersSnap = await getDocs(collection(db, "users"));
        const isEmpty = usersSnap.empty;
        const isOwner = userEmail.toLowerCase() === "nextsitehub@gmail.com";
        const role: UserRole = (isEmpty || isOwner) ? "super_admin" : "admin";
        
        profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || "Administrator",
          email: userEmail,
          role: role,
          profileImage: firebaseUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: "active"
        };
        await setDoc(doc(db, "users", firebaseUser.uid), profile);
      } else {
        profile.lastLogin = new Date().toISOString();
        await setDoc(doc(db, "users", firebaseUser.uid), profile, { merge: true });
      }
      
      if (profile.status === "inactive") {
        throw new Error("This administrator account has been deactivated.");
      }
      
      return profile;
    } catch (e: any) {
      console.error("Firebase Auth Google Sign-In Failure:", e);
      throw e;
    }
  } else {
    // Google login simulated local state
    const mockUid = "local_google_admin";
    const profile: User = {
      uid: mockUid,
      fullName: "Google Authenticated Owner",
      email: "nextsitehub@gmail.com",
      role: "super_admin",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active"
    };
    localStorage.setItem("nextsitehub_users_fallback", JSON.stringify([profile]));
    return profile;
  }
}

export async function bootstrapFirstSuperAdmin(email: string, password: string, fullName: string): Promise<User> {
  if (isFirebaseAvailable && auth && db) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const profile: User = {
        uid: firebaseUser.uid,
        fullName: fullName,
        email: email,
        role: "super_admin",
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active"
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), profile);
      return profile;
    } catch (e: any) {
      console.error("Super Admin Bootstrap failure:", e);
      throw e;
    }
  } else {
    const mockUid = "local_bootstrapped_admin";
    const profile: User = {
      uid: mockUid,
      fullName: fullName,
      email: email,
      role: "super_admin",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active"
    };
    localStorage.setItem("nextsitehub_users_fallback", JSON.stringify([profile]));
    return profile;
  }
}

export async function createNewAdminUser(email: string, password: string, fullName: string, role: UserRole): Promise<User> {
  if (isFirebaseAvailable && db) {
    try {
      // NOTE: Standard web clients cannot easily create alternate credentials in Firebase Auth 
      // without disrupting their active session unless using Admin SDK or a secondary Auth app instance.
      // To work around this client-side securely: We write the user record directly to Firestore.
      // The invited Admin can sign up on first login, or we can use a dedicated helper auth app container.
      // Here, we provision the user's Firestore record. On first login, they can initialize password.
      const tempUid = "pending_" + Math.random().toString(36).substring(2, 11);
      const profile: User = {
        uid: tempUid,
        fullName,
        email,
        role,
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        createdAt: new Date().toISOString(),
        lastLogin: "Never",
        status: "active"
      };
      await setDoc(doc(db, "users", tempUid), profile);
      return profile;
    } catch (e: any) {
      console.error("Failed to provision invited admin user:", e);
      throw e;
    }
  } else {
    const cached = JSON.parse(localStorage.getItem("nextsitehub_users_fallback") || "[]") as User[];
    const newUser: User = {
      uid: "local_" + Date.now(),
      fullName,
      email,
      role,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString(),
      lastLogin: "Never",
      status: "active"
    };
    cached.push(newUser);
    localStorage.setItem("nextsitehub_users_fallback", JSON.stringify(cached));
    return newUser;
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  if (isFirebaseAvailable && db) {
    try {
      const snap = await getDocs(collection(db, "users"));
      const usersList: User[] = [];
      snap.forEach(d => {
        usersList.push(d.data() as User);
      });
      return usersList;
    } catch (e: any) {
      console.error("Failed to fetch administrative users registry:", e);
    }
  }
  try {
    return JSON.parse(localStorage.getItem("nextsitehub_users_fallback") || "[]") as User[];
  } catch {
    return [];
  }
}

export async function updateUserRoleAndStatus(uid: string, role: UserRole, status: "active" | "inactive"): Promise<boolean> {
  if (isFirebaseAvailable && db) {
    try {
      await updateDoc(doc(db, "users", uid), { role, status });
      return true;
    } catch (e: any) {
      console.error("Failed to update user profile credentials:", e);
      return false;
    }
  }
  try {
    const cached = JSON.parse(localStorage.getItem("nextsitehub_users_fallback") || "[]") as User[];
    const idx = cached.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      cached[idx].role = role;
      cached[idx].status = status;
      localStorage.setItem("nextsitehub_users_fallback", JSON.stringify(cached));
      return true;
    }
  } catch {}
  return false;
}

export async function deleteUserAccount(uid: string): Promise<boolean> {
  if (isFirebaseAvailable && db) {
    try {
      await deleteDoc(doc(db, "users", uid));
      return true;
    } catch (e: any) {
      console.error("Failed to purge user administrative profile:", e);
      return false;
    }
  }
  try {
    let cached = JSON.parse(localStorage.getItem("nextsitehub_users_fallback") || "[]") as User[];
    cached = cached.filter(u => u.uid !== uid);
    localStorage.setItem("nextsitehub_users_fallback", JSON.stringify(cached));
    return true;
  } catch {}
  return false;
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseAvailable && auth) {
    await firebaseSignOut(auth);
  }
}

export async function sendPasswordResetLink(email: string): Promise<void> {
  if (isFirebaseAvailable && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    console.log("Password reset link simulated for", email);
  }
}

// ----------------------------------------------------------------
// Dynamic Website Settings Layer
// ----------------------------------------------------------------

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

const defaultSettings: SiteSettings = {
  siteTitle: "NextSiteHub",
  contactEmail: "nextsitehub@gmail.com",
  instagram: "@nextsitehub",
  businessLocation: "Bengaluru, Karnataka, India",
  themeSettings: {
    primaryColor: "#0F172A",
    accentColor: "#06B6D4",
    isDarkFallback: true
  }
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (isFirebaseAvailable && db) {
    try {
      const docSnap = await getDoc(doc(db, "settings", "main"));
      if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
      } else {
        await setDoc(doc(db, "settings", "main"), defaultSettings);
        return defaultSettings;
      }
    } catch (e: any) {
      console.warn("Firestore fetch site settings failed, using cache fallback", e);
    }
  }
  try {
    const local = localStorage.getItem("nextsitehub_settings");
    return local ? JSON.parse(local) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  try {
    localStorage.setItem("nextsitehub_settings", JSON.stringify(settings));
    if (isFirebaseAvailable && db) {
      await setDoc(doc(db, "settings", "main"), settings);
    }
    return true;
  } catch (e: any) {
    console.error("Failed to commit settings updates to Firestore:", e);
    return false;
  }
}

export { db, auth, isFirebaseAvailable };
