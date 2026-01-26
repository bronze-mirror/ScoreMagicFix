
import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
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
        
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 shadow-sm"
        >
          <i className="fas fa-cog text-indigo-600"></i>
          <span className="hidden sm:inline">API 연결 설정</span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
