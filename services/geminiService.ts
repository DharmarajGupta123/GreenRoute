import { GoogleGenAI, Type } from "@google/genai";
import { RouteEstimation } from "../types";

// Initialize Gemini Client
// IMPORTANT: In a real production app, this call would happen on a backend server.
// @ts-expect-error process is defined in the build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRouteDetails = async (origin: string, destination: string): Promise<RouteEstimation> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      I am planning a trip from "${origin}" to "${destination}".
      Please estimate the distance in kilometers and the driving time in minutes between these two places.
      If the locations are vague, make a best guess based on major cities or landmarks.
      Also, provide a short, motivating "Green Tip" or interesting environmental fact related to sustainable travel or this specific region.
      Return the standardized names of the origin and destination.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distanceKm: { type: Type.NUMBER, description: "Estimated distance in kilometers" },
            durationMins: { type: Type.NUMBER, description: "Estimated driving time in minutes" },
            greenTip: { type: Type.STRING, description: "A motivating environmental tip or fact" },
            originFormatted: { type: Type.STRING, description: "Standardized name of the origin" },
            destinationFormatted: { type: Type.STRING, description: "Standardized name of the destination" },
          },
          required: ["distanceKm", "durationMins", "greenTip", "originFormatted", "destinationFormatted"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as RouteEstimation;
    return data;

  } catch (error) {
    console.error("Error fetching route details:", error);
    // Fallback for demo purposes if AI fails or key is invalid
    throw new Error("Unable to calculate route. Please check your connection or API key.");
  }
};
