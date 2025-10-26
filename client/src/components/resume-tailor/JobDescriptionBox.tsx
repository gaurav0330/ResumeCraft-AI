"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionBoxProps {
  value: {
    title: string;
    description: string;
  };
  onChange: (val: { title: string; description: string }) => void;
}

export function JobDescriptionBox({ value, onChange }: JobDescriptionBoxProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Paste Job Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Title */}
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            placeholder="e.g. Frontend Developer"
            value={value.title}
            onChange={(e) =>
              onChange({ ...value, title: e.target.value })
            }
            className="mt-1"
          />
        </div>

        {/* Job Description */}
        <div>
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full job description here..."
            value={value.description}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
            className="min-h-[150px] mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
