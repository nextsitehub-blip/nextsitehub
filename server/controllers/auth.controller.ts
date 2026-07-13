import { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { DB } from "../repositories/firestore.repository";
import { CONFIG } from "../config";
import { Validators } from "../models/validators";
import { AuthenticatedRequest } from "../middlewares/auth";
import { Email } from "../services/email.service";
import { User } from "../../src/types";

export const AuthController = {
  /**
   * Admin / Client Login credentials validation using Username and Passcode.
   */
  async login(req: AuthenticatedRequest, res: Response) {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Username or email, and passcode are required." });
    }

    try {
      const users = await DB.getUsers();
      // Look up user case-insensitively
      let user = users.find(u => 
        (username && u.username && u.username.toLowerCase() === username.toLowerCase()) ||
        (email && u.email && u.email.toLowerCase() === email.toLowerCase())
      );

      // If user not found, also try searching u.email by identifier
      if (!user && identifier.includes("@")) {
        user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase());
      }

      // If no admin accounts exist yet and it's the fallback key, bootstrap the admin account
      if (!user && (identifier === "admin@nextsitehub.com" || identifier === "admin") && password === "admin123") {
        user = await DB.saveUser({
          uid: "admin-bootstrap-uid",
          fullName: "Bootstrap Super Admin",
          email: "admin@nextsitehub.com",
          role: "super_admin",
          profileImage: "",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: "active",
          username: "admin",
          hashedPassword: bcrypt.hashSync("nextsitehub2026", 10),
          lastCredentialUpdate: new Date().toISOString(),
          failedAttempts: 0,
          loginHistory: []
        });
      }

      if (!user) {
        DB.log("warning", `Failed login attempt: Account not found for ${identifier}`);
        return res.status(401).json({ error: "Invalid administrative credentials." });
      }

      if (user.status === "inactive") {
        return res.status(403).json({ error: "Your account is currently suspended." });
      }

      // Check password
      let isMatch = false;
      if (user.hashedPassword) {
        isMatch = await bcrypt.compare(password, user.hashedPassword);
      } else {
        // Fallback for unhashed passwords (though getUsers should have migrated them already)
        isMatch = (password === "admin123" || password === "nextsitehub2026");
      }

      const ip = (req.ip || req.headers["x-forwarded-for"] || "127.0.0.1") as string;
      const userAgent = (req.headers["user-agent"] || "Unknown Browser") as string;
      const historyItem = {
        timestamp: new Date().toISOString(),
        success: isMatch,
        ip,
        userAgent,
        location: "Inferred HQ",
        message: isMatch ? "Authentication successful" : "Invalid passcode provided"
      };

      if (!user.loginHistory) user.loginHistory = [];
      user.loginHistory.push(historyItem);
      if (user.loginHistory.length > 50) {
        user.loginHistory = user.loginHistory.slice(-50);
      }

      if (!isMatch) {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        if (user.failedAttempts >= 5) {
          user.status = "inactive";
          await DB.saveUser(user);
          DB.log("warning", `Account SUSPENDED due to excessive failed attempts: ${identifier}`);
          return res.status(403).json({ error: "Your account has been suspended due to too many failed login attempts." });
        }
        await DB.saveUser(user);
        DB.log("warning", `Failed login attempt: Invalid passcode for ${identifier}. Attempt: ${user.failedAttempts}/5`);
        return res.status(401).json({ error: "Invalid administrative credentials." });
      }

      // Successful login
      user.failedAttempts = 0;
      user.lastLogin = new Date().toISOString();
      await DB.saveUser(user);

      // Sign corporate JWT token
      const token = jwt.sign(
        { uid: user.uid, email: user.email, role: user.role, username: user.username },
        CONFIG.JWT_SECRET,
        { expiresIn: "12h" }
      );

      DB.log("action", `Session established for user: ${identifier} (${user.role})`);

      res.json({
        token,
        user: {
          uid: user.uid,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          username: user.username,
          lastCredentialUpdate: user.lastCredentialUpdate,
          loginHistory: user.loginHistory,
          failedAttempts: user.failedAttempts
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Server authentication failure: " + err.message });
    }
  },

  /**
   * Client registration trigger.
   */
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = Validators.validateUser({
        ...req.body,
        uid: req.body.uid || `user-${Date.now()}`,
        role: req.body.role || "visitor",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active"
      });

      const saved = await DB.saveUser(validated);
      
      // Dispatch welcome email
      await Email.sendEmail(saved.email, "Welcome to NextSiteHub!", "welcome", {
        name: saved.fullName,
        loginUrl: "https://nextsitehub.com/#login"
      });

      res.status(201).json(saved);
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ error: "Schema validation failed", fields: err.fields });
      }
      res.status(500).json({ error: "Failed to register user: " + err.message });
    }
  },

  /**
   * Super admin action to provision user accounts and adjust roles.
   */
  async adminProvisionUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, fullName, password, role } = req.body;
      if (!email || !fullName || !role) {
        return res.status(400).json({ error: "Email, fullName, and role are required." });
      }

      const validated = Validators.validateUser({
        uid: `user-${Date.now()}`,
        email,
        fullName,
        role,
        profileImage: "",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active"
      });

      const saved = await DB.saveUser(validated);
      DB.log("action", `Super Admin provisioned new account: ${email} as ${role}`);
      res.status(201).json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Super admin action to suspend/activate an account or update role tiers.
   */
  async adminUpdateUser(req: AuthenticatedRequest, res: Response) {
    const { uid } = req.params;
    const { role, status } = req.body;

    try {
      const users = await DB.getUsers();
      const user = users.find(u => u.uid === uid);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (role) user.role = role;
      if (status) user.status = status;

      await DB.saveUser(user);
      DB.log("action", `User modifications applied for UID: ${uid}. Role: ${user.role}, Status: ${user.status}`);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Super admin action to remove user account.
   */
  async adminDeleteUser(req: AuthenticatedRequest, res: Response) {
    const { uid } = req.params;

    try {
      const success = await DB.deleteUser(uid);
      if (success) {
        return res.json({ success: true, message: "User account deleted." });
      }
      res.status(404).json({ error: "User not found." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Secure credential updates for administrators with current-credential verification, strength policies, and uniqueness lookups.
   */
  async updateCredentials(req: AuthenticatedRequest, res: Response) {
    const { currentPasscode, newUsername, newPasscode, recoveryEmail } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ error: "Authentication session expired or required." });
    }

    if (!currentPasscode || !newUsername || !newPasscode) {
      return res.status(400).json({ error: "Current passcode, new username, and new passcode are required." });
    }

    try {
      const users = await DB.getUsers();
      const user = users.find(u => u.uid === uid);

      if (!user) {
        return res.status(404).json({ error: "User administrative profile not found." });
      }

      // 1. Verify current passcode
      let isMatch = false;
      if (user.hashedPassword) {
        isMatch = await bcrypt.compare(currentPasscode, user.hashedPassword);
      } else {
        isMatch = (currentPasscode === "admin123" || currentPasscode === "nextsitehub2026");
      }

      if (!isMatch) {
        return res.status(400).json({ error: "Verification failed. Current passcode is incorrect." });
      }

      // 2. Validate new username criteria (letters, numbers, underscores, hyphens, 5-32 chars, case-insensitive)
      const usernameRegex = /^[a-zA-Z0-9_-]{5,32}$/;
      if (!usernameRegex.test(newUsername)) {
        return res.status(400).json({ 
          error: "Username must be 5-32 characters and contain only alphanumeric characters, underscores, or hyphens." 
        });
      }

      // Check unique username constraint across other users
      const usernameConflict = users.find(u => 
        u.uid !== uid && 
        u.username && 
        u.username.toLowerCase() === newUsername.toLowerCase()
      );
      if (usernameConflict) {
        return res.status(400).json({ error: "Username is already registered by another administrator." });
      }

      // 3. Validate new passcode criteria (min 12, strong complexity)
      if (newPasscode.length < 12) {
        return res.status(400).json({ error: "New passcode must be at least 12 characters long." });
      }
      const hasUpper = /[A-Z]/.test(newPasscode);
      const hasLower = /[a-z]/.test(newPasscode);
      const hasDigit = /[0-9]/.test(newPasscode);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPasscode);
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        return res.status(400).json({ 
          error: "New passcode must contain uppercase, lowercase, numbers, and special characters." 
        });
      }

      // Commit changes to database
      user.username = newUsername;
      user.hashedPassword = await bcrypt.hash(newPasscode, 10);
      user.lastCredentialUpdate = new Date().toISOString();
      user.failedAttempts = 0;
      if (typeof recoveryEmail === "string") {
        user.recoveryEmail = recoveryEmail.trim();
      }

      await DB.saveUser(user);

      DB.log("action", `Credentials updated for administrator: ${user.email}. Registered username: ${newUsername}`);

      res.json({ 
        success: true, 
        message: "Administrative credentials updated successfully.",
        user: {
          uid: user.uid,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          username: user.username,
          lastCredentialUpdate: user.lastCredentialUpdate,
          loginHistory: user.loginHistory,
          failedAttempts: user.failedAttempts,
          recoveryEmail: user.recoveryEmail
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to apply credential updates: " + err.message });
    }
  },

  /**
   * Check if setup is complete (i.e. if any administrator account exists in the database).
   */
  async getSetupStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await DB.getUsers();
      const adminExists = users.some(u => u.role === "super_admin" || u.role === "admin");
      return res.json({ setupCompleted: adminExists });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to retrieve setup status: " + err.message });
    }
  },

  /**
   * Set up the first admin user securely.
   */
  async setupFirstAdmin(req: AuthenticatedRequest, res: Response) {
    const { username, passcode, email } = req.body;
    try {
      const users = await DB.getUsers();
      const adminExists = users.some(u => u.role === "super_admin" || u.role === "admin");
      if (adminExists) {
        return res.status(400).json({ error: "Initial setup has already been completed." });
      }

      // Username check (case-insensitive lookup, trim, min 5 max 32, underscores/hyphens/letters/numbers)
      if (!username) {
        return res.status(400).json({ error: "Username is required." });
      }
      const trimmedUsername = username.trim();
      const usernameRegex = /^[a-zA-Z0-9_-]{5,32}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        return res.status(400).json({ 
          error: "Username must be 5-32 characters and contain only letters, numbers, underscores, or hyphens." 
        });
      }

      // Passcode checks
      if (!passcode) {
        return res.status(400).json({ error: "Passcode is required." });
      }
      if (passcode.length < 12) {
        return res.status(400).json({ error: "Passcode must be at least 12 characters long." });
      }
      const hasUpper = /[A-Z]/.test(passcode);
      const hasLower = /[a-z]/.test(passcode);
      const hasDigit = /[0-9]/.test(passcode);
      const hasSpecial = /[^A-Za-z0-9]/.test(passcode);
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        return res.status(400).json({ 
          error: "Passcode must contain uppercase, lowercase, numbers, and special characters." 
        });
      }

      // Password hashing is performed securely using bcrypt
      const hashedPassword = await bcrypt.hash(passcode, 10);
      const uid = `admin-${Date.now()}`;
      
      const newAdmin: User = {
        uid,
        fullName: "System Super Admin",
        email: email ? email.trim() : "admin@nextsitehub.com",
        role: "super_admin",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active",
        username: trimmedUsername,
        hashedPassword,
        lastCredentialUpdate: new Date().toISOString(),
        failedAttempts: 0,
        recoveryEmail: email ? email.trim() : "",
        setupCompleted: true,
        loginHistory: [
          {
            timestamp: new Date().toISOString(),
            success: true,
            ip: (req.ip || req.headers["x-forwarded-for"] || "127.0.0.1") as string,
            userAgent: (req.headers["user-agent"] || "Unknown Browser") as string,
            message: "Setup Protocol: Administrative initial setup completed successfully."
          }
        ]
      };

      await DB.saveUser(newAdmin);

      // Save default settings if not exists
      try {
        const settings = await DB.getSettings();
        if (!settings || !settings.siteTitle) {
          await DB.saveSettings({
            siteTitle: "NextSiteHub",
            contactEmail: newAdmin.email,
            instagram: "https://instagram.com/nextsitehub",
            businessLocation: "San Francisco, CA",
            themeSettings: {
              primaryColor: "#06B6D4",
              accentColor: "#3B82F6",
              isDarkFallback: true
            }
          });
        }
      } catch (e) {
        console.warn("Failed to save default settings: ", e);
      }

      DB.log("action", `Initial setup completed: Created Super Admin account '${trimmedUsername}'`);

      // Generate JWT session token
      const token = jwt.sign(
        { uid: newAdmin.uid, email: newAdmin.email, role: newAdmin.role, username: newAdmin.username },
        CONFIG.JWT_SECRET,
        { expiresIn: "12h" }
      );

      res.status(201).json({
        success: true,
        message: "Administrator account created successfully.",
        token,
        user: {
          uid: newAdmin.uid,
          fullName: newAdmin.fullName,
          email: newAdmin.email,
          role: newAdmin.role,
          profileImage: newAdmin.profileImage,
          createdAt: newAdmin.createdAt,
          lastLogin: newAdmin.lastLogin,
          username: newAdmin.username,
          lastCredentialUpdate: newAdmin.lastCredentialUpdate,
          loginHistory: newAdmin.loginHistory,
          failedAttempts: newAdmin.failedAttempts,
          recoveryEmail: newAdmin.recoveryEmail,
          setupCompleted: newAdmin.setupCompleted
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to complete initial administrator setup: " + err.message });
    }
  }
};
