import { useEffect, useRef, useState, useCallback } from 'react'
import Elephant from './Elephant.jsx'

// Colourful equalizer bars driven by the microphone in real-time
function Bars({ stream, onLevel }) {
  const bars = useRef([])
  const onLevelRef = useRef(onLevel)
  onLevelRef.current = onLevel

  useEffect(() => {
    if (!stream) return
    let ctx, raf
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const an = ctx.createAnalyser()
      an.fftSize = 64
      const src = ctx.createMediaStreamSource(stream)
      src.connect(an)
      const d = new Uint8Array(an.frequencyBinCount)

      const loop = () => {
        an.getByteFrequencyData(d)
        let sum = 0
        bars.current.forEach((b, i) => {
          const v = (d[i + 1] || 0) / 255
          sum += v
          if (b) b.style.transform = `scaleY(${0.14 + v * 1.15})`
        })
        const avg = sum / (bars.current.length || 1)
        if (onLevelRef.current) onLevelRef.current(avg)
        raf = requestAnimationFrame(loop)
      }
      loop()
    } catch (e) {
      console.warn('AudioContext error in Bars:', e)
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {})
    }
  }, [stream])

  return (
    <div className="bars" aria-label="Voice bars">
      {Array.from({ length: 14 }).map((_, i) => (
        <i
          key={i}
          ref={(e) => (bars.current[i] = e)}
          style={{ background: `hsl(${i * 26} 92% 58%)` }}
        />
      ))}
    </div>
  )
}

export default function Lesson({ sound, L, onDone, onBack }) {
  const ui = L.ui
  const [step, setStep] = useState(0) // 0: Listen, 1: Mirror, 2: Speak
  const [talk, setTalk] = useState(false)
  const [stream, setStream] = useState(null)
  const [msg, setMsg] = useState('')
  const [matchScore, setMatchScore] = useState(85)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const vid = useRef(null)
  const heard = useRef(0)
  const live = useRef(null)
  const isDoneTriggered = useRef(false)

  const lines = [
    `${ui.listen}! ${sound.word}`,
    `${ui.copy}: "${sound.s}"`,
    `${ui.say}: "${sound.word}"`,
  ]

  // Pronounce word with SpeechSynthesis while Aana Teacher moves her mouth
  const say = useCallback((t) => {
    setTalk(true)
    const off = () => setTalk(false)
    const safety = setTimeout(off, 3200)

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(t)
      u.lang = L.tts || 'ml-IN'
      u.rate = 0.9
      u.pitch = 1.1
      u.onend = () => {
        clearTimeout(safety)
        off()
      }
      u.onerror = () => {
        clearTimeout(safety)
        off()
      }
      speechSynthesis.speak(u)
    } else {
      setTimeout(off, 2000)
    }
  }, [L.tts])

  // Play audio on step change
  useEffect(() => {
    isDoneTriggered.current = false
    heard.current = 0
    say(lines[step])
  }, [step, say, lines])

  // Request camera and microphone stream
  const startMedia = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      live.current = s
      setStream(s)
      setMsg('')
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true })
        live.current = s
        setStream(s)
        setMsg(ui.cam)
      } catch {
        setMsg(ui.mic)
      }
    }
  }, [ui.cam, ui.mic])

  useEffect(() => {
    if (step >= 1 && !live.current) {
      startMedia()
    }
  }, [step, startMedia])

  useEffect(() => {
    if (stream && vid.current) {
      vid.current.srcObject = stream
    }
  }, [stream, step])

  // Cleanup media & TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) speechSynthesis.cancel()
      if (live.current) {
        live.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Finish attempt with celebration
  const completeAttempt = useCallback((transcript = '') => {
    if (isDoneTriggered.current) return
    isDoneTriggered.current = true
    setIsEvaluating(true)

    setTimeout(() => {
      setIsEvaluating(false)
      onDone({
        soundId: sound.id,
        soundSymbol: sound.s,
        word: sound.word,
        transcript: transcript || sound.word,
        matchScore,
      })
    }, 600)
  }, [onDone, sound, matchScore])

  // Silence auto-stop & voice level monitor
  const handleLevel = useCallback((v) => {
    if (step === 2 && !isDoneTriggered.current) {
      if (v > 0.18) {
        heard.current += 1
        if (heard.current > 38) {
          heard.current = -9999
          completeAttempt(sound.word)
        }
      }
    }
  }, [step, sound.word, completeAttempt])

  const hasVideo = stream && stream.getVideoTracks().length > 0

  return (
    <section className="lesson">
      {/* Top Progress bar with step stones */}
      <div className="topbar">
        <button className="round" onClick={onBack} aria-label="Back">
          ⬅
        </button>
        <div className="steps">
          {['👂', '🪞', '🎤'].map((e, i) => (
            <span
              key={i}
              className={`stone ${i < step ? 'ok' : ''} ${i === step ? 'now' : ''}`}
            >
              {i < step ? '✔' : e}
            </span>
          ))}
        </div>
      </div>

      {/* Main Classroom Stage */}
      <div className="stage">
        {/* Animated Aana Teacher */}
        <div className="tcol">
          <Elephant talking={talk} size={230} />
        </div>

        {/* Classroom Blackboard */}
        <div className="boardwrap">
          <div className="board">
            <div className="speech" key={step}>
              {lines[step]}
            </div>
            <div
              className="letter"
              style={{ '--a': sound.c[0], '--b': sound.c[1] }}
            >
              {sound.s}
            </div>
            <div className="wordrow">
              <span>{sound.emoji}</span>
              <b>{sound.word}</b>
            </div>
          </div>

          {/* Interactive Live Mirror & Mic */}
          {step >= 1 && (
            <div className="live">
              {/* Magic Mouth Mirror */}
              <div className="mirror">
                {hasVideo ? (
                  <video ref={vid} autoPlay muted playsInline />
                ) : (
                  <span className="nocam">🪞</span>
                )}
                <i className="ring" />
                <i className="sp s1" />
                <i className="sp s2" />
              </div>

              {/* Real-time Voice Bars */}
              {step === 2 && (
                <div className="mic">
                  <Bars stream={stream} onLevel={handleLevel} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Camera / Mic Status Hints */}
      {msg && (
        <p className="hint" role="status">
          {msg}
          <button className="mini" onClick={startMedia}>
            ↻
          </button>
        </p>
      )}

      {/* Action Controls */}
      <div className="actions">
        <button
          className="round big2 blue"
          onClick={() => say(lines[step])}
          aria-label={ui.listen}
          title={ui.listen}
        >
          🔊
        </button>

        {step < 2 ? (
          <button
            className="round big2 green"
            onClick={() => setStep(step + 1)}
            aria-label={ui.next}
            title={ui.next}
          >
            ➡
          </button>
        ) : (
          <button
            className={`round big2 pink ${isEvaluating ? 'pulse' : 'pulse'}`}
            onClick={() => completeAttempt(sound.word)}
            aria-label="Done"
            title={ui.say}
          >
            🎤
          </button>
        )}
      </div>
    </section>
  )
}
