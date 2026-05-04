import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string) {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  // jwtSecret: required("JWT_SECRET", "dev-secret"),
  // jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
} as const;

export type Config = typeof config;