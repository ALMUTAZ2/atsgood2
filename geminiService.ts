
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Analyzes and optimizes a resume using the strict ATS Quality Control Auditor logic.
 * Uses Gemini 3 Flash for fast, reliable processing.
 */
export const analyzeResume = async (
  resumeText: string, 
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // Use the environment variable set in Vercel
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("CRITICAL: API_KEY is missing in the environment.");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean and limit input
  const cleanedInput = resumeText.slice(0, 15000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an Enterprise-grade ATS Quality Control Auditor and Senior Recruiter. 
        Perform a deep audit and rewrite the following resume.
        
        RESUME TO AUDIT:
        """
        ${cleanedInput}
        """`,
      config: {
        systemInstruction: `You are an elite ATS Quality Control Auditor.
        1. CRITICAL: Do NOT use markdown (**, #, etc.) in the output resume.
        2. Rewrite bullet points using the Action-Context-Result (ACR) framework.
        3. Ensure the output is a perfectly structured JSON object.
        4. Be honest with scores: penalize fluff, lack of metrics, and poor formatting.`,
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
    if (!rawText) throw new Error("The AI returned an empty response.");

    return JSON.parse(rawText.replace(/```json|```/g, "").trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Extract meaningful error message
    const errorMsg = error.message || "Unknown API error";
    if (errorMsg.includes("429")) throw new Error("Rate limit exceeded. Please try again later.");
    if (errorMsg.includes("400")) throw new Error("Invalid request or API key. Check Vercel settings.");
    throw new Error(errorMsg);
  }
};
