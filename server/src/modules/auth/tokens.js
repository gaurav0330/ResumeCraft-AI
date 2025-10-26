import jwt from "jsonwebtoken";

const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "15m";

export function generateAccessToken(userId) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET not set");

  return jwt.sign({ sub: userId }, secret, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    return null;
  }
}
 