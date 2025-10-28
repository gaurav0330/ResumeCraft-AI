/**
 * LaTeX Parser Utility
 * Extracts different sections from LaTeX resume code
 * 
 * IMPORTANT: This function preserves the RAW LaTeX code for each section,
 * including all LaTeX commands (\textbf, \item, \begin\itemize, etc.).
 * The content stored in the database is the complete LaTeX code that can be
 * used to reconstruct or re-render the section.
 */

/**
 * Extract sections from LaTeX code
 * Returns raw LaTeX code for each section (all commands preserved)
 * @param {string} latexCode - The LaTeX code to parse
 * @returns {Array<{sectionName: string, content: string}>} - Array with sectionName and raw LaTeX content
 */
export function extractLatexSections(latexCode) {
  if (!latexCode || typeof latexCode !== 'string') {
    return [];
  }

  const sections = [];
  const code = latexCode;
  
  // Attempt to extract header/contact block before first \section*
  try {
    const firstSectionIdx = code.search(/\\section\*/);
    const searchAreaEnd = firstSectionIdx > -1 ? firstSectionIdx : Math.min(code.length, 4000);
    const headerArea = code.slice(0, searchAreaEnd);
    // Header usually wrapped in flushleft with hrule separators
    const headerStart = headerArea.search(/\\begin\{flushleft\}/i);
    if (headerStart > -1) {
      // Find end: next \hrule after the flushleft block
      const afterStart = headerArea.slice(headerStart);
      const hruleIdx = afterStart.search(/\\hrule/i);
      let headerEndIdx;
      if (hruleIdx > -1) {
        headerEndIdx = headerStart + hruleIdx + afterStart.match(/\\hrule/i)[0].length;
      } else {
        // fallback: end of flushleft
        const flushEndRel = afterStart.search(/\\end\{flushleft\}/i);
        headerEndIdx = flushEndRel > -1 ? headerStart + flushEndRel + afterStart.match(/\\end\{flushleft\}/i)[0].length : searchAreaEnd;
      }
      const headerContent = code.substring(headerStart, headerEndIdx).trim();
      if (headerContent) {
        sections.push({ sectionName: 'HEADER', content: headerContent });
      }
    }
  } catch (e) {
    // swallow parsing errors silently, fallback matchers below can still work
  }
  
  // Find all major sections (not subsections)
  const sectionMatches = [...latexCode.matchAll(/\\section\*\{([^}]+)\}/gi)];
  
  // Add all sections we found
  sectionMatches.forEach((match, index) => {
    const sectionName = match[1].trim();
    const startPos = match.index;
    const sectionHeader = match[0];
    
    // Find where this section ends (next major section or end of document)
    let endPos = latexCode.length;
    
    // Look for next major section or subsection followed by major section
    const remainingText = latexCode.substring(startPos + sectionHeader.length);
    const nextSectionMatch = remainingText.match(/\\section\*/);
    
    if (nextSectionMatch) {
      endPos = startPos + sectionHeader.length + nextSectionMatch.index;
    } else {
      endPos = latexCode.length;
    }
    
    // Extract the raw LaTeX content (including the section header)
    // This preserves ALL LaTeX commands (\textbf, \item, \begin\itemize, etc.)
    let content = latexCode.substring(startPos, endPos).trim();
    
    // Store the raw LaTeX code without cleaning - this allows reconstruction
    if (content && content.length > 0) {
      sections.push({ sectionName, content });
    }
  });

  // If no sections found via section markers, try fallback patterns
  if (sections.length === 0) {
    const fallbackPatterns = [
      { name: 'HEADER', regex: /\\begin\{flushleft\}[\s\S]*?\\hrule/gi },
      { name: 'Summary', regex: /SUMMARY[\s\S]*?\\hrule/gi },
      { name: 'Experience', regex: /EXPERIENCE[\s\S]*?\\hrule/gi },
      { name: 'Skills', regex: /SKILLS[\s\S]*?\\hrule/gi },
      { name: 'Projects', regex: /PROJECTS[\s\S]*?\\hrule/gi },
      { name: 'Achievements', regex: /ACHIEVEMENTS[\s\S]*?\\hrule/gi },
      { name: 'Education', regex: /\\section\*\{Education\}/gi },
      { name: 'Certifications', regex: /CERTIFICATIONS[\s\S]*?\\hrule/gi }
    ];

    fallbackPatterns.forEach(({ name, regex }) => {
      const match = latexCode.match(regex);
      if (match) {
        const content = match[0].trim();
        // Store raw LaTeX without cleaning - preserves all LaTeX commands
        if (content && content.length > 0) {
          sections.push({ sectionName: name, content });
        }
      }
    });
  }

  return sections;
}

