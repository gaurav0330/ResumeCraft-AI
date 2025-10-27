"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { JobDescriptionBox } from "@/components/resume-tailor/JobDescriptionBox";
import { ResumeUploadBox } from "@/components/resume-tailor/ResumeUploadBox";
import { TailorResult } from "@/components/resume-tailor/TailorResult";
import { LaTeXPreview } from "@/components/resume-tailor/LaTeXPreview";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/provider/ProtectedRoute";
import { useAuth } from "@/components/provider/AuthProviderWrapper";

import { UPLOAD_RESUME_MUTATION } from "@/graphql/mutations/resume";
import { CREATE_JOB_DESCRIPTION_MUTATION } from "@/graphql/mutations/jobDescription";
import { GET_JOB_DESCRIPTIONS } from "@/graphql/queries/jobdescription";
import { GET_USER_RESUMES_QUERY } from "@/graphql/queries/resume";
import type { GetUserJobDescriptionsResponse, GetUserResumesResponse, CreateJobDescriptionResponse, UploadResumeResponse } from "@/types/graphql";

function ResumeTailorContent() {
  const { user } = useAuth();

  const [jobDescription, setJobDescription] = useState({ title: "", content: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [tailoredResume, setTailoredResume] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // --- Apollo queries ---
  const { data: jdData, loading: jdLoading } = useQuery<GetUserJobDescriptionsResponse>(GET_JOB_DESCRIPTIONS, {
    variables: { userId: user?.id },
    skip: !user,
  });

  const { data: resumeData, loading: resumeLoading } = useQuery<GetUserResumesResponse>(GET_USER_RESUMES_QUERY, {
    variables: { userId: user?.id },
    skip: !user,
  });

  const [createJobDescription] = useMutation(CREATE_JOB_DESCRIPTION_MUTATION);
  const [uploadResume] = useMutation(UPLOAD_RESUME_MUTATION);

  // --- Populate data from DB if exists ---
  useEffect(() => {
    const existingJD = jdData?.getUserJobDescriptions?.[0];
    const existingResume = resumeData?.getUserResumes?.[0];

    if (existingJD || existingResume) setHasExistingData(true);

    if (existingJD) {
      setJobDescription({
        title: existingJD.title || "",
        content: existingJD.content || "",
      });
    }

    if (existingResume) {
      setLatexCode(existingResume.latexCode || "");
    }
  }, [jdData, resumeData]);

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

      // Create or update job description
      const { data: jobData } = await createJobDescription({
        variables: {
          title: jobDescription.title,
          content: jobDescription.content,
        },
      });

      // Upload resume
      const { data: resumeData } = await uploadResume({
        variables: {
          title: jobDescription.title,
          latexCode: latexCode || undefined,
          file: resumeFile || undefined,
          fileType: resumeFile?.type || (latexCode ? "text/latex" : undefined),
        },
        context: { hasUpload: true },
      });

      const job = (jobData as CreateJobDescriptionResponse)?.createJobDescription;
      const resume = (resumeData as UploadResumeResponse)?.uploadResume;

      setTailoredResume(
        `✅ Created job "${job?.title}" and uploaded "${resume?.title}"\n` +
          `🗂️ Type: ${resume?.fileType || "LaTeX Code"}\n` +
          `📅 ${resume?.createdAt ? new Date(resume.createdAt).toLocaleString() : "Just now"}\n` +
          `${resume?.fileUrl ? `📎 File URL: ${resume.fileUrl}` : ""}`
      );
    } catch (error: any) {
      console.error("Operation failed:", error);
      setTailoredResume(`❌ Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (jdLoading || resumeLoading) {
    return <div className="text-center py-20 text-gray-500">Loading your data...</div>;
  }

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
          {hasExistingData ? (
            // ✅ Show existing DB data (read-only)
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Saved Details</h2>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Job Description</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Title:</strong> {jobDescription.title}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                  {jobDescription.content}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Resume</h3>
                {resumeData?.getUserResumes?.[0]?.fileUrl ? (
                  <div className="space-y-3">
                    <a
                      href={resumeData.getUserResumes[0].fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Uploaded Resume
                    </a>
                    {latexCode && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">LaTeX Preview:</h4>
                        <LaTeXPreview 
                          latexCode={latexCode} 
                          title=""
                          className="border-0 shadow-none"
                        />
                      </div>
                    )}
                  </div>
                ) : latexCode ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">LaTeX Preview:</h4>
                    <LaTeXPreview 
                      latexCode={latexCode} 
                      title=""
                      className="border-0 shadow-none"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No resume data available</p>
                )}
              </div>

              <Button
                onClick={() => setHasExistingData(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                ✏️ Edit / Re-tailor Resume
              </Button>
            </div>
          ) : (
            // 🧩 Editable form when no saved data
            <>
              <JobDescriptionBox value={jobDescription} onChange={setJobDescription} />
              <ResumeUploadBox onFileSelect={setResumeFile} onLatexChange={setLatexCode} latexValue={latexCode} />
              <Button
                onClick={handleTailorResume}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Processing..." : "✂️ Tailor Resume"}
              </Button>
            </>
          )}
        </div>

        {isResultVisible && <TailorResult tailoredResume={tailoredResume} latexCode={latexCode} />}
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
