
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

/**
 * Analyzes and optimizes a resume using the strict ATS Quality Control Auditor logic.
 */
export const analyzeResume = async (resumeText: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    contents: `You are an ATS Quality Control Auditor and Resume Scoring Validator. 
        Your task is to process the resume below exactly as a modern ATS platform would, enforcing realism and credibility.

        MANDATORY AUDIT OBJECTIVES:
        1. Evaluate the original resume with strict penalties for markdown, generic content, and poor formatting.
        2. Calculate scores using the weighted formula: (Structure*0.25 + Keywords*0.25 + Impact*0.20 + Formatting*0.15 + Seniority*0.15).
        3. Optimize the resume to be ATS-safe plain text (NO markdown, NO icons, NO symbols).
        4. Optimization constraint: 500-700 words, structured for 2 pages.
        5. Calculate a conservative ATS_CONFIDENCE_LEVEL (0-100).

        STRICT RULES:
        - Markdown formatting (**, ##) inside resume text REDUCES formatting scores.
        - Score improvements > 15 points require massive structural changes.
        - Plain text only for the optimized resume.

        RESUME TO PROCESS:
        """
        ${resumeText}
        """`,
    config: {
      temperature: 0,
      seed: 42,
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
                correction_applied: { type: Type.STRING }
              },
              required: ["issue", "why_it_is_a_problem", "ats_real_world_impact", "correction_applied"]
            }
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
                  seniority_alignment: { type: Type.NUMBER }
                },
                required: ["ats_structure", "keyword_match", "experience_impact", "formatting_readability", "seniority_alignment"]
              },
              final_ats_score: { type: Type.NUMBER },
              ats_confidence_level: { type: Type.NUMBER },
              ats_rejection_risk: { type: Type.STRING }
            },
            required: ["scores", "final_ats_score", "ats_confidence_level", "ats_rejection_risk"]
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
                  education: { type: Type.STRING }
                },
                required: ["summary", "experience", "skills", "education"]
              }
            },
            required: ["plain_text", "sections"]
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
                  seniority_alignment: { type: Type.NUMBER }
                },
                required: ["ats_structure", "keyword_match", "experience_impact", "formatting_readability", "seniority_alignment"]
              },
              final_ats_score: { type: Type.NUMBER },
              ats_confidence_level: { type: Type.NUMBER },
              ats_rejection_risk: { type: Type.STRING }
            },
            required: ["scores", "final_ats_score", "ats_confidence_level", "ats_rejection_risk"]
          },
          credibility_verdict: {
            type: Type.OBJECT,
            properties: {
              score_change_rationale: { type: Type.STRING },
              trust_level: { type: Type.STRING },
              enterprise_readiness: { type: Type.STRING }
            },
            required: ["score_change_rationale", "trust_level", "enterprise_readiness"]
          }
        },
        required: ["audit_findings", "corrected_before_optimization", "corrected_optimized_resume", "corrected_after_optimization", "credibility_verdict"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty audit data.");
  return JSON.parse(text);
};
