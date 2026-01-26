
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * 고화질 악보 복원 프로세스
   * @param base64Image 원본 이미지 데이터
   */
  async enhanceSheetMusic(base64Image: string): Promise<string> {
    try {
      // 시스템 지침: API 호출 직전에 인스턴스 생성 (최신 process.env.API_KEY 보장)
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
              text: `You are a world-class professional music engraver. 
              Your task is to 'Magic Fix' this blurry or low-quality sheet music.
              1. Sharpen every musical notation: notes, stems, flags, beams, and staff lines.
              2. Render all symbols in high-contrast solid black (#000000).
              3. Ensure the background is pure, noise-free white (#FFFFFF).
              4. Make lyrics and text markings extremely crisp and legible.
              5. Remove all compression artifacts, shadows, and yellowing.
              Output ONLY the resulting high-definition enhanced image data.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
            imageSize: "1K"
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
        throw new Error("이미지 생성에 실패했습니다. API 키 권한 또는 프로젝트 설정을 확인하세요.");
      }

      return enhancedImageUrl;
    } catch (error: any) {
      console.error("Enhancement failure:", error);
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("연결된 API 프로젝트를 찾을 수 없습니다. 설정에서 다시 연결해 주세요.");
      }
      throw new Error(error.message || "악보 처리 중 알 수 없는 오류가 발생했습니다.");
    }
  }
}
