import React, { useState, useEffect } from 'react'
import {
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Smile,
  BookOpen,
  Wand2,
  Eye,
  GraduationCap,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import confetti from 'canvas-confetti'
import Elephant from '../Elephant.jsx'

export function CartoonTeacher({
  targetSound,
  targetWord,
  onPlaySample = null,
  onReadyToSpeak = null,
}) {
  const { currentLanguage } = useAppStore()

  // Teaching lesson state: 1: 'watch', 2: 'listen', 3: 'repeat'
  const [lessonStep, setLessonStep] = useState(1)
  const [isTeacherTalking, setIsTeacherTalking] = useState(false)
  const [chalkboardText, setChalkboardText] = useState('')
  const [teacherMood, setTeacherMood] = useState('teaching') // 'teaching' | 'encouraging' | 'celebrating'

  const soundSymbol = targetSound?.symbol || 'ഴ'
  const soundTranslit = targetSound?.translit || 'zha'
  const wordText = targetWord?.text || targetSound?.words?.[0]?.text || soundSymbol
  const syllables = targetSound?.syllables || [soundSymbol]

  // Step 1: Watch Mouth shape setup
  const mouthShapes = {
    zha: { jaw: 'half', lips: 'funnel', tongue: 'curled-back', tip: 'Lips rounded like a small donut, tongue curved back towards the roof!' },
    'retro-la': { jaw: 'open', lips: 'wide', tongue: 'retroflex-tap', tip: 'Wide smile, tongue touches the top palate and taps softly!' },
    'hard-ra': { jaw: 'half', lips: 'smile', tongue: 'tap-vibrate', tip: 'Teeth slightly apart, tongue taps firmly with soft vibration!' },
    'flap-rha': { jaw: 'open', lips: 'relaxed', tongue: 'flap', tip: 'Drop your jaw gently and flap your tongue tip against the palate!' },
    'retro-ta': { jaw: 'half', lips: 'smile', tongue: 'touch-drop', tip: 'Touch tongue firmly behind top teeth and drop cleanly!' },
    'th-sound': { jaw: 'half', lips: 'open', tongue: 'between-teeth', tip: 'Tongue tip peeks between your teeth, blow soft gentle breeze!' },
    'r-sound': { jaw: 'half', lips: 'pucker', tongue: 'spoon-shape', tip: 'Round your lips like a circle, pull tongue back like a spoon!' },
    's-sound': { jaw: 'close', lips: 'wide-smile', tongue: 'behind-teeth', tip: 'Teeth close together with a big bright smile, hiss like a friendly snake!' },
  }

  const currentMouthProfile = mouthShapes[targetSound?.id] || {
    jaw: 'half',
    lips: 'funnel',
    tongue: 'curled-back',
    tip: targetSound?.tip || 'Look at teacher\'s mouth and mirror the shape!',
  }

  // Update chalkboard text based on lesson step
  useEffect(() => {
    if (lessonStep === 1) {
      setChalkboardText(`Lesson 1: Mouth Shape for "${soundSymbol}"`)
      setTeacherMood('teaching')
    } else if (lessonStep === 2) {
      setChalkboardText(`Lesson 2: Sound Breakdown • ${syllables.slice(0, 3).join(' • ')}`)
      setTeacherMood('teaching')
    } else {
      setChalkboardText(`Lesson 3: Your Turn! Say "${wordText}" ✨`)
      setTeacherMood('encouraging')
    }
  }, [lessonStep, soundSymbol, wordText, syllables])

  // Teacher speaks and moves mouth
  const handleTeacherDemonstrate = () => {
    setIsTeacherTalking(true)
    if (onPlaySample) {
      onPlaySample()
    }

    setTimeout(() => {
      setIsTeacherTalking(false)
    }, 2200)
  }

  const handleNextStep = (next) => {
    setLessonStep(next)
    handleTeacherDemonstrate()
  }

  const handleTeacherCheer = () => {
    setTeacherMood('celebrating')
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFD166', '#4ECDC4', '#FF8484', '#A78BFA'],
      })
    } catch (e) {}
    setTimeout(() => setTeacherMood('encouraging'), 2500)
  }

  return (
    <div className="w-full bg-gradient-to-b from-amber-100 via-orange-50 to-teal-50 rounded-3xl p-4 sm:p-6 border-4 border-amber-300 shadow-xl overflow-hidden relative my-4">
      {/* Decorative Classroom Elements */}
      <div className="absolute top-2 left-3 text-2xl opacity-40 select-none animate-float">🍎</div>
      <div className="absolute top-3 right-4 text-2xl opacity-40 select-none animate-gentle-bounce">✏️</div>
      <div className="absolute bottom-2 left-6 text-xl opacity-30 select-none">📐</div>
      <div className="absolute bottom-3 right-8 text-2xl opacity-40 select-none animate-chalk-star">⭐</div>

      {/* Classroom Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-amber-950 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-fredoka m-0 flex items-center gap-1.5">
              <span>Professor Paws' Cartoon Classroom</span>
              <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Teacher Mode
              </span>
            </h3>
            <p className="text-[11px] font-semibold text-slate-600 m-0">
              Interactive teaching style: Watch mouth &rarr; Listen &rarr; Repeat!
            </p>
          </div>
        </div>

        {/* Lesson Step Indicator Tabs */}
        <div className="flex items-center gap-1 bg-amber-200/70 p-1 rounded-2xl border border-amber-300">
          {[
            { step: 1, label: '1. Watch Mouth' },
            { step: 2, label: '2. Listen' },
            { step: 3, label: '3. Your Turn' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => handleNextStep(item.step)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lessonStep === item.step
                  ? 'bg-amber-400 text-amber-950 shadow-xs font-extrabold scale-102'
                  : 'text-slate-700 hover:bg-amber-300/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Classroom Stage: Cartoon Teacher + Live Chalkboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* LEFT: Animated Cartoon Teacher Character (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 relative">
          {/* Cartoon Character SVG */}
          <div
            onClick={handleTeacherDemonstrate}
            title="Tap Teacher to demonstrate speech!"
            className="relative cursor-pointer group transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative flex items-center justify-center p-2">
              <Elephant
                talking={isTeacherTalking}
                cheer={teacherMood === 'celebrating'}
                size={240}
              />
            </div>

            {/* Click to Speak Hint Bubble */}
            <div className="absolute -bottom-1 bg-white px-3 py-1 rounded-full border-2 border-amber-400 text-amber-950 font-black text-[11px] shadow-sm flex items-center gap-1.5 animate-bounce">
              <Play className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{isTeacherTalking ? 'Teaching sound...' : 'Tap Teacher to Speak!'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Interactive Chalkboard & Phonics Guide (7 Cols) */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {/* Wooden Chalkboard Frame */}
          <div className="chalkboard-bg rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden">
            {/* Chalkboard Corner Nails */}
            <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-200/50" />
            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-200/50" />

            {/* Chalk Lesson Header */}
            <div className="flex items-center justify-between text-xs text-emerald-200 font-mono mb-2 border-b border-emerald-800/80 pb-1">
              <span>CLASSROOM LESSON</span>
              <span className="text-amber-300">STEP {lessonStep}/3</span>
            </div>

            {/* Big Chalk Target Character */}
            <div className="my-2 flex items-center justify-center gap-4">
              <span className="text-5xl sm:text-6xl font-black chalk-text font-fredoka animate-wiggle-fun inline-block">
                {soundSymbol}
              </span>
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block font-fredoka">
                  "{wordText}"
                </span>
                <span className="text-xs text-emerald-100 font-mono">
                  Phonetic: /{soundTranslit}/
                </span>
              </div>
            </div>

            {/* Animated Mouth Cross-Section Demonstration */}
            <div className="my-3 bg-emerald-950/80 p-3 rounded-xl border border-emerald-700/60 text-left">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-amber-300">
                <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Teacher's Lip & Tongue Demonstration:</span>
              </div>

              {/* Graphic Mouth Shape Simulation */}
              <div className="flex items-center gap-3 mt-1.5">
                {/* Visual Mouth Diagram */}
                <div className="w-16 h-12 rounded-xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center p-1 relative shrink-0">
                  {/* Visual Lip Ring */}
                  <div
                    className={`rounded-full border-3 border-rose-400 transition-all duration-300 ${
                      currentMouthProfile.lips === 'funnel'
                        ? 'w-8 h-8 rounded-full'
                        : currentMouthProfile.lips === 'wide-smile'
                        ? 'w-12 h-5 rounded-3xl'
                        : 'w-10 h-7 rounded-2xl'
                    }`}
                  >
                    {/* Simulated Tongue Placement */}
                    <div
                      className={`w-4 h-3 bg-rose-300 rounded-full mx-auto transition-transform ${
                        currentMouthProfile.tongue === 'curled-back'
                          ? '-translate-y-1 rotate-180'
                          : currentMouthProfile.tongue === 'between-teeth'
                          ? 'translate-y-1'
                          : 'translate-y-0.5'
                      }`}
                    />
                  </div>
                </div>

                <p className="text-xs text-amber-100 font-medium leading-relaxed m-0">
                  {currentMouthProfile.tip}
                </p>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-emerald-800/80">
              <button
                onClick={handleTeacherDemonstrate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Teacher</span>
              </button>

              {lessonStep < 3 ? (
                <button
                  onClick={() => handleNextStep(lessonStep + 1)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xs shadow-sm cursor-pointer transition-transform active:scale-95"
                >
                  <span>Next Step &rarr;</span>
                </button>
              ) : (
                <button
                  onClick={handleTeacherCheer}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-sm cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Teacher Cheer! ⭐</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
