
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private getAiInstance() {
    // 지침에 따라 매 호출 시점에 인스턴스를 생성하여 최신 API 키 상태를 반영할 수 있게 함
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async enhanceSheetMusic(base64Image: string): Promise<string> {
    try {
      const ai = this.getAiInstance();
      const response = await ai.models.generateContent({
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
              text: "You are an expert music engraver. Sharpen and enhance this blurry sheet music. Ensure all musical symbols—notes, stems, flags, beams, accidentals, and staff lines—are crisp, solid black, and perfectly defined on a clean white background. Remove all noise, blur, and yellowing. Output ONLY the resulting high-contrast enhanced image."
            }
          ]
        }
      });

      let enhancedImageUrl: string | null = null;

      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            enhancedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!enhancedImageUrl) {
        throw new Error("모델이 이미지를 생성하지 못했습니다. 다시 시도해주세요.");
      }

      return enhancedImageUrl;
    } catch (error: any) {
      console.error("Enhancement failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API 키 권한 문제 또는 모델 접근 권한이 없습니다.");
      }
      throw new Error(error.message || "Gemini API 처리 중 오류가 발생했습니다.");
    }
  }
}
