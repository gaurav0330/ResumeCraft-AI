"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { LaTeXPreview } from "./LaTeXPreview";

interface TailorResultProps {
  tailoredResume: string;
  latexCode?: string;
}

export function TailorResult({ tailoredResume, latexCode }: TailorResultProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Resume Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {latexCode ? (
          <LaTeXPreview 
            latexCode={latexCode} 
            title=""
            className="border-0 shadow-none h-full"
          />
        ) : tailoredResume ? (
          <div className="p-6 text-sm text-gray-600">
            <div className="whitespace-pre-line">{tailoredResume}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <FileText className="h-12 w-12 mb-4" />
            <p>
              Complete the steps on the left and click <strong>Tailor Resume</strong> to see results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
