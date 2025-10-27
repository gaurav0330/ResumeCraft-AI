"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText } from "lucide-react";

interface ResumeUploadBoxProps {
  onFileSelect: (file: File | null) => void;
  onLatexChange: (latex: string) => void;
  latexValue?: string;
}

export function ResumeUploadBox({ onFileSelect, onLatexChange, latexValue }: ResumeUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset file input
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Provide Your Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload .tex or .pdf</TabsTrigger>
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
                Drag & drop your <code>.tex</code> or <code>.pdf</code> file here or click to browse
              </p>
              <input
                type="file"
                accept=".tex"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {/* Show selected file info */}
            {selectedFile && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Unknown type"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </TabsContent>

          {/* Paste Tab */}
          <TabsContent value="paste">
            <Textarea
              placeholder="Paste your LaTeX resume code here..."
              value={latexValue || ""}
              onChange={(e) => onLatexChange(e.target.value)}
              className="min-h-[200px]"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
