# LaTeX Rendering Feature - ResumeCraft AI

## Overview
This implementation adds Overleaf-style LaTeX rendering capabilities to the ResumeCraft AI application. Users can now upload LaTeX files or paste LaTeX code and see a live preview of their resume, similar to the Overleaf editor experience.

## Features Implemented

### 1. LaTeX Preview Component (`LaTeXPreview.tsx`)
- **Real-time LaTeX compilation** using LaTeX.js library
- **Split-pane interface** with Preview/Source toggle
- **Error handling** with detailed compilation error messages
- **Loading states** during compilation
- **PDF export functionality** via browser print dialog
- **Refresh button** to recompile LaTeX code

### 2. Enhanced Resume Upload Box (`ResumeUploadBox.tsx`)
- **Three-tab interface**: Upload, Paste LaTeX Code, Preview
- **Automatic tab switching** to Preview when LaTeX code is added
- **Live preview integration** with the LaTeXPreview component
- **File upload support** for .tex files
- **Monospace font** for LaTeX code editing

### 3. Updated Tailor Result (`TailorResult.tsx`)
- **LaTeX preview integration** in the results panel
- **Fallback to text display** when no LaTeX code is available
- **Seamless integration** with existing workflow

### 4. Main Page Integration (`page.tsx`)
- **LaTeX code passing** to TailorResult component
- **Enhanced existing data display** with LaTeX preview
- **Preserved existing functionality** while adding new features

## Technical Implementation

### Dependencies Added
```bash
npm install latex.js
```

### Key Components

#### LaTeXPreview Component
```typescript
interface LaTeXPreviewProps {
  latexCode: string;
  title?: string;
  className?: string;
}
```

**Features:**
- Dynamic LaTeX.js import to avoid SSR issues
- Real-time compilation with error handling
- **Fallback LaTeX-to-HTML converter** for basic LaTeX commands
- Preview/Source mode toggle
- PDF export via browser print dialog
- Responsive design with loading states
- Browser environment detection and graceful fallback

#### ResumeUploadBox Component
```typescript
interface ResumeUploadBoxProps {
  onFileSelect: (file: File | null) => void;
  onLatexChange: (latex: string) => void;
  latexValue?: string;
}
```

**Features:**
- Three-tab interface (Upload, Paste, Preview)
- Automatic preview tab activation
- File upload with drag-and-drop
- Monospace LaTeX code editor

## Usage

### For Users
1. **Upload LaTeX File**: Drag and drop a .tex file or click to browse
2. **Paste LaTeX Code**: Switch to "Paste LaTeX Code" tab and enter your LaTeX
3. **Preview**: Switch to "Preview" tab to see rendered output
4. **Export**: Use the PDF button to generate a printable version

### For Developers
```typescript
import { LaTeXPreview } from "@/components/resume-tailor/LaTeXPreview";

// Basic usage
<LaTeXPreview latexCode={latexCode} title="Resume Preview" />

// With custom styling
<LaTeXPreview 
  latexCode={latexCode} 
  title=""
  className="border-0 shadow-none"
/>
```

## Database Integration

The LaTeX rendering works with the existing database schema:

```sql
-- Resume table already has latexCode field
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "latexCode" TEXT,  -- Stores LaTeX code
    "fileUrl" TEXT,    -- Stores uploaded file URL
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);
```

## Error Handling & Fallback System

The implementation includes comprehensive error handling and a robust fallback system:

1. **Compilation Errors**: Display detailed LaTeX compilation errors
2. **Network Issues**: Graceful handling of LaTeX.js loading failures
3. **Empty Code**: Proper handling of empty or invalid LaTeX code
4. **File Upload Errors**: Clear error messages for file upload issues
5. **Browser Environment Detection**: Checks for browser availability before LaTeX.js usage
6. **Fallback LaTeX-to-HTML Converter**: When LaTeX.js fails, automatically falls back to a basic converter that handles:
   - Document structure (`\documentclass`, `\begin{document}`, etc.)
   - Sections (`\section`, `\subsection`, `\subsubsection`)
   - Text formatting (`\textbf`, `\textit`, `\underline`, `\texttt`)
   - Lists (`\itemize`, `\enumerate`, `\item`)
   - Links (`\href`, `\url`)
   - Special characters (`\&`, `\%`, `\#`, etc.)
   - Line breaks and paragraphs

## Performance Considerations

1. **Dynamic Imports**: LaTeX.js is loaded only when needed to reduce initial bundle size
2. **Debounced Compilation**: LaTeX compilation is triggered on code changes
3. **Error Boundaries**: Components are wrapped with error boundaries
4. **Loading States**: Clear loading indicators during compilation

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Print Support**: PDF export works in all modern browsers
- **Mobile Responsive**: Works on tablets and mobile devices

## Future Enhancements

1. **Syntax Highlighting**: Add LaTeX syntax highlighting to the code editor
2. **Auto-save**: Implement auto-save functionality for LaTeX code
3. **Collaborative Editing**: Real-time collaborative LaTeX editing
4. **Template Library**: Pre-built LaTeX resume templates
5. **Version Control**: Track changes and versions of LaTeX documents

## Testing

To test the LaTeX rendering:

1. Start the development server: `npm run dev`
2. Navigate to the resume-tailor page
3. Use the sample LaTeX code provided in `sample-resume.tex`
4. Test both file upload and code pasting functionality
5. Verify the preview renders correctly
6. Test PDF export functionality

## Troubleshooting

### Common Issues

1. **LaTeX.js not loading**: Check network connection and browser console
2. **Compilation errors**: Verify LaTeX syntax is correct
3. **Preview not updating**: Try refreshing the compilation
4. **PDF export issues**: Ensure browser allows pop-ups for print dialog

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('latex-debug', 'true');
```

This will show detailed compilation logs in the browser console.
