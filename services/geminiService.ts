
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  async enhanceSheetMusic(base64Image: string): Promise<string> {
    try {
      // 호출 시점에 새 인스턴스를 생성하여 최신 API 키(process.env.API_KEY)를 사용함
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/png'
              }
            },
            {
              text: "You are an elite music engraver. Sharpen and enhance this blurry sheet music. Every note, stem, flag, beam, accidental, and staff line must be perfectly rendered in high-contrast solid black on a pure white background. Eliminate all noise, blur, and compression artifacts. Ensure the lyrics are extremely legible. Output ONLY the resulting high-resolution enhanced image."
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
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
        throw new Error("이미지 생성에 실패했습니다. API 키의 결제 상태나 권한을 확인해 주세요.");
      }

      return enhancedImageUrl;
    } catch (error: any) {
      console.error("Enhancement failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        // 키 선택이 필요함을 알리는 특수 에러 처리
        throw new Error("API 키가 유효하지 않거나 프로젝트를 찾을 수 없습니다. 다시 설정해 주세요.");
      }
      throw new Error(error.message || "Gemini API 처리 중 오류가 발생했습니다.");
    }
  }
}
