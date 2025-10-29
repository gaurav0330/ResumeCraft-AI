import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  loginOrCreateNeonUser,
} from "../../modules/auth/auth.service.js";
import { verifyAccessToken } from "../../modules/auth/tokens.js";
import { prisma } from "../../db/prisma.js";
import { verifyStackIdToken } from "../../modules/auth/stackVerify.js";

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return user;
    },
  },
  Mutation: {
    register: async (_, { username, email, password }) => registerUser(username, email, password),

    login: async (_, { email, password }) => {
      const { accessToken, refreshToken, user } = await loginUser(
        email,
        password,
      );
      return { accessToken, user };
    },

    refreshToken: async (_, { refreshToken }) => {
      const { accessToken, user } = await refreshTokens(refreshToken);
      return { accessToken, user };
    },

    logout: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      await logoutUser(user.id);
      return true;
    },

    neonLogin: async (_, { email, name, stackToken }) => {
      const disableVerify = process.env.STACK_VERIFY_DISABLED === "true";

      if (!disableVerify && stackToken) {
        // Verify the provided Stack ID token and ensure it matches the email
        const payload = await verifyStackIdToken(stackToken);
        const tokenEmail = payload.email || payload["https://stack/email"];
        if (!tokenEmail || tokenEmail.toLowerCase() !== email.toLowerCase()) {
          throw new Error("Stack token email mismatch");
        }
      }

      const { accessToken, user } = await loginOrCreateNeonUser(email, name);
      return { accessToken, user };
    },
  },
};
