import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "15m";

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
}
