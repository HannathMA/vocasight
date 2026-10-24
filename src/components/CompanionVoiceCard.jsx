import React from 'react'
import { Volume2, Sparkles } from 'lucide-react'
import { MascotBuddy } from './MascotBuddy'
import { useAppStore } from '../store/useAppStore'

export function CompanionVoiceCard({
  text,
  isSpeaking,
  onReplay,
  mascotType = 'robot',
  onToggleMascot = null,
}) {
  const { currentLanguage } = useAppStore()

  const labels = {
    badge: currentLanguage === 'ml' ? 'സ്പീച്ച് കൂട്ടുകാരൻ' : currentLanguage === 'hi' ? 'स्पीच दोस्त' : 'Companion Voice',
    speaking: currentLanguage === 'ml' ? 'സംസാരിക്കുന്നു...' : currentLanguage === 'hi' ? 'बोल रहे हैं...' : 'Speaking...',
    hearMe: currentLanguage === 'ml' ? 'കേൾക്കാം' : currentLanguage === 'hi' ? 'सुनें' : 'Hear Me',
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 border-2 border-sky-200 shadow-sm flex items-center justify-between gap-3 transition-all hover:border-sky-300">
      {/* Companion Avatar (Animated while speaking) */}
      <div
        onClick={onToggleMascot}
        title="Click to switch between Robot and Aana Teacher"
        className="shrink-0 w-12 h-12 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
      >
        <MascotBuddy
          type={mascotType}
          mood={isSpeaking ? 'talking' : 'happy'}
          size={46}
        />
      </div>

      {/* Speech text bubble */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{labels.badge}</span>
          </span>
          {isSpeaking && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold animate-pulse">
              {labels.speaking}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug line-clamp-2 m-0">
          "{text}"
        </p>
      </div>

      {/* Replay Voice Button */}
      <button
        onClick={onReplay}
        title="Hear companion voice again"
        className={`shrink-0 p-2 sm:px-3 sm:py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs ${
          isSpeaking
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200 scale-105'
            : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
        }`}
      >
        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : 'text-sky-600'}`} />
        <span className="hidden sm:inline">{isSpeaking ? labels.speaking : labels.hearMe}</span>
      </button>
    </div>
  )
}
