import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Volume2,
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Play,
  Home,
  Settings,
  Wind,
  Layers,
  GraduationCap,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { evaluateSpeechAttempt, detectSubstitution } from '../engine/textMatching'
import { analyzeFluencyPatterns } from '../engine/disfluency'
import { routePracticeTrack } from '../engine/patternRouter'
import { MouthMirror } from './MouthMirror'
import { Waveform } from './Waveform'
import { MascotBuddy } from './MascotBuddy'
import { BreathingExercise } from './BreathingExercise'
import { CartoonTeacher } from './CartoonTeacher'
import { useCompanionVoice } from '../hooks/useCompanionVoice'
import { companionVoice, getWordPrompt } from '../services/companionVoice'
import confetti from 'canvas-confetti'

export function PracticeScreen({ micHook, faceHook, whisperHook }) {
  const { t } = useTranslation()
  const {
    soundPack,
    currentLanguage,
    selectedSoundId,
    selectedWordIndex,
    currentTrack,
    setCurrentTrack,
    ladderStep,
    setLadderStep,
    history,
    recordAttempt,
    setScreen,
    setSelectedWordIndex,
    settings,
  } = useAppStore()

  const [pacingProgress, setPacingProgress] = useState(0)
  const [showBreathingModal, setShowBreathingModal] = useState(false)
  const [showTeacherLesson, setShowTeacherLesson] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mascotType, setMascotType] = useState('robot') // 'robot' | 'elephant'
  const { isSpeaking, speakCurrentScreen } = useCompanionVoice()
  const pacingTimerRef = useRef(null)
  const hasUserRecordedRef = useRef(false)

  // Retrieve current target sound & word
  const sounds = soundPack?.sounds || []
  const currentSound = sounds.find((s) => s.id === selectedSoundId) || sounds[0] || { symbol: 'ഴ', translit: 'zha' }
  const currentWords = currentSound?.words || []
  const currentWord = currentWords[selectedWordIndex] || currentWords[0] || { text: currentSound?.symbol || 'mazha' }

  // Practice text depends on ladder step
  let targetPracticeText = currentWord.text
  if (currentTrack === 'articulation' || currentTrack === 'fluency') {
    if (ladderStep === 'isolated') targetPracticeText = currentSound.symbol
    else if (ladderStep === 'syllable') targetPracticeText = currentSound.syllables?.[0] || currentSound.symbol
    else if (ladderStep === 'word') targetPracticeText = currentWord.text
    else if (ladderStep === 'phrase') targetPracticeText = currentSound.phrase || currentWord.text
    else if (ladderStep === 'sentence') targetPracticeText = currentSound.sentence || currentWord.text
  }

  // Friendly tutor word prompt text
  const wordPromptText = getWordPrompt(currentWord?.text || targetPracticeText, currentLanguage)

  // When a word comes, FIRST tutor says the word!
  useEffect(() => {
    micHook.clearRecordedAudio?.()
    hasUserRecordedRef.current = false
    setIsProcessing(false)

    // Tutor broadcasts the word with audio chime and friendly pronunciation
    const tutorTimer = setTimeout(() => {
      if (currentWord?.text && settings?.voiceSamples !== false) {
        companionVoice.speakWord(
          currentWord.text,
          currentLanguage,
          currentWord.translit || currentSound?.translit
        )
      }
    }, 450)

    return () => {
      clearTimeout(tutorTimer)
      micHook.clearRecordedAudio?.()
      hasUserRecordedRef.current = false
    }
  }, [selectedSoundId, selectedWordIndex, currentWord?.text, currentLanguage])

  // Play sample audio: tutor says the word clearly
  const handlePlaySample = () => {
    companionVoice.speakWord(
      currentWord.text,
      currentLanguage,
      currentWord.translit || currentSound?.translit
    )
  }

  // Start Speaking / Recording
  const handleStartSpeaking = async () => {
    if (micHook.isRecording) return
    hasUserRecordedRef.current = true
    await micHook.startRecording(currentLanguage)

    setPacingProgress(0)
    const startTime = Date.now()
    const pacingDuration = currentTrack === 'fluency' ? 5000 : 3500

    if (pacingTimerRef.current) clearInterval(pacingTimerRef.current)
    pacingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const prog = Math.min(1.0, elapsed / pacingDuration)
      setPacingProgress(prog)
      if (prog >= 1.0) {
        clearInterval(pacingTimerRef.current)
      }
    }, 50)
  }

  // Stop Speaking / Recording
  const handleStopSpeaking = () => {
    if (pacingTimerRef.current) {
      clearInterval(pacingTimerRef.current)
    }
    micHook.stopRecording()
  }

  // When recorded audio is finalized, run evaluation & navigate to result
  useEffect(() => {
    const audio = micHook.recordedAudio
    // ONLY evaluate if user explicitly tapped Speak in this session and audio exists
    if (!hasUserRecordedRef.current || !audio || !audio.float32Array || isProcessing) return

    // Immediately consume flag so this recording session is evaluated once
    hasUserRecordedRef.current = false

    const evaluateAttempt = async () => {
      setIsProcessing(true)

      try {
        const whisperLang = soundPack?.whisperLang || 'english'
        let whisperResult = null
        try {
          whisperResult = await whisperHook.transcribeAudio(
            audio.float32Array,
            whisperLang,
            targetPracticeText,
            audio.speechTranscript || ''
          )
        } catch (transcribeErr) {
          console.warn('transcribeAudio error, using fallback:', transcribeErr)
          whisperResult = { text: audio?.speechTranscript || '', words: [], isFallback: true }
        }

        const transcript = (whisperResult?.text || audio?.speechTranscript || '').trim()
        const wordTimestamps = whisperResult?.words || []

        let speechEvaluation = { isSuccess: false, similarity: 0 }
        if (transcript) {
          try {
            speechEvaluation = evaluateSpeechAttempt(transcript, targetPracticeText, 0.70)
            if (!speechEvaluation.isSuccess && currentWord?.text) {
              const wordEval = evaluateSpeechAttempt(transcript, currentWord.text, 0.70)
              if (wordEval.isSuccess) speechEvaluation = wordEval
            }
          } catch (evalErr) {
            console.warn('evaluateSpeechAttempt error:', evalErr)
          }
        }

        let substitution = null
        try {
          substitution = detectSubstitution(
            transcript,
            targetPracticeText,
            currentSound?.symbol || '',
            currentSound?.minimalPairs || []
          )
        } catch (subErr) {
          console.warn('detectSubstitution error:', subErr)
        }

        let fluencyEvaluation = { hasDisfluency: false }
        try {
          fluencyEvaluation =
            analyzeFluencyPatterns(
              audio.float32Array,
              16000,
              wordTimestamps,
              currentTrack === 'fluency' ? 1.4 : 1.2
            ) || { hasDisfluency: false }
        } catch (fluencyErr) {
          console.warn('analyzeFluencyPatterns error:', fluencyErr)
        }

        let routing = { recommendedTrack: 'normal' }
        try {
          routing = routePracticeTrack({
            attemptHistory: history || [],
            currentDisfluency: fluencyEvaluation,
            currentSubstitution: substitution,
            soundId: currentSound?.id,
          })
        } catch (routeErr) {
          console.warn('routePracticeTrack error:', routeErr)
        }

        // True speech evaluation: Must actually match the spoken word!
        const isSuccess = Boolean(speechEvaluation?.isSuccess)
        const starsAwarded = isSuccess ? 3 : 1

        if (isSuccess) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            })
          } catch (_) {}
        }

        const durationMs =
          Math.round(((audio?.float32Array?.length || 0) / 16000) * 1000) || 1500

        const attemptRecord = {
          soundId: currentSound?.id || 'sound',
          soundSymbol: currentSound?.symbol || 'ഴ',
          word: currentWord?.text || targetPracticeText,
          targetWord: targetPracticeText,
          transcript: transcript || '(no speech detected)',
          similarity: speechEvaluation?.similarity || 0,
          isSuccess,
          starsAwarded,
          substitution,
          disfluencyFlags: fluencyEvaluation,
          metrics: {
            durationMs,
            rms: 0.1,
          },
          routing,
        }

        recordAttempt(attemptRecord)
        micHook.clearRecordedAudio?.()
        setScreen('result')
      } catch (fatalErr) {
        console.error('Fatal error in evaluateAttempt:', fatalErr)
        const fallbackRecord = {
          soundId: currentSound?.id || 'sound',
          soundSymbol: currentSound?.symbol || 'ഴ',
          word: currentWord?.text || targetPracticeText,
          targetWord: targetPracticeText,
          transcript: '',
          similarity: 0,
          isSuccess: false,
          starsAwarded: 1,
          substitution: null,
          disfluencyFlags: { hasDisfluency: false },
          metrics: {
            durationMs: 1500,
            rms: 0.1,
          },
          routing: { recommendedTrack: 'normal' },
        }
        recordAttempt(fallbackRecord)
        micHook.clearRecordedAudio?.()
        setScreen('result')
      } finally {
        setIsProcessing(false)
      }
    }

    evaluateAttempt()
  }, [micHook.recordedAudio])

  const totalSteps = currentWords.length || 3
  const currentStepNum = selectedWordIndex + 1

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Practice Bar matching Mockup Screen 3 */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border-2 border-sky-100 shadow-xs mb-5">
        {/* Left: Home Button */}
        <button
          onClick={() => setScreen('welcome')}
          aria-label="Home"
          className="w-10 h-10 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-transform active:scale-95 cursor-pointer border border-sky-200"
        >
          <Home className="w-5 h-5 text-sky-600" />
        </button>

        {/* Center: Practice Title */}
        <h2 className="text-lg sm:text-xl font-black text-slate-800 font-fredoka m-0 flex items-center gap-2">
          <span>{currentLanguage === 'ml' ? 'പരിശീലനം:' : currentLanguage === 'hi' ? 'अभ्यास:' : 'Practice:'}</span>
          <span className="text-teal-600 font-extrabold">{currentSound.symbol}</span>
          <span className="text-slate-500 font-semibold text-base">({currentWord.text})</span>
        </h2>

        {/* Right: Step Indicator + Settings Button */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs">
            {currentStepNum}/{totalSteps}
          </span>
          <button
            onClick={() => setScreen('settings')}
            aria-label="Settings"
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-transform active:scale-95 cursor-pointer border border-slate-200"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Companion / Teacher Mode Switcher */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Companion:</span>
          <button
            onClick={() => setMascotType('robot')}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
              mascotType === 'robot'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🤖 Robot Buddy
          </button>
          <button
            onClick={() => setMascotType('elephant')}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
              mascotType === 'elephant'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🐘 Aana Teacher
          </button>
        </div>

        <button
          onClick={() => setShowTeacherLesson(!showTeacherLesson)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
          <span>{showTeacherLesson ? 'Hide Blackboard' : 'Lesson Blackboard 🐾'}</span>
        </button>
      </div>

      {/* Optional Blackboard Teacher Stage */}
      {showTeacherLesson && (
        <div className="mb-6 animate-pop-burst">
          <CartoonTeacher
            targetSound={currentSound}
            targetWord={currentWord}
            onPlaySample={handlePlaySample}
            onReadyToSpeak={handleStartSpeaking}
          />
        </div>
      )}

      {/* Main 2-Column Practice Layout matching Mockup Screen 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Magic Mouth Mirror + Live Metrics (Jaw Open, Mouth Funnel, Mouth Stretch) */}
        <div className="w-full flex flex-col items-center">
          <MouthMirror
            faceHook={faceHook}
            targetSound={currentSound}
            onCalibrateComplete={() => {}}
          />

          <div className="mt-2 text-center text-[11px] text-slate-500 font-semibold">
            {whisperHook.loadingStatus || 'Whisper Speech Check & Face Tracking Active'}
          </div>
        </div>

        {/* RIGHT COLUMN: Target Card, Dialogue Bubble, Waveform, and Controls */}
        <div className="flex flex-col gap-4">
          {/* Top Row: Target Word Card + Mascot Dialogue Bubble */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            {/* Target Sound Card */}
            <div className="bg-white rounded-3xl p-4 border-3 border-sky-100 shadow-sm flex flex-col items-center justify-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-4xl mb-1 shadow-inner">
                {currentWord.icon || '🌧️'}
              </div>
              <div className="text-3xl font-black text-slate-900 font-fredoka my-0.5">
                {currentSound.symbol}
              </div>
              <div className="text-sm font-bold text-slate-500">
                ({targetPracticeText})
              </div>
              {/* Play Sound Button */}
              <button
                onClick={handlePlaySample}
                aria-label="Listen"
                className="mt-2.5 w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-sky-200 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Mascot Dialogue Bubble with Tutor Voice Replay */}
            <div
              onClick={handlePlaySample}
              title="Click to hear tutor pronounce word"
              className="bg-white rounded-3xl p-4 border-3 border-sky-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-sky-300 transition-all group"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider block">
                    {currentLanguage === 'ml' ? 'ട്യൂട്ടർ പറയുന്നു:' : currentLanguage === 'hi' ? 'ट्यूटर कहता है:' : 'Tutor Says:'}
                  </span>
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-pink-500 animate-bounce' : 'text-sky-500'}`} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug m-0">
                  {wordPromptText}
                </p>
              </div>
              <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                <MascotBuddy
                  type={mascotType}
                  mood={isSpeaking ? 'talking' : micHook.isRecording ? 'happy' : 'happy'}
                  size={64}
                />
              </div>
            </div>
          </div>

          {/* Middle: Live Waveform */}
          <Waveform
            micHook={micHook}
            isRecording={micHook.isRecording}
            pacingProgress={pacingProgress}
            showEasyOnset={currentTrack === 'fluency'}
          />

          {/* Bottom Action Controls matching Mockup Screen 3 */}
          <div className="bg-white rounded-3xl p-5 border-3 border-sky-100 shadow-sm flex items-center justify-around gap-4">
            {/* Big Circular Mic Button */}
            <div className="flex flex-col items-center">
              {!micHook.isRecording ? (
                <button
                  onClick={handleStartSpeaking}
                  disabled={isProcessing}
                  aria-label="Tap to Speak"
                  className={`w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-xl shadow-red-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer border-4 border-white ${
                    isProcessing ? 'opacity-60 cursor-wait' : 'hover:scale-105'
                  }`}
                >
                  <Mic className="w-9 h-9" />
                </button>
              ) : (
                <button
                  onClick={handleStopSpeaking}
                  aria-label="Stop Speaking"
                  className="w-20 h-20 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-300 flex items-center justify-center transition-transform active:scale-95 cursor-pointer border-4 border-amber-400 animate-pulse"
                >
                  <Square className="w-8 h-8 fill-white" />
                </button>
              )}
              <span className="text-xs font-black text-slate-700 mt-2">
                {micHook.isRecording
                  ? (currentLanguage === 'ml' ? 'കേൾക്കുന്നു...' : currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...')
                  : isProcessing
                  ? (currentLanguage === 'ml' ? 'പരിശോധിക്കുന്നു...' : currentLanguage === 'hi' ? 'जाँच हो रही है...' : 'Analyzing...')
                  : (currentLanguage === 'ml' ? 'പറയാൻ തൊടൂ' : currentLanguage === 'hi' ? 'बोलने के लिए छुएं' : 'Tap to Speak')}
              </span>
            </div>

            {/* Blue Listen Button */}
            <button
              onClick={handlePlaySample}
              className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-md shadow-sky-200 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{currentLanguage === 'ml' ? 'ശ്രദ്ധിച്ചു കേൾക്കൂ' : currentLanguage === 'hi' ? 'ध्यान से सुनें' : 'Listen'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breathing Warm-Up Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-4 border-pink-300 shadow-2xl relative">
            <button
              onClick={() => setShowBreathingModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕ Close
            </button>
            <BreathingExercise onComplete={() => setShowBreathingModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
