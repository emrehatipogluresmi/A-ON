
import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/geminiService';

const AionVision: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null); // Yeni görsel seçildiğinde eski üretileni temizle
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setStatusText('');
    
    try {
      // Eğer seçili bir görsel varsa onu referans alarak düzenler, yoksa sıfırdan üretir.
      const result = await generateOrEditImage(prompt, selectedImage || undefined);
      setGeneratedImage(result.imageUrl);
      if (result.text) setStatusText(result.text);
    } catch (error) {
      console.error(error);
      alert("Görsel oluşturma sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `aion-vision-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearCanvas = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setStatusText('');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative pt-24 px-6 overflow-y-auto pb-40 scroll-smooth">
      <div className="absolute inset-0 vision-gradient pointer-events-none -z-10" />

      <div className="space-y-12">
        {/* Hero / Stage Area */}
        <div className="flex flex-col items-center space-y-8">
          <div className="relative group">
            <div 
              className={`w-64 h-64 lg:w-80 lg:h-80 glass rounded-[2.5rem] flex items-center justify-center border-white/10 overflow-hidden transition-all duration-700 shadow-[0_0_80px_rgba(59,130,246,0.15)] ${isLoading ? 'scale-95 opacity-50' : 'scale-100'}`}
            >
              {generatedImage ? (
                <img src={generatedImage} alt="Üretilen Görsel" className="w-full h-full object-cover animate-[fadeIn_1s_ease-out]" />
              ) : selectedImage ? (
                <img src={selectedImage} alt="Referans Görsel" className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20">
                   <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                   <p className="text-[10px] tracking-widest uppercase font-light">Henüz bir hayal kurulmadı</p>
                </div>
              )}
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                   <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Floating Controls */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 rounded-full glass border-white/10 text-[9px] tracking-widest text-white/80 hover:bg-white/10 transition-all uppercase font-bold flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {selectedImage ? "Referansı Değiştir" : "Referans Ekle"}
              </button>
              
              {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className="w-9 h-9 rounded-full glass border-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center"
                  title="Görseli İndir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              )}

              {(selectedImage || generatedImage) && (
                <button 
                  onClick={clearCanvas}
                  className="w-9 h-9 rounded-full glass border-white/10 text-white/40 hover:text-red-400 transition-all flex items-center justify-center"
                  title="Temizle"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </div>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-light tracking-tight text-white/90">AION Vision</h1>
            <p className="text-white/30 font-light text-[11px] tracking-widest uppercase">
              {selectedImage ? "Görsel Düzenleme Modu" : "Görsel Üretim Modu"}
            </p>
          </div>
        </div>

        {/* Input & Generation Area */}
        <div className="glass rounded-[2rem] p-8 lg:p-10 space-y-8 max-w-2xl mx-auto w-full transition-all duration-700 hover:border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedImage ? "Görseli nasıl değiştirelim? Örn: 'Arka planı uzay yap' veya 'Karaktere şapka ekle'" : "Ne hayal ediyorsun? Örn: 'Neon ışıklı siberpunk bir kedi portresi'"}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-white/30 transition-all duration-500 text-white placeholder-white/20 resize-none h-32 leading-relaxed font-light"
          />
          
          <button
            onClick={handleProcess}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-5 rounded-2xl bg-white text-black text-sm font-bold hover:scale-[1.02] active:scale-[0.98] disabled:bg-white/10 disabled:text-white/20 transition-all duration-500 shadow-[0_10px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                <span className="ml-2 uppercase tracking-widest text-[10px]">Hayal Ediliyor...</span>
              </>
            ) : (
              <span className="uppercase tracking-widest text-[10px]">
                {selectedImage ? "Görseli Yeniden Yarat" : "Görseli Oluştur"}
              </span>
            )}
          </button>
        </div>

        {/* Extra Feedback */}
        {statusText && (
          <div className="max-w-2xl mx-auto w-full animate-[fadeIn_0.8s_ease-out_forwards]">
            <div className="glass rounded-2xl p-6 text-white/40 text-[11px] font-light leading-relaxed border-white/5 italic">
              "{statusText}"
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-8 opacity-20">
         <p className="text-[9px] tracking-widest uppercase">Aion Vision Studio</p>
         <p className="text-[9px] tracking-widest uppercase">Gemini 2.5 Flash Image</p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AionVision;
