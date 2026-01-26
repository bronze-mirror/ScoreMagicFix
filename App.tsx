
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // 초기 로드 시 API 키 선택 여부 확인 (빈 화면 방지)
  useEffect(() => {
    const initConnection = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsConnected(hasKey);
        }
      } catch (err) {
        console.error("Connection check failed", err);
      } finally {
        setIsCheckingKey(false);
      }
    };
    initConnection();
  }, []);

  const handleOpenSettings = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      setError("설정 창을 여는 중 문제가 발생했습니다.");
    }
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!isConnected) {
      setError("먼저 우측 상단 톱니바퀴 아이콘을 눌러 API 키를 연결해 주세요.");
      return;
    }

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
        setError(err.message);
        if (err.message.includes("API 키") || err.message.includes("연결")) {
          setIsConnected(false);
        }
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [isConnected]);

  const resetAll = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setError(null);
    setIsProcessing(false);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">연결 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header onOpenSettings={handleOpenSettings} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {!isConnected ? (
          <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
              <i className="fas fa-shield-halved text-4xl"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900">안전한 API 연결 시작</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                각 사용자의 개인 API 키를 사용해 악보를 복원합니다. <br/>
                입력하신 키는 암호화되어 관리되며 외부로 노출되지 않습니다.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4 text-left">
              <i className="fas fa-info-circle text-indigo-400 mt-1"></i>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="font-bold">결제가 활성화된 프로젝트의 키가 필요합니다.</p>
                <p>Gemini 3 Pro 모델을 사용해 최상의 복원 품질을 제공합니다.</p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener" className="text-indigo-600 underline font-medium">결제 관련 가이드 보기</a>
              </div>
            </div>
            <button 
              onClick={handleOpenSettings}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-plug-circle-check"></i>
              지금 API 연결하기
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                AI STUDIO 보안 연결됨
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                흐릿한 악보를 <span className="text-indigo-600">마법처럼 선명하게.</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                음표, 꼬리표, 가사까지 완벽하게 잡아내는 전문가급 AI 복원 도구입니다.
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <i className="fas fa-triangle-exclamation text-xl"></i>
                  <p className="font-semibold">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  <i className="fas fa-times"></i>
                </button>
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
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-microchip text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Gemini 3 Pro 엔진</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  가장 정교한 시각 추론 모델을 사용하여 일반적인 업스케일링보다 훨씬 정확한 복원을 제공합니다.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-shield-check text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">외부 관리 방식 보안</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  키는 애플리케이션 코드가 아닌 시스템 레벨에서 암호화되어 관리되므로 절대 노출되지 않습니다.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-print text-xl"></i>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">즉각적인 출력 최적화</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  복원된 결과물은 즉시 인쇄하거나 디지털 악보로 활용할 수 있는 고대비 PNG 파일로 제공됩니다.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-8 px-6 text-center">
        <p className="text-gray-400 text-sm font-medium">
          &copy; 2024 Score Magic Fix. Securely Powered by Google Gemini AI.
        </p>
      </footer>
    </div>
  );
};

export default App;
