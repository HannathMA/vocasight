import React, { useState, useRef, useEffect } from 'react'
import Elephant from '../Elephant.jsx'
import { useAppStore } from '../store/useAppStore'

// Playful 8-bit / musical chime via Web Audio API for instant feedback
function playCuteRoboChime(type = 'chime') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    const notes = [
      { f: 523.25, d: 0.08, t: 0 },    // C5
      { f: 659.25, d: 0.09, t: 0.07 }, // E5
      { f: 783.99, d: 0.10, t: 0.14 }, // G5
      { f: 1046.50, d: 0.22, t: 0.21 }, // C6
      { f: 1318.51, d: 0.28, t: 0.30 }, // E6
    ]
    notes.forEach(({ f, d, t }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, ctx.currentTime + t)
      gain.gain.setValueAtTime(0.001, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + d + 0.05)
    })
  } catch (_) {}
}

const CUTE_EXPRESSIONS = ['hearts', 'stars', 'wink', 'joy', 'surprised']
const DANCE_STYLES = ['animate-robo-groove', 'animate-robo-jump', 'animate-robo-spin', 'animate-robo-wobble']

const DANCE_PHRASES = {
  ml: [
    '✨ യേയ്! ഡാൻസ് കളിക്കാം! 🎶',
    '💖 എനിക്ക് സന്തോഷമായി! സൂപ്പർ! 🎉',
    '⭐ അടിപൊളി! ഒന്നുകൂടി തൊടൂ! 💃',
    '🌟 വൗ! നിങ്ങൾ ബെസ്റ്റ് ഫ്രണ്ട് ആണ്! ✨',
  ],
  hi: [
    '✨ वाह! चलो डांस करते हैं! 🎶',
    '💖 मुझे बहुत अच्छा लगा! शाबाश! 🎉',
    '⭐ बहुत खूब! एक बार और छुओ! 💃',
  ],
  en: [
    "✨ Yay! Let's dance together! 🎶",
    "💖 Wow! You're my best friend! 🎉",
    '⭐ Dance party! Tap me again! 💃',
  ],
}

