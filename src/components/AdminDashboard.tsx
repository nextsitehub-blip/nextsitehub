import React, { useState, useEffect } from "react";
import logoImg from "../assets/images/nextsitehub_clean_logo_1782965304404.jpg";
import { 
  fetchAllLeadsAndAudits, 
  updateLeadStatus, 
  fetchPricingPlans, 
  savePricingPlan,
  fetchProjects,
  saveProject,
  deleteProject,
  fetchFAQs,
  saveFAQ,
  deleteFAQ,
  fetchTestimonials,
  saveTestimonial,
  deleteTestimonial,
  isFirebaseAvailable,
  getCurrentUserProfile,
  loginWithEmail,
  updateAdminCredentials,
  checkSetupStatus,
  setupFirstAdmin,
  loginWithGoogle,
  createNewAdminUser,
  fetchAllUsers,
  updateUserRoleAndStatus,
  deleteUserAccount,
  logoutUser,
  sendPasswordResetLink,
  fetchSiteSettings,
  saveSiteSettings,
  auth
} from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Lead, WebsiteAudit, PricingPlan, Project, FAQItem, TestimonialItem, User, UserRole, SiteSettings } from "../types";
import { 
  Users, FileText, CheckCircle2, Clock, Eye, EyeOff, Trash2, Edit3, Plus, 
  Filter, Search, ShieldX, KeyRound, ArrowRight, X, Mail, Coins, 
  CheckCircle, AlertTriangle, RefreshCw, LayoutDashboard, Layers, 
  HelpCircle, MessageSquare, LogOut, ChevronLeft, ChevronRight, Star, 
  Globe, Sparkles, TrendingUp, DollarSign, Activity, Settings, Loader2,
  Lock, Shield, UserCheck, AlertCircle, Info, Sliders
} from "lucide-react";
import { useToast } from "./Toast";