/**
 * Clean LaTeX content by removing or replacing LaTeX commands
 * @param {string} content - The LaTeX content to clean
 * @returns {string} - Cleaned content
 */
function cleanLatexContent(content) {
  if (!content) return '';

  let cleaned = content;

  // Remove LaTeX comments
  cleaned = cleaned.replace(/%.*$/gm, '');
  
  // Replace common LaTeX commands with their content
  cleaned = cleaned.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
  cleaned = cleaned.replace(/\\textit\{([^}]+)\}/g, '*$1*');
  cleaned = cleaned.replace(/\\emph\{([^}]+)\}/g, '*$1*');
  cleaned = cleaned.replace(/\\href\{[^}]*\}\{([^}]+)\}/g, '$1');
  
  // Handle special commands
  cleaned = cleaned.replace(/\\vspace\{[^}]*\}/g, '\n');
  cleaned = cleaned.replace(/\\[0-9]+pt/g, '');
  
  // Handle flushleft environment
  cleaned = cleaned.replace(/\\begin\{flushleft\}/g, '');
  cleaned = cleaned.replace(/\\end\{flushleft\}/g, '');
  
  // Handle tabular environments
  cleaned = cleaned.replace(/\\begin\{tabularx?\}[^}]*\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\\end\{tabularx?\}/g, '');
  cleaned = cleaned.replace(/\\begin\{tabular\}[^}]*\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\\end\{tabular\}/g, '');
  cleaned = cleaned.replace(/\\begin\{tabular\*?\}[^}]*\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\\end\{tabular\*?\}/g, '');
  cleaned = cleaned.replace(/p\{[^}]+\}/g, '');
  cleaned = cleaned.replace(/\\linewidth/g, '');
  
  // Handle fontawesome and other icon commands
  cleaned = cleaned.replace(/\\fa[A-Za-z]*\[[^\]]*\]/g, '');
  cleaned = cleaned.replace(/\\faIcon\[[^\]]*\]\{[^}]+\}/g, '');
  
  // Handle textcolor and other color commands
  cleaned = cleaned.replace(/\\textcolor\{[^}]+\}/g, '');
  
  // Remove remaining LaTeX commands
  cleaned = cleaned.replace(/\\[a-zA-Z]+(\[[^\]]*\])?\{([^}]*)\}/g, '$2');
  cleaned = cleaned.replace(/\\[a-zA-Z]+/g, '');
  
  // Clean up itemize/enumerate environments
  cleaned = cleaned.replace(/\\begin\{itemize\}/g, '');
  cleaned = cleaned.replace(/\\end\{itemize\}/g, '');
  cleaned = cleaned.replace(/\\begin\{enumerate\}/g, '');
  cleaned = cleaned.replace(/\\end\{enumerate\}/g, '');
  cleaned = cleaned.replace(/\\begin\{description\}/g, '');
  cleaned = cleaned.replace(/\\end\{description\}/g, '');
  
  // Handle item commands
  cleaned = cleaned.replace(/\\item\[([^\]]+)\]/g, '- [$1]');
  cleaned = cleaned.replace(/\\item\s*/g, '- ');
  
  // Clean up subsection commands
  cleaned = cleaned.replace(/\\subsection\*\{([^}]+)\}/g, '\n### $1\n');
  cleaned = cleaned.replace(/\\subsection\{([^}]+)\}/g, '\n### $1\n');
  
  // Clean up and/or commands
  cleaned = cleaned.replace(/\\hfill/g, ' ');
  cleaned = cleaned.replace(/\\quad/g, ' ');
  cleaned = cleaned.replace(/\\[0-9]+pt/g, '');
  
  // Handle line breaks and spacing
  cleaned = cleaned.replace(/\\\\\s*\[[^\]]*\]/g, '\n');
  cleaned = cleaned.replace(/\\\\/g, '\n');
  
  // Remove special characters but keep meaningful ones
  cleaned = cleaned.replace(/\\\[/g, '');
  cleaned = cleaned.replace(/\\\]/g, '');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');
  
  // Remove empty lines at start and end
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Validate if the code is valid LaTeX resume code
 * @param {string} latexCode - The LaTeX code to validate
 * @returns {boolean}
 */
export function isValidLatexResume(latexCode) {
  if (!latexCode || typeof latexCode !== 'string') {
    return false;
  }
  
  // Check for basic LaTeX document structure
  const hasDocumentClass = /\\documentclass/i.test(latexCode);
  const hasBeginDocument = /\\begin\{document\}/i.test(latexCode);
  const hasEndDocument = /\\end\{document\}/i.test(latexCode);
  
  return hasDocumentClass && hasBeginDocument && hasEndDocument;
}

