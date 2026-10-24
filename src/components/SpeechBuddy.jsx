import React, { useState, useEffect } from 'react'
import { Volume2, Sparkles, Compass } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function SpeechBuddy({
  mode = 'encourage', // 'encourage' | 'retry' | 'celebrate' | 'daily'
  customMessage = null,
  onPronounce = null,
  showDailyQuest = true,
}) {
  const { soundPack, currentLanguage, setScreen } = useAppStore()
  const [currentPhrase, setCurrentPhrase] = useState('')
  const [isWaving, setIsWaving] = useState(false)
  const [isHeartEyes, setIsHeartEyes] = useState(false)

  const phrases = soundPack?.buddyPhrases || {}

  useEffect(() => {
    if (customMessage) {
      setCurrentPhrase(customMessage)
      return
    }

    const phraseList = phrases[mode] || phrases.encourage || ['Awesome work! Keep practicing!']
    const randomPick = phraseList[Math.floor(Math.random() * phraseList.length)]
    setCurrentPhrase(randomPick)
  }, [mode, customMessage, phrases])

  const handleBuddyClick = () => {
    setIsWaving(true)
    setIsHeartEyes(true)

    // Play cute synthesized chime
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const notes = [659.25, 783.99, 1046.50]
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08)
          gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + i * 0.08)
          osc.stop(ctx.currentTime + i * 0.08 + 0.2)
        })
      }
    } catch (_) {}

    setTimeout(() => {
      setIsWaving(false)
      setIsHeartEyes(false)
    }, 2200)

    if (onPronounce) {
      onPronounce()
    } else {
      // Pick another cheerful phrase
      const list = phrases[mode] || phrases.encourage || []
      if (list.length > 0) {
        const next = list[Math.floor(Math.random() * list.length)]
        setCurrentPhrase(next)
      }
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-r from-teal-50 via-emerald-50 to-amber-50 p-3.5 sm:p-4 rounded-3xl border-3 border-teal-200/90 shadow-sm relative overflow-hidden">
      {/* Decorative background stars */}
      <div className="absolute top-2 right-3 text-emerald-200/50 text-2xl select-none pointer-events-none">✨</div>
      <div className="absolute bottom-1 right-12 text-teal-200/40 text-xl select-none pointer-events-none">⭐</div>

      {/* Cute Interactive Robot Mascot */}
      <button
        onClick={handleBuddyClick}
        onTouchStart={handleBuddyClick}
        title="Tap Robo-Buddy to dance & show love!"
        className={`relative shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-b from-teal-300 via-teal-400 to-teal-500 border-3 border-teal-600 shadow-md flex items-center justify-center p-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
          isWaving ? 'animate-robo-groove' : 'animate-gentle-bounce'
        }`}
      >
        {/* Antenna */}
        <div className="absolute -top-3 w-2 h-3.5 bg-teal-600 rounded-full flex flex-col items-center">
          <div className={`w-3.5 h-3.5 -mt-2 rounded-full border-2 border-teal-700 ${isWaving ? 'bg-pink-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
        </div>

        {/* Robot Face Screen */}
        <div className="w-full h-full bg-slate-900 rounded-xl border-2 border-teal-200/60 flex flex-col items-center justify-center p-1 relative overflow-hidden">
          {/* Eyes */}
          {isHeartEyes ? (
            <div className="flex items-center gap-2 text-rose-400 text-sm animate-pulse">
              <span>❤️</span>
              <span>❤️</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-pulse" />
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] animate-pulse" />
            </div>
          )}
          {/* Smiling mouth LEDs */}
          <div className={`mt-1.5 rounded-full ${isHeartEyes ? 'w-5 h-2 bg-pink-400 shadow-[0_0_8px_#f43f5e]' : 'w-6 h-1.5 bg-emerald-400 shadow-[0_0_6px_#34d399]'}`} />
          {/* Cheerful rosy cheeks */}
          <div className="absolute bottom-1.5 left-1.5 w-2.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_4px_#fb7185]" />
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_4px_#fb7185]" />
        </div>

        {/* Small Audio Speaker Badge */}
        {onPronounce && (
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md border-2 border-white">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
        )}
      </button>

      {/* Speech Bubble Content */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>AI Speech Buddy & Companion</span>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug m-0">
          "{currentPhrase}"
        </p>

        {/* Optional Daily Quest Prompt */}
        {showDailyQuest && phrases.dailyQuest && (
          <div className="mt-2 pt-2 border-t border-teal-200/70 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{phrases.dailyQuest}</span>
            </div>
            <button
              onClick={() => setScreen('quest')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
            >
              Open Quest Map &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
