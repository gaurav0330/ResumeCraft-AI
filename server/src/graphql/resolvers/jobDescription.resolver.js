// server/src/graphql/resolvers/jobDescription.resolver.js
import { AuthenticationError } from "apollo-server-errors";

export default {
  Query: {
    getUserJobDescriptions: async (_, __, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      return prisma.jobDescription.findMany({ where: { userId: user.id } });
    },
  },

  Mutation: {
    createJobDescription: async (_, { title, content }, context) => {
      console.log('Context:', context); // Debug log
      const { prisma, user } = context;

      if (!prisma) {
        console.error('Prisma client is undefined');
        throw new Error('Database connection error');
      }

      if (!user) {
        console.error('User is not authenticated');
        throw new AuthenticationError("Unauthorized");
      }

      try {
        const result = await prisma.jobDescription.create({
          data: {
            userId: user.id,
            title,
            content,
          },
        });
        console.log('Created job description:', result); // Debug log
        return result;
      } catch (error) {
        console.error('Error creating job description:', error);
        throw error;
      }
    },
  },
};