export function MascotBuddy({
  type = 'robot', // 'robot' | 'elephant'
  mood = 'happy', // 'happy' | 'waving' | 'talking' | 'celebrating'
  signText = null,
  speechBubble = null,
  size = 200,
  onClick = null,
}) {
  const currentLanguage = useAppStore((state) => state.currentLanguage) || 'ml'
  const [isDancing, setIsDancing] = useState(false)
  const [danceMove, setDanceMove] = useState('animate-robo-groove')
  const [expression, setExpression] = useState(null) // null | 'hearts' | 'stars' | 'wink' | 'joy' | 'surprised'
  const [particles, setParticles] = useState([])
  const [danceReaction, setDanceReaction] = useState(null)
  const danceTimeoutRef = useRef(null)
  const expressionIndexRef = useRef(0)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current)
    }
  }, [])

  const handleTouchRobo = (e) => {
    // If external onClick provided, still call it
    if (onClick) {
      try {
        onClick(e)
      } catch (_) {}
    }

    // Play cheerful audio chime
    playCuteRoboChime()

    // Pick next cute expression and dance style
    expressionIndexRef.current = (expressionIndexRef.current + 1) % CUTE_EXPRESSIONS.length
    const nextExpr = CUTE_EXPRESSIONS[expressionIndexRef.current]
    const nextDance = DANCE_STYLES[Math.floor(Math.random() * DANCE_STYLES.length)]

    setExpression(nextExpr)
    setDanceMove(nextDance)
    setIsDancing(true)

    // Language specific cheerful dance exclamation
    const phrases = DANCE_PHRASES[currentLanguage] || DANCE_PHRASES.ml
    setDanceReaction(phrases[Math.floor(Math.random() * phrases.length)])

    // Spawn floating emoji particles around the robot
    const emojis = ['💖', '✨', '⭐', '🎶', '🌈', '🎉', '💃', '🍭']
    const newParticles = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      tx: `${(Math.random() - 0.5) * 120}px`,
      delay: `${i * 0.08}s`,
      left: `${20 + Math.random() * 60}%`,
    }))
    setParticles(newParticles)

    if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current)
    danceTimeoutRef.current = setTimeout(() => {
      setIsDancing(false)
      setExpression(null)
      setDanceReaction(null)
      setParticles([])
    }, 3200)
  }

  // Elephant Mascot Mode
  if (type === 'elephant') {
    return (
      <div
        onClick={handleTouchRobo}
        onTouchStart={handleTouchRobo}
        className="relative flex flex-col items-center select-none cursor-pointer group"
      >
        {speechBubble && (
          <div className="mb-2 bg-white px-4 py-2 rounded-2xl border-3 border-amber-300 text-slate-800 font-extrabold text-sm sm:text-base shadow-md relative animate-gentle-bounce max-w-xs text-center">
            {speechBubble}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-3 border-b-3 border-amber-300 rotate-45" />
          </div>
        )}

        <div className={isDancing ? danceMove : ''}>
          <Elephant
            talking={mood === 'talking'}
            cheer={mood === 'celebrating' || isDancing}
            size={size}
          />
        </div>

        {signText && (
          <div className="mt-2 bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 font-black text-xs sm:text-sm px-4 py-1.5 rounded-xl border-2 border-amber-900 shadow-md transform -rotate-1 group-hover:rotate-0 transition-transform">
            {signText}
          </div>
        )}
      </div>
    )
  }

  // 3D Cute Robot Buddy with Interactive Touch Dance & Cute Expressions
  const activeBubble = danceReaction || speechBubble

  return (
    <div
      onClick={handleTouchRobo}
      onTouchStart={handleTouchRobo}
      title="Touch or click me to dance!"
      className="relative flex flex-col items-center select-none cursor-pointer group active:scale-95 transition-transform"
    >
      {/* Speech Bubble / Dance Reaction Banner */}
      {activeBubble && (
        <div
          className={`mb-3 px-4 py-2 rounded-2xl text-slate-800 font-black text-xs sm:text-sm shadow-lg relative animate-bounce max-w-xs text-center transition-all ${
            isDancing
              ? 'bg-gradient-to-r from-pink-100 via-yellow-100 to-sky-100 border-3 border-pink-400 text-pink-900 scale-105'
              : 'bg-white border-3 border-sky-300'
          }`}
        >
          {activeBubble}
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-r-3 border-b-3 ${
              isDancing ? 'bg-yellow-100 border-pink-400' : 'bg-white border-sky-300'
            }`}
          />
        </div>
      )}

      {/* Touch prompt badge if idle */}
      {!isDancing && !activeBubble && (
        <div className="mb-2 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
          👆 എന്നെ തൊടൂ! (Touch me!)
        </div>
      )}

      {/* Floating Emojis when touched & dancing */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            '--tx': p.tx,
            left: p.left,
            animationDelay: p.delay,
            animationDuration: '1.8s',
          }}
          className="absolute top-10 pointer-events-none text-2xl z-30 select-none animate-[float-pop-particle_1.8s_ease-out_forwards]"
        >
          {p.emoji}
        </span>
      ))}

      {/* Robot SVG with Dancing & Cute Expression Animation */}
      <div
        style={{ width: size, height: size * 1.05 }}
        className={`relative flex items-center justify-center transition-transform ${
          isDancing ? danceMove : 'group-hover:scale-105'
        }`}
      >
        <svg viewBox="0 0 200 210" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            {/* Robot Head & Body Gradients */}
            <linearGradient id="roboBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E2F1FF" />
              <stop offset="100%" stopColor="#BFDBFE" />
            </linearGradient>
            <linearGradient id="roboBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="roboPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="roboScreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="antennaRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse
            cx="100"
            cy="198"
            rx={isDancing ? '45' : '60'}
            ry="10"
            fill="rgba(15, 23, 42, 0.18)"
            className={isDancing ? 'animate-pulse' : ''}
          />

          {/* Cute Robot Body Wrapper */}
          <g className={!isDancing && (mood === 'celebrating' ? 'animate-bounce' : 'animate-gentle-bounce')}>
            {/* Feet with alternate dance tap */}
            <g className={isDancing ? 'animate-wiggle origin-bottom' : ''}>
              <rect x="68" y="172" width="26" height="20" rx="9" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
              <rect x="106" y="172" width="26" height="20" rx="9" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
            </g>

            {/* Torso */}
            <rect x="58" y="112" width="84" height="68" rx="28" fill="url(#roboBody)" stroke="#93C5FD" strokeWidth="2.5" />

            {/* Chest Center Core Circle (Pulses when dancing) */}
            <circle cx="100" cy="142" r="16" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
            <circle cx="100" cy="142" r="12" fill={isDancing ? '#F43F5E' : '#38BDF8'} className="animate-pulse" />
            {isDancing ? (
              <text x="100" y="146" textAnchor="middle" fontSize="12" fill="#FFFFFF">💖</text>
            ) : (
              <path d="M96 138 L104 146 M104 138 L96 146" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Arms: Left hand waving high when dancing / Right hand grooving with microphone */}
            <g className={isDancing ? 'animate-wiggle origin-[42px_130px]' : (mood === 'waving' || mood === 'celebrating' ? 'animate-wiggle origin-[42px_130px]' : '')}>
              <ellipse
                cx="42"
                cy={isDancing ? '122' : '138'}
                rx="12"
                ry="18"
                fill="url(#roboBody)"
                stroke="#93C5FD"
                strokeWidth="2"
                transform={isDancing ? 'rotate(55 42 122)' : 'rotate(25 42 138)'}
              />
              <circle cx={isDancing ? '32' : '34'} cy={isDancing ? '108' : '150'} r="8" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
            </g>

            {/* Right Arm holding Studio Mic */}
            <g className={isDancing ? 'animate-bounce origin-[158px_130px]' : 'origin-[158px_130px]'}>
              <ellipse
                cx="158"
                cy="138"
                rx="12"
                ry="18"
                fill="url(#roboBody)"
                stroke="#93C5FD"
                strokeWidth="2"
                transform={isDancing ? 'rotate(-45 158 138)' : 'rotate(-25 158 138)'}
              />
              <circle cx="166" cy="150" r="8" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />

              {/* Handheld Studio Microphone */}
              <g transform={isDancing ? 'translate(150, 85) rotate(-10)' : 'translate(156, 95) rotate(-22)'}>
                <rect x="4" y="22" width="7" height="30" rx="3.5" fill="#1E293B" />
                <rect x="3" y="48" width="9" height="4" rx="2" fill="#475569" />
                <rect x="1" y="6" width="13" height="18" rx="6" fill="#64748B" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="1" y1="12" x2="14" y2="12" stroke="#E2E8F0" strokeWidth="1" />
                <line x1="1" y1="17" x2="14" y2="17" stroke="#E2E8F0" strokeWidth="1" />
                <circle
                  cx="7.5"
                  cy="27"
                  r="2.5"
                  fill={isDancing ? '#EC4899' : mood === 'talking' ? '#EF4444' : '#10B981'}
                  className={isDancing || mood === 'talking' ? 'animate-ping' : ''}
                />
                {(isDancing || mood === 'talking') && (
                  <g className="animate-pulse">
                    <path d="M 18 8 Q 25 15 18 22" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 23 4 Q 31 15 23 27" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                )}
              </g>
            </g>

            {/* Head Neck Connector */}
            <rect x="88" y="100" width="24" height="15" rx="5" fill="#94A3B8" />

            {/* Antenna with Flashing Rainbow Disco Light when Dancing */}
            <g transform="translate(100, 24)">
              <rect x="-3" y="0" width="6" height="12" rx="3" fill="#64748B" />
              <circle
                cx="0"
                cy="-3"
                r={isDancing ? '8' : '5'}
                fill={isDancing ? 'url(#antennaRainbow)' : '#F59E0B'}
                className={isDancing ? 'animate-ping' : ''}
              />
              <circle
                cx="0"
                cy="-3"
                r="4.5"
                fill={isDancing ? '#FDE047' : '#FBBF24'}
              />
            </g>

            {/* Main Robot Rounded Head */}
            <rect x="42" y="32" width="116" height="80" rx="34" fill="url(#roboBody)" stroke="#93C5FD" strokeWidth="3" />

            {/* Headphones Trim */}
            <rect x="34" y="52" width="14" height="38" rx="7" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
            <rect x="152" y="52" width="14" height="38" rx="7" fill={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'} />
            <path
              d="M48 48 Q100 20 152 48"
              fill="none"
              stroke={isDancing ? 'url(#roboPink)' : 'url(#roboBlue)'}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Screen Face Display */}
            <rect x="54" y="44" width="92" height="56" rx="22" fill="url(#roboScreen)" />

            {/* CUTE EXPRESSIONS DISPLAY (Eyes & Mouth) */}
            {expression === 'hearts' ? (
              /* Heart Love Eyes Expression */
              <g className="animate-heart-pulse">
                {/* Left Heart Eye */}
                <path
                  d="M 78 63 A 4.5 4.5 0 0 0 71 63 A 4.5 4.5 0 0 0 71 69 L 78 76 L 85 69 A 4.5 4.5 0 0 0 85 63 A 4.5 4.5 0 0 0 78 63 Z"
                  fill="#F43F5E"
                />
                {/* Right Heart Eye */}
                <path
                  d="M 122 63 A 4.5 4.5 0 0 0 115 63 A 4.5 4.5 0 0 0 115 69 L 122 76 L 129 69 A 4.5 4.5 0 0 0 129 63 A 4.5 4.5 0 0 0 122 63 Z"
                  fill="#F43F5E"
                />
              </g>
            ) : expression === 'stars' ? (
              /* Star Sparkle Eyes Expression */
              <g className="animate-star-twinkle">
                {/* Left Star Eye */}
                <g transform="translate(78, 68)">
                  <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FDE047" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                </g>
                {/* Right Star Eye */}
                <g transform="translate(122, 68)">
                  <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FDE047" />
                  <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                </g>
              </g>
            ) : expression === 'wink' ? (
              /* Playful Winking Eyes */
              <g>
                {/* Left Eye: Cheeky Wink */}
                <path d="M 68 70 Q 78 62 88 70" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                {/* Right Eye: Big Sparkling Anime Eye */}
                <ellipse cx="122" cy="68" rx="14" ry="18" fill="url(#eyeGlow)" />
                <circle cx="119" cy="62" r="5.5" fill="#FFFFFF" />
                <circle cx="126" cy="74" r="3" fill="#E0F2FE" />
              </g>
            ) : expression === 'joy' ? (
              /* Joyful Chibi Squint Eyes (^ ^) */
              <g>
                <path d="M 68 72 Q 78 60 88 72" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <path d="M 112 72 Q 122 60 132 72" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              </g>
            ) : expression === 'surprised' ? (
              /* Kawaii WOW Eyes (O O) */
              <g>
                <circle cx="78" cy="68" r="16" fill="url(#eyeGlow)" />
                <circle cx="78" cy="68" r="11" fill="#0F172A" />
                <circle cx="75" cy="64" r="5" fill="#FFFFFF" />
                <circle cx="122" cy="68" r="16" fill="url(#eyeGlow)" />
                <circle cx="122" cy="68" r="11" fill="#0F172A" />
                <circle cx="119" cy="64" r="5" fill="#FFFFFF" />
              </g>
            ) : (
              /* Default Big Expressive Glowing Eyes */
              <g className="animate-eye-blink origin-center">
                {/* Left Eye */}
                <ellipse cx="78" cy="68" rx="13" ry="17" fill="url(#eyeGlow)" />
                <circle cx="75" cy="63" r="5" fill="#FFFFFF" />
                <circle cx="82" cy="74" r="2.5" fill="#E0F2FE" />

                {/* Right Eye */}
                <ellipse cx="122" cy="68" rx="13" ry="17" fill="url(#eyeGlow)" />
                <circle cx="119" cy="63" r="5" fill="#FFFFFF" />
                <circle cx="126" cy="74" r="2.5" fill="#E0F2FE" />
              </g>
            )}

            {/* Cute Cheerful Mouth depending on expression */}
            <g transform="translate(100, 85)">
              {expression === 'hearts' ? (
                /* Cute Cat Smile 'w' */
                <path d="M -8 1 Q -4 6 0 1 Q 4 6 8 1" fill="none" stroke="#FB7185" strokeWidth="3" strokeLinecap="round" />
              ) : expression === 'stars' || expression === 'joy' || isDancing ? (
                /* Wide joyful open singing smile */
                <g>
                  <path d="M -11 -2 Q 0 12 11 -2 Z" fill="#38BDF8" />
                  <path d="M -6 5 Q 0 11 6 5 Z" fill="#FB7185" />
                </g>
              ) : expression === 'wink' ? (
                /* Cheeky Smirk */
                <path d="M -7 2 Q 1 7 8 0" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
              ) : expression === 'surprised' ? (
                /* Little Round WOW Mouth */
                <circle cx="0" cy="1" r="5" fill="#38BDF8" />
              ) : mood === 'talking' ? (
                <ellipse cx="0" cy="0" rx="9" ry="6" fill="#38BDF8" className="animate-ping" />
              ) : mood === 'celebrating' ? (
                <path d="M -10 -2 Q 0 10 10 -2 Z" fill="#38BDF8" />
              ) : (
                <path d="M -8 -1 Q 0 7 8 -1" fill="none" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
              )}
            </g>

            {/* Rosy Cheeks Glow (Extra bright & blushing when dancing or happy) */}
            <circle
              cx="62"
              cy="78"
              r={isDancing ? '8' : '6'}
              fill={isDancing ? '#FB7185' : '#F43F5E'}
              opacity={isDancing ? '0.85' : '0.45'}
              className={isDancing ? 'animate-pulse' : ''}
            />
            <circle
              cx="138"
              cy="78"
              r={isDancing ? '8' : '6'}
              fill={isDancing ? '#FB7185' : '#F43F5E'}
              opacity={isDancing ? '0.85' : '0.45'}
              className={isDancing ? 'animate-pulse' : ''}
            />
          </g>
        </svg>
      </div>

      {/* Wooden Signboard */}
      {signText && (
        <div className="mt-1 relative bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-xl border-2 border-amber-950 shadow-md transform -rotate-1 group-hover:rotate-0 transition-transform">
          <div className="absolute -top-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-300" />
          <div className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-300" />
          <span>{signText}</span>
        </div>
      )}
    </div>
  )
}
