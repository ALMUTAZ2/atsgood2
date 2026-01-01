
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Enterprise ATS Auditor Service
 * Performs deep analysis using Gemini-3-flash-preview.
 */
export const analyzeResume = async (
  resumeText: string, 
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // Access the API key from the environment bridge
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    console.error("ATS Auditor: API_KEY is missing. Check your environment variables.");
    throw new Error("API_KEY_MISSING_IN_BROWSER");
  }

  // Use new GoogleGenAI instance as per guidelines
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Truncate input to stay within reasonable token limits for a fast audit
  const cleanedInput = resumeText.slice(0, 15000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an Enterprise ATS Quality Control Auditor.
        Perform a strict audit on this resume and return a structured JSON report.
        
        RESUME TEXT:
        """
        ${cleanedInput}
        """`,
      config: {
        systemInstruction: `You are an elite Enterprise ATS Quality Control Auditor.
        Mission: Eliminate "AI fluff", enforce metrics-driven experience, and ensure zero-error parsing.
        Rules:
        1. REWRITE: All bullets must follow the Action-Context-Result (ACR) model.
        2. CLEAN: The 'plain_text' field must be clean of markdown (no **, #, __).
        3. HONESTY: Provide conservative scores. Rejection risk should be 'High' if metrics are missing.
        4. FORMAT: Return strict JSON only.`,
        temperature: 0.1,
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

    if (signal?.aborted) throw new Error("AbortError");

    const rawText = response.text;
    if (!rawText) throw new Error("EMPTY_AI_RESPONSE");

    return JSON.parse(rawText.replace(/```json|```/g, "").trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
