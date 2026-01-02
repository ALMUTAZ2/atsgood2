import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Enterprise ATS Auditor Service
 * Generic service for any user's resume + optional Job Description.
 */
export const analyzeResume = async (
  resumeText: string,
  jobDescription?: string,
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // قراءة API key (متوافق مع Vercel + Vite bridge)
  const win = window as any;
  const apiKey =
    (import.meta as any).env?.VITE_API_KEY || win.process?.env?.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    console.error(
      "ATS Auditor: API_KEY is missing. Check your environment variables."
    );
    throw new Error("API_KEY_MISSING_IN_BROWSER");
  }

  const ai = new GoogleGenAI({ apiKey });

  // حماية من undefined
  const safeResume = typeof resumeText === "string" ? resumeText : "";
  const safeJD = typeof jobDescription === "string" ? jobDescription : "";

  const cleanedResume = safeResume.slice(0, 15000);
  const cleanedJD = safeJD.slice(0, 4000);

  // بلوك اختياري لو فيه JD
  const jdBlock = cleanedJD
    ? `
JOB DESCRIPTION FOR JOB MATCH ANALYSIS:
Use this ONLY to:
- evaluate job_match_analysis
- understand target role level & keywords
Do NOT copy responsibilities or achievements from the JD into the resume
unless they are already clearly supported by the resume content.

"""
${cleanedJD}
"""
`
    : "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are a Senior Executive Recruiter and ATS Auditor.
Your job is to audit and rewrite the following resume into a high-performance, ATS-safe document.

The resume can belong to ANY profession, level, or country. 
Do NOT assume details that are not supported by the text. You may rephrase and reorganize,
but you MUST NOT invent new responsibilities, projects, tools, certifications, or metrics
that are not present in the original resume.

STRICT LENGTH REQUIREMENT:
- The FINAL rewritten resume (corrected_optimized_resume.plain_text) MUST be between 500 and 700 words (inclusive).
- Never return fewer than 500 words.
- Never exceed 700 words.
- If the original resume is short, you may elaborate sentences ONLY using information
  that already exists in the resume (no new facts).

Return ONLY JSON that matches the responseSchema. 
No explanations, no markdown, no extra text.

RESUME TO AUDIT:
"""
${cleanedResume}
"""
${jdBlock}
      `,
      config: {
        systemInstruction: `
You are an elite Enterprise ATS Quality Control Auditor & Global Recruiter.

INPUTS:
- A resume (always provided).
- An optional Job Description (JD). If JD is missing or very short, you must still return a valid JSON
  but you may omit job_match_analysis entirely.

MISSION:
1) Rewrite the resume so it is clear, impact-driven, and ATS-friendly.
2) You MUST NOT fabricate or invent any new facts:
   - No new job titles, responsibilities, projects, technologies, certifications, or metrics
     that are not already directly implied in the original resume.
   - You may only rephrase, restructure, and clarify existing content.

STRICT LENGTH & INTEGRITY CONSTRAINTS:

1) LENGTH:
   - corrected_optimized_resume.plain_text MUST contain between 500 and 700 words (inclusive).
   - If you are about to generate fewer than 500 words, you must elaborate the existing points
     (using the same underlying facts) until you reach at least 500 words.
   - Do NOT exceed 700 words.

2) SOURCE OF INFORMATION:
   - All content in corrected_optimized_resume.plain_text MUST be grounded in the original resume text.
   - Do NOT copy responsibilities or bullet points from the Job Description into the resume.
   - JD is ONLY for job_match_analysis, not for creating or inflating experience.

CRITICAL RULES FOR corrected_optimized_resume.plain_text:

1) PLAIN TEXT ONLY:
   - No markdown (** , # , __ , • , numbered lists).
   - Use only basic characters.

2) NO PIPES:
   - Do NOT use the "|" character at all.
   - Do not format like: "Name | Email | Phone". This is FORBIDDEN.

3) SECTION HEADERS:
   - Use clear UPPERCASE headings, for example (only if relevant to the resume):
     PROFESSIONAL SUMMARY
     EXPERIENCE
     PROJECTS
     SKILLS
     EDUCATION
     CERTIFICATIONS
     LANGUAGES
   - Each heading must be alone on a separate line.
   - Do NOT merge multiple headings in one line.

4) VERTICAL LAYOUT:
   - The resume MUST be multi-line and vertically structured.
   - NEVER compress multiple sections or data fields into one long line.
   - Insert ONE blank line between sections (double line break).
   - Inside each section, each bullet or entry is on its own line.

5) BULLETS:
   - Each bullet starts with: "- " (hyphen + space).
   - One bullet per line.
   - No other bullet symbols.

6) CONTACT INFO:
   - Keep it generic and suitable for any user:
     FULL NAME (as given in the resume)
     Optional title (if clear)
     Email: ...
     Mobile: ...
     LinkedIn or Portfolio: ...
   - Each on its own line or at most two simple lines.
   - NO pipes, NO inline "Name | Email | Phone".

7) NO SINGLE-PARAGRAPH OUTPUT:
   - It is INVALID to return the entire resume as one paragraph or one long line.
   - The plain_text MUST have multiple lines and blank lines between sections.

JOB MATCH ANALYSIS (job_match_analysis):
- If a Job Description (JD) is provided AND reasonably detailed (at least about 40 words):
  - Calculate match_score (0–100) based on keyword overlap, seniority, and responsibilities.
  - Set match_level to: "Low", "Medium", "High", or "Excellent".
  - missing_keywords: list the most critical 5–12 missing or weak keywords for this role.
  - recruiter_view: a short paragraph (2–4 sentences) describing how a recruiter would see this match.
