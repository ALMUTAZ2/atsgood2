
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types.ts";

/**
 * Analyzes and optimizes a resume using the strict ATS Quality Control Auditor logic.
 * The API_KEY is fetched from process.env.API_KEY (Set in Vercel or .env file).
 */
export const analyzeResume = async (
  resumeText: string, 
  signal?: AbortSignal
): Promise<AnalysisResult> => {
  // المحرك يبحث عن API_KEY في متغيرات البيئة
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    console.error("خطأ في الإعدادات: لم يتم العثور على API_KEY في متغيرات بيئة Vercel.");
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const cleanedInput = resumeText.slice(0, 12000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an Enterprise-grade ATS Quality Control Auditor. 
        Analyze, score, and rewrite this resume for maximum recruiter compatibility.
        
        RESUME TEXT:
        """
        ${cleanedInput}
        """`,
      config: {
        systemInstruction: `You are an elite ATS Quality Control Auditor.
        1. REWRITE: Transform all experience into Action-Context-Result (ACR) format.
        2. CLEAN: Remove all markdown symbols (like **, #, __) from the 'plain_text' resume field.
        3. AUDIT: Be critical. If the resume lacks metrics, give a low 'experience_impact' score.
        4. FORMAT: Return the response strictly as JSON.`,
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
    const errorMsg = error.message || "Unknown API error";
    
    if (errorMsg.includes("429")) throw new Error("Rate limit exceeded. Please wait 60 seconds.");
    if (errorMsg.includes("403")) throw new Error("API Key permissions issue. Check Google AI Studio status.");
    if (errorMsg.includes("400")) throw new Error("Request error. Try again with simpler text.");
    
    throw new Error(errorMsg);
  }
};
