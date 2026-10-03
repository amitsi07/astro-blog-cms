import React from 'react';
import { usePrompts } from '../context/PromptContext';
import { Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = usePrompts();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#171926] text-white border border-[#2d3148] shadow-2xl shadow-black/80 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-medium">
        <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
