"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react"; // ✅ fixed import
import { Button } from "@/components/ui/button";
import { JobDescriptionBox } from "@/components/resume-tailor/JobDescriptionBox";
import { ResumeUploadBox } from "@/components/resume-tailor/ResumeUploadBox";
import { TailorResult } from "@/components/resume-tailor/TailorResult";
import { LaTeXPreview } from "@/components/resume-tailor/LaTeXPreview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/provider/ProtectedRoute";
import { useAuth } from "@/components/provider/AuthProviderWrapper";
import { useToast } from "@/components/provider/ToastProvider";

import {
  UPLOAD_RESUME_MUTATION,
  OPTIMIZE_RESUME_PREVIEW,
  ACCEPT_OPTIMIZED_RESUME,
} from "@/graphql/mutations/resume";
import { CREATE_JOB_DESCRIPTION_MUTATION } from "@/graphql/mutations/jobDescription";
import { GET_JOB_DESCRIPTIONS } from "@/graphql/queries/jobdescription";
import { GET_USER_RESUMES_QUERY } from "@/graphql/queries/resume";
import type {
  GetUserJobDescriptionsResponse,
  GetUserResumesResponse,
  CreateJobDescriptionResponse,
  UploadResumeResponse,
  OptimizeResumePreviewResponse,
  Resume,
} from "@/types/graphql";

function ResumeTailorContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [jobDescription, setJobDescription] = useState({ title: "", content: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState("");
  const [tailoredResume, setTailoredResume] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [activeStep, setActiveStep] = useState("step-1");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);

  // --- Apollo queries ---
  const { data: jdData, loading: jdLoading } = useQuery<GetUserJobDescriptionsResponse>(
    GET_JOB_DESCRIPTIONS,
    {
      variables: { userId: user?.id },
      skip: !user,
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: resumeData, loading: resumeLoading } = useQuery<GetUserResumesResponse>(
    GET_USER_RESUMES_QUERY,
    {
      variables: { userId: user?.id },
      skip: !user,
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [createJobDescription] = useMutation(CREATE_JOB_DESCRIPTION_MUTATION);
  const [uploadResume] = useMutation(UPLOAD_RESUME_MUTATION);
  const [optimizePreview, { data: previewData, loading: previewLoading }] = useMutation(
    OPTIMIZE_RESUME_PREVIEW
  );
  const [acceptOptimized, { loading: acceptLoading }] = useMutation(
    ACCEPT_OPTIMIZED_RESUME,
    { refetchQueries: [{ query: GET_USER_RESUMES_QUERY, variables: { userId: user?.id } }] }
  );

  // --- Hydrate from localStorage on first mount ---
  useEffect(() => {
    try {
      const savedJD = localStorage.getItem("rt_jd");
      if (savedJD) {
        const parsed = JSON.parse(savedJD) as { title: string; content: string };
        if (parsed?.title || parsed?.content) setJobDescription({ title: parsed.title || "", content: parsed.content || "" });
      }
      const savedLatex = localStorage.getItem("rt_latex");
      if (savedLatex) setLatexCode(savedLatex);
    } catch {}
  }, []);

  // --- Populate from DB and persist to localStorage ---
  useEffect(() => {
    const existingJD = jdData?.getUserJobDescriptions?.[0];
    const existingResume = resumeData?.getUserResumes?.[0];

    if (existingJD || existingResume) setHasExistingData(true);

    if (existingJD) {
      const nextJD = {
        title: existingJD.title || "",
        content: existingJD.content || "",
      };
      setJobDescription(nextJD);
      try { localStorage.setItem("rt_jd", JSON.stringify(nextJD)); } catch {}
    }

    if (existingResume) {
      const nextLatex = existingResume.latexCode || "";
      setLatexCode(nextLatex);
      try { localStorage.setItem("rt_latex", nextLatex); } catch {}
    }
  }, [jdData, resumeData]);

  // --- Controlled setters that also persist ---
  const setJobDescriptionPersist = useCallback((jd: { title: string; content: string }) => {
    setJobDescription(jd);
    try { localStorage.setItem("rt_jd", JSON.stringify(jd)); } catch {}
  }, []);

  const setLatexCodePersist = useCallback((val: string) => {
    setLatexCode(val);
    try { localStorage.setItem("rt_latex", val); } catch {}
  }, []);

  const existingJD = jdData?.getUserJobDescriptions?.[0];
  const existingResume = resumeData?.getUserResumes?.[0] as Resume | undefined;

  const handleOptimizePreview = async () => {
    if (!existingJD?.id || !existingResume?.id) {
      showToast({ variant: "warning", title: "Missing data", description: "Save a Job Description and a Resume first." });
      return;
    }
    try {
      setIsLoading(true);
      setIsOptimizing(true);

      // live step logs like a terminal
      setOptimizationLogs(["Initializing optimizer..."]);
      const addLog = (line: string) => setOptimizationLogs((prev) => [...prev, line]);
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // Run staged logs in the background while the mutation executes
      (async () => {
        await delay(350);
        addLog("Parsing resume (LaTeX) ✍️");
        await delay(400);
        addLog("Extracting sections: Education, Experience, Projects, Skills...");
        await delay(500);
        addLog("Reading job description 🧾");
        await delay(450);
        addLog("Computing semantic similarity with embeddings 🔎");
        await delay(600);
        addLog("Selecting strong bullet points and quantifiable wins ✅");
        await delay(550);
        addLog("Generating optimized LaTeX with aligned keywords ✨");
      })();

      const { data } = await optimizePreview({ variables: { resumeId: existingResume.id, jobDescriptionId: existingJD.id } });
      const result = (data as OptimizeResumePreviewResponse | undefined)?.optimizeResumePreview ??
        (previewData as OptimizeResumePreviewResponse | undefined)?.optimizeResumePreview;
      if (result?.optimizedLatex) {
        showToast({ variant: "success", title: "Preview ready", description: "Optimized preview generated." });
        addLog("Optimization complete ✔");
        addLog("Preparing comparison view...");
        const payload = {
          originalLatex: (existingResume?.optimizedLatex || existingResume?.latexCode) ?? "",
          optimizedLatex: result.optimizedLatex,
          changes: result.changes ?? [],
          resumeId: existingResume.id,
        };
        try { sessionStorage.setItem("resume_compare_payload", JSON.stringify(payload)); } catch {}
        router.push("/resume-tailor/compare");
      }
    } catch (e: any) {
      console.error(e);
      showToast({ variant: "destructive", title: "Preview failed", description: e.message || "Failed to generate preview" });
    } finally {
      setIsLoading(false);
      setIsOptimizing(false);
    }
  };

  const handleAccept = async () => {
    const optimizedLatex =
      (previewData as OptimizeResumePreviewResponse | undefined)?.optimizeResumePreview?.optimizedLatex;
    if (!optimizedLatex || !existingResume?.id) return;
    try {
      await acceptOptimized({ variables: { resumeId: existingResume.id, optimizedLatex } });
      showToast({ variant: "success", title: "Saved", description: "Optimized resume saved." });
    } catch (e: any) {
      console.error(e);
      showToast({ variant: "destructive", title: "Save failed", description: e.message || "Failed to save optimized resume" });
    }
  };

  const handleReject = () => {
    // Simply discard preview from UI
    setIsResultVisible(false);
    setTailoredResume("");
  };

  const handleTailorResume = async () => {
    if (!jobDescription.title || !jobDescription.content) {
      showToast({ variant: "warning", title: "Missing fields", description: "Please fill the job title and description." });
      return;
    }

    if (!resumeFile && !latexCode.trim()) {
      showToast({ variant: "warning", title: "Resume required", description: "Upload a .tex file or paste LaTeX code." });
      return;
    }

    try {
      setIsLoading(true);
      setIsResultVisible(true);
      setTailoredResume("🧠 Saving job description and uploading resume...");

      // Create or update job description
      const { data: jobData } = await createJobDescription({
        variables: { title: jobDescription.title, content: jobDescription.content },
      });

      // Upload resume
      const { data: uploadedResumeData } = await uploadResume({
        variables: {
          title: jobDescription.title,
          latexCode: latexCode || undefined,
          file: resumeFile || undefined,
          fileType: resumeFile?.type || (latexCode ? "text/latex" : undefined),
        },
        context: { hasUpload: true },
      });

      const job = (jobData as CreateJobDescriptionResponse)?.createJobDescription;
      const resume = (uploadedResumeData as UploadResumeResponse)?.uploadResume;

      setTailoredResume(
        `✅ Created job "${job?.title}" and uploaded "${resume?.title}"\n` +
          `🗂️ Type: ${resume?.fileType || "LaTeX Code"}\n` +
          `📅 ${resume?.createdAt ? new Date(resume.createdAt).toLocaleString() : "Just now"}\n` +
          `${resume?.fileUrl ? "📎 File URL: " + resume.fileUrl : ""}`
      );
      showToast({ variant: "success", title: "Uploaded", description: "Job and resume saved." });
    } catch (error: any) {
      console.error("Operation failed:", error);
      setTailoredResume(`❌ Operation failed: ${error.message}`);
      showToast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (jdLoading || resumeLoading) {
    return <div className="text-center py-20 text-gray-500">Loading your data...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Resume Tailor</h1>
          <p className="text-muted-foreground">Follow the steps to tailor and preview your resume.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Tabs value={activeStep} onValueChange={setActiveStep}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="step-1">1. Job</TabsTrigger>
                <TabsTrigger value="step-2">2. Resume</TabsTrigger>
                <TabsTrigger value="step-3">3. Tailor</TabsTrigger>
              </TabsList>

              <TabsContent value="step-1" className="mt-4">
                <JobDescriptionBox value={jobDescription} onChange={setJobDescriptionPersist} />
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setActiveStep("step-2")}>Continue</Button>
                </div>
              </TabsContent>

              <TabsContent value="step-2" className="mt-4">
                <ResumeUploadBox
                  onFileSelect={setResumeFile}
                  onLatexChange={setLatexCodePersist}
                  latexValue={latexCode}
                />
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" onClick={() => setActiveStep("step-1")}>
                    Back
                  </Button>
                  <Button onClick={() => setActiveStep("step-3")} disabled={!resumeFile && !latexCode.trim()}>
                    Continue
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="step-3" className="mt-4 space-y-4">
                <Button onClick={handleTailorResume} disabled={isLoading} className="w-full">
                  {isLoading ? "Processing..." : "Tailor Resume"}
                </Button>

                {isOptimizing && (
  <div className="rounded-lg border bg-[#0D1117] text-[#C9D1D9] font-mono text-sm shadow-inner overflow-hidden">
    {/* Terminal Header */}
    <div className="flex items-center gap-2 px-3 py-2 bg-[#161B22] border-b border-gray-800">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
      </div>
      <span className="text-xs text-gray-400 ml-2">Optimization Log</span>
    </div>

    {/* Terminal Body */}
    <div
      className="px-4 py-3 h-60 overflow-y-auto whitespace-pre-wrap leading-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      id="terminal-log"
    >
      {optimizationLogs.map((line, idx) => (
        <div key={idx} className="flex items-start">
          <span className="text-[#58A6FF] mr-2">$</span>
          <span>{line}</span>
        </div>
      ))}
      <span className="animate-pulse text-[#58A6FF] ml-2">▋</span>
    </div>
  </div>
)}


                {hasExistingData && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Optimize for this JD</h3>
                      <Button onClick={handleOptimizePreview} disabled={isLoading || previewLoading}>
                        {previewLoading ? "Analyzing..." : "Optimize"}
                      </Button>
                    </div>
                    {(previewData as OptimizeResumePreviewResponse | undefined)?.optimizeResumePreview && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <LaTeXPreview
                            title="Original"
                            latexCode={(existingResume?.optimizedLatex || existingResume?.latexCode) ?? ""}
                          />
                          <LaTeXPreview
                            title="Optimized Preview"
                            latexCode={
                              (previewData as OptimizeResumePreviewResponse).optimizeResumePreview.optimizedLatex
                            }
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={handleAccept} disabled={acceptLoading}>
                            Accept & Save
                          </Button>
                          <Button onClick={handleReject} variant="outline">
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {latexCode ? (
              <div className="space-y-6">
                <TailorResult tailoredResume={tailoredResume} latexCode={latexCode} />

                {hasExistingData && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Optimization ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to step 3 to run optimization and compare changes.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border p-12 min-h-[500px] flex items-center justify-center bg-card">
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-foreground/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Add Your Resume</h3>
                  <p className="text-muted-foreground">Upload a .tex file or paste LaTeX code to see the preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Correct closing of component
export default function ResumeTailorPage() {
  return (
    <ProtectedRoute>
      <ResumeTailorContent />
    </ProtectedRoute>
  );
}
