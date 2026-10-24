import React, { useState, useEffect } from 'react'
import {
  Home,
  Map,
  Flower2,
  BarChart3,
  Settings,
  Sparkles,
  Volume2,
  Gamepad2,
} from 'lucide-react'
import { useAppStore } from './store/useAppStore'
import { useMicrophone } from './hooks/useMicrophone'
import { useFaceLandmarker } from './hooks/useFaceLandmarker'
import { useWhisper } from './hooks/useWhisper'
import { useCompanionVoice } from './hooks/useCompanionVoice'
import { CompanionVoiceCard } from './components/CompanionVoiceCard'

// Screen Components
import { WelcomeScreen } from './components/WelcomeScreen'
import { SoundSelectScreen } from './components/SoundSelectScreen'
import { PracticeScreen } from './components/PracticeScreen'
import { ResultScreen } from './components/ResultScreen'
import { ParentDashboard } from './components/ParentDashboard'
import { SettingsScreen } from './components/SettingsScreen'
import { QuestMap } from './components/QuestMap'
import { SpeechGarden } from './components/SpeechGarden'
import { AlphabetGameScreen } from './components/AlphabetGameScreen'
import { companionVoice, getWordPrompt } from './services/companionVoice'

export default function App() {
  const {
    currentScreen,
    currentLanguage,
    setScreen,
    stars,
    settings,
    soundPack,
    selectedSoundId,
    selectedWordIndex,
  } = useAppStore()

  const [mascotChoice, setMascotChoice] = useState('robot') // 'robot' | 'elephant'

  // Initialize Core AI & Audio Hooks
  const micHook = useMicrophone({ maxDurationSec: 6 })
  const faceHook = useFaceLandmarker()
  const whisperHook = useWhisper({ defaultModelId: settings.whisperModelId })
  const { isSpeaking, currentPromptText, speakCurrentScreen, stopSpeaking } = useCompanionVoice()

  // Apply high contrast mode if enabled
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  // Nav items matching bottom navigation bar in the reference mockup
  const navItems = [
    { id: 'welcome', label: currentLanguage === 'ml' ? 'ഹോം' : currentLanguage === 'hi' ? 'होम' : 'Home', icon: Home },
    { id: 'alphabet-game', label: currentLanguage === 'ml' ? 'ഗെയിം' : currentLanguage === 'hi' ? 'गेम' : 'Game', icon: Gamepad2 },
    { id: 'quest', label: currentLanguage === 'ml' ? 'മാപ്പ്' : currentLanguage === 'hi' ? 'क्वेस्ट' : 'Quest', icon: Map },
    { id: 'garden', label: currentLanguage === 'ml' ? 'പൂന്തോട്ടം' : currentLanguage === 'hi' ? 'बगीचा' : 'Garden', icon: Flower2 },
    { id: 'parent', label: currentLanguage === 'ml' ? 'പുരോഗതി' : currentLanguage === 'hi' ? 'प्रगति' : 'Progress', icon: BarChart3 },
    { id: 'settings', label: currentLanguage === 'ml' ? 'ക്രമീകരണങ്ങൾ' : currentLanguage === 'hi' ? 'सेटिंग्स' : 'Settings', icon: Settings },
  ]

  // Determine active nav tab
  const getActiveNavId = () => {
    if (['sound-select', 'practice', 'result'].includes(currentScreen)) {
      return 'quest'
    }
    return currentScreen
  }
  const activeNavId = getActiveNavId()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100/50 flex flex-col justify-between text-slate-800 font-sans selection:bg-amber-200">
      {/* Top Floating Star & Whisper Status Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sky-100 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <span className="text-xl font-black font-fredoka text-sky-600">
            VocaSight <span className="text-amber-500">Kids</span>
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Companion Voice Quick Action / Status Button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking()
              } else {
                speakCurrentScreen(currentScreen)
              }
            }}
            title={isSpeaking ? 'Stop Companion Voice' : 'Hear Companion Voice'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black cursor-pointer transition-all border ${
              isSpeaking
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-300 shadow-md animate-pulse'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce' : 'text-sky-600'}`} />
            <span className="hidden sm:inline">
              {isSpeaking
                ? (currentLanguage === 'ml' ? 'സംസാരിക്കുന്നു...' : currentLanguage === 'hi' ? 'बोल रहे हैं...' : 'Speaking...')
                : (currentLanguage === 'ml' ? 'കൂട്ടുകാരന്റെ ശബ്ദം 🔊' : currentLanguage === 'hi' ? 'दोस्त की आवाज 🔊' : 'Companion Voice 🔊')}
            </span>
            <span className="sm:hidden">{isSpeaking ? 'Talking' : 'Voice'}</span>
          </button>

          {/* AI Model Status Pill */}
          {whisperHook.isModelLoading ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span className="hidden sm:inline">AI Loading ({whisperHook.loadProgress}%)</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>AI On-Device</span>
            </div>
          )}

          {/* Star Counter Pill */}
          <button
            onClick={() => setScreen('parent')}
            title="Stars Earned"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm shadow-xs cursor-pointer hover:bg-amber-200 transition-all"
          >
            <span className="text-sm">⭐</span>
            <span>{stars || 0}</span>
          </button>
        </div>
      </header>

      {/* Main Screen Content Viewport */}
      <main className="flex-1 pb-20 sm:pb-24">
        {/* Companion Voice Card on all secondary pages except alphabet game */}
        {currentScreen !== 'welcome' && currentScreen !== 'alphabet-game' && (
          <div className="pt-3 px-4">
            <CompanionVoiceCard
              text={
                currentScreen === 'practice'
                  ? getWordPrompt(
                      soundPack?.sounds?.find((s) => s.id === selectedSoundId)?.words?.[selectedWordIndex]?.text,
                      currentLanguage
                    ) || currentPromptText
                  : currentPromptText
              }
              isSpeaking={isSpeaking}
              onReplay={() => {
                if (currentScreen === 'practice') {
                  const snd = soundPack?.sounds?.find((s) => s.id === selectedSoundId)
                  const wrd = snd?.words?.[selectedWordIndex]
                  if (wrd?.text) {
                    companionVoice.speakWord(wrd.text, currentLanguage, wrd.translit || snd?.translit)
                  }
                } else {
                  speakCurrentScreen(currentScreen)
                }
              }}
              mascotType={mascotChoice}
              onToggleMascot={() =>
                setMascotChoice((prev) => (prev === 'robot' ? 'elephant' : 'robot'))
              }
            />
          </div>
        )}

        {currentScreen === 'welcome' && <WelcomeScreen />}

        {currentScreen === 'sound-select' && (
          <SoundSelectScreen whisperHook={whisperHook} />
        )}

        {currentScreen === 'practice' && (
          <PracticeScreen
            micHook={micHook}
            faceHook={faceHook}
            whisperHook={whisperHook}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen whisperHook={whisperHook} micHook={micHook} />
        )}

        {currentScreen === 'parent' && <ParentDashboard />}

        {currentScreen === 'settings' && (
          <SettingsScreen whisperHook={whisperHook} />
        )}

        {currentScreen === 'quest' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <QuestMap />
          </div>
        )}

        {currentScreen === 'garden' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <SpeechGarden />
          </div>
        )}

        {currentScreen === 'alphabet-game' && <AlphabetGameScreen />}
      </main>

      {/* Bottom Navigation Bar matching Mockup System */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-sky-100 py-2 px-3 shadow-lg"
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNavId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-sky-600 bg-sky-50 font-black scale-105'
                    : 'text-slate-500 hover:text-slate-800 font-bold'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
