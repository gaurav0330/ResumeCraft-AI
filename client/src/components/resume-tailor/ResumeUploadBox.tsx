"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Eye, Code } from "lucide-react";
import { LaTeXPreview } from "./LaTeXPreview";

interface ResumeUploadBoxProps {
  onFileSelect: (file: File | null) => void;
  onLatexChange: (latex: string) => void;
  latexValue?: string;
}

export function ResumeUploadBox({ onFileSelect, onLatexChange, latexValue }: ResumeUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

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

  const handleLatexChange = (value: string) => {
    onLatexChange(value);
    // Switch to preview tab if LaTeX code is added
    if (value.trim() && activeTab === "paste") {
      setActiveTab("preview");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Provide Your Resume</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upload">Upload .tex or .pdf</TabsTrigger>
            <TabsTrigger value="paste">Paste LaTeX Code</TabsTrigger>
            <TabsTrigger value="preview" disabled={!latexValue?.trim()}>
              Preview
            </TabsTrigger>
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
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your LaTeX resume code here..."
                value={latexValue || ""}
                onChange={(e) => handleLatexChange(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              {latexValue?.trim() && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Eye className="h-4 w-4" />
                  <span>Switch to Preview tab to see rendered output</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            {latexValue?.trim() ? (
              <LaTeXPreview 
                latexCode={latexValue} 
                title="Resume Preview"
                className="border-0 shadow-none"
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No LaTeX code to preview</p>
                <p className="text-sm">Add some LaTeX code in the "Paste LaTeX Code" tab</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}