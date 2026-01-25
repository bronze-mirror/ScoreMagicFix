
import React, { useState } from 'react';
import { StorageKeys } from '../types';
import { GeminiService } from '../services/geminiService';

interface ApiKeyModalProps {
  onSuccess: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess }) => {
  const [key, setKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setIsValidating(true);
    setError(null);

    const service = new GeminiService(key);
    const isValid = await service.validateKey();

    if (isValid) {
      localStorage.setItem(StorageKeys.API_KEY, btoa(key)); // Simple obfuscation
      onSuccess(key);
    } else {
      setError('유효하지 않은 API 키입니다. 다시 확인해주세요.');
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-key"></i>
            Gemini API 연결
          </h2>
          <p className="text-indigo-100 text-sm mt-2">
            본인의 API 키를 입력하여 악보 매직픽스를 시작하세요. 입력하신 키는 로컬 브라우저에만 안전하게 저장됩니다.
          </p>
        </div>
        
        <form onSubmit={handleValidate} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Google Gemini API Key</label>
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <i className="fas fa-shield-alt"></i>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isValidating}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                isValidating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95'
              }`}
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch animate-spin"></i>
                  연결 확인 중...
                </span>
              ) : '연결 및 시작하기'}
            </button>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-center text-indigo-500 hover:underline"
            >
              API 키가 없으신가요? 여기서 무료로 받으세요
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
