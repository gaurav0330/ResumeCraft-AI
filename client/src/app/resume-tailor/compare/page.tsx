"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { LaTeXPreview } from "@/components/resume-tailor/LaTeXPreview";
import { ACCEPT_OPTIMIZED_RESUME } from "@/graphql/mutations/resume";
import { GET_USER_RESUMES_QUERY } from "@/graphql/queries/resume";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";


interface ComparePayload {
  originalLatex: string;
  optimizedLatex: string;
  changes?: Array<{ sectionName: string; changeType: string; explanation?: string }>;
  resumeId?: string;
}

export default function ComparePage() {
  const ReactDiffViewer = dynamic(() => import("react-diff-viewer-continued"), { ssr: false });
  
  const router = useRouter();
  const [payload, setPayload] = useState<ComparePayload | null>(null);
  const [acceptOptimized, { loading: acceptLoading }] = useMutation(ACCEPT_OPTIMIZED_RESUME, {
    refetchQueries: [{ query: GET_USER_RESUMES_QUERY }],
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("resume_compare_payload");
      if (raw) setPayload(JSON.parse(raw));
    } catch {}
  }, []);

  const handleAccept = async () => {
    if (!payload?.optimizedLatex || !payload?.resumeId) return;
    try {
      await acceptOptimized({ variables: { resumeId: payload.resumeId, optimizedLatex: payload.optimizedLatex } });
      alert("Optimized resume saved.");
      router.push("/resume-tailor");
    } catch (e: any) {
      alert(e?.message || "Failed to save optimized resume");
    }
  };

  const handleReject = () => {
    router.push("/resume-tailor");
  };

  if (!payload) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-xl font-semibold mb-2">No comparison data</h1>
        <p className="text-muted-foreground mb-6">Run an optimization first to compare results.</p>
        <Button onClick={() => router.push("/resume-tailor")}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Compare & Accept</h1>
        <p className="text-muted-foreground">Review changes and accept if satisfied.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LaTeXPreview title="Original" latexCode={payload.originalLatex} />
        <LaTeXPreview title="Optimized" latexCode={payload.optimizedLatex} />
      </div>

      {payload.changes && payload.changes.length > 0 && (
  <div className="mt-6 rounded-xl border bg-card shadow-sm p-6">
    <h3 className="text-lg font-semibold mb-4">Detailed Section Changes</h3>
    <div className="space-y-6">
      {payload.changes.map((change, idx) => (
        <div key={idx} className="rounded-lg border p-4 bg-background shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-base">{change.sectionName}</h4>
              <p className="text-sm text-muted-foreground">
                {change.explanation || (change.changeType === "added"
                  ? "New section added"
                  : change.changeType === "removed"
                  ? "Section removed"
                  : "No significant change")}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                change.changeType === "modified"
                  ? "bg-blue-100 text-blue-800"
                  : change.changeType === "added"
                  ? "bg-green-100 text-green-800"
                  : change.changeType === "removed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {change.changeType}
            </span>
          </div>

          {change.changeType === "modified" && (
            <div className="mt-3 border-t pt-3 text-sm">
              <ReactDiffViewer
                oldValue={change.originalContent || ""}
                newValue={change.newContent || ""}
                splitView={true}
                showDiffOnly={true}
                leftTitle="Original"
                rightTitle="Optimized"
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: "transparent",
                      addedBackground: "#e6ffed",
                      removedBackground: "#ffefef",
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

      <div className="mt-6 flex gap-3">
        <Button onClick={handleAccept} disabled={acceptLoading}>Accept & Save</Button>
        <Button variant="outline" onClick={handleReject}>Reject</Button>
      </div>
    </div>
  );
}


