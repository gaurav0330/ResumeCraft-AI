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
};
