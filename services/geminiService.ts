import { GoogleGenAI, Type } from "@google/genai";
import { CAMPAIGN_TYPES } from "../constants";

// Declare process variable to avoid TypeScript errors during build
declare var process: any;

const getAiClient = () => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  // Assume this variable is pre-configured, valid, and accessible.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCampaignIdeas = async (
  brandName: string,
  industry: string,
  month: string,
  campaignTypeKey: string
): Promise<{ title: string; description: string }[]> => {
  const ai = getAiClient();

  // Get label safely
  const typeLabel = CAMPAIGN_TYPES[campaignTypeKey as keyof typeof CAMPAIGN_TYPES]?.label || 'General';

  const prompt = `Genera 3 ideas de campañas de marketing creativas para la marca "${brandName}" (${industry}).
  Contexto:
  - Mes: ${month}
  - Tipo de comunicación: "${typeLabel}"
  
  Devuelve solo un array JSON puro.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Un título corto y pegadizo (máx 5 palabras)" },
              description: { type: Type.STRING, description: "Descripción breve de la acción" }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    if (response.text) {
      // Robust cleanup: Remove markdown code blocks (```json ... ```) if present
      const cleanText = response.text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleanText);
    }
    return [];
  } catch (error) {
    console.error("Error generating campaigns:", error);
    // Fallback error handling without asking user to edit code
    return [];
  }
};