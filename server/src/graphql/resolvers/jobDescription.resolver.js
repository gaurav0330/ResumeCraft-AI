import { AuthenticationError } from "apollo-server-errors";

export default {
  Query: {
    getUserJobDescriptions: async (_, __, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      return prisma.jobDescription.findMany({ where: { userId: user.id } });
    },
  },

  Mutation: {
    createJobDescription: async (_, { title, content }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");

      return prisma.jobDescription.create({
        data: {
          userId: user.id,
          title,
          content,
        },
      });
    },
  },
};
