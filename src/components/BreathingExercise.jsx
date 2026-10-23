import React, { useState, useEffect } from 'react'
import { Sparkles, Wind } from 'lucide-react'

export function BreathingExercise({ onComplete = null }) {
  // 4s Inhale, 2s Hold, 4s Exhale
  const [phase, setPhase] = useState('inhale') // 'inhale' | 'hold' | 'exhale'
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (phase === 'inhale') {
            setPhase('hold')
            return 2
          } else if (phase === 'hold') {
            setPhase('exhale')
            return 4
          } else {
            const nextCycle = cyclesCompleted + 1
            setCyclesCompleted(nextCycle)
            if (nextCycle >= 2 && onComplete) {
              onComplete()
            }
            setPhase('inhale')
            return 4
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, cyclesCompleted, onComplete])

  const phaseConfig = {
    inhale: {
      title: 'Breathe In Gently... 🌸',
      sub: 'Expand your tummy like a soft balloon',
      color: 'from-pink-400 to-rose-400',
      scale: 'scale-125',
    },
    hold: {
      title: 'Hold Softly... ✨',
      sub: 'Keep calm and relaxed',
      color: 'from-amber-400 to-yellow-400',
      scale: 'scale-120',
    },
    exhale: {
      title: 'Breathe Out Slowly... 🫧',
      sub: 'Blow soft air like blowing giant soap bubbles',
      color: 'from-teal-400 to-emerald-400',
      scale: 'scale-75',
    },
  }

  const current = phaseConfig[phase]

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-50 via-teal-50 to-pink-50 rounded-3xl border-3 border-teal-200 shadow-md max-w-md mx-auto text-center my-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-3">
        <Wind className="w-4 h-4 text-teal-600 animate-pulse" />
        <span>Calm Dragon Breathing Warm-Up</span>
      </div>

      {/* Expanding / Contracting Breathing Flower Circle */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        {/* Outer pulse aura */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${current.color} opacity-20 transition-all duration-1000 ease-in-out ${current.scale}`}
        />

        {/* Core animated bubble */}
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-tr ${current.color} shadow-lg flex flex-col items-center justify-center text-white font-extrabold transition-all duration-1000 ease-in-out ${current.scale}`}
        >
          <span className="text-3xl mb-0.5">
            {phase === 'inhale' ? '🌸' : phase === 'hold' ? '✨' : '🫧'}
          </span>
          <span className="text-2xl font-fredoka">{secondsLeft}s</span>
        </div>
      </div>

      {/* Phase Prompts */}
      <h3 className="text-lg font-bold text-slate-800 mt-2 mb-0.5">
        {current.title}
      </h3>
      <p className="text-xs text-slate-600 max-w-xs">{current.sub}</p>

      {/* Cycle indicator */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs font-bold text-slate-500">
          Calm Cycles: {cyclesCompleted} / 2
        </span>
        <div className="flex gap-1.5">
          <div
            className={`w-3 h-3 rounded-full ${
              cyclesCompleted >= 1 ? 'bg-teal-500' : 'bg-slate-300'
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              cyclesCompleted >= 2 ? 'bg-teal-500' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
