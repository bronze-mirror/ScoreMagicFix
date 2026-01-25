
import React from 'react';

interface ResultViewerProps {
  original: string;
  enhanced: string | null;
  isProcessing: boolean;
  onReset: () => void;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ original, enhanced, isProcessing, onReset }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Original */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">원본 (Original)</span>
            <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded text-gray-500">Blurry</span>
          </div>
          <div className="relative aspect-[3/4] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-inner group">
            <img src={original} alt="Original" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
          </div>
        </div>

        {/* Enhanced */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">복원됨 (Enhanced)</span>
            {enhanced && <span className="px-2 py-0.5 bg-green-100 text-[10px] font-bold rounded text-green-600">Magic Fixed</span>}
          </div>
          <div className="relative aspect-[3/4] bg-white rounded-2xl border-2 border-indigo-100 overflow-hidden shadow-xl group">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/50 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-wand-magic-sparkles text-indigo-600 animate-pulse"></i>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-800">매직 픽스 진행 중...</h4>
                <p className="text-sm text-gray-500 mt-1 animate-pulse italic">음표와 가사를 선명하게 복원하고 있습니다.</p>
              </div>
            ) : enhanced ? (
              <>
                <img src={enhanced} alt="Enhanced" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-[1.02]" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = enhanced;
                    link.download = 'enhanced-score.png';
                    link.click();
                  }}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                  title="Download"
                >
                  <i className="fas fa-download"></i>
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <i className="fas fa-image text-4xl opacity-20"></i>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-redo"></i>
          다른 악보 복원하기
        </button>
      </div>
    </div>
  );
};

export default ResultViewer;
