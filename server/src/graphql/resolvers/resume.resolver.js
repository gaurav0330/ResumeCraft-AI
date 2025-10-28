import { GraphQLUpload } from "graphql-upload-minimal";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { AuthenticationError } from "apollo-server-errors";
import { extractLatexSections } from "../../utils/latexParser.js";
import logger from "../../config/logger.js";
import { optimizeResume } from "../../services/resumeOptimizer.js";

export default {
  Upload: GraphQLUpload,

  Query: {
    getUserResumes: async (_, { userId }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      const idToUse = userId ? parseInt(userId) : user.id;
      if (userId && parseInt(userId) !== user.id) {
        throw new AuthenticationError("Cannot access another user's data");
      }
      return prisma.resume.findMany({ 
        where: { userId: idToUse },
        include: { sections: true }
      });
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
          include: { sections: true }
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
          
          // Extract and update sections from LaTeX code
          if (latexCode) {
            const rawSections = extractLatexSections(latexCode);
            // Deduplicate by sectionName (case-insensitive), keep first occurrence
            const seen = new Set();
            const sections = [];
            for (const s of rawSections) {
              const key = (s.sectionName || '').trim().toLowerCase();
              if (!key || seen.has(key)) continue;
              seen.add(key);
              sections.push(s);
            }
            const sectionNames = sections.map(s => s.sectionName);
            logger.info(`[DB] Updating resume ${existingResume.id}: extracted ${sections.length} sections -> ${JSON.stringify(sectionNames)}`);
            
            // Update sections atomically: delete ALL sections for this user, then insert new ones for current resume
            await prisma.$transaction(async (tx) => {
              await tx.resumeSection.deleteMany({ where: { resume: { userId: user.id } } });
              if (sections && sections.length > 0) {
                await tx.resumeSection.createMany({
                  data: sections.map(section => ({
                    resumeId: existingResume.id,
                    sectionName: section.sectionName,
                    content: section.content
                  }))
                });
              }
            });
            logger.info(`[DB] Stored sections for resume ${existingResume.id}: ${sections.length} rows`);
          }
          
          // Fetch updated resume with sections
          const resumeWithSections = await prisma.resume.findUnique({
            where: { id: existingResume.id },
            include: { sections: true }
          });
          
          console.log("Updated resume with sections:", resumeWithSections);
          return resumeWithSections;
        }
    
        // Create new resume
        const newResume = await prisma.resume.create({
          data: {
            userId: user.id,
            ...updatedData,
          },
        });
        
        // Extract and create sections from LaTeX code
        if (latexCode) {
          const rawSections = extractLatexSections(latexCode);
          // Deduplicate by sectionName (case-insensitive), keep first occurrence
          const seen = new Set();
          const sections = [];
          for (const s of rawSections) {
            const key = (s.sectionName || '').trim().toLowerCase();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            sections.push(s);
          }
          const sectionNames = sections.map(s => s.sectionName);
          logger.info(`[DB] Creating resume ${newResume.id}: extracted ${sections.length} sections -> ${JSON.stringify(sectionNames)}`);
          
          if (sections && sections.length > 0) {
            await prisma.resumeSection.createMany({
              data: sections.map(section => ({
                resumeId: newResume.id,
                sectionName: section.sectionName,
                content: section.content
              }))
            });
            logger.info(`[DB] Stored sections for resume ${newResume.id}: ${sections.length} rows`);
          } else {
            logger.info(`[DB] No sections detected for resume ${newResume.id}`);
          }
        }
        
        // Fetch created resume with sections
        const resumeWithSections = await prisma.resume.findUnique({
          where: { id: newResume.id },
          include: { sections: true }
        });
        
        console.log("Created resume with sections:", resumeWithSections);
        return resumeWithSections;
    
      } catch (error) {
        console.error("Error uploading/updating resume:", error);
        throw error;
      }
    },
    optimizeResumePreview: async (_, { resumeId, jobDescriptionId }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      const resume = await prisma.resume.findFirst({ where: { id: parseInt(resumeId), userId: user.id }, include: { sections: true } });
      if (!resume) throw new AuthenticationError("Resume not found or not accessible");
      const jd = await prisma.jobDescription.findFirst({ where: { id: parseInt(jobDescriptionId), userId: user.id } });
      if (!jd) throw new AuthenticationError("Job description not found or not accessible");
      const preview = await optimizeResume({ resume, jobDescription: jd });
      return preview;
    },
    acceptOptimizedResume: async (_, { resumeId, optimizedLatex }, { prisma, user }) => {
      if (!user) throw new AuthenticationError("Unauthorized");
      const resume = await prisma.resume.findFirst({ where: { id: parseInt(resumeId), userId: user.id } });
      if (!resume) throw new AuthenticationError("Resume not found or not accessible");
      const updated = await prisma.resume.update({ where: { id: resume.id }, data: { optimizedLatex } });
      return updated;
    },
  },
};
