
import React, { useState } from 'react';
import { AppMode } from './types';
import ModeToggle from './components/ModeToggle';
import AionVision from './components/AionVision';
import AionChat from './components/AionChat';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VISION);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none">
      {/* Dynamic Background */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        {mode === AppMode.VISION ? (
           <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-black opacity-50" />
        ) : (
           <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-black opacity-50" />
        )}
      </div>

      <ModeToggle currentMode={mode} onModeChange={setMode} />

      {/* Viewport Transition Container */}
      <main className="h-full w-full relative">
        <div 
          className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mode === AppMode.VISION 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <AionVision />
        </div>

        <div 
          className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mode === AppMode.AION 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <AionChat />
        </div>
      </main>

      {/* Global Aesthetics */}
      <div className="fixed inset-0 pointer-events-none border-[12px] border-black z-[100]" />
      <div className="fixed inset-0 pointer-events-none ring-1 ring-white/5 z-[100]" />
    </div>
  );
};

export default App;
