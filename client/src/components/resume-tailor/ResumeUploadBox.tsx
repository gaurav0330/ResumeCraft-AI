"use client";

import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface ResumeUploadBoxProps {
  onFileSelect: (file: File | null) => void;
  onLatexChange: (latex: string) => void;
}

export function ResumeUploadBox({ onFileSelect, onLatexChange }: ResumeUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Provide Your Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload .tex File</TabsTrigger>
            <TabsTrigger value="paste">Paste LaTeX Code</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                Drag & drop your <code>.tex</code> file here or click to browse
              </p>
              <input
                type="file"
                accept=".tex"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </TabsContent>

          {/* Paste Tab */}
          <TabsContent value="paste">
            <Textarea
              placeholder="Paste your LaTeX resume code here..."
              onChange={(e) => onLatexChange(e.target.value)}
              className="min-h-[200px]"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
