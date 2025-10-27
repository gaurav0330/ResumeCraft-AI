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
    
      try {
        // Check if user already has a resume
        const existingResume = await prisma.resume.findFirst({
          where: { userId: user.id },
        });
    
        // Determine which field to keep based on input
        let updatedData = { title, fileType };
    
        if (latexCode && fileUrl) {
          throw new Error("Cannot provide both latexCode and file upload at the same time.");
        }
    
        if (latexCode) {
          updatedData.latexCode = latexCode;
          updatedData.fileUrl = null; // ensure mutual exclusivity
        } else if (fileUrl) {
          updatedData.fileUrl = fileUrl;
          updatedData.latexCode = null;
        }
    
        if (existingResume) {
          // Check if user reuploaded same data (no changes)
          const isSameLatex = latexCode && latexCode === existingResume.latexCode;
          const isSameFile = fileUrl && fileUrl === existingResume.fileUrl;
    
          if (isSameLatex || isSameFile) {
            console.log("No new content detected, skipping update.");
            return existingResume;
          }
    
          // Update existing resume
          const updatedResume = await prisma.resume.update({
            where: { id: existingResume.id },
            data: updatedData,
          });
          console.log("Updated resume:", updatedResume);
          return updatedResume;
        }
    
        // Create new resume
        const newResume = await prisma.resume.create({
          data: {
            userId: user.id,
            ...updatedData,
          },
        });
        console.log("Created resume:", newResume);
        return newResume;
    
      } catch (error) {
        console.error("Error uploading/updating resume:", error);
        throw error;
      }
    },
    
  },
};
