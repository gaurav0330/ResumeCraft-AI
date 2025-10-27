"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Code, Download, RefreshCw, AlertCircle } from "lucide-react";

interface LaTeXPreviewProps {
  latexCode: string;
  title?: string;
  className?: string;
}

export function LaTeXPreview({ latexCode, title = "LaTeX Preview", className }: LaTeXPreviewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [compiledHTML, setCompiledHTML] = useState<string>("");
  const previewRef = useRef<HTMLDivElement>(null);

  // Fallback LaTeX to HTML converter for basic commands
  const basicLatexToHtml = (code: string): string => {
    let html = code;
    
    // Basic LaTeX to HTML conversions
    const conversions = [
      // Document structure
      { from: /\\documentclass\{([^}]+)\}/g, to: '' },
      { from: /\\usepackage\[([^\]]*)\]\{([^}]+)\}/g, to: '' },
      { from: /\\usepackage\{([^}]+)\}/g, to: '' },
      { from: /\\begin\{document\}/g, to: '' },
      { from: /\\end\{document\}/g, to: '' },
      
      // Sections
      { from: /\\title\{([^}]+)\}/g, to: '<h1 class="title">$1</h1>' },
      { from: /\\author\{([^}]+)\}/g, to: '<div class="author">$1</div>' },
      { from: /\\date\{([^}]+)\}/g, to: '<div class="date">$1</div>' },
      { from: /\\maketitle/g, to: '' },
      
      { from: /\\section\*?\{([^}]+)\}/g, to: '<h2 class="section">$1</h2>' },
      { from: /\\subsection\*?\{([^}]+)\}/g, to: '<h3 class="subsection">$1</h3>' },
      { from: /\\subsubsection\*?\{([^}]+)\}/g, to: '<h4 class="subsubsection">$1</h4>' },
      
      // Text formatting
      { from: /\\textbf\{([^}]+)\}/g, to: '<strong>$1</strong>' },
      { from: /\\textit\{([^}]+)\}/g, to: '<em>$1</em>' },
      { from: /\\underline\{([^}]+)\}/g, to: '<u>$1</u>' },
      { from: /\\texttt\{([^}]+)\}/g, to: '<code>$1</code>' },
      
      // Lists
      { from: /\\begin\{itemize\}/g, to: '<ul>' },
      { from: /\\end\{itemize\}/g, to: '</ul>' },
      { from: /\\begin\{enumerate\}/g, to: '<ol>' },
      { from: /\\end\{enumerate\}/g, to: '</ol>' },
      { from: /\\item\s*([^\\]*?)(?=\\item|\\end|$)/g, to: '<li>$1</li>' },
      
      // Links and emails
      { from: /\\href\{([^}]+)\}\{([^}]+)\}/g, to: '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>' },
      { from: /\\url\{([^}]+)\}/g, to: '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>' },
      
      // Special characters
      { from: /\\&/g, to: '&amp;' },
      { from: /\\%/g, to: '%' },
      { from: /\\#/g, to: '#' },
      { from: /\\$/g, to: '$' },
      { from: /\\_/g, to: '_' },
      { from: /\\{/g, to: '{' },
      { from: /\\}/g, to: '}' },
      
      // Line breaks and paragraphs
      { from: /\\\\/g, to: '<br>' },
      { from: /\\par/g, to: '<p>' },
      
      // Remove remaining LaTeX commands (basic cleanup)
      { from: /\\[a-zA-Z]+\{[^}]*\}/g, to: '' },
      { from: /\\[a-zA-Z]+/g, to: '' },
    ];
    
    conversions.forEach(({ from, to }) => {
      html = html.replace(from, to);
    });
    
    // Clean up extra whitespace and wrap in a container
    html = html.trim().replace(/\n\s*\n/g, '</p><p>');
    if (html && !html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }
    
    return html || '<p>No content to display</p>';
  };

  const compileLaTeX = async (code: string) => {
    if (!code.trim()) {
      setCompiledHTML("");
      setCompilationError(null);
      return;
    }

    setIsCompiling(true);
    setCompilationError(null);

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error("LaTeX compilation requires a browser environment");
      }

      // Dynamic import to avoid SSR issues
      const { parse, HtmlGenerator } = await import("latex.js");
      
      const generator = new HtmlGenerator({ hyphenate: false });
      const parsed = parse(code, { generator });
      const html = parsed.htmlDocument();
      
      setCompiledHTML(html);
    } catch (error: any) {
      console.error("LaTeX compilation error:", error);
      
      // Try fallback basic conversion
      try {
        const fallbackHtml = basicLatexToHtml(code);
        setCompiledHTML(fallbackHtml);
        setCompilationError(null);
        console.log("Using fallback LaTeX to HTML conversion");
      } catch (fallbackError) {
        console.error("Fallback conversion also failed:", fallbackError);
        
        // Provide more helpful error messages
        if (error.message.includes("browser environment")) {
          setCompilationError("LaTeX compilation is only available in the browser. Please refresh the page and try again.");
        } else if (error.message.includes("SyntaxError")) {
          setCompilationError(`LaTeX syntax error: ${error.message}`);
        } else if (error.message.includes("Failed to fetch")) {
          setCompilationError("Failed to load LaTeX compiler. Please check your internet connection and try again.");
        } else {
          setCompilationError(error.message || "Failed to compile LaTeX code. Please check your syntax.");
        }
      }
    } finally {
      setIsCompiling(false);
    }
  };

  useEffect(() => {
    if (latexCode) {
      compileLaTeX(latexCode);
    }
  }, [latexCode]);

  const handleDownloadPDF = () => {
    if (!compiledHTML) return;
    
    // Create a new window with the compiled HTML for printing/PDF generation
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume - ${title}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .resume-content { 
              max-width: 800px; 
              margin: 0 auto; 
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="resume-content">
            ${compiledHTML}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewMode(true)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant={!isPreviewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              Source
            </Button>
            {compiledHTML && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => compileLaTeX(latexCode)}
              disabled={isCompiling}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isCompiling ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-0">
        {isPreviewMode ? (
          <div className="relative">
            {isCompiling && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Compiling LaTeX...</span>
                </div>
              </div>
            )}
            
            {compilationError ? (
              <div className="p-6">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Compilation Error</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                    {compilationError}
                  </pre>
                </div>
              </div>
            ) : compiledHTML ? (
              <>
                <div 
                  ref={previewRef}
                  className="p-6 bg-white min-h-[400px] overflow-auto"
                  style={{ 
                    fontFamily: "'Times New Roman', serif",
                    lineHeight: "1.4"
                  }}
                  dangerouslySetInnerHTML={{ __html: compiledHTML }}
                />
                <style jsx>{`
                  .title {
                    font-size: 1.5em;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 0.5em;
                  }
                  .author {
                    text-align: center;
                    font-style: italic;
                    margin-bottom: 0.3em;
                  }
                  .date {
                    text-align: center;
                    margin-bottom: 1em;
                  }
                  .section {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                  }
                  .subsection {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-top: 0.8em;
                    margin-bottom: 0.4em;
                  }
                  .subsubsection {
                    font-size: 1em;
                    font-weight: bold;
                    margin-top: 0.6em;
                    margin-bottom: 0.3em;
                  }
                  ul, ol {
                    margin: 0.5em 0;
                    padding-left: 2em;
                  }
                  li {
                    margin: 0.2em 0;
                  }
                  code {
                    background-color: #f5f5f5;
                    padding: 0.1em 0.3em;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                  }
                  a {
                    color: #0066cc;
                    text-decoration: underline;
                  }
                  a:hover {
                    color: #004499;
                  }
                `}</style>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500 min-h-[400px] flex items-center justify-center">
                <div>
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No LaTeX code to preview</p>
                  <p className="text-sm">Add some LaTeX code to see the preview</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <pre className="text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-auto min-h-[400px] whitespace-pre-wrap">
              {latexCode || "No LaTeX code available"}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
