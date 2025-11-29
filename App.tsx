import React, { useState, useRef, useEffect } from 'react';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage } from './types';
import LoadingGrid from './components/LoadingGrid';
import ImageViewer from './components/ImageViewer';
import { MagicIcon, SendIcon, CloseIcon, PhotoIcon } from './components/Icons';

function App() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [remixSource, setRemixSource] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImages([]); // Clear previous images to show loading state cleanly

    try {
      const newImages = await generateWallpapers(prompt, remixSource?.url);
      setImages(newImages);
      // Clear remix source after successful generation if desired, 
      // strictly keeping it allows continuous iteration. Let's keep it for now but clear UI focus.
      // Actually, standard UX: clear source after use to avoid confusion on next prompt.
      setRemixSource(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRemix = (image: GeneratedImage) => {
    setSelectedImage(null); // Close modal
    setRemixSource(image);
    // Pre-fill prompt or keep empty? 
    // Keeping empty allows user to type *new* instructions (e.g. "make it rainy").
    // But we should focus the input.
    setPrompt(""); 
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setRemixSource({
                    id: 'local-upload',
                    url: event.target.result as string,
                    prompt: '사용자 업로드 이미지',
                    createdAt: Date.now()
                });
                setPrompt("");
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        };
        reader.readAsDataURL(file);
    }
    // Reset the value so the same file can be selected again if needed
    e.target.value = '';
  };

  const clearRemix = () => {
    setRemixSource(null);
  };

  // Scroll to bottom when images load
  useEffect(() => {
    if (images.length > 0 && !loading) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [images, loading]);

  return (
    <div className="min-h-screen bg-black text-white pb-32 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
            <div className="flex items-center gap-2">
                <MagicIcon className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    SoulWallpaper
                </h1>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-md mx-auto min-h-screen flex flex-col">
        {error && (
            <div className="mx-4 mb-4 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-sm">
                {error}
            </div>
        )}

        {/* Welcome State (only if no images and not loading) */}
        {!loading && images.length === 0 && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 mt-20">
                <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6 animate-pulse">
                    <MagicIcon className="w-10 h-10 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-300 mb-2">나만의 감성 배경화면</h2>
                <p className="text-sm">"비 오는 서정적인 도시 풍경"<br/>"몽환적인 우주 고양이"<br/>원하는 분위기를 입력하거나<br/>사진을 업로드하여 리믹스해보세요.</p>
            </div>
        )}

        {/* Loading Grid */}
        {loading && <LoadingGrid />}

        {/* Results Grid */}
        {!loading && images.length > 0 && (
           <div className="grid grid-cols-2 gap-3 p-3 pb-4">
             {images.map((img) => (
               <button
                 key={img.id}
                 onClick={() => setSelectedImage(img)}
                 className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
               >
                 <img 
                   src={img.url} 
                   alt={img.prompt} 
                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
               </button>
             ))}
           </div>
        )}
        
        <div ref={bottomRef} />
      </main>

      {/* Sticky Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black to-transparent pt-10 pb-6 px-4">
        <div className="max-w-md mx-auto">
            
            {/* Remix Source Indicator */}
            {remixSource && (
                <div className="mb-2 flex items-center gap-2 bg-gray-800/80 backdrop-blur rounded-lg p-2 border border-purple-500/30 animate-slide-up">
                    <img src={remixSource.url} alt="Remix source" className="w-10 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-300 font-medium">Remixing Image</p>
                        <p className="text-xs text-gray-400 truncate">변형할 내용을 입력하세요</p>
                    </div>
                    <button onClick={clearRemix} className="p-2 text-gray-400 hover:text-white">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form 
                onSubmit={handleSubmit} 
                className={`relative flex items-center bg-gray-900 border transition-all duration-300 rounded-full shadow-2xl ${
                    loading ? 'border-gray-800 opacity-50 cursor-not-allowed' : 'border-gray-700 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'
                }`}
            >
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="pl-4 pr-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                    aria-label="Upload Image"
                >
                    <PhotoIcon className="w-6 h-6" />
                </button>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={remixSource ? "어떻게 바꿀까요?" : "어떤 분위기를 원하시나요?"}
                    className="w-full bg-transparent text-white py-4 pr-12 pl-1 rounded-full focus:outline-none placeholder-gray-500 text-sm"
                    disabled={loading}
                />
                
                <button 
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="absolute right-2 p-2.5 bg-purple-600 rounded-full text-white disabled:bg-gray-700 disabled:text-gray-500 transition-colors hover:bg-purple-500"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                </button>
            </form>
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
            />
        </div>
      </div>

      {/* Full Screen Viewer Modal */}
      <ImageViewer 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
        onRemix={handleRemix}
      />
    </div>
  );
}

export default App;