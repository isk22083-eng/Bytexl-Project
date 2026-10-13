import { GoogleGenAI } from "@google/genai";
import type { ExtractionResult } from "./types";

const MODEL = "gemini-2.0-flash";

const EXTRACTION_PROMPT = `You are a careful medical-document reading assistant. You are given an image of a medical document (prescription, lab report, or discharge summary), possibly handwritten and possibly in a mix of English and Telugu.

Read the document and return ONLY a single JSON object (no markdown fences, no commentary) matching exactly this shape:

{
  "documentType": "prescription" | "lab_report" | "discharge_summary" | "other",
  "documentDate": string | null,          // ISO date (YYYY-MM-DD) if you can determine it, else null
  "patientNameGuess": string | null,       // only if clearly printed/written on the document
  "medications": [
    { "name": string, "dosage": string | null, "frequency": string | null, "duration": string | null, "instructions": string | null }
  ],
  "labObservations": [
    { "testName": string, "value": string, "unit": string | null, "referenceRange": string | null, "isAbnormal": boolean, "plainLanguageNote": string | null }
  ],
  "diagnoses": [
    { "description": string, "date": string | null }
  ],
  "summaryEnglish": string,   // 3-6 sentences, plain language, explain any abnormal values and what the document is about
  "summaryTelugu": string | null, // same summary translated to Telugu script if requested, else null
  "disclaimer": string        // a short safety disclaimer, e.g. "This is an AI-generated summary for informational purposes only and is not a medical diagnosis. Please consult a qualified doctor."
}

Rules:
- If a field cannot be determined from the document, use null or an empty array — never invent data.
- Use cautious, non-diagnostic language. Never tell the user to start, stop or change a medication. Never claim certainty about a diagnosis.
- Mark a lab value as "isAbnormal": true only if it clearly falls outside a printed reference range on the document, or is a widely-known abnormal value for a common test.
- Always include the disclaimer field.
- Return ONLY the JSON object, nothing else.`;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export async function extractFromDocument(options: {
  base64Data: string;
  mimeType: string;
  includeTelugu: boolean;
}): Promise<ExtractionResult> {
  const { base64Data, mimeType, includeTelugu } = options;
  const ai = getClient();

  const prompt = includeTelugu
    ? EXTRACTION_PROMPT
    : EXTRACTION_PROMPT.replace(
        '"summaryTelugu": string | null, // same summary translated to Telugu script if requested, else null',
        '"summaryTelugu": null, // Telugu not requested for this call'
      );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }

  const parsed = JSON.parse(stripJsonFences(text)) as ExtractionResult;

  if (!parsed.disclaimer) {
    parsed.disclaimer =
      "This is an AI-generated summary for informational purposes only and is not a medical diagnosis. Please consult a qualified doctor.";
  }

  return parsed;
}
