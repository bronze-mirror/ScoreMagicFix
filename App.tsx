
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import ResultViewer from './components/ResultViewer';
import { GeminiService } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // 초기 로드 시 API 키 상태 확인 및 자동 연결
  useEffect(() => {
    const initConnection = async () => {
      try {
        // 1. Vercel 환경 변수에 API_KEY가 있는지 먼저 확인 (가장 우선)
        if (process.env.API_KEY && process.env.API_KEY.length > 5) {
          console.debug("Vercel Environment Variable detected.");
          setIsConnected(true);
          return;
        }

        // 2. AI Studio 보안 도구 확인 (차선책)
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsConnected(hasKey);
        } else {
          console.warn("No API_KEY in env and window.aistudio is not available.");
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
    console.debug("Opening Magic Tuning...");
    
    // AI Studio 내부에서 실행 중인 경우
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error("Failed to open key selector:", err);
        setError("보안 설정 창을 여는 중 문제가 발생했습니다.");
      }
    } 
    // Vercel 등 외부 배포 환경인 경우
    else {
      const vMessage = "현재 Vercel 배포 환경입니다. API 연결을 위해 Vercel 대시보드(Settings > Environment Variables)에서 'API_KEY'를 추가해 주세요. AI Studio 내부에서 사용 중이라면 새로고침이 필요할 수 있습니다.";
      setError(vMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!isConnected) {
      setError("먼저 API 키가 연결되어야 매직 픽스를 시작할 수 있습니다.");
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
        console.error("Image processing error:", err);
        setError(err.message);
        // 키 문제일 경우 연결 상태 해제 (단, 환경 변수 방식은 제외)
        if (!process.env.API_KEY && (err.message.includes("연결") || err.message.includes("인증"))) {
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
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Security Handshaking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header onOpenSettings={handleOpenSettings} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {!isConnected ? (
          <div className="max-w-2xl mx-auto bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-12 text-center space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="relative inline-block">
              <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                <i className="fas fa-key text-5xl"></i>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500">
                <i className="fas fa-lock"></i>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">Gemini AI 연결이 필요합니다</h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
                악보 매직픽스는 구글의 강력한 시각 AI를 사용합니다. 보안 키를 통해 안전하게 연결해 주세요.
              </p>
            </div>
            
            {error && (
              <div className="p-6 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-2xl text-sm text-left flex gap-4 shadow-sm">
                <i className="fas fa-info-circle text-xl mt-1"></i>
                <div className="space-y-2">
                  <p className="font-bold">환경 설정 안내</p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-indigo-500 uppercase mb-2">Option A</p>
                <p className="text-sm font-bold text-gray-700 mb-1">AI Studio 런타임</p>
                <p className="text-xs text-gray-500 leading-relaxed">구글 AI Studio 내부에서 버튼 한 번으로 연결합니다.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-purple-500 uppercase mb-2">Option B</p>
                <p className="text-sm font-bold text-gray-700 mb-1">Vercel 배포 환경</p>
                <p className="text-xs text-gray-500 leading-relaxed">Vercel 대시보드에서 API_KEY 변수를 설정하세요.</p>
              </div>
            </div>
            
            <button 
              onClick={handleOpenSettings}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-4 group"
            >
              <i className="fas fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i>
              보안 연결 도구 실행
            </button>
            
            <p className="text-xs text-gray-400">
              * 사용자의 키는 브라우저 외부로 유출되지 않으며, 암호화된 채널을 통해서만 전송됩니다.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Securely Connected
              </div>
              <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                흐릿한 악보를 <span className="text-indigo-600">마법처럼 선명하게.</span>
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                음표의 꼬리표 하나까지 완벽하게 복원하는 전문가급 AI 도구입니다.
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <i className="fas fa-triangle-exclamation text-xl"></i>
                  <p className="font-bold">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 p-2">
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

            <section className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <i className="fas fa-brain text-2xl"></i>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Gemini 3 Pro</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  단순한 필터가 아닙니다. AI가 악보의 구조를 이해하고 음악적으로 정확하게 재구성합니다.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <i className="fas fa-shield-halved text-2xl"></i>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">보안 우선 설계</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  구글 공식 보안 프레임워크를 사용하여 사용자의 API 키와 악보 데이터의 프라이버시를 지킵니다.
                </p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <i className="fas fa-file-pdf text-2xl"></i>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">인쇄 최적화</h4>
                <p className="text-gray-500 leading-relaxed font-medium">
                  복원 즉시 인쇄 가능한 고해상도 PNG로 제공되어, 연습이나 합주에 바로 활용 가능합니다.
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="w-full bg-white border-t border-gray-100 py-12 px-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fas fa-music"></i>
            </div>
            <span className="font-extrabold text-gray-900">Score Magic Fix</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">
            &copy; 2024 Score Magic Fix. Advanced AI Restoration by Google Gemini.
          </p>
          <div className="flex gap-4 text-gray-300 text-lg">
            <i className="fab fa-github hover:text-gray-900 cursor-pointer transition-colors"></i>
            <i className="fas fa-envelope hover:text-indigo-600 cursor-pointer transition-colors"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
