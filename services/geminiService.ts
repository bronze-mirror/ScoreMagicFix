
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async validateKey(): Promise<boolean> {
    try {
      // Small call to validate if the key is working
      await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      return true;
    } catch (error) {
      console.error("API Key validation failed:", error);
      return false;
    }
  }

  async enhanceSheetMusic(base64Image: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/png'
              }
            },
            {
              text: "You are an expert music engraver and digital document restorer. Sharpen and enhance this blurry sheet music. Ensure all musical symbols—notes, stems, flags, beams, accidentals, and staff lines—are crisp, dark black, and perfectly defined on a clean, pure white background. Enhance the lyrics to be legible and sharp. Remove any graininess or blur. Output ONLY the resulting high-contrast enhanced image."
            }
          ]
        }
      });

      let enhancedImageUrl: string | null = null;

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          enhancedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!enhancedImageUrl) {
        throw new Error("Model failed to generate an enhanced image.");
      }

      return enhancedImageUrl;
    } catch (error: any) {
      console.error("Enhancement failed:", error);
      throw new Error(error.message || "Failed to process the image with Gemini.");
    }
  }
}
