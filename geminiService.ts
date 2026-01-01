import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Enterprise ATS Auditor Service
 * Generic service for any user's resume.
 */
export const analyzeResume = async (
  resumeText: string,
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // Read API key (works with Vercel + Vite bridge)
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
  const cleanedInput = resumeText.slice(0, 15000);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are a Senior Executive Recruiter and ATS Auditor.
Your job is to audit and rewrite the following resume into a high-performance, ATS-safe document.

The resume can belong to ANY profession, level, or country. 
Do NOT assume details that are not supported by the text. You may generalize responsibilities,
but stay realistic to the role and context.

TARGET LENGTH: 500–700 words.

Return ONLY JSON that matches the responseSchema. 
No explanations, no markdown, no extra text.

RESUME TO AUDIT:
"""
${cleanedInput}
"""
      `,
      config: {
        systemInstruction: `
You are an elite Enterprise ATS Quality Control Auditor & Global Recruiter.

MISSION:
- Rewrite the resume so it is clear, impact-driven, and ATS-friendly.
- If the input is short or poorly written, expand using realistic responsibilities
  for that role level (junior / mid / senior) without inventing fake achievements.
- Every bullet should follow Action–Context–Result (ACR) and use metrics when possible (%, $, time, volume, scale).

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
   - Always keep it generic and suitable for any user:
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

SCORING PHILOSOPHY (APPLIES TO ANY USER):
- Penalize generic phrases (e.g. "responsible for", "team player") if overused.
- Reward specific impact: "Reduced cost by 15%", "Improved uptime to 99.9%", etc.
- If the resume lacks keywords or concrete data relevant to its field,
  keep ats_rejection_risk as High or Medium-High (do NOT be overly optimistic).

CONSISTENCY:
- corrected_optimized_resume.plain_text = the final, fully formatted resume for the user.
- corrected_optimized_resume.sections.summary / experience / skills / education
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
                  },
                  required: ["summary", "experience", "skills", "education"],
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
          },
          required: [
            "audit_findings",
            "corrected_before_optimization",
            "corrected_optimized_resume",
            "corrected_after_optimization",
            "credibility_verdict",
          ],
        },
      },
    });

    if (signal?.aborted) throw new Error("AbortError");

    // دعم شكلين محتملين للرد من SDK
    const anyResponse = response as any;
    const rawText =
      typeof anyResponse.text === "function"
        ? anyResponse.text()
        : anyResponse.text;

    if (!rawText || typeof rawText !== "string") {
      throw new Error("EMPTY_AI_RESPONSE");
    }

    return JSON.parse(rawText.replace(/```json|```/g, "").trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
