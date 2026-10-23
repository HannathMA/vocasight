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
  Heart,
  Wind,
  Layers,
  Smile,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { evaluateSpeechAttempt, detectSubstitution } from '../engine/textMatching'
import { analyzeFluencyPatterns } from '../engine/disfluency'
import { routePracticeTrack } from '../engine/patternRouter'
import { MouthMirror } from './MouthMirror'
import { Waveform } from './Waveform'
import { SpeechBuddy } from './SpeechBuddy'
import { BreathingExercise } from './BreathingExercise'
import { CartoonTeacher } from './CartoonTeacher'
import { GraduationCap } from 'lucide-react'
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
  } = useAppStore()

  const [pacingProgress, setPacingProgress] = useState(0) // 0 to 1
  const [showBreathingModal, setShowBreathingModal] = useState(false)
  const [showTeacherLesson, setShowTeacherLesson] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [playbackAudioUrl, setPlaybackAudioUrl] = useState(null)
  const pacingTimerRef = useRef(null)

  // Retrieve current target sound & word
  const sounds = soundPack?.sounds || []
  const currentSound = sounds.find((s) => s.id === selectedSoundId) || sounds[0]
  const currentWords = currentSound?.words || []
  const currentWord = currentWords[selectedWordIndex] || currentWords[0] || { text: currentSound?.symbol }

  // Target text depends on the active ladder step
  let targetPracticeText = currentWord.text
  if (currentTrack === 'articulation' || currentTrack === 'fluency') {
    if (ladderStep === 'isolated') targetPracticeText = currentSound.symbol
    else if (ladderStep === 'syllable') targetPracticeText = currentSound.syllables?.[0] || currentSound.symbol
    else if (ladderStep === 'word') targetPracticeText = currentWord.text
    else if (ladderStep === 'phrase') targetPracticeText = currentSound.phrase || currentWord.text
    else if (ladderStep === 'sentence') targetPracticeText = currentSound.sentence || currentWord.text
  }

  // Play word pronunciation sample
  const handlePlaySample = () => {
    if (whisperHook?.playSampleAudio) {
      whisperHook.playSampleAudio(targetPracticeText, currentLanguage)
    }
  }

  // Handle Speech Recording Start
  const handleStartSpeaking = async () => {
    if (micHook.isRecording) return

    setPlaybackAudioUrl(null)
    await micHook.startRecording()

    // Slow Pacing Bar animation (runs for 4.5 seconds)
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

  // Handle Speech Recording Stop & Evaluation
  const handleStopSpeaking = () => {
    if (pacingTimerRef.current) {
      clearInterval(pacingTimerRef.current)
    }
    micHook.stopRecording()
  }

  // When recorded audio is finalized, run evaluation
  useEffect(() => {
    const audio = micHook.recordedAudio
    if (!audio || !audio.float32Array || isProcessing) return

    const evaluateAttempt = async () => {
      setIsProcessing(true)

      // 1. Whisper speech check in Web Worker
      const whisperLang = soundPack?.whisperLang || 'english'
      const whisperResult = await whisperHook.transcribeAudio(
        audio.float32Array,
        whisperLang,
        targetPracticeText
      )

      const transcript = whisperResult?.text || ''
      const wordTimestamps = whisperResult?.words || []

      // In-memory playback URL for child
      if (audio.audioUrl) {
        setPlaybackAudioUrl(audio.audioUrl)
      }

      // 2. Similarity evaluation & articulation substitution detection
      const speechEvaluation = evaluateSpeechAttempt(transcript, targetPracticeText, 0.76)
      const substitution = detectSubstitution(
        transcript,
        targetPracticeText,
        currentSound.symbol,
        currentSound.minimalPairs || []
      )

      // 3. Rule-based Fluency pattern detection
      const fluencyEvaluation = analyzeFluencyPatterns(
        audio.float32Array,
        16000,
        wordTimestamps,
        currentTrack === 'fluency' ? 1.4 : 1.2
      )

      // 4. Pattern router recommendation
      const routing = routePracticeTrack({
        attemptHistory: history,
        currentDisfluency: fluencyEvaluation,
        currentSubstitution: substitution,
        soundId: currentSound.id,
      })

      // Effort-based rewards: stars for calm completed attempts
      const starsAwarded = speechEvaluation.isSuccess ? 3 : 1

      // Trigger mirror sparkles if success
      if (speechEvaluation.isSuccess) {
        faceHook.triggerSparkles()
        try {
          if (useAppStore.getState().settings.soundEffects) {
            const chimeAudio = new Audio('/audio/celebrate.wav')
            chimeAudio.volume = 0.6
            chimeAudio.play().catch(() => {})
          }
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4ECDC4', '#FFD166', '#FF8484', '#10B981'],
          })
        } catch (e) {}
      }

      // Save attempt
      const attemptRecord = {
        soundId: currentSound.id,
        soundSymbol: currentSound.symbol,
        targetWord: targetPracticeText,
        transcript,
        similarity: speechEvaluation.similarity,
        isSuccess: speechEvaluation.isSuccess,
        substitution,
        disfluencyFlags: fluencyEvaluation,
        track: currentTrack,
        starsAwarded,
        routing,
      }

      recordAttempt(attemptRecord)
      setIsProcessing(false)

      // Navigate to results screen
      setScreen('result')
    }

    evaluateAttempt()
  }, [micHook.recordedAudio])

  const ladderSteps = [
    { id: 'isolated', label: t('tracks.ladder.isolated') },
    { id: 'syllable', label: t('tracks.ladder.syllable') },
    { id: 'word', label: t('tracks.ladder.word') },
    { id: 'phrase', label: t('tracks.ladder.phrase') },
    { id: 'sentence', label: t('tracks.ladder.sentence') },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Track Selection & Ladder Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-3xl border-3 border-amber-200 shadow-sm mb-5">
        <div className="flex items-center gap-1.5 bg-amber-100/70 p-1 rounded-2xl">
          <button
            onClick={() => setCurrentTrack('normal')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              currentTrack === 'normal'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tracks.normal')}
          </button>
          <button
            onClick={() => setCurrentTrack('articulation')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              currentTrack === 'articulation'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tracks.articulation')}
          </button>
          <button
            onClick={() => setCurrentTrack('fluency')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              currentTrack === 'fluency'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('tracks.fluency')}
          </button>
        </div>

        {/* Fluency Warm-up or Articulation Step indicator */}
        <div className="flex items-center gap-2">
          {currentTrack === 'fluency' && (
            <button
              onClick={() => setShowBreathingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs cursor-pointer border border-pink-300"
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Breathing Warm-Up</span>
            </button>
          )}

          <button
            onClick={() => setShowTeacherLesson(!showTeacherLesson)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
              showTeacherLesson
                ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                : 'bg-white hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-900" />
            <span>{showTeacherLesson ? 'Hide Teacher 🐾' : 'Show Cartoon Teacher 🐾'}</span>
          </button>

          <button
            onClick={() => setScreen('sound-select')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Change Sound &rarr;
          </button>
        </div>
      </div>

      {/* Cartoon Teacher Lesson Stage */}
      {showTeacherLesson && (
        <div className="animate-pop-burst mb-5">
          <CartoonTeacher
            targetSound={currentSound}
            targetWord={currentWord}
            onPlaySample={handlePlaySample}
            onReadyToSpeak={handleStartSpeaking}
          />
        </div>
      )}

      {/* Articulation / Fluency Ladder Progression Tabs */}
      {(currentTrack === 'articulation' || currentTrack === 'fluency') && (
        <div className="mb-5 bg-gradient-to-r from-teal-50 to-pink-50 p-2.5 rounded-2xl border-2 border-teal-200 flex items-center justify-between gap-1 overflow-x-auto">
          <span className="text-xs font-extrabold text-teal-900 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Progression:</span>
          </span>
          <div className="flex gap-1.5">
            {ladderSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setLadderStep(step.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  ladderStep === step.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-teal-100'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Practice Workspace: Magic Mouth Mirror + Live Waveform & Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Magic Mouth Mirror (Hero Feature) */}
        <div className="flex flex-col items-center">
          <MouthMirror
            faceHook={faceHook}
            targetSound={currentSound}
            onCalibrateComplete={() => {}}
          />

          {/* Model status pill */}
          <div className="mt-2 text-center text-[11px] text-slate-500 font-semibold">
            {whisperHook.loadingStatus || 'Whisper Speech Check Active'}
          </div>
        </div>

        {/* Right Column: Target Card, Waveform & Buttons */}
        <div className="flex flex-col gap-4">
          {/* Target Practice Word Hero Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-4 border-amber-300 shadow-md text-center relative overflow-hidden">
            {/* Target sound symbol badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold mb-2">
              <span>{t('practice.targetSound')}:</span>
              <span className="text-base font-extrabold">{currentSound.symbol}</span>
              <span className="text-slate-500">({currentSound.translit})</span>
            </div>

            {/* Target text display */}
            <h3 className="text-4xl sm:text-5xl font-black text-slate-900 font-fredoka my-1 tracking-tight">
              {targetPracticeText}
            </h3>

            {currentWord.meaning && ladderStep === 'word' && (
              <p className="text-sm font-semibold text-slate-500 m-0">
                "{currentWord.meaning}" {currentWord.icon}
              </p>
            )}

            {/* Listen and Pronounce Button */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handlePlaySample}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm border-2 border-amber-300 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-5 h-5 text-amber-600" />
                <span>{t('practice.listenBtn')}</span>
              </button>
            </div>
          </div>

          {/* Live Waveform Component */}
          <Waveform
            micHook={micHook}
            isRecording={micHook.isRecording}
            pacingProgress={pacingProgress}
            showEasyOnset={currentTrack === 'fluency'}
          />

          {/* Big Child-Friendly Record / Speak Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!micHook.isRecording ? (
              <button
                onClick={handleStartSpeaking}
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-3xl font-black text-lg sm:text-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer border-3 ${
                  isProcessing
                    ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-wait'
                    : 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:to-rose-600 text-white border-red-300 hover:scale-102 active:scale-95 shadow-red-200'
                }`}
              >
                <Mic className="w-6 h-6 animate-pulse" />
                <span>{isProcessing ? t('practice.analyzingState') : t('practice.speakBtn')}</span>
              </button>
            ) : (
              <button
                onClick={handleStopSpeaking}
                className="w-full py-4 px-6 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg sm:text-xl shadow-lg flex items-center justify-center gap-3 cursor-pointer border-3 border-amber-400 animate-pulse"
              >
                <Square className="w-6 h-6 fill-white" />
                <span>{t('practice.stopBtn')}</span>
              </button>
            )}
          </div>

          {/* AI Speech Buddy Encouragement */}
          <SpeechBuddy mode="encourage" onPronounce={handlePlaySample} />

          {/* Animal Challenge Card */}
          <AnimalChallenge
            targetWord={currentWord}
            onPlaySample={handlePlaySample}
            isCompleted={false}
          />
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
