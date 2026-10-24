import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Settings,
  Volume2,
  Lock,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { MascotBuddy } from './MascotBuddy'

export function SoundSelectScreen({ whisperHook }) {
  const { t } = useTranslation()
  const {
    soundPack,
    currentLanguage,
    completedSounds,
    setSelectedSound,
    setScreen,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('sounds') // 'sounds' | 'quest'
  const sounds = soundPack?.sounds || []
  const languageName = soundPack?.name || 'Malayalam'

  const handlePlayWord = (e, word) => {
    e.stopPropagation()
    if (whisperHook?.playSampleAudio) {
      whisperHook.playSampleAudio(word.text, currentLanguage)
    }
  }

  const handleSelectSound = (sound, wordIdx = 0) => {
    setSelectedSound(sound.id, wordIdx)
    setScreen('practice')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header matching Screen 2 in mockup */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setScreen('welcome')}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 text-sky-700 flex items-center justify-center hover:bg-sky-50 shadow-xs cursor-pointer transition-all"
          title="Back to Welcome"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-fredoka m-0">
          {languageName}
        </h1>

        <button
          onClick={() => setScreen('settings')}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 text-slate-700 flex items-center justify-center hover:bg-sky-50 shadow-xs cursor-pointer transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-sky-600" />
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-sky-100/80 rounded-2xl border border-sky-200 shadow-inner">
          <button
            onClick={() => setActiveTab('sounds')}
            className={`px-6 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'sounds'
                ? 'bg-white text-sky-800 shadow-sm'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            Sounds
          </button>
          <button
            onClick={() => setActiveTab('quest')}
            className={`px-6 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'quest'
                ? 'bg-white text-sky-800 shadow-sm'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            Quest Map
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sounds (6 cols), Right Sound Quest Adventure (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Sounds Grid (visible if activeTab === 'sounds' or on large screens) */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            activeTab === 'quest' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {sounds.map((sound) => {
              const mainWord = sound.words?.[0] || { text: sound.symbol, meaning: '', icon: '🌟' }
              const isCompleted = completedSounds.includes(sound.id)

              return (
                <div
                  key={sound.id}
                  onClick={() => handleSelectSound(sound, 0)}
                  className="group bg-white rounded-3xl p-3 sm:p-4 border-3 border-sky-100 hover:border-sky-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center relative"
                >
                  {isCompleted && (
                    <span className="absolute top-2 right-2 text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      ⭐
                    </span>
                  )}

                  {/* Big Sound Symbol */}
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-fredoka mb-1 group-hover:scale-108 transition-transform">
                    {sound.symbol}
                  </span>

                  {/* Word Illustration / Icon */}
                  <span className="text-3xl sm:text-4xl my-1 select-none animate-gentle-bounce">
                    {mainWord.icon || '🌧️'}
                  </span>

                  {/* Word Text & Transliteration */}
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">
                    {mainWord.text}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    ({mainWord.translit || mainWord.meaning || sound.translit})
                  </div>

                  {/* Blue Speaker Listen Button */}
                  <button
                    onClick={(e) => handlePlayWord(e, mainWord)}
                    className="mt-3 w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-90 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}

            {/* 3 Locked Sound Cards (Coming Soon) matching mockup */}
            {[1, 2, 3].map((num) => (
              <div
                key={`locked-${num}`}
                className="bg-slate-50/70 rounded-3xl p-3 sm:p-4 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center min-h-[160px] opacity-75"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 leading-tight">
                  More Sounds<br />Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Sound Quest Adventure Map Panel */}
        <div
          className={`lg:col-span-6 bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-100 rounded-3xl p-5 sm:p-6 border-3 border-teal-200 shadow-md relative overflow-hidden min-h-[460px] flex flex-col justify-between ${
            activeTab === 'sounds' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Wooden Banner Sign */}
          <div className="text-center relative z-10 mb-4">
            <div className="inline-block bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 font-black text-sm sm:text-base px-6 py-2 rounded-2xl border-2 border-amber-950 shadow-md">
              Sound Quest Adventure
            </div>
          </div>

          {/* Winding Adventure Path with Waypoint Milestones */}
          <div className="relative z-10 space-y-6 my-2 px-4 sm:px-8">
            {/* Quest Point 1: Rain Forest (Unlocked) */}
            <div
              onClick={() => sounds[0] && handleSelectSound(sounds[0], 0)}
              className="flex items-center gap-3 p-3 bg-white/90 rounded-2xl border-2 border-emerald-400 shadow-sm cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
                {sounds[0]?.symbol || 'ഴ'}
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-emerald-800">
                  {sounds[0]?.quest?.name || 'Rain Forest Oasis'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Practice "{sounds[0]?.words?.[0]?.text || 'മഴ'}" & unlock rewards!
                </div>
              </div>
              <span className="text-2xl">🌴</span>
            </div>

            {/* Quest Point 2: Magical Garden (Locked) */}
            <div
              onClick={() => sounds[1] && handleSelectSound(sounds[1], 0)}
              className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border-2 border-slate-200 shadow-xs cursor-pointer hover:bg-white transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl">
                {sounds[1]?.symbol || 'ള'}
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <span>{sounds[1]?.quest?.name || 'Magical Flower Garden'}</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Earn 2 stars to unlock
                </div>
              </div>
              <span className="text-2xl">🌺</span>
            </div>

            {/* Quest Point 3: Adventure River (Locked) */}
            <div
              onClick={() => sounds[2] && handleSelectSound(sounds[2], 0)}
              className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border-2 border-slate-200 shadow-xs cursor-pointer hover:bg-white transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-xl">
                {sounds[2]?.symbol || 'റ'}
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <span>{sounds[2]?.quest?.name || 'Adventure River Stream'}</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Earn 4 stars to unlock
                </div>
              </div>
              <span className="text-2xl">⛵</span>
            </div>
          </div>

          {/* Robot / Aana Mascot on bottom of path */}
          <div className="relative z-10 flex items-center justify-center mt-2">
            <MascotBuddy mood="happy" size={130} />
          </div>
        </div>
      </div>
    </div>
  )
}
