import { prisma } from "../db/prisma.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";

export default async function context({ req }) {
  const auth = req.headers.authorization || "";
  let user = null;

  if (auth.startsWith("Bearer ")) {
    const token = auth.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (payload?.sub) {
      user = await prisma.user.findUnique({
        where: { id: Number(payload.sub) },
      });
    }
  }

  return { prisma, user };
}
