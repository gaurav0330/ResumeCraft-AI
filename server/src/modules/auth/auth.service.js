import crypto from "crypto";
import { prisma } from "../../db/prisma.js";
import { hashPassword, verifyPassword, hashRefreshToken } from "./hash.js";
import { generateAccessToken } from "./tokens.js";

const REFRESH_EXPIRY_DAYS = Number(process.env.REFRESH_EXPIRY_DAYS || 7);

export async function registerUser(email, password) {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({ data: { email, passwordHash } });
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id);

  const refreshToken = crypto.randomBytes(48).toString("hex");
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: { userId: user.id, refreshTokenHash, expiresAt },
  });

  return { accessToken, refreshToken, user };
}

export async function refreshTokens(refreshToken) {
  const hashed = hashRefreshToken(refreshToken);
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash: hashed, revoked: false },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date())
    throw new Error("Invalid refresh token");

  await prisma.session.update({
    where: { id: session.id },
    data: { revoked: true },
  });

  const newRefreshToken = crypto.randomBytes(48).toString("hex");
  const newHash = hashRefreshToken(newRefreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: { userId: session.userId, refreshTokenHash: newHash, expiresAt },
  });

  const newAccessToken = generateAccessToken(session.userId);
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: session.user,
  };
}

export async function logoutUser(userId) {
  await prisma.session.updateMany({
    where: { userId },
    data: { revoked: true },
  });
  return true;
}
