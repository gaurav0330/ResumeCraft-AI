"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { JobDescriptionBox } from "@/components/resume-tailor/JobDescriptionBox";
import { ResumeUploadBox } from "@/components/resume-tailor/ResumeUploadBox";
import { TailorResult } from "@/components/resume-tailor/TailorResult";
import { UPLOAD_RESUME_MUTATION } from "@/graphql/mutations/resume";
import { CREATE_JOB_DESCRIPTION_MUTATION } from "@/graphql/mutations/jobDescription";
import ProtectedRoute from "@/components/provider/ProtectedRoute";

function ResumeTailorContent() {
  const [jobDescription, setJobDescription] = useState({
    title: "",
    content: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [tailoredResume, setTailoredResume] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  const [createJobDescription] = useMutation(CREATE_JOB_DESCRIPTION_MUTATION);
  const [uploadResume] = useMutation(UPLOAD_RESUME_MUTATION);

  const handleTailorResume = async () => {
    if (!jobDescription.title || !jobDescription.content) {
      alert("Please fill out the job title and description.");
      return;
    }
    if (!resumeFile && !latexCode.trim()) {
      alert("Please upload a .tex file or paste LaTeX code.");
      return;
    }

    try {
      setIsLoading(true);
      setIsResultVisible(true);
      setTailoredResume("🧠 Saving job description and uploading resume...");

      console.log('Auth Token:', localStorage.getItem('authToken'));
      console.log('Mutation variables:', {
        title: jobDescription.title,
        content: jobDescription.content,
      });

      // Create job description
      const { data: jobData } = await createJobDescription({
        variables: {
          title: jobDescription.title,
          content: jobDescription.content,
        },
      });

      console.log('Job Description Response:', jobData);

      if (!jobData?.createJobDescription) {
        throw new Error("Failed to create job description");
      }

  // Upload resume
  console.log('resumeFile instance:', resumeFile, resumeFile instanceof File);
  const { data: resumeData } = await uploadResume({
        variables: {
          title: jobDescription.title,
          latexCode: latexCode || undefined,
          file: resumeFile || undefined,
          fileType: resumeFile?.type || (latexCode ? "text/latex" : undefined),
        },
        context: {
          hasUpload: true,
        },
      });

      console.log('Resume Upload Response:', resumeData);

      if (!resumeData?.uploadResume) {
        throw new Error("Failed to upload resume");
      }

      const job = jobData.createJobDescription;
      const resume = resumeData.uploadResume;

      setTailoredResume(
        `✅ Created job "${job.title}" and uploaded "${resume.title}"\n` +
        `🗂️ Type: ${resume.fileType || "LaTeX Code"}\n` +
        `📅 ${new Date(resume.createdAt).toLocaleString()}\n` +
        `${resume.fileUrl ? `📎 File URL: ${resume.fileUrl}` : ""}`
      );

    } catch (error: any) {
      console.error("Operation failed:", error);
      if (error.networkError) {
        console.error('Network error:', error.networkError?.result || error.networkError);
      }
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', error.graphQLErrors);
      }
      setTailoredResume(`❌ Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold text-center pt-10 mb-8">
        Resume Tailor AI
      </h1>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isResultVisible
            ? "grid lg:grid-cols-2 gap-8 px-10 pb-10"
            : "flex items-center justify-center"
        }`}
      >
        <div
          className={`space-y-6 w-full ${
            isResultVisible ? "" : "max-w-xl p-6 bg-white rounded-2xl shadow-md"
          }`}
        >
          <JobDescriptionBox
            value={jobDescription}
            onChange={setJobDescription}
          />
          <ResumeUploadBox
            onFileSelect={setResumeFile}
            onLatexChange={setLatexCode}
          />
          <Button
            onClick={handleTailorResume}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Processing..." : "✂️ Tailor Resume"}
          </Button>
        </div>
        {isResultVisible && (
    
            <TailorResult tailoredResume={tailoredResume} />
    
        )}
      </div>
    </div>
  );
}

export default function ResumeTailorPage() {
  return (
     <ProtectedRoute>
      <ResumeTailorContent />
    </ProtectedRoute>
  );
}