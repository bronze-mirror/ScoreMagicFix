
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * 고화질 악보 복원 프로세스
   * @param base64Image 원본 이미지 데이터
   */
  async enhanceSheetMusic(base64Image: string): Promise<string> {
    try {
      if (!process.env.API_KEY) {
        throw new Error("연결된 API 키가 없습니다. 설정에서 키를 먼저 연결해 주세요.");
      }

      // 최신 API 키를 반영하기 위해 호출 시점에 인스턴스 생성
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Gemini 3 Pro 모델 사용 (고화질 시각 지능 최적화)
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
            imageSize: "1K" // 고해상도 출력
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
        throw new Error("이미지 생성에 실패했습니다. 결제가 활성화된 프로젝트의 키인지 확인해 주세요.");
      }

      return enhancedImageUrl;
    } catch (error: any) {
      console.error("Enhancement failure:", error);
      
      // 구체적인 에러 안내
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API 키가 잘못되었거나 유효하지 않은 프로젝트입니다. 다시 연결해 주세요.");
      }
      
      if (error.status === 401 || error.status === 403) {
        throw new Error("API 키 인증 실패: 유료 플랜이 활성화된 프로젝트인지 확인해 주세요.");
      }

      throw new Error(error.message || "악보 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }
}
