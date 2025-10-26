"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function TailorResult({ tailoredResume }: { tailoredResume: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your tailored resume will appear here</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600">
        {tailoredResume ? (
          <div className="whitespace-pre-line">{tailoredResume}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
