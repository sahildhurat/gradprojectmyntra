import { GoogleGenerativeAI } from "@google/generative-ai";
import { Product, Check, Assessment } from "../../data/types";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import { assessmentSchema } from "./schema";
import { evidenceGuard } from "./evidenceGuard";

// Fallback assessment for when the API fails or times out
const FALLBACK_ASSESSMENT: Assessment = {
  match_reasons: [
    { statement: "This item generally aligns with your stated use case based on standard categorisation.", evidence_ids: [] }
  ],
  considerations: [],
  unknowns: [
    { statement: "Detailed fit analysis", missing_information: "Live AI generation timed out." }
  ],
  question_to_resolve: "Does this look like it could work for you?",
  evidence_completeness: "low",
  isFallback: true
};

export async function generateAssessment(product: Product, context: Partial<Check>): Promise<Assessment> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
    return product.fallbackAssessment || FALLBACK_ASSESSMENT;
  }

  console.log("DEBUG: Using GEMINI_API_KEY starting with:", apiKey.substring(0, 4));

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2, // Low temperature for high factual adherence
      responseMimeType: "application/json",
      responseSchema: assessmentSchema,
    }
  });

  const prompt = buildUserMessage(product, context);

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = result.response.text();
    const rawAssessment = JSON.parse(text);

    // Apply Evidence Guard
    return evidenceGuard(rawAssessment, product);
    
  } catch (error: any) {
    console.error("CRITICAL AI FAILURE. Reason:", error.name, error.message);
    if (error.status) console.error("Status code:", error.status);
    console.error("Stack trace:", error.stack);
    // Return cached fallback or generic fallback
    return product.fallbackAssessment || FALLBACK_ASSESSMENT;
  }
}
