import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from './store/useAppStore'
import { useMicrophone } from './hooks/useMicrophone'
import { useFaceLandmarker } from './hooks/useFaceLandmarker'
import { useWhisper } from './hooks/useWhisper'

import { Navbar } from './components/Navbar'
import { WelcomeScreen } from './components/WelcomeScreen'
import { SoundSelectScreen } from './components/SoundSelectScreen'
import { PracticeScreen } from './components/PracticeScreen'
import { ResultScreen } from './components/ResultScreen'
import { QuestMap } from './components/QuestMap'
import { SpeechGarden } from './components/SpeechGarden'
import { AnimalChallenge } from './components/AnimalChallenge'
import { ParentDashboard } from './components/ParentDashboard'
import { SettingsScreen } from './components/SettingsScreen'
import { AlertCircle, Lock, Sparkles, Heart } from 'lucide-react'

export default function App() {
  const { t } = useTranslation()
  const {
    currentScreen,
    currentLanguage,
    soundPack,
    selectedSoundId,
    selectedWordIndex,
    settings,
  } = useAppStore()

  // Initialize Core Hardware & AI Hooks
  const micHook = useMicrophone()
  const faceHook = useFaceLandmarker()
  const whisperHook = useWhisper({
    defaultModelId: settings.whisperModelId || 'onnx-community/whisper-tiny',
  })

  // Apply high contrast mode if set
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  const sounds = soundPack?.sounds || []
  const currentSound = sounds.find((s) => s.id === selectedSoundId) || sounds[0]
  const currentWords = currentSound?.words || []
  const currentWord = currentWords[selectedWordIndex] || currentWords[0]

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans selection:bg-teal-200 selection:text-teal-900 lang-${currentLanguage}`}
    >
      {/* Top Sticky Navigation */}
      <Navbar />

      {/* Model Loading Progress Banner (if active) */}
      {whisperHook.isModelLoading && (
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 text-white px-4 py-2 text-xs font-bold shadow-sm flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{whisperHook.loadingStatus || 'Loading Whisper Speech Model into Web Worker...'}</span>
          <div className="w-24 bg-white/30 h-2 rounded-full overflow-hidden ml-2">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${whisperHook.loadProgress || 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Main Body Screen */}
      <main className="flex-1 py-4 sm:py-6">
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
          <ResultScreen whisperHook={whisperHook} />
        )}

        {currentScreen === 'quest' && <QuestMap />}

        {currentScreen === 'garden' && <SpeechGarden />}

        {currentScreen === 'animals' && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <AnimalChallenge
              targetWord={currentWord}
              onPlaySample={() =>
                whisperHook.playSampleAudio(currentWord?.text, currentLanguage)
              }
              isCompleted={false}
            />
          </div>
        )}

        {currentScreen === 'parent' && <ParentDashboard />}

        {currentScreen === 'settings' && (
          <SettingsScreen whisperHook={whisperHook} />
        )}
      </main>

      {/* Child-Safe Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t-2 border-amber-200/80 px-4 py-4 text-center text-xs text-slate-600 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <span className="text-base">🌈</span>
            <span>VocaSight Kids</span>
            <span className="text-slate-400 font-normal">| Browser-Only Speech Companion</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% In-Memory Processing &bull; No Audio or Video Uploaded</span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-slate-500 max-w-xl mx-auto">
          ⚠️ Practice companion, not a medical or diagnostic tool. Does not replace speech-language therapy.
        </div>
      </footer>
    </div>
  )
}
