// FIX: Add reference to vite/client to resolve `import.meta.env` type error.
/// <reference types="vite/client" />

import { GoogleGenAI } from "@google/genai";
import { Application } from '../types';

// FIX: Per @google/genai guidelines, initialize the client at the module level.
// The logic is simplified into a helper function to handle cases where the API key is not provided.
const getAiClient = (): GoogleGenAI | null => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY") {
    try {
      return new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
      return null;
    }
  }
  console.warn("Gemini API key not set in .env file. AI features will be disabled.");
  return null;
};

const ai = getAiClient();

export const generateSummary = async (applications: Application[]): Promise<string> => {
  if (!ai) {
    return "AI features are disabled. Please configure your Gemini API key in the .env file.";
  }
  
  if (applications.length === 0) {
    return "No application data to summarize. Add some applications first!";
  }

  const model = 'gemini-2.5-flash';

  const simplifiedApps = applications.map(({ company, position, appliedDate, status }) => ({
    company,
    position,
    appliedDate,
    status,
  }));

  const prompt = `
    You are an expert career coach assistant. Analyze the following list of job applications and provide a concise, encouraging, and insightful summary for the user.
    The summary should be 2-4 sentences long.
    - Start with a positive and encouraging tone.
    - Mention the total number of applications.
    - Highlight key stats like the number of interviews or offers, if any.
    - If there are many applications with no response, suggest following up.
    - End with a motivational sentence.

    Here is the job application data in JSON format:
    ${JSON.stringify(simplifiedApps)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not generate summary from Gemini API.");
  }
};
