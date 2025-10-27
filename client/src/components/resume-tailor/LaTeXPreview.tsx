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

  // Pixel-perfect LaTeX to HTML converter
  const basicLatexToHtml = (code: string): string => {
    let html = code;
    
    // Remove ALL LaTeX comments first
    html = html.replace(/%.*/gm, '');
    
    // Remove document setup (keep geometry info for margins)
    const geometryMatch = html.match(/\\geometry\{([^}]+)\}/);
    let topMargin = '0.5in', bottomMargin = '0.5in', leftMargin = '0.5in', rightMargin = '0.5in';
    if (geometryMatch) {
      const geom = geometryMatch[1];
      const topM = geom.match(/top=([\d.]+in)/);
      const bottomM = geom.match(/bottom=([\d.]+in)/);
      const leftM = geom.match(/left=([\d.]+in)/);
      const rightM = geom.match(/right=([\d.]+in)/);
      if (topM) topMargin = topM[1];
      if (bottomM) bottomMargin = bottomM[1];
      if (leftM) leftMargin = leftM[1];
      if (rightM) rightMargin = rightM[1];
    }
    
    html = html.replace(/\\documentclass[^\n]*/g, '');
    html = html.replace(/\\usepackage[^\n]*/g, '');
    html = html.replace(/\\geometry[^\n]*/g, '');
    html = html.replace(/\\setlist[^\n]*/g, '');
    html = html.replace(/\\titleformat[^\n]*/g, '');
    html = html.replace(/\\titlespacing[^\n]*/g, '');
    html = html.replace(/\\pagestyle[^\n]*/g, '');
    html = html.replace(/\\begin\{document\}/g, '');
    html = html.replace(/\\end\{document\}/g, '');
    
    // Handle environments with div wrappers
    html = html.replace(/\\begin\{flushleft\}/g, '');
    html = html.replace(/\\end\{flushleft\}/g, '');
    
    // Handle complex structures - icons first
    html = html.replace(/\\href\{([^}]+)\}\{\\faIcon\[2x\]\{file-pdf\}\s*\\textbf\{View PDF\}\}/g,
      '<span style="float: right;"><a href="$1" target="_blank" style="color: #0066cc; text-decoration: none;"><strong>View PDF</strong></a> 📄</span>');
    html = html.replace(/\\href\{([^}]+)\}\{\\faIcon\[2x\]\{file-pdf\}\}/g,
      '<span style="float: right;"><a href="$1" target="_blank" style="color: #0066cc; text-decoration: none;">View PDF</a> 📄</span>');
    html = html.replace(/\\href\{([^}]+)\}\{\\faGithub\}/g, '<a href="$1" target="_blank">🐙</a>');
    html = html.replace(/\\href\{([^}]+)\}\{\\faGlobe\}/g, '<a href="$1" target="_blank">🌐</a>');
    
    // Handle href with textcolor
    html = html.replace(/\\href\{([^}]+)\}\{\\textcolor\{([^}]+)\}\{([^}]+)\}\}/g, 
      '<a href="$1" target="_blank" style="color: $2;">$3</a>');
    
    // Handle all other href
    html = html.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, 
      '<a href="$1" target="_blank" style="color: #0066cc;">$2</a>');
    
    // Handle textcolor
    html = html.replace(/\\textcolor\{([^}]+)\}\{\\textbf\{([^}]+)\}\}/g,
      '<span style="color: $1;"><strong>$2</strong></span>');
    html = html.replace(/\\textcolor\{([^}]+)\}\{([^}]+)\}/g,
      '<span style="color: $1;">$2</span>');
    
    // Handle font sizes with exact spacing
    html = html.replace(/\\LARGE\s*\\textbf\{([^}]+)\}/g, '<div style="font-size: 20pt; font-weight: bold; line-height: 1; margin: 0;">$1</div>');
    html = html.replace(/\\LARGE/g, '');
    html = html.replace(/\\Large/g, '');
    html = html.replace(/\\large/g, '');
    
    // Handle bold
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    
    // Handle sections with better spacing
    html = html.replace(/\\section\*\{([^}]+)\}/g, '<div style="font-weight: bold; font-size: 11pt; margin: 10px 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">$1</div><hr style="border: none; border-top: 1px solid #000; margin: 4px 0 8px 0;">');
    html = html.replace(/\\subsection\*\{([^}]+)\}/g, '<div style="font-weight: bold; font-size: 10pt; margin: 8px 0 4px 0;">$1</div>');
    
    // Handle horizontal fill for right alignment with proper spacing
    html = html.replace(/\\hfill/g, '<span style="float: right; clear: right;"></span>');
    html = html.replace(/\\quad/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    
    // Handle vertical spacing - exact LaTeX pt to px conversion (1pt ≈ 1.33px at 96dpi)
    html = html.replace(/\\\[([0-9]+)pt\]/g, (match, pt) => {
      const px = Math.round(parseFloat(pt) * 1.33);
      return `<div style="height: ${px}px; line-height: ${px}px; overflow: hidden;">&nbsp;</div>`;
    });
    html = html.replace(/\\vspace\{([0-9]+)mm\}/g, (match, mm) => {
      const px = Math.round(parseFloat(mm) * 3.78);
      return `<div style="height: ${px}px; line-height: ${px}px; overflow: hidden;">&nbsp;</div>`;
    });
    html = html.replace(/\\vspace\{([^}]+)\}/g, '');
    
    // Handle separators
    html = html.replace(/\\\,/g, ' ');
    html = html.replace(/\|\s*\|/g, '<span style="color: #666; margin: 0 4px;">|</span>');
    html = html.replace(/\|/g, '<span style="color: #666; margin: 0 4px;">|</span>');
    
    // Handle horizontal rules with 4pt spacing (from LaTeX: \hrule with \[4pt] spacing)
    html = html.replace(/\\hrule/g, '<hr style="border: none; border-top: 0.5pt solid #000; margin: 5.3px 0;">');
    
    // Handle lists - process itemize blocks
    html = html.replace(/\\begin\{itemize\}/g, '{{BEGIN_UL}}');
    html = html.replace(/\\end\{itemize\}/g, '{{END_UL}}');
    html = html.replace(/\\begin\{enumerate\}/g, '{{BEGIN_UL}}');
    html = html.replace(/\\end\{enumerate\}/g, '{{END_UL}}');
    
    // Process list items with multi-line support
    const ulBlocks = html.split(/\{\{BEGIN_UL\}\}/);
    let processedHtml = ulBlocks[0]; // Content before first list
    
    for (let i = 1; i < ulBlocks.length; i++) {
      const block = ulBlocks[i];
      const endIdx = block.indexOf('{{END_UL}}');
      if (endIdx === -1) {
        processedHtml += block;
        continue;
      }
      
      const listContent = block.substring(0, endIdx);
      const afterList = block.substring(endIdx + 10); // After {{END_UL}}
      
      // Split into lines and process
      const items: string[] = [];
      const lines = listContent.split('\n');
      let currentItem = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('\\item')) {
          if (currentItem) items.push(currentItem);
          currentItem = trimmed.replace(/^\\item\s*/, '').trim();
        } else if (trimmed && !trimmed.startsWith('\\begin') && !trimmed.startsWith('\\end')) {
          currentItem += ' ' + trimmed;
        } else {
          if (currentItem) {
            items.push(currentItem);
            currentItem = '';
          }
        }
      }
      if (currentItem) items.push(currentItem);
      
      // Build the UL with better spacing
      processedHtml += '<ul style="margin: 4px 0; padding-left: 18px; list-style-position: outside;">';
      items.forEach(item => {
        if (item.trim()) {
          processedHtml += `<li style="margin: 2px 0; line-height: 1.4; padding: 0;">${item}</li>`;
        }
      });
      processedHtml += '</ul>' + afterList;
    }
    
    html = processedHtml;
    
    // Handle tabular - convert tables to proper HTML
    html = html.replace(/\\begin\{tabular\}[^{]*\{([^}]*)\}/g, '{{BEGIN_TABLE}}');
    html = html.replace(/\\begin\{tabularx\}[^{]*\{[^}]*\}[^{]*\{([^}]*)\}/g, '{{BEGIN_TABLE}}');
    html = html.replace(/\\end\{tabular\}/g, '{{END_TABLE}}');
    html = html.replace(/\\end\{tabularx\}/g, '{{END_TABLE}}');
    
    const tableBlocks = html.split(/\{\{BEGIN_TABLE\}\}/);
    processedHtml = tableBlocks[0];
    
    for (let i = 1; i < tableBlocks.length; i++) {
      const block = tableBlocks[i];
      const endIdx = block.indexOf('{{END_TABLE}}');
      if (endIdx === -1) {
        processedHtml += block;
        continue;
      }
      
      let tableContent = block.substring(0, endIdx);
      const afterTable = block.substring(endIdx + 12);
      
      // Parse tabular specification (e.g., {p{0.7\linewidth} p{0.25\linewidth}})
      const colSpec = tableContent.match(/p\{[\d.]*\\linewidth\}/g) || [];
      
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 0; border-spacing: 0;"><tbody>';
      
      const rows = tableContent.split(/\\\\/);
      rows.forEach(row => {
        row = row.trim();
        if (row && !row.includes('\\begin') && !row.includes('\\end')) {
          tableHtml += '<tr>';
          const cells = row.split(/\s*&\s*/);
          cells.forEach((cell, idx) => {
            cell = cell.trim();
            if (cell) {
              // Parse hfill in cell to make content span correctly
              const hasHfill = cell.includes('\\hfill');
              const align = hasHfill || idx === 1 ? 'text-align: right;' : 'text-align: left;';
              cell = cell.replace(/\\hfill/g, '');
              
              tableHtml += `<td style="padding: 0; ${align} vertical-align: top;">${cell}</td>`;
            }
          });
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</tbody></table>';
      processedHtml += tableHtml + afterTable;
    }
    
    html = processedHtml;
    
    // Clean up any remaining LaTeX
    html = html.replace(/\\[a-zA-Z@]+(\[[^\]]*\])*(\{[^}]*\})*/g, '');
    
    // Remove stray characters
    html = html.replace(/[{}]/g, '');
    html = html.replace(/\[\]/g, '');
    
    // Clean up spacing
    html = html.replace(/\n\s*\n+/g, '\n');
    html = html.replace(/\s{3,}/g, ' ');
    
    // Create A4-sized container with exact margins
    return `<div style="
      width: 210mm;
      min-height: 297mm;
      max-width: 210mm;
      margin: 0 auto;
      padding: ${topMargin} ${rightMargin} ${bottomMargin} ${leftMargin};
      background: white;
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 10pt;
      line-height: 1.5;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 4px;
    ">
      <style>
        @page { size: A4; }
        * { box-sizing: border-box; }
        html { font-family: 'Georgia', 'Times New Roman', serif; }
        body { margin: 0; padding: 0; }
        ul { list-style-position: outside; margin: 4px 0 4px 18px; padding-left: 20px; }
        li { margin: 2px 0; padding: 0; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        td { vertical-align: top; padding: 3px 0; }
        hr { margin: 8px 0; border: none; border-top: 1px solid #ddd; height: 0; }
        div { overflow: visible; }
        strong { font-weight: bold; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { color: #1d4ed8; text-decoration: underline; }
        h2, h3 { margin: 6px 0 3px 0; }
        p { margin: 4px 0; }
      </style>
      ${html}
    </div>`;
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
      
      // Suppress console errors temporarily to avoid noisy log messages
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Filter out LaTeX package loading errors
        const message = args[0]?.toString() || '';
        if (!message.includes('error loading package') && !message.includes('Cannot find module')) {
          originalConsoleError.apply(console, args);
        }
      };

      try {
      const generator = new HtmlGenerator({ hyphenate: false });
      const parsed = parse(code, { generator });
      const html = parsed.htmlDocument();
      setCompiledHTML(html);
      } finally {
        // Restore original console.error
        console.error = originalConsoleError;
      }
    } catch (error: any) {
      // Try fallback basic conversion
      try {
        const fallbackHtml = basicLatexToHtml(code);
        setCompiledHTML(fallbackHtml);
        setCompilationError(null);
      } catch (fallbackError) {
        console.error("Fallback conversion also failed:", fallbackError);
        
        // Provide more helpful error messages
        if (error.message && error.message.includes("browser environment")) {
          setCompilationError("LaTeX compilation is only available in the browser. Please refresh the page and try again.");
        } else {
          setCompilationError("Using basic LaTeX rendering. Some advanced LaTeX features may not be supported.");
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
                  className="overflow-auto bg-gray-50 p-4"
                  style={{ 
                    minHeight: '600px',
                  }}
                  dangerouslySetInnerHTML={{ __html: compiledHTML }}
                />
                <style jsx>{`
                  div[style*="text-align"] {
                    display: block;
                  }
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
                  .section, h2 {
                    font-size: 1em;
                    font-weight: bold;
                    margin-top: 12px;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .subsection, h3 {
                    font-size: 0.95em;
                    font-weight: bold;
                    margin-top: 8px;
                    margin-bottom: 4px;
                  }
                  .subsubsection, h4 {
                    font-size: 0.9em;
                    font-weight: bold;
                    margin-top: 6px;
                    margin-bottom: 3px;
                  }
                  ul, ol {
                    margin: 4px 0;
                    padding-left: 20px;
                    list-style-position: outside;
                  }
                  li {
                    margin: 2px 0;
                    line-height: 1.4;
                  }
                  code {
                    background-color: #f5f5f5;
                    padding: 0.1em 0.3em;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                  }
                  a {
                    color: #0066cc;
                    text-decoration: none;
                  }
                  a:hover {
                    color: #004499;
                    text-decoration: underline;
                  }
                  hr {
                    border: none;
                    border-top: 1px solid #ccc;
                    margin: 8px 0;
                    width: 100%;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 8px 0;
                  }
                  td {
                    padding: 4px 0;
                  }
                  strong {
                    font-weight: bold;
                  }
                  em {
                    font-style: italic;
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
