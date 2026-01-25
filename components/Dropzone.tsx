
import React, { useRef } from 'react';

interface DropzoneProps {
  onImageSelect: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className="group relative border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-3xl p-12 transition-all cursor-pointer bg-white/50 hover:bg-indigo-50/30 flex flex-col items-center justify-center min-h-[400px]"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="image/*" 
      />
      
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white">
        <i className="fas fa-cloud-upload-alt text-3xl"></i>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">흐릿한 악보를 올려주세요</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        흐릿하거나 오래된 악보 이미지를 드래그하거나 클릭하여 업로드하세요. AI가 선명하게 복원해 드립니다.
      </p>

      <div className="flex gap-4">
        <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">JPG</span>
        <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">PNG</span>
        <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">WEBP</span>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-indigo-400 animate-bounce">
        <i className="fas fa-chevron-down"></i>
        <span className="text-[10px] font-bold uppercase tracking-wider">Start Magic Fix</span>
      </div>
    </div>
  );
};

export default Dropzone;