type Tab = "overview" | "leads" | "audits" | "portfolio" | "pricing" | "faqs" | "testimonials" | "users" | "settings";

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { toast } = useToast();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("nextsitehub_admin_auth") === "true" || localStorage.getItem("nextsitehub_local_session") !== null;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("nextsitehub_local_session");
    return cached ? JSON.parse(cached) : null;
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Dynamic Settings and User Registries
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Administrative credentials updating states
  const [newUsername, setNewUsername] = useState("");
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmNewPasscode, setConfirmNewPasscode] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [showCurrentPasscode, setShowCurrentPasscode] = useState(false);
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [showConfirmNewPasscode, setShowConfirmNewPasscode] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Setup related state
  const [isSetupChecked, setIsSetupChecked] = useState(false);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [setupUsername, setSetupUsername] = useState("");
  const [setupPasscode, setSetupPasscode] = useState("");
  const [setupConfirmPasscode, setSetupConfirmPasscode] = useState("");
  const [setupRecoveryEmail, setSetupRecoveryEmail] = useState("");
  const [showSetupPasscode, setShowSetupPasscode] = useState(false);
  const [showSetupConfirmPasscode, setShowSetupConfirmPasscode] = useState(false);
  const [isSubmittingSetup, setIsSubmittingSetup] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // User invitation / management form
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("admin");
  const [isCreatingUser, setIsCreatingUser] = useState(false);


  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [audits, setAudits] = useState<WebsiteAudit[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Search & Filter state
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Selection states for view detail / editing
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<WebsiteAudit | null>(null);
  
  // Editor Modals / States
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<Partial<FAQItem> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [leadsPage, setLeadsPage] = useState(1);
  const [auditsPage, setAuditsPage] = useState(1);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [faqsPage, setFaqsPage] = useState(1);
  const [testimonialsPage, setTestimonialsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Check Setup status on mount
  useEffect(() => {
    const runSetupCheck = async () => {
      try {
        const setupCompleted = await checkSetupStatus();
        setIsSetupRequired(!setupCompleted);
      } catch (err) {
        console.error("Failed to fetch administrator initial setup status:", err);
      } finally {
        setIsSetupChecked(true);
      }
    };
    runSetupCheck();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllDashboardData();
    }
  }, [isAuthenticated, currentUser]);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const { leads: fetchedLeads, audits: fetchedAudits } = await fetchAllLeadsAndAudits();
      setLeads(fetchedLeads);
      setAudits(fetchedAudits);

      const [fetchedPricing, fetchedProjects, fetchedFAQs, fetchedReviews, fetchedSettingsList] = await Promise.all([
        fetchPricingPlans(),
        fetchProjects(),
        fetchFAQs(),
        fetchTestimonials(),
        fetchSiteSettings()
      ]);

      setPricingPlans(fetchedPricing);
      setProjects(fetchedProjects);
      setFaqs(fetchedFAQs);
      setTestimonials(fetchedReviews);
      setSiteSettings(fetchedSettingsList);

      // Super Admin can inspect user accounts and configurations
      if (currentUser?.role === "super_admin") {
        const users = await fetchAllUsers();
        setUsersList(users);
      }
    } catch (e) {
      console.error("Critical error sync admin dashboard collections:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    toast(message, "success");
  };

  // Session synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getCurrentUserProfile(firebaseUser.uid);
          if (profile) {
            if (profile.status === "inactive") {
              toast("This account has been deactivated.", "error");
              await logoutUser();
              setCurrentUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem("nextsitehub_local_session");
              sessionStorage.removeItem("nextsitehub_admin_auth");
            } else {
              setCurrentUser(profile);
              setIsAuthenticated(true);
              localStorage.setItem("nextsitehub_local_session", JSON.stringify(profile));
              sessionStorage.setItem("nextsitehub_admin_auth", "true");
            }
          }
        } catch (err) {
          console.error("Authentication session verification failed:", err);
        }
      } else {
        // If not authenticated in firebase, but we don't have a local session, clear
        if (!localStorage.getItem("nextsitehub_local_session")) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSigningIn(true);
    try {
      const profile = await loginWithEmail(loginEmail, loginPassword);
      setCurrentUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem("nextsitehub_local_session", JSON.stringify(profile));
      sessionStorage.setItem("nextsitehub_admin_auth", "true");
      toast(`Welcome back, ${profile.fullName}!`, "success");
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate administrator credentials.");
      toast("Sign in failed. Intrusion alert logged.", "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError("");
    setIsSigningIn(true);
    try {
      const profile = await loginWithGoogle();
      setCurrentUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem("nextsitehub_local_session", JSON.stringify(profile));
      sessionStorage.setItem("nextsitehub_admin_auth", "true");
      toast(`Google authenticated: Welcome ${profile.fullName}`, "success");
    } catch (err: any) {
      setLoginError(err.message || "Google Sign-In failed or was aborted.");
      toast("Social handshake cancelled", "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError("Please enter your admin email to request a reset link.");
      return;
    }
    setLoginError("");
    try {
      await sendPasswordResetLink(loginEmail);
      setResetSent(true);
      toast("Password reset link dispatched to your email inbox.", "success");
    } catch (err: any) {
      setLoginError(err.message || "Reset request failed.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout firebase action missed", e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("nextsitehub_local_session");
    sessionStorage.removeItem("nextsitehub_admin_auth");
    toast("Administrative session locked securely.", "success");
  };

  // Administrative User management helpers
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserFullName) {
      toast("Please populate all administrative credential fields.", "error");
      return;
    }
    setIsCreatingUser(true);
    try {
      const created = await createNewAdminUser(newUserEmail, newUserPassword, newUserFullName, newUserRole);
      if (created) {
        toast(`Administrator account provisioned: ${newUserFullName}`, "success");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserFullName("");
        setNewUserRole("admin");
        
        // Refresh users roster
        const users = await fetchAllUsers();
        setUsersList(users);
      }
    } catch (err: any) {
      toast(err.message || "Failed to create administrator user account.", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    if (userId === currentUser?.uid) {
      toast("You cannot deactivate your own active session.", "error");
      return;
    }
    setActionLoading(true);
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const success = await updateUserRoleAndStatus(userId, undefined, newStatus);
      if (success) {
        toast("Administrative user account status modified successfully.", "success");
        const users = await fetchAllUsers();
        setUsersList(users);
      }
    } catch (err: any) {
      toast(err.message || "Failed to alter account status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: UserRole) => {
    if (userId === currentUser?.uid) {
      toast("You cannot alter your own administrative role tier.", "error");
      return;
    }
    setActionLoading(true);
    try {
      const newRole = currentRole === "super_admin" ? "admin" : "super_admin";
      const success = await updateUserRoleAndStatus(userId, newRole, undefined);
      if (success) {
        toast(`Role tier adjusted to ${newRole}.`, "success");
        const users = await fetchAllUsers();
        setUsersList(users);
      }
    } catch (err: any) {
      toast(err.message || "Failed to alter role tier assignment.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.uid) {
      toast("Self-termination block: You cannot delete your own session.", "error");
      return;
    }
    if (!window.confirm("Are you absolutely sure you want to terminate this administrator account? This cannot be undone.")) {
      return;
    }
    setActionLoading(true);
    try {
      const success = await deleteUserAccount(userId);
      if (success) {
        toast("Administrative account permanently deleted.", "success");
        const users = await fetchAllUsers();
        setUsersList(users);
      }
    } catch (err: any) {
      toast(err.message || "Termination failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    setIsSavingSettings(true);
    try {
      const success = await saveSiteSettings(siteSettings);
      if (success) {
        toast("Corporate website configurations updated successfully.", "success");
      }
    } catch (err: any) {
      toast(err.message || "Configuration write-back failed.", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Synchronize newUsername state with currentUser username
  useEffect(() => {
    if (currentUser?.username) {
      setNewUsername(currentUser.username);
    } else if (currentUser?.email) {
      setNewUsername(currentUser.email.split("@")[0]);
    }
    if (currentUser?.recoveryEmail) {
      setRecoveryEmail(currentUser.recoveryEmail);
    } else if (currentUser?.email) {
      setRecoveryEmail(currentUser.email);
    }
  }, [currentUser, activeTab]);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasscode) {
      toast("Verification failed. Current passcode is required.", "warning");
      return;
    }
    if (!newUsername) {
      toast("Verification failed. New username is required.", "warning");
      return;
    }
    if (!recoveryEmail) {
      toast("Verification failed. Recovery email is required.", "warning");
      return;
    }
    if (newPasscode.length < 12) {
      toast("Passcode is too short. Minimum 12 characters required.", "warning");
      return;
    }
    if (newPasscode !== confirmNewPasscode) {
      toast("Passcode validation failed. New passcodes do not match.", "error");
      return;
    }

    // Validate strong passcode criteria (upper, lower, number, special)
    const hasUpper = /[A-Z]/.test(newPasscode);
    const hasLower = /[a-z]/.test(newPasscode);
    const hasDigit = /[0-9]/.test(newPasscode);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPasscode);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      toast("Passcode must include uppercase, lowercase, numbers, and special characters.", "error");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSaveCredentials = async () => {
    setIsSavingCredentials(true);
    try {
      const updatedUser = await updateAdminCredentials(currentPasscode, newUsername, newPasscode, recoveryEmail);
      setCurrentUser(updatedUser);
      localStorage.setItem("nextsitehub_local_session", JSON.stringify(updatedUser));
      toast("Administrative credentials updated successfully.", "success");
      
      // Reset sensitive fields
      setCurrentPasscode("");
      setNewPasscode("");
      setConfirmNewPasscode("");
      setShowConfirmDialog(false);
    } catch (err: any) {
      toast(err.message || "Failed to commit credential updates.", "error");
    } finally {
      setIsSavingCredentials(false);
    }
  };

  const handleGeneratePasscode = () => {
    const length = 16;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let code = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * uppercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      code.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    
    code = code.sort(() => Math.random() - 0.5);
    const generated = code.join("");
    
    setNewPasscode(generated);
    setConfirmNewPasscode(generated);
    setShowNewPasscode(true);
    setShowConfirmNewPasscode(true);
    toast("Strong passcode generated successfully.", "success");
  };

  // Status transitions
  const handleUpdateStatus = async (id: string, type: "contact" | "audit", newStatus: Lead["status"]) => {
    setActionLoading(true);
    try {
      const success = await updateLeadStatus(id, type, newStatus);
      if (success) {
        if (type === "contact") {
          setLeads(prev => prev.map(l => (l.id === id || (!l.id && "local_" + new Date(l.timestamp).getTime() === id)) ? { ...l, status: newStatus } : l));
          if (selectedLead) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        } else {
          setAudits(prev => prev.map(a => (a.id === id || (!a.id && "local_" + new Date(a.timestamp).getTime() === id)) ? { ...a, status: newStatus } : a));
          if (selectedAudit) setSelectedAudit(prev => prev ? { ...prev, status: newStatus } : null);
        }
        showToast(`Status updated successfully to ${newStatus}`);
      }
    } catch (err) {
      console.error("Error transitioning status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Portfolio actions
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject.client || !editingProject.category) return;
    setActionLoading(true);
    try {
      const id = editingProject.id || `proj-${Date.now()}`;
      const projectToSave: Project = {
        id,
        title: editingProject.title,
        client: editingProject.client,
        category: editingProject.category as Project["category"],
        description: editingProject.description || "",
        fullDetails: editingProject.fullDetails || "",
        metrics: editingProject.metrics || "",
        metricsLabel: editingProject.metricsLabel || "",
        image: editingProject.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        tags: editingProject.tags || ["Vite", "TailwindCSS"],
        liveUrl: editingProject.liveUrl || "#"
      };

      const success = await saveProject(projectToSave);
      if (success) {
        setProjects(prev => {
          const idx = prev.findIndex(p => p.id === id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = projectToSave;
            return copy;
          }
          return [...prev, projectToSave];
        });
        setEditingProject(null);
        showToast("Portfolio project saved to cloud registry.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this case study? This action is instant and irreversible.")) return;
    setActionLoading(true);
    try {
      const success = await deleteProject(id);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        showToast("Project deleted from registry.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // FAQ actions
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ?.question || !editingFAQ.answer || !editingFAQ.category) return;
    setActionLoading(true);
    try {
      const id = editingFAQ.id || `faq-${Date.now()}`;
      const faqToSave: FAQItem = {
        id,
        question: editingFAQ.question,
        answer: editingFAQ.answer,
        category: editingFAQ.category as FAQItem["category"]
      };

      const success = await saveFAQ(faqToSave);
      if (success) {
        setFaqs(prev => {
          const idx = prev.findIndex(f => f.id === id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = faqToSave;
            return copy;
          }
          return [...prev, faqToSave];
        });
        setEditingFAQ(null);
        showToast("FAQ inquiry saved to database.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    setActionLoading(true);
    try {
      const success = await deleteFAQ(id);
      if (success) {
        setFaqs(prev => prev.filter(f => f.id !== id));
        showToast("FAQ inquiry removed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Testimonial actions
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial.role || !editingTestimonial.content) return;
    setActionLoading(true);
    try {
      const id = editingTestimonial.id || `rev-${Date.now()}`;
      const testimonialToSave: TestimonialItem = {
        id,
        name: editingTestimonial.name,
        role: editingTestimonial.role,
        company: editingTestimonial.company || "Independent",
        content: editingTestimonial.content,
        avatar: editingTestimonial.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        rating: editingTestimonial.rating || 5
      };

      const success = await saveTestimonial(testimonialToSave);
      if (success) {
        setTestimonials(prev => {
          const idx = prev.findIndex(t => t.id === id);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = testimonialToSave;
            return copy;
          }
          return [...prev, testimonialToSave];
        });
        setEditingTestimonial(null);
        showToast("Client testimonial saved to database.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Delete this client endorsement?")) return;
    setActionLoading(true);
    try {
      const success = await deleteTestimonial(id);
      if (success) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
        showToast("Testimonial record removed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Pricing actions
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setActionLoading(true);
    try {
      const success = await savePricingPlan(editingPlan);
      if (success) {
        setPricingPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
        setEditingPlan(null);
        showToast(`Pricing plan '${editingPlan.name}' successfully modified.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper styles
  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "New": return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "Contacted": return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case "In Progress": return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
      case "Closed": return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupUsername) {
      toast("Verification failed. Username is required.", "warning");
      return;
    }
    if (setupUsername.length < 5 || setupUsername.length > 32) {
      toast("Username must be between 5 and 32 characters.", "warning");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(setupUsername)) {
      toast("Username can only contain alphanumeric characters, underscores, and hyphens.", "warning");
      return;
    }
    if (setupPasscode.length < 12) {
      toast("Passcode is too short. Minimum 12 characters required.", "warning");
      return;
    }
    if (setupPasscode !== setupConfirmPasscode) {
      toast("Passcode validation failed. Passcodes do not match.", "error");
      return;
    }

    const hasUpper = /[A-Z]/.test(setupPasscode);
    const hasLower = /[a-z]/.test(setupPasscode);
    const hasDigit = /[0-9]/.test(setupPasscode);
    const hasSpecial = /[^A-Za-z0-9]/.test(setupPasscode);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      toast("Passcode must include uppercase, lowercase, numbers, and special characters.", "error");
      return;
    }

    setIsSubmittingSetup(true);
    try {
      const user = await setupFirstAdmin(setupUsername, setupPasscode, setupRecoveryEmail);
      setCurrentUser(user);
      setIsSetupRequired(false);
      setIsAuthenticated(true);
      localStorage.setItem("nextsitehub_local_session", JSON.stringify(user));
      sessionStorage.setItem("nextsitehub_admin_auth", "true");
      toast("Initial administrator credentials established successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to complete initial administrator setup.", "error");
    } finally {
      setIsSubmittingSetup(false);
    }
  };

  const handleSetupGeneratePasscode = () => {
    const length = 16;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const all = uppercase + lowercase + numbers + symbols;
    let generated = "";
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < length; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }
    generated = generated.split("").sort(() => 0.5 - Math.random()).join("");
    setSetupPasscode(generated);
    setSetupConfirmPasscode(generated);
    setShowSetupPasscode(true);
    setShowSetupConfirmPasscode(true);
  };

  // -------------------------------------------------------------
  // FIRST-TIME ADMINISTRATOR SETUP SCREEN
  // -------------------------------------------------------------
  if (isSetupChecked && isSetupRequired) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060813] flex items-center justify-center p-4 font-sans overflow-y-auto">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden animate-scaleIn my-8">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-lg shadow-[#2563EB]/25">
            <Shield className="w-6 h-6 text-white" />
          </div>

          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase text-center">
            First-Time Administrator Setup
          </h2>
          <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mt-1 text-center">
            No Active Admin Account Found. Please provision the system owner account.
          </p>

          <form onSubmit={handleSetupSubmit} className="mt-8 space-y-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Administrator Username *</label>
                <input
                  type="text"
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none font-mono"
                  placeholder="e.g. admin"
                  required
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1">5-32 characters, letters, numbers, underscores, hyphens.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Recovery Email *</label>
                <input
                  type="email"
                  value={setupRecoveryEmail}
                  onChange={(e) => setSetupRecoveryEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                  placeholder="e.g. recovery@domain.com"
                  required
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1">Required for emergency account recovery and critical security alerts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Administrator Passcode *</label>
                  <button
                    type="button"
                    onClick={handleSetupGeneratePasscode}
                    className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSetupPasscode ? "text" : "password"}
                    value={setupPasscode}
                    onChange={(e) => setSetupPasscode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none font-mono"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupPasscode(!showSetupPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {showSetupPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {setupPasscode && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>Strength Estimate:</span>
                      <span className={
                        setupPasscode.length < 12 ? "text-red-400" :
                        (/[A-Z]/.test(setupPasscode) && /[a-z]/.test(setupPasscode) && /[0-9]/.test(setupPasscode) && /[^A-Za-z0-9]/.test(setupPasscode)) ? "text-emerald-400" : "text-amber-400"
                      }>
                        {setupPasscode.length < 12 ? "Too Short" :
                         (/[A-Z]/.test(setupPasscode) && /[a-z]/.test(setupPasscode) && /[0-9]/.test(setupPasscode) && /[^A-Za-z0-9]/.test(setupPasscode)) ? "Strong (Complexity Met)" : "Weak (Requires Upper/Lower/Number/Special)"}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{
                        width: setupPasscode.length < 12 ? "25%" :
                               (/[A-Z]/.test(setupPasscode) && /[a-z]/.test(setupPasscode) && /[0-9]/.test(setupPasscode) && /[^A-Za-z0-9]/.test(setupPasscode)) ? "100%" : "60%",
                        backgroundColor: setupPasscode.length < 12 ? "#F87171" :
                                         (/[A-Z]/.test(setupPasscode) && /[a-z]/.test(setupPasscode) && /[0-9]/.test(setupPasscode) && /[^A-Za-z0-9]/.test(setupPasscode)) ? "#34D399" : "#FBBF24"
                      }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Confirm Passcode *</label>
                <div className="relative">
                  <input
                    type={showSetupConfirmPasscode ? "text" : "password"}
                    value={setupConfirmPasscode}
                    onChange={(e) => setSetupConfirmPasscode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none font-mono"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupConfirmPasscode(!showSetupConfirmPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {showSetupConfirmPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px] text-slate-400">
              <h4 className="text-[10px] font-mono text-[#06B6D4] uppercase font-bold">First-Time Setup Guidelines</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Username must contain only letters, numbers, underscores, or hyphens.</li>
                <li>Passcode must be at least 12 characters.</li>
                <li>Passcode must include uppercase, lowercase, numbers, and special symbols.</li>
                <li>Your recovery email will allow passcode recovery and audit updates.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmittingSetup}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
            >
              {isSubmittingSetup ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Initialize System Owner Account</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SIGN IN PANEL SCREEN (SECURE LOGIN)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060813] flex items-center justify-center p-4 font-sans">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center animate-scaleIn">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-lg shadow-[#2563EB]/25">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase">
            {isForgotPassword ? "Reset Admin Key" : "Operations Login"}
          </h2>
          <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mt-1">
            {isForgotPassword ? "Credentials Restoration Gate" : "NextSiteHub Enterprise Gate"}
          </p>

          {loginError && (
            <div className="p-3 mt-6 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs flex items-start space-x-2 animate-fadeIn text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {resetSent && (
            <div className="p-3 mt-6 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs flex items-start space-x-2 animate-fadeIn text-left">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Reset link dispatched. Please monitor your spam or inbox folders.</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Admin Email Address</label>
                <input
                  type="email"
                  placeholder="admin@nextsitehub.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/35 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#2563EB]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setLoginError(""); setResetSent(false); }}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-semibold transition-all mt-2"
              >
                Back to credentials login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Administrator Username</label>
                <input
                  type="text"
                  placeholder="Enter administrative username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/35 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Passcode</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setLoginError(""); }}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/35 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <label className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 accent-cyan-500 cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Local Fallback Passcode: <code className="text-cyan-400 bg-cyan-950/40 px-1 py-0.5 rounded font-mono">admin123</code>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#2563EB]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-850/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>SECURE CRYPTO HANDSHAKE</span>
            <span>v5.2.0-RBAC</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DATA FILTERING & PAGINATION LOGIC
  // -------------------------------------------------------------
  
  // Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = globalSearch === "" || 
      l.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      l.email.toLowerCase().includes(globalSearch.toLowerCase()) || 
      (l.company && l.company.toLowerCase().includes(globalSearch.toLowerCase()));
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const leadsTotalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = filteredLeads.slice((leadsPage - 1) * ITEMS_PER_PAGE, leadsPage * ITEMS_PER_PAGE);

  // Audits
  const filteredAudits = audits.filter(a => {
    const matchesSearch = globalSearch === "" || 
      a.url.toLowerCase().includes(globalSearch.toLowerCase()) || 
      a.email.toLowerCase().includes(globalSearch.toLowerCase()) || 
      a.industry.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const auditsTotalPages = Math.ceil(filteredAudits.length / ITEMS_PER_PAGE) || 1;
  const paginatedAudits = filteredAudits.slice((auditsPage - 1) * ITEMS_PER_PAGE, auditsPage * ITEMS_PER_PAGE);

  // Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = globalSearch === "" || 
      p.title.toLowerCase().includes(globalSearch.toLowerCase()) || 
      p.client.toLowerCase().includes(globalSearch.toLowerCase()) || 
      p.category.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const portfolioTotalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = filteredProjects.slice((portfolioPage - 1) * ITEMS_PER_PAGE, portfolioPage * ITEMS_PER_PAGE);

  // FAQs
  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = globalSearch === "" || 
      f.question.toLowerCase().includes(globalSearch.toLowerCase()) || 
      f.answer.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const faqsTotalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE) || 1;
  const paginatedFaqs = filteredFaqs.slice((faqsPage - 1) * ITEMS_PER_PAGE, faqsPage * ITEMS_PER_PAGE);

  // Testimonials
  const filteredTestimonials = testimonials.filter(t => {
    return globalSearch === "" || 
      t.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      t.company.toLowerCase().includes(globalSearch.toLowerCase()) || 
      t.content.toLowerCase().includes(globalSearch.toLowerCase());
  });
  const testimonialsTotalPages = Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE) || 1;
  const paginatedTestimonials = filteredTestimonials.slice((testimonialsPage - 1) * ITEMS_PER_PAGE, testimonialsPage * ITEMS_PER_PAGE);


  // -------------------------------------------------------------
  // RENDER COMPLETE SAAS WORKSPACE
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#060813] flex overflow-hidden text-slate-300 font-sans antialiased text-sm">

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-[#0F172A] border-r border-slate-850 flex flex-col justify-between transition-all duration-300 shrink-0 z-30`}
      >
        <div>
          {/* Logo bar */}
          <div className="h-20 border-b border-slate-850 flex items-center justify-between px-5 bg-slate-950/20">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img 
                src={logoImg} 
                alt="NextSiteHub Logo" 
                className="w-8 h-8 rounded-full border border-white/10 object-cover shadow-md shadow-[#2563EB]/15 shrink-0"
                referrerPolicy="no-referrer"
              />
              {isSidebarOpen && (
                <div className="animate-fadeIn">
                  <h1 className="font-display text-sm font-black text-white uppercase tracking-tight">Hub CRM</h1>
                  <span className="text-[8px] font-mono text-[#94A3B8] tracking-widest block uppercase">Admin Panel</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
              title="Toggle Sidebar size"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab("overview"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "overview" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Overview</span>}
            </button>

            <button
              onClick={() => { setActiveTab("leads"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "leads" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Users className="w-4 h-4" />
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-grow animate-fadeIn">
                  <span className="text-xs uppercase tracking-wider font-semibold">Leads</span>
                  {leads.filter(l => l.status === "New").length > 0 && (
                    <span className="bg-red-500 text-white font-mono text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                      {leads.filter(l => l.status === "New").length}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("audits"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "audits" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-grow animate-fadeIn">
                  <span className="text-xs uppercase tracking-wider font-semibold">Audit Wizard</span>
                  {audits.filter(a => a.status === "New").length > 0 && (
                    <span className="bg-cyan-500 text-slate-950 font-mono text-[8px] px-1.5 py-0.5 rounded-full font-black">
                      {audits.filter(a => a.status === "New").length}
                    </span>
                  )}
                </div>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("portfolio"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "portfolio" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Layers className="w-4 h-4" />
              {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Portfolio</span>}
            </button>

            <button
              onClick={() => { setActiveTab("pricing"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "pricing" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Coins className="w-4 h-4" />
              {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Pricing Tiers</span>}
            </button>

            <button
              onClick={() => { setActiveTab("faqs"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "faqs" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">FAQ Desk</span>}
            </button>

            <button
              onClick={() => { setActiveTab("testimonials"); setGlobalSearch(""); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                activeTab === "testimonials" 
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Testimonials</span>}
            </button>

            {currentUser?.role === "super_admin" && (
              <>
                <button
                  onClick={() => { setActiveTab("users"); setGlobalSearch(""); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                    activeTab === "users" 
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">User Accounts</span>}
                </button>

                <button
                  onClick={() => { setActiveTab("settings"); setGlobalSearch(""); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all ${
                    activeTab === "settings" 
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">Site Config</span>}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Footer/Logout area */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="text-[10px] font-mono tracking-wider uppercase font-bold">Lock Session</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE AREA */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#0A0D1A]">
        
        {/* TOP BAR BRAND CRUMB HEADER */}
        <header className="h-20 border-b border-slate-850 flex items-center justify-between px-6 bg-[#0F172A] shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">NEXTSITEHUB / ADMIN</span>
            <span className="text-slate-700">/</span>
            <span className="text-white text-xs font-mono uppercase tracking-widest bg-slate-950 border border-slate-850 px-2 py-1 rounded">
              {activeTab} VIEWPORT
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={loadAllDashboardData}
              disabled={loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-xl transition-all flex items-center gap-1.5"
              title="Refresh database collections"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold hidden sm:inline">sync</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800" />

            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{sessionStorage.getItem("nextsitehub_admin_auth") === "true" ? "nextsitehub@gmail.com" : "anonymous"}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all ml-1"
              title="Close Panel Overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CENTRAL MAIN */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-3.5 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Establishing secure firestore tunnel...</p>
            </div>
          ) : (
            <>
              {/* -----------------------------------------------------------
                  1. OVERVIEW GRAPHICS & INTRO DASHBOARD
                  ----------------------------------------------------------- */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Agency Overview</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Real-time statistics & marketing audit conversion funnels.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-850 rounded-xl px-4 py-2.5 flex items-center space-x-2.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-slate-400">Database Engine Live: {isFirebaseAvailable ? "Cloud Firestore" : "Local Cache fallback"}</span>
                    </div>
                  </div>

                  {/* Operational Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-[#0F172A] border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-xl group-hover:bg-blue-600/10 transition-all duration-300" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Total Leads</span>
                        <span className="text-3xl font-black text-white font-display mt-1 block">{leads.length}</span>
                        <span className="text-[9px] font-mono text-blue-400 mt-2 block flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Inbound queries</span>
                      </div>
                      <div className="p-3 bg-blue-950/40 border border-blue-900/20 text-blue-400 rounded-xl">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 bg-[#0F172A] border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl group-hover:bg-cyan-600/10 transition-all duration-300" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Audits Run</span>
                        <span className="text-3xl font-black text-white font-display mt-1 block">{audits.length}</span>
                        <span className="text-[9px] font-mono text-cyan-400 mt-2 block flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Core Analyzed</span>
                      </div>
                      <div className="p-3 bg-cyan-950/40 border border-cyan-900/20 text-cyan-400 rounded-xl">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 bg-[#0F172A] border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-xl group-hover:bg-amber-600/10 transition-all duration-300" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">New Backlog</span>
                        <span className="text-3xl font-black text-amber-400 font-display mt-1 block">
                          {leads.filter(l => l.status === "New").length + audits.filter(a => a.status === "New").length}
                        </span>
                        <span className="text-[9px] font-mono text-amber-500/80 mt-2 block flex items-center gap-1"><Clock className="w-3 h-3" /> Requires dispatch</span>
                      </div>
                      <div className="p-3 bg-amber-950/40 border border-amber-900/20 text-amber-400 rounded-xl">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    <div className="p-5 bg-[#0F172A] border border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl group-hover:bg-emerald-600/10 transition-all duration-300" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block">Deals Settled</span>
                        <span className="text-3xl font-black text-emerald-400 font-display mt-1 block">
                          {leads.filter(l => l.status === "Closed").length + audits.filter(a => a.status === "Closed").length}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 mt-2 block flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Closed / Completed</span>
                      </div>
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/20 text-emerald-400 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Funnel breakdown & System resources */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Lead Funnel Chart */}
                    <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Conversion Channel Velocity</h3>
                        <span className="text-[9px] font-mono text-[#06B6D4] uppercase bg-cyan-950/60 border border-cyan-900/40 px-2 py-0.5 rounded">Dynamic</span>
                      </div>
                      <div className="space-y-3.5 pt-2">
                        {/* Status bar chart representation */}
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                            <span>New Leads ({leads.filter(l => l.status === "New").length + audits.filter(a => a.status === "New").length})</span>
                            <span className="font-bold text-red-400">
                              {Math.round(((leads.filter(l => l.status === "New").length + audits.filter(a => a.status === "New").length) / (leads.length + audits.length || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-red-500 h-full rounded-full transition-all" 
                              style={{ width: `${Math.min(100, Math.round(((leads.filter(l => l.status === "New").length + audits.filter(a => a.status === "New").length) / (leads.length + audits.length || 1)) * 100))}%` }} 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                            <span>Contacted / Scheduled ({leads.filter(l => l.status === "Contacted").length + audits.filter(a => a.status === "Contacted").length})</span>
                            <span className="font-bold text-amber-400">
                              {Math.round(((leads.filter(l => l.status === "Contacted").length + audits.filter(a => a.status === "Contacted").length) / (leads.length + audits.length || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all" 
                              style={{ width: `${Math.min(100, Math.round(((leads.filter(l => l.status === "Contacted").length + audits.filter(a => a.status === "Contacted").length) / (leads.length + audits.length || 1)) * 100))}%` }} 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                            <span>Production / In Progress ({leads.filter(l => l.status === "In Progress").length + audits.filter(a => a.status === "In Progress").length})</span>
                            <span className="font-bold text-blue-400">
                              {Math.round(((leads.filter(l => l.status === "In Progress").length + audits.filter(a => a.status === "In Progress").length) / (leads.length + audits.length || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-blue-500 h-full rounded-full transition-all" 
                              style={{ width: `${Math.min(100, Math.round(((leads.filter(l => l.status === "In Progress").length + audits.filter(a => a.status === "In Progress").length) / (leads.length + audits.length || 1)) * 100))}%` }} 
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                            <span>Closed Won Deals ({leads.filter(l => l.status === "Closed").length + audits.filter(a => a.status === "Closed").length})</span>
                            <span className="font-bold text-emerald-400">
                              {Math.round(((leads.filter(l => l.status === "Closed").length + audits.filter(a => a.status === "Closed").length) / (leads.length + audits.length || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all" 
                              style={{ width: `${Math.min(100, Math.round(((leads.filter(l => l.status === "Closed").length + audits.filter(a => a.status === "Closed").length) / (leads.length + audits.length || 1)) * 100))}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-850/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span>EST. AGENT ACCELERATOR VELOCITY</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> High Operational Capacity</span>
                      </div>
                    </div>

                    {/* Right: Cloud Resources list */}
                    <div className="bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl space-y-4">
                      <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">Asset Registry Status</h3>
                      <div className="space-y-3 pt-1 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850">
                          <div className="flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            <span className="font-mono uppercase text-slate-400">Portfolio</span>
                          </div>
                          <strong className="text-white font-mono">{projects.length} case studies</strong>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-[#06B6D4]" />
                            <span className="font-mono uppercase text-slate-400">Pricing PLANS</span>
                          </div>
                          <strong className="text-white font-mono">{pricingPlans.length} products</strong>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850">
                          <div className="flex items-center space-x-2">
                            <HelpCircle className="w-4 h-4 text-purple-400" />
                            <span className="font-mono uppercase text-slate-400">FAQ Inquiries</span>
                          </div>
                          <strong className="text-white font-mono">{faqs.length} records</strong>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-850">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-pink-400" />
                            <span className="font-mono uppercase text-slate-400">Testimonials</span>
                          </div>
                          <strong className="text-white font-mono">{testimonials.length} reviews</strong>
                        </div>
                      </div>

                      <p className="text-[10px] font-mono text-slate-500 leading-relaxed pt-2">All assets are cached locally with Firestore replication pipelines active on change events.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  2. LEADS MANAGEMENT TABLE LIST VIEW
                  ----------------------------------------------------------- */}
              {activeTab === "leads" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Leads Registry</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Enterprise digital transformation consultations received.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={globalSearch}
                          onChange={(e) => { setGlobalSearch(e.target.value); setLeadsPage(1); }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setLeadsPage(1); }}
                        className="bg-slate-950 border border-slate-850 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        title="Filter Status"
                      >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Main Grid: list & details panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Table list */}
                    <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-850 text-[10px] font-mono tracking-wider text-slate-500 uppercase bg-slate-950/25">
                              <th className="py-4 px-5 font-bold">Client / Company</th>
                              <th className="py-4 px-5 font-bold">Inbound Services</th>
                              <th className="py-4 px-5 font-bold">Inbound Date</th>
                              <th className="py-4 px-5 font-bold text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60">
                            {paginatedLeads.length > 0 ? (
                              paginatedLeads.map((lead) => {
                                const isSelected = selectedLead?.timestamp === lead.timestamp;
                                return (
                                  <tr 
                                    key={lead.id || lead.timestamp}
                                    onClick={() => { setSelectedLead(lead); setSelectedAudit(null); }}
                                    className={`cursor-pointer transition-all ${
                                      isSelected ? "bg-blue-600/10" : "hover:bg-slate-900/30"
                                    }`}
                                  >
                                    <td className="py-4 px-5">
                                      <div className="font-bold text-white text-xs">{lead.name}</div>
                                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{lead.company || "No Company Specified"}</div>
                                    </td>
                                    <td className="py-4 px-5">
                                      <div className="flex flex-wrap gap-1">
                                        {lead.services.slice(0, 2).map((s, idx) => (
                                          <span key={idx} className="text-[9px] font-mono bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400">{s}</span>
                                        ))}
                                        {lead.services.length > 2 && <span className="text-[8px] font-mono text-slate-500 px-1">+{lead.services.length - 2} more</span>}
                                      </div>
                                    </td>
                                    <td className="py-4 px-5 font-mono text-[10px] text-slate-400">
                                      {new Date(lead.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                      <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${getStatusColor(lead.status)}`}>
                                        {lead.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500 font-mono text-xs">No leads match your search credentials.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination buttons */}
                      <div className="p-4 bg-slate-950/40 border-t border-slate-850/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Page {leadsPage} of {leadsTotalPages}</span>
                        <div className="flex space-x-1">
                          <button
                            disabled={leadsPage === 1}
                            onClick={() => setLeadsPage(prev => Math.max(1, prev - 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                            title="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={leadsPage === leadsTotalPages}
                            onClick={() => setLeadsPage(prev => Math.min(leadsTotalPages, prev + 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                            title="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Leads detail drawer */}
                    <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl space-y-5 shadow-sm text-xs">
                      {selectedLead ? (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                            <div>
                              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Consultation Inquiry</span>
                              <h3 className="font-display text-lg font-bold text-white mt-0.5">{selectedLead.name}</h3>
                              <p className="text-slate-500 font-mono text-[10px] mt-0.5">{selectedLead.email}</p>
                            </div>

                            <div className="space-y-1 text-right">
                              <span className="text-[8px] font-mono text-slate-500 block font-bold">TRANSITION STATUS</span>
                              <select
                                value={selectedLead.status}
                                onChange={(e) => handleUpdateStatus(selectedLead.id || "local_" + new Date(selectedLead.timestamp).getTime(), "contact", e.target.value as Lead["status"])}
                                className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2.5 py-1 text-[11px] rounded-lg focus:outline-none"
                                disabled={actionLoading}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Company</span>
                              <span className="text-white text-xs font-semibold mt-0.5 block">{selectedLead.company || "Independent"}</span>
                            </div>
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Estimated Budget</span>
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 block">{selectedLead.budget} {selectedLead.currency}</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Inbound Services Needed</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedLead.services.map((svc, i) => (
                                <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-300 font-semibold">{svc}</span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold font-sans">Strategic Client Message</span>
                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-850/60 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            <span>Capture Timestamp: {new Date(selectedLead.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                          <Users className="w-12 h-12 text-slate-800" />
                          <div>
                            <h4 className="font-bold text-slate-400">No Lead Selected</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Select any operational client card from the left registry spreadsheet to view contact and budget specifications.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  3. AUDITS REQUESTS TABLE LIST VIEW
                  ----------------------------------------------------------- */}
              {activeTab === "audits" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">AI Website Audits</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Automated conversion and SEO code diagnostics requested.</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search audits..."
                          value={globalSearch}
                          onChange={(e) => { setGlobalSearch(e.target.value); setAuditsPage(1); }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setAuditsPage(1); }}
                        className="bg-slate-950 border border-slate-850 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        title="Filter Status"
                      >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Audits Main content layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left List table */}
                    <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-850 text-[10px] font-mono tracking-wider text-slate-500 uppercase bg-slate-950/25">
                              <th className="py-4 px-5 font-bold">Website URL</th>
                              <th className="py-4 px-5 font-bold">SEO/UX/SPD</th>
                              <th className="py-4 px-5 font-bold text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60">
                            {paginatedAudits.length > 0 ? (
                              paginatedAudits.map((audit) => {
                                const isSelected = selectedAudit?.timestamp === audit.timestamp;
                                return (
                                  <tr 
                                    key={audit.id || audit.timestamp}
                                    onClick={() => { setSelectedAudit(audit); setSelectedLead(null); }}
                                    className={`cursor-pointer transition-all ${
                                      isSelected ? "bg-blue-600/10" : "hover:bg-slate-900/30"
                                    }`}
                                  >
                                    <td className="py-4 px-5">
                                      <div className="font-bold text-white text-xs truncate max-w-[180px] sm:max-w-xs">{audit.url.replace(/https?:\/\//g, '')}</div>
                                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{audit.industry}</div>
                                    </td>
                                    <td className="py-4 px-5 font-mono text-[10px]">
                                      <div className="flex space-x-2 text-slate-400">
                                        <span className="text-emerald-400">SEO:{audit.scores.seo}</span>
                                        <span className="text-cyan-400">UX:{audit.scores.ux}</span>
                                        <span className="text-blue-400">SPD:{audit.scores.performance}</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                      <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${getStatusColor(audit.status)}`}>
                                        {audit.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={3} className="py-12 text-center text-slate-500 font-mono text-xs">No audit reports match search criteria.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination buttons */}
                      <div className="p-4 bg-slate-950/40 border-t border-slate-850/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Page {auditsPage} of {auditsTotalPages}</span>
                        <div className="flex space-x-1">
                          <button
                            disabled={auditsPage === 1}
                            onClick={() => setAuditsPage(prev => Math.max(1, prev - 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                            title="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={auditsPage === auditsTotalPages}
                            onClick={() => setAuditsPage(prev => Math.min(auditsTotalPages, prev + 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                            title="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right detailed Audit Card */}
                    <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl space-y-5 shadow-sm text-xs">
                      {selectedAudit ? (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                            <div>
                              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Performance Audit</span>
                              <h3 className="font-display text-lg font-bold text-white mt-0.5 break-all">{selectedAudit.url}</h3>
                              <p className="text-slate-500 font-mono text-[10px] mt-0.5">{selectedAudit.email}</p>
                            </div>

                            <div className="space-y-1 text-right shrink-0">
                              <span className="text-[8px] font-mono text-slate-500 block font-bold">TRANSITION STATUS</span>
                              <select
                                value={selectedAudit.status}
                                onChange={(e) => handleUpdateStatus(selectedAudit.id || "local_" + new Date(selectedAudit.timestamp).getTime(), "audit", e.target.value as Lead["status"])}
                                className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2.5 py-1 text-[11px] rounded-lg focus:outline-none"
                                disabled={actionLoading}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-emerald-400">
                              <strong className="text-base font-bold font-mono">{selectedAudit.scores.seo}</strong>
                              <span className="text-[8px] font-mono text-slate-500 block mt-0.5 uppercase">SEO</span>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-cyan-400">
                              <strong className="text-base font-bold font-mono">{selectedAudit.scores.ux}</strong>
                              <span className="text-[8px] font-mono text-slate-500 block mt-0.5 uppercase">UX</span>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-blue-400">
                              <strong className="text-base font-bold font-mono">{selectedAudit.scores.performance}</strong>
                              <span className="text-[8px] font-mono text-slate-500 block mt-0.5 uppercase">Speed</span>
                            </div>
                            <div className="bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-purple-400">
                              <strong className="text-base font-bold font-mono">{selectedAudit.scores.conversion}</strong>
                              <span className="text-[8px] font-mono text-slate-500 block mt-0.5 uppercase">Convert</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-slate-300 leading-relaxed font-sans">
                            <strong className="text-[#06B6D4] block font-mono text-[9px] uppercase tracking-wider mb-1">AI Executive Summary</strong>
                            <p>{selectedAudit.summary}</p>
                          </div>

                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Business Overview</span>
                            <p className="text-slate-400 leading-relaxed">{selectedAudit.description || "No specific business outline provided."}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>Industry Segment: {selectedAudit.industry}</span>
                            <span>Requested: {new Date(selectedAudit.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                          <FileText className="w-12 h-12 text-slate-800 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-slate-400">No Audit Selected</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Select any website path audit from the left register to inspect calculated scores and recommended action steps.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  4. PORTFOLIO CASE STUDY CRUD PANEL
                  ----------------------------------------------------------- */}
              {activeTab === "portfolio" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Portfolio Case Studies</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Manage modular corporate case studies rendering on landing view.</p>
                    </div>

                    <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                      <div className="relative w-full sm:w-48">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search case studies..."
                          value={globalSearch}
                          onChange={(e) => { setGlobalSearch(e.target.value); setPortfolioPage(1); }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-8 pr-4 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => setEditingProject({})}
                        className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Case Study</span>
                      </button>
                    </div>
                  </div>

                  {/* List + Editing Panel Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left case studies list card */}
                    <div className="lg:col-span-6 space-y-3.5">
                      {paginatedProjects.length > 0 ? (
                        paginatedProjects.map((p) => (
                          <div 
                            key={p.id}
                            className="p-4 bg-[#0F172A] border border-slate-800/80 rounded-2xl flex items-start gap-4 hover:border-slate-700 transition-all"
                          >
                            <img 
                              src={p.image} 
                              alt={p.title} 
                              referrerPolicy="no-referrer"
                              className="w-20 h-14 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950" 
                            />
                            <div className="flex-grow min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-xs truncate">{p.title}</h4>
                                <span className="text-[8px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 px-1.5 py-0.5 rounded uppercase font-semibold">{p.category}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">Client: {p.client}</p>
                              <p className="text-[10px] font-mono text-emerald-400 font-bold">{p.metrics} ({p.metricsLabel})</p>
                            </div>

                            <div className="flex space-x-1.5 shrink-0">
                              <button
                                onClick={() => setEditingProject(p)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg"
                                title="Edit project specs"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-850 rounded-lg"
                                title="Delete case study"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 font-mono py-12">No portfolio items found.</p>
                      )}

                      {/* Pagination buttons */}
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Page {portfolioPage} of {portfolioTotalPages}</span>
                        <div className="flex space-x-1">
                          <button
                            disabled={portfolioPage === 1}
                            onClick={() => setPortfolioPage(prev => Math.max(1, prev - 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={portfolioPage === portfolioTotalPages}
                            onClick={() => setPortfolioPage(prev => Math.min(portfolioTotalPages, prev + 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right dynamic add / editing form */}
                    <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl shadow-sm text-xs space-y-4">
                      {editingProject ? (
                        <form onSubmit={handleSaveProject} className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Portfolio Editor</span>
                              <h3 className="font-display text-sm font-bold text-white uppercase mt-0.5">{editingProject.id ? "Edit case study" : "Register new case study"}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingProject(null)}
                              className="text-slate-500 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Case Study Title *</label>
                              <input
                                type="text"
                                value={editingProject.title || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Client Name *</label>
                              <input
                                type="text"
                                value={editingProject.client || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, client: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Category Folder *</label>
                              <select
                                value={editingProject.category || "Web Apps"}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, category: e.target.value as Project["category"] } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                                required
                              >
                                <option value="Web Development">Web Development</option>
                                <option value="Web Apps">Web Apps</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="SEO & Marketing">SEO & Marketing</option>
                                <option value="Branding">Branding</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Graphic Cover URL</label>
                              <input
                                type="text"
                                value={editingProject.image || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, image: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                                placeholder="https://images.unsplash.com..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Growth Metric Code (e.g. +320%)</label>
                              <input
                                type="text"
                                value={editingProject.metrics || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, metrics: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                placeholder="e.g. +140% speed boost"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold">Metric Tagline / Label</label>
                              <input
                                type="text"
                                value={editingProject.metricsLabel || ""}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, metricsLabel: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                placeholder="e.g. interaction latency collapse"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">One-sentence brief summary *</label>
                            <input
                              type="text"
                              value={editingProject.description || ""}
                              onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">In-depth Technical Case study details</label>
                            <textarea
                              value={editingProject.fullDetails || ""}
                              onChange={(e) => setEditingProject(prev => prev ? { ...prev, fullDetails: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none h-16 resize-none"
                              placeholder="Describe structural libraries, API frameworks utilized..."
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            <span>Save case study to Firestore</span>
                          </button>
                        </form>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                          <Layers className="w-12 h-12 text-slate-800 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-slate-400">Case Study Editor Idle</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click 'Add Case Study' above or any project configuration pen to create or update active landing entries.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  5. PRICING TIERS MANUAL OVERRIDE
                  ----------------------------------------------------------- */}
              {activeTab === "pricing" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Pricing Framework override</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Edit price levels, timelines, features, and float badges across global tiers.</p>
                    </div>
                  </div>

                  {/* Pricing grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => {
                      const isEditing = editingPlan?.id === plan.id;
                      return (
                        <div 
                          key={plan.id}
                          className={`p-6 bg-[#0F172A] border rounded-2xl space-y-5 relative flex flex-col justify-between ${
                            isEditing ? "border-blue-500/80 ring-1 ring-blue-500/20" : "border-slate-800/80"
                          }`}
                        >
                          {plan.badge && (
                            <span className="absolute -top-3.5 right-4 bg-blue-600 text-white font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest font-black shadow-md shadow-blue-600/10">
                              {plan.badge}
                            </span>
                          )}

                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">{plan.id} plan tier</span>
                              <h3 className="font-display text-lg font-bold text-white mt-0.5">{plan.name}</h3>
                              <p className="text-slate-400 text-xs leading-relaxed mt-1">{plan.description}</p>
                            </div>

                            <div className="py-3 bg-slate-950/40 px-4 rounded-xl border border-slate-850 space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-mono">USD Level:</span>
                                <strong className="text-white">${plan.priceUSD.toLocaleString()}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-mono">EUR Level:</span>
                                <strong className="text-white">€{plan.priceEUR.toLocaleString()}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-mono">INR Level:</span>
                                <strong className="text-white">₹{plan.priceINR.toLocaleString()}</strong>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Operational Timeline</span>
                              <span className="text-xs text-slate-300 block font-semibold">{plan.timeline}</span>
                            </div>

                            <div className="space-y-1 text-[11px]">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Features bullet points</span>
                              {plan.features.slice(0, 4).map((f, i) => (
                                <div key={i} className="flex items-start space-x-1.5 text-slate-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                  <span className="truncate">{f}</span>
                                </div>
                              ))}
                              {plan.features.length > 4 && <span className="text-[10px] text-slate-500 pl-5">+{plan.features.length - 4} more details</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="w-full py-2.5 mt-2 bg-slate-900 border border-slate-850 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Modify Tier parameters</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Editing Overlay overlay slider */}
                  {editingPlan && (
                    <div className="fixed inset-0 z-50 bg-[#070A13]/85 backdrop-blur-md flex items-center justify-center p-4">
                      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-scaleIn text-left text-xs">
                        
                        <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-mono text-cyan-400 uppercase block font-bold">Plan Configuration</span>
                            <h3 className="font-display text-lg font-bold text-white uppercase mt-0.5">Edit {editingPlan.id} parameters</h3>
                          </div>
                          <button onClick={() => setEditingPlan(null)} className="text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSavePricing} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tier Display Name *</label>
                            <input
                              type="text"
                              value={editingPlan.name}
                              onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">USD price ($)</label>
                              <input
                                type="number"
                                value={editingPlan.priceUSD}
                                onChange={(e) => setEditingPlan({ ...editingPlan, priceUSD: Number(e.target.value) || 0 })}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">EUR price (€)</label>
                              <input
                                type="number"
                                value={editingPlan.priceEUR}
                                onChange={(e) => setEditingPlan({ ...editingPlan, priceEUR: Number(e.target.value) || 0 })}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">INR price (₹)</label>
                              <input
                                type="number"
                                value={editingPlan.priceINR}
                                onChange={(e) => setEditingPlan({ ...editingPlan, priceINR: Number(e.target.value) || 0 })}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Timeline</label>
                              <input
                                type="text"
                                value={editingPlan.timeline}
                                onChange={(e) => setEditingPlan({ ...editingPlan, timeline: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Badge Ribbons</label>
                              <input
                                type="text"
                                value={editingPlan.badge || ""}
                                onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                placeholder="e.g. Best Value, Hot"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Plan Description *</label>
                            <input
                              type="text"
                              value={editingPlan.description}
                              onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Features (one per line) *</label>
                            <textarea
                              value={editingPlan.features.join("\n")}
                              onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split("\n").filter(Boolean) })}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-300 font-mono h-24 resize-none"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            <span>Update Tier specification</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* -----------------------------------------------------------
                  6. FAQ ACCORDION MANAGEMENT
                  ----------------------------------------------------------- */}
              {activeTab === "faqs" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">FAQ Desk</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Control visual landing FAQs grouped by general category files.</p>
                    </div>

                    <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                      <div className="relative w-full sm:w-48">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search FAQs..."
                          value={globalSearch}
                          onChange={(e) => { setGlobalSearch(e.target.value); setFaqsPage(1); }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-8 pr-4 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => setEditingFAQ({ category: "general" })}
                        className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add FAQ</span>
                      </button>
                    </div>
                  </div>

                  {/* FAQ layout split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left List of FAQs */}
                    <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-850/60">
                        {paginatedFaqs.length > 0 ? (
                          paginatedFaqs.map((faq) => (
                            <div key={faq.id} className="p-4 flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-[8px] font-mono bg-blue-950/60 text-blue-300 border border-blue-900/40 px-1.5 py-0.5 rounded uppercase font-semibold">{faq.category}</span>
                                <h4 className="font-bold text-white text-xs mt-1">{faq.question}</h4>
                                <p className="text-[10px] text-slate-400 line-clamp-2">{faq.answer}</p>
                              </div>

                              <div className="flex space-x-1 shrink-0">
                                <button
                                  onClick={() => setEditingFAQ(faq)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFAQ(faq.id)}
                                  className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-850 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-500 font-mono text-xs py-12">No active FAQ inquiries matching specifications.</p>
                        )}
                      </div>

                      {/* Pagination buttons */}
                      <div className="p-4 bg-slate-950/40 border-t border-slate-850/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Page {faqsPage} of {faqsTotalPages}</span>
                        <div className="flex space-x-1">
                          <button
                            disabled={faqsPage === 1}
                            onClick={() => setFaqsPage(prev => Math.max(1, prev - 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={faqsPage === faqsTotalPages}
                            onClick={() => setFaqsPage(prev => Math.min(faqsTotalPages, prev + 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Editor card */}
                    <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl shadow-sm text-xs space-y-4">
                      {editingFAQ ? (
                        <form onSubmit={handleSaveFAQ} className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-mono text-[#06B6D4] uppercase block font-bold">Faq Editor</span>
                              <h3 className="font-display text-xs font-bold text-white uppercase mt-0.5">{editingFAQ.id ? "Edit FAQ" : "Add FAQ entry"}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingFAQ(null)} className="text-slate-500 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Inquiry Category *</label>
                            <select
                              value={editingFAQ.category || "general"}
                              onChange={(e) => setEditingFAQ(prev => prev ? { ...prev, category: e.target.value as FAQItem["category"] } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                              required
                            >
                              <option value="general">General</option>
                              <option value="services">Capabilities / Services</option>
                              <option value="process">Delivery / Process</option>
                              <option value="pricing">Settlements / Pricing</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Question *</label>
                            <input
                              type="text"
                              value={editingFAQ.question || ""}
                              onChange={(e) => setEditingFAQ(prev => prev ? { ...prev, question: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Answer *</label>
                            <textarea
                              value={editingFAQ.answer || ""}
                              onChange={(e) => setEditingFAQ(prev => prev ? { ...prev, answer: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none h-24 resize-none leading-relaxed"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            <span>Save FAQ entry</span>
                          </button>
                        </form>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                          <HelpCircle className="w-12 h-12 text-slate-850 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-slate-400">FAQ Editor Idle</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click 'Add FAQ' above or the edit button on any listed items to configure operational inquiries.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  7. TESTIMONIALS REVIEWS PANEL
                  ----------------------------------------------------------- */}
              {activeTab === "testimonials" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Client Testimonials</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Edit corporate testimonials and executive customer rating stars.</p>
                    </div>

                    <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                      <div className="relative w-full sm:w-48">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search endorsements..."
                          value={globalSearch}
                          onChange={(e) => { setGlobalSearch(e.target.value); setTestimonialsPage(1); }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-8 pr-4 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => setEditingTestimonial({ rating: 5 })}
                        className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Review</span>
                      </button>
                    </div>
                  </div>

                  {/* Testimonial layout split */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left list table */}
                    <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-850/60">
                        {paginatedTestimonials.length > 0 ? (
                          paginatedTestimonials.map((t) => (
                            <div key={t.id} className="p-4 flex items-start justify-between gap-4">
                              <div className="flex gap-3.5">
                                <img src={t.avatar} alt={t.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-800 bg-slate-950" />
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-xs">{t.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-mono">{t.role} at {t.company}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 italic line-clamp-2">"{t.content}"</p>
                                  <div className="flex items-center gap-1">
                                    {[...Array(t.rating)].map((_, idx) => (
                                      <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-1 shrink-0">
                                <button
                                  onClick={() => setEditingTestimonial(t)}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-850 rounded-lg"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTestimonial(t.id)}
                                  className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-850 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-500 font-mono text-xs py-12">No client testimonials registered currently.</p>
                        )}
                      </div>

                      {/* Pagination buttons */}
                      <div className="p-4 bg-slate-950/40 border-t border-slate-850/60 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Page {testimonialsPage} of {testimonialsTotalPages}</span>
                        <div className="flex space-x-1">
                          <button
                            disabled={testimonialsPage === 1}
                            onClick={() => setTestimonialsPage(prev => Math.max(1, prev - 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={testimonialsPage === testimonialsTotalPages}
                            onClick={() => setTestimonialsPage(prev => Math.min(testimonialsTotalPages, prev + 1))}
                            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right editor card */}
                    <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl shadow-sm text-xs space-y-4">
                      {editingTestimonial ? (
                        <form onSubmit={handleSaveTestimonial} className="space-y-4 animate-fadeIn">
                          <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-mono text-[#06B6D4] uppercase block font-bold">Endorsement Config</span>
                              <h3 className="font-display text-xs font-bold text-white uppercase mt-0.5">{editingTestimonial.id ? "Edit Review" : "Add Client Endorsement"}</h3>
                            </div>
                            <button type="button" onClick={() => setEditingTestimonial(null)} className="text-slate-500 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Client Name *</label>
                              <input
                                type="text"
                                value={editingTestimonial.name || ""}
                                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Corporate Role *</label>
                              <input
                                type="text"
                                value={editingTestimonial.role || ""}
                                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, role: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                placeholder="e.g. VP of Product"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Company Name</label>
                              <input
                                type="text"
                                value={editingTestimonial.company || ""}
                                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, company: e.target.value } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                                placeholder="e.g. Acme Corp"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Rating Stars (1-5)</label>
                              <select
                                value={editingTestimonial.rating || 5}
                                onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, rating: Number(e.target.value) } : null)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                              >
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Avatar Image URL</label>
                            <input
                              type="text"
                              value={editingTestimonial.avatar || ""}
                              onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, avatar: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none font-mono"
                              placeholder="https://images.unsplash.com..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Client Feedback quote *</label>
                            <textarea
                              value={editingTestimonial.content || ""}
                              onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, content: e.target.value } : null)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none h-20 resize-none leading-relaxed"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            <span>Save Testimonial quote</span>
                          </button>
                        </form>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                          <MessageSquare className="w-12 h-12 text-slate-850 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-slate-400">Testimonial Editor Idle</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click 'Add Review' above or any edit pen to configure active customer ratings.</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  8. USERS REGISTRY PANEL (SUPER ADMIN ONLY)
                  ----------------------------------------------------------- */}
              {activeTab === "users" && currentUser?.role === "super_admin" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div>
                    <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">User Accounts</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Manage credentials, activate status and assign role levels for security audits.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left roster list */}
                    <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-slate-850/60 bg-slate-950/20 flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Registered Administrators</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full font-bold">
                          {usersList.length} Active accounts
                        </span>
                      </div>

                      <div className="divide-y divide-slate-850/60">
                        {usersList.length > 0 ? (
                          usersList.map((user) => (
                            <div key={user.uid} className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center font-bold text-white uppercase font-sans">
                                  {user.fullName.charAt(0)}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white text-xs">{user.fullName}</h4>
                                    {user.uid === currentUser?.uid && (
                                      <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono text-[8px] px-1.5 py-0.2 rounded font-bold">YOU</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleUserRole(user.uid, user.role)}
                                  disabled={user.uid === currentUser?.uid}
                                  className={`px-2.5 py-1 text-[9px] font-mono rounded-full font-bold uppercase transition-all ${
                                    user.role === "super_admin"
                                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                      : "bg-slate-800 text-slate-400 hover:text-white"
                                  }`}
                                  title="Toggle operational authorization level"
                                >
                                  {user.role}
                                </button>

                                <button
                                  onClick={() => handleToggleUserStatus(user.uid, user.status)}
                                  disabled={user.uid === currentUser?.uid}
                                  className={`px-2.5 py-1 text-[9px] font-mono rounded-full font-bold uppercase transition-all ${
                                    user.status === "active"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}
                                  title="Deactivate or activate access key"
                                >
                                  {user.status}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(user.uid)}
                                  disabled={user.uid === currentUser?.uid}
                                  className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-850 rounded-lg disabled:opacity-30"
                                  title="Permanently terminate account credentials"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-600 mb-2" />
                            <p className="text-xs font-mono">Fetching administrator roster...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Create/Invite Card */}
                    <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800/80 p-6 rounded-2xl shadow-sm text-xs space-y-4">
                      <div className="border-b border-slate-850 pb-3">
                        <span className="text-[9px] font-mono text-[#06B6D4] uppercase block font-bold">Credential Provisioner</span>
                        <h3 className="font-display text-xs font-bold text-white uppercase mt-0.5">Register Administrative Credentials</h3>
                      </div>

                      <form onSubmit={handleCreateNewUser} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Account Full Name *</label>
                          <input
                            type="text"
                            value={newUserFullName}
                            onChange={(e) => setNewUserFullName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                            placeholder="e.g. Liam Sterling"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Secure Account Email *</label>
                          <input
                            type="email"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                            placeholder="liam@nextsitehub.com"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Temporary Password *</label>
                          <input
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                            placeholder="••••••••••••"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Administrative Role Tiers *</label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="admin">Admin (Manage Leads, Testimonials, FAQ, Portfolio)</option>
                            <option value="super_admin">Super Admin (Full Access, Settings, Users)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={isCreatingUser}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                          <span>Provision Admin Access</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------------------
                  9. DYNAMIC WEBSITE SETTINGS CONFIGS
                  ----------------------------------------------------------- */}
              {activeTab === "settings" && siteSettings && currentUser?.role === "super_admin" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div>
                    <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Site Configurations</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Control agency contact details, branding credentials, and layout details globally.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
                    <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
                      <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#06B6D4] uppercase block font-bold">Dynamic Metadata</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Saves in Firestore Realtime</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Company / Agency Title *</label>
                          <input
                            type="text"
                            value={siteSettings.siteTitle || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, siteTitle: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Global Support Email *</label>
                          <input
                            type="email"
                            value={siteSettings.contactEmail || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, contactEmail: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Corporate Phone number</label>
                          <input
                            type="text"
                            value={siteSettings.contactPhone || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, contactPhone: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Instagram Handle (@username)</label>
                          <input
                            type="text"
                            value={siteSettings.instagram || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, instagram: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                            placeholder="@nextsitehub"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">GitHub Site / Organization URL</label>
                          <input
                            type="text"
                            value={siteSettings.github || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, github: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none font-mono"
                            placeholder="https://github.com/..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Physical Address / HQ Location</label>
                          <input
                            type="text"
                            value={siteSettings.businessLocation || ""}
                            onChange={(e) => setSiteSettings(prev => prev ? { ...prev, businessLocation: e.target.value } : null)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                            placeholder="e.g. Bangalore, India"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Save global settings</span>
                    </button>
                  </form>

                  {/* Administrative Security & Credentials section */}
                  <div className="mt-12 pt-10 border-t border-slate-850 space-y-6">
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Security & Credentials</h2>
                      <p className="text-slate-500 text-xs mt-0.5">Manage administrative credentials, rotate passcodes, and monitor session histories securely.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <form onSubmit={handleSaveCredentials} className="lg:col-span-2 bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-sm text-left">
                        <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#06B6D4] uppercase block font-bold">Credential Rotation</span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">Enforces NIST SP 800-63B standards</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Username (Read-Only)</label>
                            <input
                              type="text"
                              disabled
                              value={currentUser?.username || currentUser?.email?.split("@")[0] || "admin"}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-500 font-mono focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">New Administrator Username *</label>
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                              placeholder="e.g. administrator"
                              required
                            />
                            <p className="text-[9px] text-slate-500 font-mono mt-1">5-32 characters, alphanumeric, underscores, hyphens.</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Recovery Email *</label>
                            <input
                              type="email"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3 text-white focus:outline-none"
                              placeholder="e.g. recovery@domain.com"
                              required
                            />
                            <p className="text-[9px] text-slate-500 font-mono mt-1">For secure passwords restoration & critical alerts.</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Workspace Passcode *</label>
                          <div className="relative">
                            <input
                              type={showCurrentPasscode ? "text" : "password"}
                              value={currentPasscode}
                              onChange={(e) => setCurrentPasscode(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none font-mono"
                              placeholder="••••••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPasscode(!showCurrentPasscode)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                            >
                              {showCurrentPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">New Workspace Passcode *</label>
                              <button
                                type="button"
                                onClick={handleGeneratePasscode}
                                className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Generate Strong</span>
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showNewPasscode ? "text" : "password"}
                                value={newPasscode}
                                onChange={(e) => setNewPasscode(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none font-mono"
                                placeholder="••••••••••••"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPasscode(!showNewPasscode)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                              >
                                {showNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {/* Simple Passcode Strength Meter */}
                            {newPasscode && (
                              <div className="mt-1.5 space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                                  <span>Strength Estimate:</span>
                                  <span className={
                                    newPasscode.length < 12 ? "text-red-400" :
                                    (/[A-Z]/.test(newPasscode) && /[a-z]/.test(newPasscode) && /[0-9]/.test(newPasscode) && /[^A-Za-z0-9]/.test(newPasscode)) ? "text-emerald-400" : "text-amber-400"
                                  }>
                                    {newPasscode.length < 12 ? "Too Short" :
                                     (/[A-Z]/.test(newPasscode) && /[a-z]/.test(newPasscode) && /[0-9]/.test(newPasscode) && /[^A-Za-z0-9]/.test(newPasscode)) ? "Strong (Complexity Met)" : "Weak (Requires Upper/Lower/Number/Special)"}
                                  </span>
                                </div>
                                <div className="h-1 bg-slate-850 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-300" style={{
                                    width: newPasscode.length < 12 ? "25%" :
                                           (/[A-Z]/.test(newPasscode) && /[a-z]/.test(newPasscode) && /[0-9]/.test(newPasscode) && /[^A-Za-z0-9]/.test(newPasscode)) ? "100%" : "60%",
                                    backgroundColor: newPasscode.length < 12 ? "#F87171" :
                                                     (/[A-Z]/.test(newPasscode) && /[a-z]/.test(newPasscode) && /[0-9]/.test(newPasscode) && /[^A-Za-z0-9]/.test(newPasscode)) ? "#34D399" : "#FBBF24"
                                  }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Confirm New Passcode *</label>
                            <div className="relative">
                              <input
                                type={showConfirmNewPasscode ? "text" : "password"}
                                value={confirmNewPasscode}
                                onChange={(e) => setConfirmNewPasscode(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2.5 pl-3 pr-10 text-white focus:outline-none font-mono"
                                placeholder="••••••••••••"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmNewPasscode(!showConfirmNewPasscode)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                              >
                                {showConfirmNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingCredentials}
                          className="py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingCredentials ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          <span>Rotate admin credentials</span>
                        </button>
                      </form>

                      {/* Security sidebar with policies & verification stats */}
                      <div className="space-y-4">
                        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 text-left text-xs space-y-4 shadow-sm">
                          <h4 className="text-[10px] font-mono text-[#06B6D4] uppercase block font-bold border-b border-slate-850 pb-2">Passcode Policies</h4>
                          <ul className="space-y-2 text-slate-400">
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>Minimum 12 character length</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>Uppercase & lowercase letters</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>Numeric digits (0-9)</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>Special characters (e.g. !@#$)</span>
                            </li>
                          </ul>
                          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-slate-400 text-[11px] leading-relaxed">
                            <Info className="w-4 h-4 text-cyan-400 mb-1.5" />
                            To maximize operations room safety, avoid using words that appear in the dictionary or match your administrator username.
                          </div>
                          {currentUser?.lastCredentialUpdate && (
                            <div className="pt-3 border-t border-slate-850 text-[10px] font-mono text-slate-500 flex flex-col gap-1">
                              <span>Last Credentials Rotation:</span>
                              <span className="text-slate-300 font-bold">{new Date(currentUser.lastCredentialUpdate).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Login audit logs section */}
                    <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-6 shadow-sm text-left">
                      <div className="border-b border-slate-850 pb-3 flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono text-[#06B6D4] uppercase block font-bold">Recent Sign-In History</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Session Audit Logs</span>
                      </div>
                      
                      {currentUser?.loginHistory && currentUser.loginHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-400 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-850 text-[10px] font-mono text-slate-500 uppercase">
                                <th className="py-2.5 px-3">Date & Time</th>
                                <th className="py-2.5 px-3">IP Address</th>
                                <th className="py-2.5 px-3">Geo-Location</th>
                                <th className="py-2.5 px-3">Browser / Device</th>
                                <th className="py-2.5 px-3">Session ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentUser.loginHistory.map((log: any, index: number) => (
                                <tr key={log.sessionId || index} className="border-b border-slate-850/50 hover:bg-slate-900/35 transition-colors">
                                  <td className="py-2.5 px-3 font-mono text-[#06B6D4]">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="py-2.5 px-3 font-mono text-white">{log.ip}</td>
                                  <td className="py-2.5 px-3">{log.location || "Approximate Bangalore, India"}</td>
                                  <td className="py-2.5 px-3 truncate max-w-xs" title={log.userAgent}>{log.userAgent || "Chrome Client"}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[10px]">{log.sessionId || "local_session"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-500 font-mono text-xs">
                          No historical logs present. A record of login entries will populate upon subsequent administrative handshakes.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secure confirmation dialog */}
                  {showConfirmDialog && (
                    <div className="fixed inset-0 bg-[#02040a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-fadeIn">
                      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-white uppercase tracking-tight">Rotate Credentials?</h3>
                            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                              You are about to modify your administrator credentials. This action will apply to all subsequent operations room sessions.
                            </p>
                            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 mt-4 space-y-1.5 text-xs font-mono">
                              <div className="flex justify-between">
                                <span className="text-slate-500">New Username:</span>
                                <span className="text-white font-bold">{newUsername}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Recovery Email:</span>
                                <span className="text-slate-300 font-bold">{recoveryEmail}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">New Passcode:</span>
                                <span className="text-cyan-400 font-bold">•••••••••••• (complex)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-850">
                          <button
                            type="button"
                            onClick={() => setShowConfirmDialog(false)}
                            className="py-2 px-4 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={confirmSaveCredentials}
                            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                          >
                            {isSavingCredentials && <Loader2 className="w-3 h-3 animate-spin" />}
                            <span>Confirm Rotation</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </div>

      </main>
    </div>
  );
}
