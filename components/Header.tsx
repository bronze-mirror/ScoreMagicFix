
import React from 'react';

const Header: React.FC = () => {
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
        <div className="hidden md:block">
          <span className="text-xs font-semibold text-gray-400">Powered by Gemini AI</span>
        </div>
      </div>
    </nav>
  );
};

export default Header;
