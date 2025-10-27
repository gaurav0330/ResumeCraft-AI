import { AuthenticationError } from "apollo-server-errors";

export default {
  Query: {
    getUserJobDescriptions: async (_, { userId }, { prisma, user }) => {
      // Still enforce auth
      if (!user) throw new AuthenticationError("Unauthorized");
    
      // Use provided userId if present, otherwise fallback to the logged-in user's ID
      const idToUse = userId ? parseInt(userId) : user.id;
    
      // (Optional: prevent querying other users' data)
      if (userId && parseInt(userId) !== user.id) {
        throw new AuthenticationError("Cannot access another user's data");
      }
    
      return prisma.jobDescription.findMany({
        where: { userId: idToUse },
      });
    },
    
  },

  Mutation: {
    createJobDescription: async (_, { title, content }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");

      try {
        // Check if user already has a JD
        const existingJD = await prisma.jobDescription.findFirst({
          where: { userId: user.id },
        });

        if (existingJD) {
          // Update existing JD
          const updatedJD = await prisma.jobDescription.update({
            where: { id: existingJD.id },
            data: { title, content },
          });
          console.log("Updated job description:", updatedJD);
          return updatedJD;
        }

        // Otherwise create new JD
        const newJD = await prisma.jobDescription.create({
          data: { userId: user.id, title, content },
        });
        console.log("Created job description:", newJD);
        return newJD;
      } catch (error) {
        console.error("Error creating/updating job description:", error);
        throw error;
      }
    },
  },
};
