import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Info, Lock, Volume2, Gamepad2, Sparkles } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { MascotBuddy } from './MascotBuddy'
import { useCompanionVoice } from '../hooks/useCompanionVoice'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const {
    currentLanguage,
    setLanguage,
    hasParentConsent,
    setParentConsent,
    setScreen,
  } = useAppStore()

  const [mascotChoice, setMascotChoice] = useState('robot') // 'robot' | 'elephant'
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [agreedConsent, setAgreedConsent] = useState(hasParentConsent)
  const { isSpeaking, currentPromptText, speakCurrentScreen } = useCompanionVoice()

  // Trigger tutor speech through microphone immediately when interface opens
  useEffect(() => {
    // 1. Initial attempt
    const timer = setTimeout(() => {
      speakCurrentScreen('welcome')
    }, 450)

    // 2. Gesture fallback for strict browser autoplay policies
    let hasActivated = false
    const handleFirstGesture = () => {
      if (!hasActivated) {
        hasActivated = true
        speakCurrentScreen('welcome')
      }
    }

    window.addEventListener('pointerdown', handleFirstGesture, { once: true })
    window.addEventListener('keydown', handleFirstGesture, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', handleFirstGesture)
      window.removeEventListener('keydown', handleFirstGesture)
    }
  }, [speakCurrentScreen])

  const handleStartClicked = () => {
    if (hasParentConsent) {
      setScreen('sound-select')
    } else {
      setShowConsentModal(true)
    }
  }

  const handleConsentConfirm = () => {
    if (agreedConsent) {
      setParentConsent(true)
      setShowConsentModal(false)
      setScreen('sound-select')
    }
  }

  const langCards = [
    {
      code: 'ml',
      letter: 'മ',
      native: 'മലയാളം',
      english: 'Malayalam',
      color: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-600',
      activeRing: 'ring-4 ring-amber-300 shadow-lg scale-102',
    },
    {
      code: 'hi',
      letter: 'A अ',
      native: 'हिन्दी',
      english: 'Hindi',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-700',
      activeRing: 'ring-4 ring-purple-300 shadow-lg scale-102',
    },
    {
      code: 'en',
      letter: 'Aa',
      native: 'English',
      english: 'English',
      color: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white border-blue-700',
      activeRing: 'ring-4 ring-sky-300 shadow-lg scale-102',
    },
  ]

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Decorative Garden / Sky Elements */}
      <div className="absolute top-2 left-8 text-4xl opacity-30 select-none pointer-events-none animate-float">
        ☁️
      </div>
      <div className="absolute top-6 right-12 text-4xl opacity-30 select-none pointer-events-none animate-gentle-bounce">
        🌈
      </div>

      {/* Main Brand Title Header */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight font-fredoka flex items-center justify-center gap-2 m-0 drop-shadow-sm">
          <span className="text-sky-500">VocaSight</span>
          <span className="text-amber-500">Kids</span>
        </h1>
        <p className="text-slate-600 font-bold text-sm sm:text-base mt-1.5 tracking-wide">
          Speak · Practice · Explore · Grow
        </p>
      </div>

      {/* Mascot & Language Selection Card (Side by Side) */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Side: Mascot Robot / Aana Teacher */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          {/* Microphone On-Air Tutor Live Bubble */}
          <div
            onClick={() => speakCurrentScreen('welcome')}
            title="Click to hear tutor speak on mic"
            className={`mb-2 px-4 py-2 rounded-2xl border-2 transition-all shadow-md flex items-center gap-2 cursor-pointer max-w-xs group ${
              isSpeaking
                ? 'bg-gradient-to-r from-sky-50 via-white to-pink-50 border-pink-400 ring-2 ring-pink-200'
                : 'bg-white border-sky-300 hover:bg-sky-50'
            }`}
          >
            <div className="shrink-0 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[11px] font-black text-slate-800">🎙️ Tutor:</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-tight m-0 text-left line-clamp-2 flex-1">
              "{currentPromptText}"
            </p>
            <Volume2 className={`w-4 h-4 shrink-0 ${isSpeaking ? 'text-pink-500 animate-bounce' : 'text-sky-600'}`} />
          </div>

          <MascotBuddy
            type={mascotChoice}
            mood={isSpeaking ? 'talking' : 'waving'}
            signText="Let's Make Speech Fun!"
            size={220}
            onClick={() => speakCurrentScreen('welcome')}
          />

          {/* Mascot toggle pill */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() =>
                setMascotChoice((prev) => (prev === 'robot' ? 'elephant' : 'robot'))
              }
              className="text-[11px] font-bold text-slate-600 hover:text-sky-600 bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              Switch: {mascotChoice === 'robot' ? '🐘 Aana Teacher' : '🤖 Robo Buddy'}
            </button>
            <button
              onClick={() => speakCurrentScreen('welcome')}
              className="text-[11px] font-extrabold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200 cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              <span>Hear Voice</span>
            </button>
          </div>
        </div>

        {/* Right Side: Language Selection Card */}
        <div className="md:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-3 border-sky-100 shadow-xl text-center">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-4 font-fredoka">
            Choose Your Language
          </h2>

          {/* 3 Colorful Language Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {langCards.map((card) => {
              const isSelected = currentLanguage === card.code
              return (
                <button
                  key={card.code}
                  onClick={() => {
                    setLanguage(card.code)
                    speakCurrentScreen('welcome', card.code)
                  }}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    card.color
                  } ${isSelected ? card.activeRing : 'opacity-85 hover:opacity-100 hover:scale-102'}`}
                >
                  <span className="text-2xl sm:text-3xl font-black mb-1">
                    {card.letter}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold leading-tight">
                    {card.native}
                  </span>
                  <span className="text-[10px] sm:text-xs opacity-90 font-medium">
                    {card.english}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            {/* Play Robo Alphabet Game Button */}
            <button
              onClick={() => setScreen('alphabet-game')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 active:scale-95 text-white font-black text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer ring-4 ring-amber-200"
            >
              <Gamepad2 className="w-5 h-5 text-yellow-200" />
              <span>🎮 Play Robo Alphabet Game! 🤖</span>
            </button>

            {/* Start Sound Quest Button */}
            <button
              onClick={handleStartClicked}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sound Quest</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Safety & Parental Disclaimers */}
          <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-500 text-left max-w-md mx-auto pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>This is a practice companion, not a medical tool.</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Please get parental consent before using camera and microphone.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parental Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-sky-300 shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1 font-fredoka">
              Parental Consent Notice
            </h3>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              VocaSight Kids runs 100% on this device in your browser. Live camera
              video and microphone audio are processed in temporary computer memory to
              guide mouth movements and voice volume. No audio or video is ever
              uploaded to any server.
            </p>

            <label className="flex items-start gap-3 p-3 bg-sky-50 rounded-2xl border border-sky-200 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600"
              />
              <span className="text-xs font-bold text-slate-800">
                I am a parent or guardian and consent to using the camera and microphone
                for practice on this device.
              </span>
            </label>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentConfirm}
                disabled={!agreedConsent}
                className={`px-6 py-2.5 rounded-xl text-xs font-black text-white transition-all cursor-pointer ${
                  agreedConsent
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                I Agree & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
