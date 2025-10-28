import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

const requiredVars = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

for (const v of requiredVars) {
  if (!process.env[v]) {
    logger.error(`❌ Missing required env var: ${v}`);
    process.exit(1);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  dbUrl: process.env.DATABASE_URL,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  tokenExpiry: process.env.TOKEN_EXPIRY || "15000m",
  refreshExpiryDays: Number(process.env.REFRESH_EXPIRY_DAYS || 7),
  // AI key can be provided as HF_API_KEY or HUGGING_FACE_API_KEY
  aiKey: process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY || "",
};

if (!config.aiKey) {
  logger.warn("⚠️ HF_API_KEY/HUGGING_FACE_API_KEY not set. AI optimization will return unchanged sections.");
} else {
  const masked = config.aiKey.length > 8
    ? `${config.aiKey.slice(0, 4)}...${config.aiKey.slice(-4)}`
    : "(hidden)";
  logger.info(`🤖 AI key loaded (HF), using Bearer ${masked}`);
}
