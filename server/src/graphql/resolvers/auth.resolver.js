import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
} from "../../modules/auth/auth.service.js";
import { verifyAccessToken } from "../../modules/auth/tokens.js";
import { prisma } from "../../db/prisma.js";

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
  },
};
