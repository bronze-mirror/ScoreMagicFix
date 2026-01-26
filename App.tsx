
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import ResultViewer from './components/ResultViewer';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(true);

  // 초기 로드 시 API 키 선택 여부 확인
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenSettings = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true); // 선택 후 성공했다고 가정 (레이스 컨디션 방지)
    } else {
      alert("이 환경에서는 API 키 선택 도구를 사용할 수 없습니다. 환경 변수를 확인하세요.");
    }
  };

  const handleImageSelect = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      setEnhancedImage(null);
      setError(null);
      setIsProcessing(true);

      try {
        const service = new GeminiService();
        const result = await service.enhanceSheetMusic(base64);
        setEnhancedImage(result);
      } catch (err: any) {
        setError(err.message || "악보 복원 중 오류가 발생했습니다.");
        // 특정 에러 시 키 선택 가이드
        if (err.message.includes("API 키")) {
          setHasKey(false);
        }
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const resetAll = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header onOpenSettings={handleOpenSettings} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {!hasKey && (
          <div className="mb-12 p-8 bg-indigo-50 border border-indigo-200 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-indigo-600">
              <i className="fas fa-key text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-indigo-900">API 키 연결이 필요합니다</h3>
            <p className="text-indigo-700 max-w-md mx-auto">
              고화질 악보 복원을 위해 본인의 Google Gemini API 키를 연결해야 합니다. 
              유료 플랜(Pay-as-you-go)이 활성화된 프로젝트의 키가 필요합니다.
            </p>
            <button 
              onClick={handleOpenSettings}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg transition-all"
            >
              지금 API 키 선택하기
            </button>
            <div className="pt-2">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener" className="text-xs text-indigo-400 underline">결제 문서 확인하기</a>
            </div>
          </div>
        )}

        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            흐릿한 악보를 <span className="text-indigo-600">마법처럼 선명하게.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            최신 Gemini 3 Pro AI를 활용해 악보를 복원합니다.<br/>
            음표, 꼬리표, 가사까지 완벽하게 잡아냅니다.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <i className="fas fa-exclamation-circle text-xl"></i>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!originalImage ? (
          <Dropzone onImageSelect={handleImageSelect} />
        ) : (
          <ResultViewer 
            original={originalImage} 
            enhanced={enhancedImage} 
            isProcessing={isProcessing} 
            onReset={resetAll} 
          />
        )}

        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-feather-pointed text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">정교한 기호 복원</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              복잡한 음표와 미세한 꼬리표, 임시표까지 AI가 정밀하게 인식하여 선명하게 다시 그려냅니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-font text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">가사 가독성 향상</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              번지거나 깨진 가사 텍스트를 분석하여 배경과 분리하고 훨씬 읽기 편한 텍스트로 강화합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-wand-magic-sparkles text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Gemini 3 Pro 파워</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              가장 강력한 시각 지능 모델을 사용하여 전문가급 악보 복원 품질을 제공합니다.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-8 px-6 text-center">
        <p className="text-gray-400 text-sm font-medium">
          &copy; 2024 Score Magic Fix. Powered by Google Gemini AI Studio.
        </p>
      </footer>
    </div>
  );
};

export default App;
