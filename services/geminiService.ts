
import { GoogleGenAI } from "@google/genai";
import { Application } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSummary = async (applications: Application[]): Promise<string> => {
  if (!API_KEY) {
    return "AI features are disabled. Please configure your API key.";
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