- If JD is missing or extremely short:
  - You may set job_match_analysis to null or omit it.
  - Do NOT guess a match_score.

CERTIFICATIONS HANDLING:
- Only place truly professional certifications (e.g., PMP®, CFA®, AWS Certified, Cisco, etc.)
  into the CERTIFICATIONS section.
- Do NOT include generic training, short webinars, or attendance-only certificates there.
- If the user includes minor attendance certificates, keep them in EXPERIENCE or a generic section,
  but avoid inflating the CERTIFICATIONS heading.

SCORING PHILOSOPHY:
- Penalize generic phrases (e.g. "responsible for", "team player") if overused.
- Reward specific impact only when clearly stated in the original resume.
- If the resume lacks keywords or concrete data relevant to its field,
  keep ats_rejection_risk as High or Medium-High (do NOT be overly optimistic).

CONSISTENCY:
- corrected_optimized_resume.plain_text = the final, fully formatted resume for the user.
- corrected_optimized_resume.sections.summary / experience / skills / education / certifications
  must be aligned with and extracted from plain_text content.
        `,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            audit_findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING },
                  why_it_is_a_problem: { type: Type.STRING },
                  ats_real_world_impact: { type: Type.STRING },
                  correction_applied: { type: Type.STRING },
                },
                required: [
                  "issue",
                  "why_it_is_a_problem",
                  "ats_real_world_impact",
                  "correction_applied",
                ],
              },
            },
            corrected_before_optimization: {
              type: Type.OBJECT,
              properties: {
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    ats_structure: { type: Type.NUMBER },
                    keyword_match: { type: Type.NUMBER },
                    experience_impact: { type: Type.NUMBER },
                    formatting_readability: { type: Type.NUMBER },
                    seniority_alignment: { type: Type.NUMBER },
                  },
                  required: [
                    "ats_structure",
                    "keyword_match",
                    "experience_impact",
                    "formatting_readability",
                    "seniority_alignment",
                  ],
                },
                final_ats_score: { type: Type.NUMBER },
                ats_confidence_level: { type: Type.NUMBER },
                ats_rejection_risk: { type: Type.STRING },
              },
              required: [
                "scores",
                "final_ats_score",
                "ats_confidence_level",
                "ats_rejection_risk",
              ],
            },
            corrected_optimized_resume: {
              type: Type.OBJECT,
              properties: {
                plain_text: { type: Type.STRING },
                sections: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    experience: { type: Type.STRING },
                    skills: { type: Type.STRING },
                    education: { type: Type.STRING },
                    certifications: { type: Type.STRING },
                  },
                  required: [
                    "summary",
                    "experience",
                    "skills",
                    "education",
                    "certifications",
                  ],
                },
              },
              required: ["plain_text", "sections"],
            },
            corrected_after_optimization: {
              type: Type.OBJECT,
              properties: {
                scores: {
                  type: Type.OBJECT,
                  properties: {
                    ats_structure: { type: Type.NUMBER },
                    keyword_match: { type: Type.NUMBER },
                    experience_impact: { type: Type.NUMBER },
                    formatting_readability: { type: Type.NUMBER },
                    seniority_alignment: { type: Type.NUMBER },
                  },
                  required: [
                    "ats_structure",
                    "keyword_match",
                    "experience_impact",
                    "formatting_readability",
                    "seniority_alignment",
                  ],
                },
                final_ats_score: { type: Type.NUMBER },
                ats_confidence_level: { type: Type.NUMBER },
                ats_rejection_risk: { type: Type.STRING },
              },
              required: [
                "scores",
                "final_ats_score",
                "ats_confidence_level",
                "ats_rejection_risk",
              ],
            },
            credibility_verdict: {
              type: Type.OBJECT,
              properties: {
                score_change_rationale: { type: Type.STRING },
                trust_level: { type: Type.STRING },
                enterprise_readiness: { type: Type.STRING },
              },
              required: [
                "score_change_rationale",
                "trust_level",
                "enterprise_readiness",
              ],
            },
            job_match_analysis: {
              type: Type.OBJECT,
              properties: {
                match_score: { type: Type.NUMBER },
                match_level: { type: Type.STRING },
                missing_keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recruiter_view: { type: Type.STRING },
              },
              required: [
                "match_score",
                "match_level",
                "missing_keywords",
                "recruiter_view",
              ],
            },
          },
          required: [
            "audit_findings",
            "corrected_before_optimization",
            "corrected_optimized_resume",
            "corrected_after_optimization",
            "credibility_verdict"
          ],
        },
      },
    });

    if (signal?.aborted) throw new Error("AbortError");

    const anyResponse = response as any;
    const rawText =
      typeof anyResponse.text === "function"
        ? anyResponse.text()
        : anyResponse.text;

    if (!rawText || typeof rawText !== "string") {
      throw new Error("EMPTY_AI_RESPONSE");
    }

    const cleanedJson = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedJson) as AnalysisResult;

    // ✅ إذا ما فيه JD فعليًا، نحذف job_match_analysis عشان الواجهة ما تعرض أي نسبة
    if (!cleanedJD.trim()) {
      (parsed as any).job_match_analysis = undefined;
    }

    // ✅ فحص صارم لطول السيرة المحسّنة (500–700 كلمة)
    const plain = parsed.corrected_optimized_resume?.plain_text || "";
    const wordCount = plain
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    if (wordCount < 500 || wordCount > 700) {
      console.error(
        `Length constraint violated: got ${wordCount} words (required 500–700).`
      );
      throw new Error(
        `LENGTH_CONSTRAINT_VIOLATION: optimized resume has ${wordCount} words (required 500–700).`
      );
    }

    return parsed;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
