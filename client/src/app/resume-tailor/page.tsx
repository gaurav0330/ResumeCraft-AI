"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JobDescriptionBox } from "@/components/resume-tailor/JobDescriptionBox";
import { ResumeUploadBox } from "@/components/resume-tailor/ResumeUploadBox";
import { TailorResult } from "@/components/resume-tailor/TailorResult";

export default function ResumeTailorPage() {
  const [jobDescription, setJobDescription] = useState({
    title: "",
    description: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [tailoredResume, setTailoredResume] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  const handleTailorResume = () => {
    // Validation
    if (!jobDescription.title || !jobDescription.description) {
      alert("Please fill out the job title and job description.");
      return;
    }

    if (!resumeFile && !latexCode.trim()) {
      alert("Please upload a .tex file or paste your LaTeX code.");
      return;
    }

    // Start mock AI processing
    setIsLoading(true);
    setIsResultVisible(true);
    setTailoredResume("🧠 Tailoring your resume, please wait...");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setTailoredResume(
        "✅ Your tailored resume has been successfully generated based on the provided job description and resume input."
      );
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold text-center pt-10 mb-8">
        Resume Tailor AI
      </h1>

      {/* Layout */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isResultVisible
            ? "grid lg:grid-cols-2 gap-8 px-10 pb-10"
            : "flex items-center justify-center"
        }`}
      >
        {/* Left Side (Form Section) */}
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

        {/* Right Side (Tailor Result) */}
        {isResultVisible && (
          <div className="flex justify-center ">
         
              <TailorResult tailoredResume={tailoredResume} />
       
          </div>
        )}
      </div>
    </div>
  );
}
