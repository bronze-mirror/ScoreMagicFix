
import React from 'react';

interface HeaderProps {
  onResetKey: () => void;
  isKeySet: boolean;
}

const Header: React.FC<HeaderProps> = ({ onResetKey, isKeySet }) => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <i className="fas fa-music text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Score Magic Fix</h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none">AI Notation Enhancer</p>
          </div>
        </div>

        {isKeySet && (
          <button 
            onClick={onResetKey}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors border border-gray-200"
          >
            <i className="fas fa-sign-out-alt"></i>
            API 키 재설정
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;
