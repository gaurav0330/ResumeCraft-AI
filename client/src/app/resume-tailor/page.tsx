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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b">
        <h1 className="text-4xl font-bold text-center py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Resume Tailor AI
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 px-4 lg:px-12 py-8 max-w-8xl mx-auto">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {hasExistingData ? (
            // ✅ Show existing DB data (read-only)
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Your Saved Details</h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Job Description</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Title:</strong> {jobDescription.title}
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {jobDescription.content}
                  </p>
                </div>

                {resumeData?.getUserResumes?.[0]?.fileUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Uploaded File</h3>
                    <a
                      href={resumeData.getUserResumes[0].fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Uploaded Resume
                    </a>
                  </div>
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-lg"
              >
                {isLoading ? "⏳ Processing..." : "✂️ Tailor Resume"}
              </Button>
            </>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {latexCode ? (
            <TailorResult tailoredResume={tailoredResume} latexCode={latexCode} />
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Add Your Resume</h3>
                <p className="text-gray-500">Upload a .tex file or paste LaTeX code to see the preview</p>
              </div>
            </div>
          )}
        </div>
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
