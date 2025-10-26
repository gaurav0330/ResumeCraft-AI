import { GraphQLUpload } from "graphql-upload-minimal";


import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { AuthenticationError } from "apollo-server-errors";

export default {
  Upload: GraphQLUpload,

  Query: {
    getUserResumes: async (_, __, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      return prisma.resume.findMany({ where: { userId: user.id } });
    },
  },

  Mutation: {
    uploadResume: async (_, { title, latexCode, file, fileType }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");

      let fileUrl = null;

      if (file) {
        const { createReadStream, filename } = await file;
        const stream = createReadStream();
        fileUrl = await uploadToCloudinary(stream, filename);
      }

      return prisma.resume.create({
        data: {
          userId: user.id,
          title,
          latexCode,
          fileUrl,
          fileType,
        },
      });
    },
  },
};
