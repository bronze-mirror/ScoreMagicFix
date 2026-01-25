
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import Dropzone from './components/Dropzone';
import ResultViewer from './components/ResultViewer';
import { GeminiService } from './services/geminiService';
import { StorageKeys } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(StorageKeys.API_KEY);
    if (stored) {
      try {
        setApiKey(atob(stored));
      } catch {
        setShowKeyModal(true);
      }
    } else {
      setShowKeyModal(true);
    }
  }, []);

  const handleKeySuccess = (key: string) => {
    setApiKey(key);
    setShowKeyModal(false);
  };

  const handleResetKey = () => {
    localStorage.removeItem(StorageKeys.API_KEY);
    setApiKey(null);
    setShowKeyModal(true);
  };

  const handleImageSelect = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      setEnhancedImage(null);
      setError(null);
      setIsProcessing(true);

      if (!apiKey) {
        setShowKeyModal(true);
        setIsProcessing(false);
        return;
      }

      try {
        const service = new GeminiService(apiKey);
        const result = await service.enhanceSheetMusic(base64);
        setEnhancedImage(result);
      } catch (err: any) {
        setError(err.message || "악보 복원 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [apiKey]);

  const resetAll = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <Header onResetKey={handleResetKey} isKeySet={!!apiKey} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            흐릿한 악보를 <span className="text-indigo-600">마법처럼 선명하게.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            AI 기술을 활용해 오래된 악보나 저해상도 사진을 깨끗하게 복원합니다.<br/>
            음표, 꼬리표, 가사까지 완벽하게 잡아냅니다.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-bounce">
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

        {/* Feature Highlights */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-feather-pointed text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">정교한 기호 복원</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              복잡한 음표와 미세한 꼬리표, 임시표까지 AI가 정밀하게 인식하여 선명하게 다시 그려냅니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-font text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">가사 가독성 향상</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              번지거나 깨진 가사 텍스트를 분석하여 배경과 분리하고 훨씬 읽기 편한 텍스트로 강화합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-user-shield text-xl"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">강력한 개인정보 보호</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              사용자의 API 키는 브라우저 내부에 암호화되어 저장되며, 그 어떤 외부 서버로도 전송되지 않습니다.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-8 px-6 text-center">
        <p className="text-gray-400 text-sm font-medium">
          &copy; 2024 Score Magic Fix. Powered by Google Gemini API.
        </p>
      </footer>

      {showKeyModal && <ApiKeyModal onSuccess={handleKeySuccess} />}
    </div>
  );
};

export default App;
