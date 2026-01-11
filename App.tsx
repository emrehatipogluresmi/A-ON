
import React, { useState } from 'react';
import { AppMode } from './types';
import ModeToggle from './components/ModeToggle';
import AionVision from './components/AionVision';
import AionChat from './components/AionChat';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VISION);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none font-inter text-white">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            mode === AppMode.VISION ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full" />
        </div>
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            mode === AppMode.AION ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-900/10 blur-[100px] rounded-full" />
        </div>
      </div>

      <ModeToggle currentMode={mode} onModeChange={setMode} />

      {/* Main Content Viewport */}
      <main className="h-full w-full relative z-10">
        <div 
          className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mode === AppMode.VISION 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <AionVision />
        </div>

        <div 
          className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mode === AppMode.AION 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <AionChat />
        </div>
      </main>

      {/* Decorative Bezel Frame */}
      <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-[100]" />
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-[101]" />
    </div>
  );
};

export default App;
