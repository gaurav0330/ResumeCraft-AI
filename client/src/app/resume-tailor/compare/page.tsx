"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { LaTeXPreview } from "@/components/resume-tailor/LaTeXPreview";
import { ACCEPT_OPTIMIZED_RESUME } from "@/graphql/mutations/resume";
import { GET_USER_RESUMES_QUERY } from "@/graphql/queries/resume";
import { useRouter } from "next/navigation";

interface ComparePayload {
  originalLatex: string;
  optimizedLatex: string;
  changes?: Array<{ sectionName: string; changeType: string; explanation?: string }>;
  resumeId?: string;
}

export default function ComparePage() {
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
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="font-medium mb-3">Changes</h3>
          <div className="max-h-64 overflow-auto pr-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-3">Section</th>
                  <th className="py-1 pr-3">Change</th>
                  <th className="py-1">Note</th>
                </tr>
              </thead>
              <tbody>
                {payload.changes.map((c, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 pr-3 font-medium">{c.sectionName}</td>
                    <td className="py-2 pr-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-foreground/80">
                        {c.changeType}
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground">{c.explanation || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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


