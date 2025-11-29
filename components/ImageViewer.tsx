import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, RemixIcon, CloseIcon } from './Icons';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRemix: (image: GeneratedImage) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onRemix }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `soul-wallpaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Background blur effect */}
      <div 
        className="absolute inset-0 opacity-30 bg-cover bg-center filter blur-3xl scale-110"
        style={{ backgroundImage: `url(${image.url})` }}
      />
      
      {/* Header Actions */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img 
          src={image.url} 
          alt={image.prompt} 
          className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain animate-slide-up"
        />
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 flex flex-col gap-4">
        <p className="text-sm text-gray-300 line-clamp-2 text-center italic mb-2">
          "{image.prompt}"
        </p>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => onRemix(image)}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all active:scale-95"
          >
            <RemixIcon className="w-5 h-5" />
            Remix
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
          >
            <DownloadIcon className="w-5 h-5" />
            다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
