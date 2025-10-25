import argon2 from "argon2";
import crypto from "crypto";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "secret";

export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

export function hashRefreshToken(token) {
  return crypto
    .createHmac("sha256", REFRESH_TOKEN_SECRET)
    .update(token)
    .digest("hex");
}
