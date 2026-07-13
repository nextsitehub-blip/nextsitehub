import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "nextsitehub-enterprise-secure-jwt-secret-key-2026",
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  EMAIL_SMTP: {
    HOST: process.env.SMTP_HOST || "smtp.mailtrap.io",
    PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 2525,
    USER: process.env.SMTP_USER || "",
    PASS: process.env.SMTP_PASS || "",
    FROM: process.env.SMTP_FROM || "no-reply@nextsitehub.com"
  },
  BACKUP_DIR: "./backups",
  MEDIA_DIR: "./public/uploads",
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",
  SYSTEM_TZ: "UTC",
};
