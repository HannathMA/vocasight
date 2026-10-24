import React, { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import {
  Volume2,
  Sparkles,
  Trophy,
  RotateCcw,
  ArrowRight,
  Home,
  CheckCircle2,
  HelpCircle,
  Star,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ALPHABET_PACKS } from '../data/alphabetData'
import { roboAudio } from '../services/roboAudio'
import { MascotBuddy } from './MascotBuddy'

const ROUNDS_PER_GAME = 5

export function AlphabetGameScreen() {
  const { currentLanguage, setScreen, addStars, stars } = useAppStore()

  // Selected alphabet pack: defaults to current app language or 'en'
  const initialPack = ['en', 'ml', 'hi'].includes(currentLanguage) ? currentLanguage : 'en'
  const [selectedPackCode, setSelectedPackCode] = useState(initialPack)
  const currentPack = ALPHABET_PACKS[selectedPackCode] || ALPHABET_PACKS.en

  // Game state
  const [round, setRound] = useState(1)
  const [targetLetter, setTargetLetter] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  const [roboSpeechBubble, setRoboSpeechBubble] = useState('')
  const [wobbleIndex, setWobbleIndex] = useState(null)
  const [showPhonicsModal, setShowPhonicsModal] = useState(false)
  const [starsAwardedThisGame, setStarsAwardedThisGame] = useState(0)

  // Track used letters to avoid repeat in a single game
  const usedLettersRef = useRef(new Set())
  const autoAdvanceTimerRef = useRef(null)

  // Move to next round or trigger victory if complete
  const advanceToNextRound = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    if (round >= ROUNDS_PER_GAME) {
      triggerGameWin()
    } else {
      setRound((prev) => prev + 1)
      setupRound(selectedPackCode, false)
    }
  }

  // Pick a new target letter and 3 distractors
  const setupRound = (packCode = selectedPackCode, isFirstRound = false) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }

    const pack = ALPHABET_PACKS[packCode] || ALPHABET_PACKS.en
    const letters = pack.letters

    if (isFirstRound) {
      usedLettersRef.current.clear()
    }

    // Pick a letter not yet used in this session if possible
    let available = letters.filter((l) => !usedLettersRef.current.has(l.letter))
    if (available.length === 0) {
      usedLettersRef.current.clear()
      available = letters
    }

    const chosen = available[Math.floor(Math.random() * available.length)]
    usedLettersRef.current.add(chosen.letter)

    // Pick 3 distractors
    const distractors = letters.filter((l) => l.letter !== chosen.letter)
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3)

    // Shuffle 4 choices together
    const allOptions = [...shuffledDistractors, chosen].sort(() => 0.5 - Math.random())

    setTargetLetter(chosen)
    setOptions(allOptions)
    setSelectedChoice(null)
    setIsAnswerCorrect(null)
    setWobbleIndex(null)

    // Set speech bubble prompt
    const prompt =
      packCode === 'ml'
        ? `അക്ഷരം '${chosen.letter}' ഉള്ള കാർഡ് കണ്ടെത്തൂ! (${chosen.word})`
        : packCode === 'hi'
        ? `अक्षर '${chosen.letter}' वाला कार्ड ढूंढिए! (${chosen.word})`
        : `Find the card for letter '${chosen.letter}'! (${chosen.word})`

    setRoboSpeechBubble(prompt)

    // Auto-announce with robotic voice to tell what card is wanted
    setTimeout(() => {
      roboAudio.announceTargetLetter(chosen, packCode, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      })
    }, 400)
  }

  // Initialize first round on mount or pack change
  useEffect(() => {
    setRound(1)
    setIsGameWon(false)
    setStarsAwardedThisGame(0)
    setupRound(selectedPackCode, true)

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
        autoAdvanceTimerRef.current = null
      }
      roboAudio.stopSpeech()
    }
  }, [selectedPackCode])

  // Handle clicking a letter choice
  const handleSelectOption = (option, index) => {
    if (isAnswerCorrect === true || isGameWon) return

    setSelectedChoice(option)
    roboAudio.playTapSound()

    if (option.letter === targetLetter.letter) {
      // CORRECT CHOICE!
      setIsAnswerCorrect(true)

      // Burst of colorful confetti
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#38bdf8', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
        })
      } catch (_) {}

      // Speech bubble celebration
      const celebrationBubble =
        selectedPackCode === 'ml'
          ? `വളരെ ശരിയാണ്! അക്ഷരം '${option.letter}'! ${option.word}!`
          : selectedPackCode === 'hi'
          ? `बिल्कुल सही! अक्षर '${option.letter}'! ${option.word}!`
          : `YES! Correct! Letter '${option.letter}'! ${option.word}!`
      setRoboSpeechBubble(celebrationBubble)

      // Robo voice celebration
      roboAudio.celebrateCorrect(option, selectedPackCode, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      })

      // AUTOMATICALLY GO NEXT: 1.4-second delay lets the child see the visual reward, then moves forward automatically
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current)
      }
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNextRound()
      }, 1400)
    } else {
      // INCORRECT CHOICE
      setIsAnswerCorrect(false)
      setWobbleIndex(index)
      roboAudio.playTryAgainSound()

      const tryAgainPrompt =
        selectedPackCode === 'ml'
          ? `ഒന്നുകൂടി ശ്രമിക്കൂ! '${targetLetter.letter}' എവിടെയാണെന്ന് നോക്കൂ!`
          : selectedPackCode === 'hi'
          ? `फिर से कोशिश करें! '${targetLetter.letter}' खोजें!`
          : `Try again! Find letter '${targetLetter.letter}'!`
      setRoboSpeechBubble(tryAgainPrompt)

      setTimeout(() => {
        setWobbleIndex(null)
      }, 700)
    }
  }

  // Trigger game winning celebration
  const triggerGameWin = () => {
    setIsGameWon(true)
    const earned = 3
    setStarsAwardedThisGame(earned)
    addStars(earned)

    // Multi-cannon confetti celebration!
    try {
      const end = Date.now() + 2.5 * 1000
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6']

      ;(function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    } catch (_) {}

    // Robo voice winning announcement
    setRoboSpeechBubble('🎉 WINNER! You won the Alphabet Game! 🎉')
    roboAudio.celebrateGameWin(selectedPackCode, earned, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    })
  }

  // Restart game
  const handlePlayAgain = () => {
    setIsGameWon(false)
    setRound(1)
    setStarsAwardedThisGame(0)
    setupRound(selectedPackCode, true)
  }

  // Hear robo voice again
  const handleHearAgain = () => {
    if (targetLetter) {
      roboAudio.announceTargetLetter(targetLetter, selectedPackCode, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border-2 border-sky-100 hover:bg-sky-50 text-slate-700 font-extrabold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4 text-sky-600" />
          <span>Home</span>
        </button>

        {/* Alphabet Language Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-sky-100 shadow-xs">
          {Object.values(ALPHABET_PACKS).map((pack) => {
            const isSelected = selectedPackCode === pack.id
            return (
              <button
                key={pack.id}
                onClick={() => setSelectedPackCode(pack.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs scale-102'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{pack.flag}</span>
                <span className="hidden sm:inline">{pack.name}</span>
                <span className="sm:hidden">{pack.id.toUpperCase()}</span>
              </button>
            )
          })}
        </div>

        {/* Phonics Chart Button */}
        <button
          onClick={() => setShowPhonicsModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-800 font-extrabold text-xs sm:text-sm shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span className="hidden sm:inline">Alphabet Chart</span>
          <span className="sm:hidden">Chart</span>
        </button>
      </div>

      {/* Main Game Card */}
      <div className="relative bg-gradient-to-b from-sky-100 via-white to-amber-50 rounded-3xl p-6 sm:p-8 border-4 border-sky-200 shadow-xl overflow-hidden">
        {/* Floating Decorative Elements */}
        <div className="absolute top-3 left-4 text-3xl opacity-25 select-none pointer-events-none animate-float">
          ✨
        </div>
        <div className="absolute top-4 right-6 text-3xl opacity-25 select-none pointer-events-none animate-gentle-bounce">
          🎈
        </div>
        <div className="absolute bottom-4 left-6 text-3xl opacity-20 select-none pointer-events-none">
          🚀
        </div>

        {/* Round Progress Tracker & Stars */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-sky-500 text-white font-black text-xs sm:text-sm shadow-xs">
              Round {round} / {ROUNDS_PER_GAME}
            </span>
            <div className="w-24 sm:w-36 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all duration-500 rounded-full"
                style={{ width: `${(round / ROUNDS_PER_GAME) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs sm:text-sm shadow-xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{stars} Stars</span>
            </div>
          </div>
        </div>

        {/* Center Mascot & Robotic Voice Interaction Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
          {/* Mascot Robot */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <MascotBuddy
              type="robot"
              mood={isAnswerCorrect === true ? 'celebrating' : isSpeaking ? 'talking' : 'happy'}
              size={170}
              onClick={handleHearAgain}
            />
            <span className="text-[11px] font-bold text-slate-500 mt-1">
              🤖 Robo Buddy (Click to hear!)
            </span>
          </div>

          {/* Robo Buddy Speech Bubble & Challenge Banner */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Animated Speech Bubble */}
            <div
              className={`w-full p-4 sm:p-5 rounded-3xl border-3 transition-all shadow-md relative mb-4 ${
                isAnswerCorrect === true
                  ? 'bg-emerald-50 border-emerald-300 ring-4 ring-emerald-100'
                  : isAnswerCorrect === false
                  ? 'bg-amber-50 border-amber-300 ring-4 ring-amber-100'
                  : 'bg-white border-sky-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-xs font-black text-slate-800">
                  {isSpeaking ? '🎙️ Robo Buddy Speaking...' : '🤖 Robo Buddy Asks:'}
                </span>
              </div>
              <p className="text-base sm:text-xl font-black text-slate-800 font-fredoka m-0">
                "{roboSpeechBubble}"
              </p>
            </div>

            {/* Target Letter Spotlight Card & Voice Replay Button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleHearAgain}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95 ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'Robo is Speaking... 🎙️' : '🔊 Hear What Card Robo Wants!'}</span>
              </button>

              {targetLetter && (
                <button
                  onClick={handleHearAgain}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-2xl border-2 border-amber-300 shadow-xs cursor-pointer active:scale-95 transition-all text-left"
                  title="Click to hear what card is wanted"
                >
                  <span className="text-xl">{targetLetter.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider leading-none">
                      Wanted Card 🔊
                    </span>
                    <span className="text-xs font-black text-amber-950">
                      '{targetLetter.letter}' ({targetLetter.word})
                    </span>
                  </div>
                </button>
              )}

              {isAnswerCorrect === true && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-extrabold text-xs animate-pulse shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Next card automatically loading... 🚀</span>
                  <button
                    onClick={advanceToNextRound}
                    className="ml-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-xs active:scale-95"
                  >
                    Next ➡️
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The 4 Interactive Letter Choice Cards */}
        <div className="mb-4">
          <div className="text-center mb-3">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
              <span>Tap the card Robo wants:</span>
              {targetLetter && (
                <span className="text-sky-700 font-black">
                  '{targetLetter.letter}' ({targetLetter.word})
                </span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {options.map((option, idx) => {
              const isSelected = selectedChoice?.letter === option.letter
              const isCorrectCard = isSelected && isAnswerCorrect === true
              const isWrongCard = isSelected && isAnswerCorrect === false
              const isWobbling = wobbleIndex === idx

              return (
                <button
                  key={`${option.letter}-${idx}`}
                  onClick={() => handleSelectOption(option, idx)}
                  disabled={isAnswerCorrect === true}
                  className={`relative p-5 sm:p-6 rounded-3xl border-4 transition-all flex flex-col items-center justify-center cursor-pointer select-none group shadow-md ${
                    isCorrectCard
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-6 ring-emerald-200 scale-105 animate-bounce'
                      : isWrongCard || isWobbling
                      ? 'bg-rose-50 border-rose-400 ring-4 ring-rose-200 animate-wiggle'
                      : 'bg-white hover:bg-sky-50 border-sky-200 hover:border-sky-400 hover:scale-105 active:scale-95'
                  }`}
                >
                  {/* Card Icon */}
                  <span className="text-3xl sm:text-4xl mb-2 transition-transform group-hover:scale-120">
                    {option.icon}
                  </span>

                  {/* Big Alphabet Letter */}
                  <span
                    className={`text-4xl sm:text-5xl font-black font-fredoka leading-none mb-1.5 ${
                      isCorrectCard ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {option.letter}
                  </span>

                  {/* Sample Word */}
                  <span
                    className={`text-xs sm:text-sm font-extrabold ${
                      isCorrectCard ? 'text-emerald-100' : 'text-slate-500 group-hover:text-sky-700'
                    }`}
                  >
                    {option.word}
                  </span>

                  {/* Correct Checkmark badge */}
                  {isCorrectCard && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-md animate-pop">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* GAME WINNING CELEBRATION MODAL */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center relative overflow-hidden animate-pop">
            {/* Background sparkle effects */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-200 rounded-full blur-2xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-50 pointer-events-none" />

            {/* Giant Trophy */}
            <div className="relative inline-block mb-3">
              <span className="text-6xl sm:text-7xl block animate-bounce">🏆</span>
              <div className="absolute -top-2 -right-2 text-2xl animate-spin">✨</div>
            </div>

            {/* Winning Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka m-0 mb-1">
              🎉 GAME WINNER! 🎉
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mb-4">
              You completed all {ROUNDS_PER_GAME} alphabet rounds with Robo Buddy!
            </p>

            {/* Star Reward Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border-2 border-amber-300 mb-5 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1 text-2xl">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-amber-900 block leading-tight">
                  +{starsAwardedThisGame} Golden Stars Earned!
                </span>
                <span className="text-[11px] text-amber-700 font-bold">
                  Total Stars: {stars} ⭐
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handlePlayAgain}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Another Game 🚀</span>
              </button>

              <button
                onClick={() => setScreen('quest')}
                className="w-full py-3 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Go to Quest Map 🗺️</span>
              </button>

              <button
                onClick={() => setScreen('welcome')}
                className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Home 🏠
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALPHABET PHONICS EXPLORER MODAL */}
      {showPhonicsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col border-4 border-sky-300 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentPack.flag}</span>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-fredoka m-0">
                    {currentPack.name} Chart
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    Tap any letter to hear Robo Buddy speak! 🤖
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPhonicsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Letter Grid */}
            <div className="overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-6 gap-2.5 p-1">
              {currentPack.letters.map((item) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    roboAudio.announceTargetLetter(item, selectedPackCode, {
                      onStart: () => setIsSpeaking(true),
                      onEnd: () => setIsSpeaking(false),
                    })
                  }}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-sky-50 border-2 border-slate-200 hover:border-sky-400 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-2xl font-black font-fredoka text-slate-900">
                    {item.letter}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 line-clamp-1">
                    {item.word}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2 text-right">
              <button
                onClick={() => setShowPhonicsModal(false)}
                className="px-5 py-2 rounded-xl bg-sky-500 text-white font-black text-xs hover:bg-sky-600 cursor-pointer shadow-xs"
              >
                Close Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
