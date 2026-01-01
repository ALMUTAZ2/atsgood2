
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Analyzes and optimizes a resume using the strict ATS Quality Control Auditor logic.
 * Uses Gemini 3 Pro with thinking capabilities for enterprise-grade reasoning.
 */
export const analyzeResume = async (
  resumeText: string, 
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // Try to get from env first, otherwise use the specific key provided by the user
  const apiKey = process.env.API_KEY || "AIzaSyA0zxxgHESUqLIPmL1qooWarXgjacDT2-s";
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("CRITICAL: API_KEY is missing. Check your configuration.");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean and limit input to prevent token overflow
  const cleanedInput = resumeText.slice(0, 15000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an Enterprise-grade ATS Quality Control Auditor. 
        Analyze, score, and rewrite this resume for maximum Fortune 500 compatibility.

        RESUME CONTENT:
        """
        ${cleanedInput}
        """`,
      config: {
        systemInstruction: `You are a strict ATS Auditor. 
        - Penalize markdown (**, ##).
        - Use Impact Logic (quantified achievements).
        - Optimized resume must be PLAIN TEXT only.
        - Output MUST be a valid JSON object matching the schema exactly.`,
        temperature: 0.1, 
        thinkingConfig: { thinkingBudget: 4000 },
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
    if (!rawText) throw new Error("EMPTY_RESPONSE");

    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Gemini Analysis Failure:", error);
    throw error;
  }
};
