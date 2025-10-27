// server/src/graphql/context.js
import { prisma } from "../db/prisma.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";

export async function createContext({ req }) {
  let user = null;
  
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        const decoded = verifyAccessToken(token);
        user = await prisma.user.findUnique({ 
          where: { id: decoded.sub }
        });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
  }

  return {
    prisma, // Make sure prisma is being passed here
    user,
  };
}