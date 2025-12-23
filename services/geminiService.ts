
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;
  private ai: any;

  private constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Transforms an image based on a text prompt.
   * @param base64Image The source image in base64 format (with or without data URL prefix)
   * @param prompt The instructions for the transformation
   * @returns The transformed image as a base64 string
   */
  public async transformImage(base64Image: string, prompt: string): Promise<string> {
    try {
      // Remove data URL prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: 'image/png', // Defaulting to png for better results
              },
            },
            {
              text: `Please edit this image based on the following instructions: ${prompt}. Maintain the composition but change the subject as requested.`,
            },
          ],
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No image generated from Gemini.");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("The AI response did not contain an image part.");
    } catch (error) {
      console.error("Gemini Transformation Error:", error);
      throw error;
    }
  }
}
