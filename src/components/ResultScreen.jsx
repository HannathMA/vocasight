import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Heart,
  Smile,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { SpeechBuddy } from './SpeechBuddy'
import { AnimalChallenge } from './AnimalChallenge'

export function ResultScreen({ whisperHook }) {
  const { t } = useTranslation()
  const {
    lastResult,
    soundPack,
    currentLanguage,
    selectedSoundId,
    selectedWordIndex,
    setSelectedSound,
    setScreen,
  } = useAppStore()

  const sounds = soundPack?.sounds || []
  const currentSound = sounds.find((s) => s.id === selectedSoundId) || sounds[0]
  const currentWords = currentSound?.words || []
  const currentWord = currentWords[selectedWordIndex] || currentWords[0]

  const isSuccess = lastResult?.isSuccess ?? true
  const starsAwarded = lastResult?.starsAwarded || 2
  const transcript = lastResult?.transcript || ''
  const targetWord = lastResult?.targetWord || currentWord?.text || ''
  const similarity = Math.round((lastResult?.similarity || 0.8) * 100)
  const substitution = lastResult?.substitution
  const routing = lastResult?.routing

  const handleRetry = () => {
    setScreen('practice')
  }

  const handleNextSound = () => {
    // Next word or next sound
    if (selectedWordIndex + 1 < currentWords.length) {
      useAppStore.getState().setSelectedWordIndex(selectedWordIndex + 1)
    } else {
      const currentIdx = sounds.findIndex((s) => s.id === selectedSoundId)
      const nextIdx = (currentIdx + 1) % sounds.length
      setSelectedSound(sounds[nextIdx].id, 0)
    }
    setScreen('practice')
  }

  const handlePlaySample = () => {
    if (whisperHook?.playSampleAudio) {
      whisperHook.playSampleAudio(targetWord, currentLanguage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Main Reward Card */}
      <div className="bg-gradient-to-b from-amber-50 via-yellow-50 to-teal-50 rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-xl text-center relative overflow-hidden">
        {/* Floating Confetti / Sparkle Graphics */}
        <div className="text-5xl animate-bounce mb-2">
          {isSuccess ? '🌟' : '🎈'}
        </div>

        {/* Stars Celebration Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-4xl sm:text-5xl transition-transform duration-500 ${
                i < starsAwarded
                  ? 'scale-110 drop-shadow-[0_0_12px_#F59E0B] animate-gentle-bounce'
                  : 'opacity-30 scale-90'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-fredoka mb-1">
          {isSuccess ? t('results.greatJob') : 'Wonderful Effort!'}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-semibold max-w-md mx-auto mb-6">
          {isSuccess
            ? 'You pronounced the sound so clearly and beautifully!'
            : 'Every gentle practice makes your speech muscles stronger and happier!'}
        </p>

        {/* Practice Comparison Pill */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border-2 border-amber-200 max-w-lg mx-auto mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Sound
              </span>
              <span className="text-2xl font-black text-teal-800 font-fredoka">
                {targetWord}
              </span>
            </div>
            <div className="text-center pl-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Speech Check
              </span>
              <span className="text-2xl font-black text-slate-800 font-fredoka">
                {transcript ? `"${transcript}"` : `"${targetWord}"`}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Match Confidence: {similarity}%</span>
            </span>
            <button
              onClick={handlePlaySample}
              className="text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Again</span>
            </button>
          </div>
        </div>

        {/* Flagged Articulation Pattern Notice (Informational only) */}
        {routing?.hasRecurringSubstitution && routing.recurringSubstitutionDetails && (
          <div className="max-w-lg mx-auto mb-6 p-3 rounded-2xl bg-amber-100/90 border-2 border-amber-300 text-left text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-amber-900 mb-0.5">
                {t('results.patternFoundNotice')}
              </span>
              <span>
                Repeated sound exchange observed ({routing.recurringSubstitutionDetails.targetSound} &rarr; {routing.recurringSubstitutionDetails.substitutedWith}). A certified Speech-Language Pathologist can review tongue placement.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons: Retry vs Next */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-6">
          <button
            onClick={handleRetry}
            className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border-3 border-slate-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-teal-600" />
            <span>{t('results.retryBtn')}</span>
          </button>

          <button
            onClick={handleNextSound}
            className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 border-2 border-teal-300"
          >
            <span>{t('results.nextBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mascot & Animal Celebration */}
        <div className="max-w-lg mx-auto text-left">
          <SpeechBuddy mode={isSuccess ? 'celebrate' : 'retry'} />
        </div>
      </div>
    </div>
  )
}
