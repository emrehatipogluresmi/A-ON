
import React from 'react';
import { AppMode } from '../types';

interface ModeToggleProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 p-1.5 rounded-full glass shadow-2xl scale-90 lg:scale-100 transition-all">
      <button
        onClick={() => onModeChange(AppMode.VISION)}
        className={`px-6 py-2.5 rounded-full text-[10px] tracking-widest font-bold transition-all duration-500 flex items-center gap-3 ${
          currentMode === AppMode.VISION 
          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          : 'text-white/40 hover:text-white/80'
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${currentMode === AppMode.VISION ? 'bg-black' : 'bg-blue-500/50'}`} />
        GÖZ
      </button>
      <button
        onClick={() => onModeChange(AppMode.AION)}
        className={`px-6 py-2.5 rounded-full text-[10px] tracking-widest font-bold transition-all duration-500 flex items-center gap-3 ${
          currentMode === AppMode.AION 
          ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          : 'text-white/40 hover:text-white/80'
        }`}
      >
        <div className={`w-2.5 h-2.5 squircle transition-colors ${currentMode === AppMode.AION ? 'bg-black' : 'bg-purple-500/50'}`} />
        AKIL
      </button>
    </div>
  );
};

export default ModeToggle;
