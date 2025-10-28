import { generateCompletion } from "./aiClient.js";
import logger from "../config/logger.js";

function buildSectionPrompt({ jdTitle, jdContent, sectionName, sectionLatex }) {
  return `You are an ATS-optimized resume rewriting assistant.

JOB DESCRIPTION:
Title: ${jdTitle}
Content: ${jdContent}

RESUME SECTION:
Name: ${sectionName}
LaTeX:
${sectionLatex}

TASK:
Rewrite ONLY this section in LaTeX to better align with the job description by:
- Naturally integrating relevant JD keywords (skills, tools, certifications) where appropriate
- Keeping all content truthful and realistic (no fabrication or exaggeration)
- Maintaining approximately the same length — do NOT add unnecessary details or explanations
- Skipping redundant or already matching keywords/sentences from the JD to avoid repetition
- Quantifying results briefly where suitable (use concise metrics if possible)
- Preserving all LaTeX formatting and environments exactly
- Retaining section headers and structure

Return ONLY the revised LaTeX for this section, without any extra commentary or formatting outside the LaTeX code.`
;
}

function combineSectionsToLatex(sections) {
  // Minimal combination: concatenate in given order.
  // Assumes input sections include their own \section* headers where applicable.
  return sections.map(s => s.content).join("\n\n");
}

function diffSection(original, optimized) {
  if (!original && optimized) return { changeType: "added" };
  if (original && !optimized) return { changeType: "removed" };
  if (original === optimized) return { changeType: "unchanged" };
  return { changeType: "modified" };
}

export async function optimizeResume({ resume, jobDescription }) {
  const jdTitle = jobDescription.title || "";
  const jdContent = jobDescription.content || "";

  const optimizedSections = [];
  const changes = [];

  logger.info(`[AI] Starting optimization: resumeId=${resume.id}, jdId=${jobDescription.id}, sections=${(resume.sections||[]).length}`);

  for (const section of (resume.sections || [])) {
    const sectionLogPrefix = `[AI][Section:${section.sectionName}]`;
    const prompt = buildSectionPrompt({
      jdTitle,
      jdContent,
      sectionName: section.sectionName,
      sectionLatex: section.content,
    });

    let optimizedLatex;
    try {
      const t0 = Date.now();
      optimizedLatex = await generateCompletion(prompt, { maxTokens: 700, temperature: 0.2 });
      logger.info(`${sectionLogPrefix} optimized in ${Date.now()-t0}ms; originalLen=${section.content?.length||0}, newLen=${optimizedLatex?.length||0}`);
    } catch (e) {
      logger.error(`${sectionLogPrefix} generation failed: ${e?.message}`);
      // If a section fails, fall back to original
      optimizedLatex = section.content;
    }

    optimizedSections.push({ sectionName: section.sectionName, content: optimizedLatex });
    const change = diffSection(section.content, optimizedLatex);
    changes.push({
      sectionName: section.sectionName,
      changeType: change.changeType,
      originalContent: section.content,
      newContent: optimizedLatex,
      explanation: change.changeType === "modified" ? "Enhanced with JD-aligned keywords and phrasing" : undefined,
    });
  }

  // If there is base latexCode but no sections (edge case), attempt whole-document optimization
  if ((resume.sections || []).length === 0 && resume.latexCode) {
    const prompt = `Optimize this LaTeX resume to align with the JD while preserving structure and ATS-friendliness. Return ONLY LaTeX.\nJD Title: ${jdTitle}\nJD: ${jdContent}\n\n${resume.latexCode}`;
    let optimizedDoc;
    try {
      const t0 = Date.now();
      optimizedDoc = await generateCompletion(prompt, { maxTokens: 2000, temperature: 0.2 });
      logger.info(`[AI][WholeDoc] optimized in ${Date.now()-t0}ms; originalLen=${resume.latexCode?.length||0}, newLen=${optimizedDoc?.length||0}`);
    } catch (e) {
      logger.error(`[AI][WholeDoc] generation failed: ${e?.message}`);
      optimizedDoc = resume.latexCode;
    }
    optimizedSections.push({ sectionName: "Document", content: optimizedDoc });
    changes.push({ sectionName: "Document", changeType: resume.latexCode === optimizedDoc ? "unchanged" : "modified", originalContent: resume.latexCode, newContent: optimizedDoc });
  }

  const optimizedLatex = combineSectionsToLatex(optimizedSections);
  logger.info(`[AI] Completed optimization: combinedLen=${optimizedLatex?.length||0}`);
  return { optimizedLatex, optimizedSections, changes };
}


