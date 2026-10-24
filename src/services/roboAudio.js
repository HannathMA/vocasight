// Robo Voice & Audio Synthesis Service for VocaSight Alphabet Game
// Provides robotic bleeps, harmonic game-winning fanfares, and speech synthesis

class RoboAudioService {
  constructor() {
    this.audioCtx = null
    this.isSpeaking = false
    this.currentUtterance = null
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.audioCtx = new AudioCtx()
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {})
    }
    return this.audioCtx
  }

  // Cute 2-tone robotic bleep (Beep-Boop!)
  playRoboBeep() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const tones = [
        { freq: 880, start: 0, duration: 0.08, type: 'square' },
        { freq: 1174, start: 0.09, duration: 0.12, type: 'triangle' },
      ]

      tones.forEach(({ freq, start, duration, type }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + start)
        osc.stop(ctx.currentTime + start + duration + 0.02)
      })
    } catch (_) {}
  }

  // Playful pop / tap sound
  playTapSound() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.09)
    } catch (_) {}
  }

  // Upbeat electronic major chord fanfare for correct alphabet choice
  playCorrectSound() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const notes = [
        { freq: 523.25, time: 0 },    // C5
        { freq: 659.25, time: 0.07 }, // E5
        { freq: 783.99, time: 0.14 }, // G5
        { freq: 1046.5, time: 0.22 }, // C6
        { freq: 1318.5, time: 0.32 }, // E6
      ]

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time)
        gain.gain.setValueAtTime(0.15, ctx.currentTime + time)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.28)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + time)
        osc.stop(ctx.currentTime + time + 0.3)
      })
    } catch (_) {}
  }

  // Gentle, friendly encouragement sound (not a harsh buzzer)
  playTryAgainSound() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(360, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(290, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.23)
    } catch (_) {}
  }

  // Grand victory fanfare chime for winning the game
  playVictoryFanfare() {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const fanfare = [
        { freq: 523.25, time: 0, dur: 0.15 },    // C5
        { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.30, dur: 0.15 }, // G5
        { freq: 1046.5, time: 0.45, dur: 0.35 }, // C6
        { freq: 880.0, time: 0.85, dur: 0.15 },  // A5
        { freq: 1046.5, time: 1.0, dur: 0.15 },  // C6
        { freq: 1174.6, time: 1.15, dur: 0.15 }, // D6
        { freq: 1318.5, time: 1.35, dur: 0.60 }, // E6 grand finale
      ]

      fanfare.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time)
        gain.gain.setValueAtTime(0.18, ctx.currentTime + time)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(ctx.currentTime + time)
        osc.stop(ctx.currentTime + time + dur + 0.05)
      })
    } catch (_) {}
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    this.currentUtterance = null
    this.isSpeaking = false
  }

  // Speaks in a cheerful, energetic robotic companion voice
  speakRoboText(text, langCode = 'en', phoneticFallback = null, { onStart = null, onEnd = null } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd()
      return
    }

    try {
      // Play robotic bleep intro
      this.playRoboBeep()

      window.speechSynthesis.cancel()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }

      const voices = window.speechSynthesis.getVoices() || []
      let chosenVoice = null
      let spokenLang = 'en-US'
      let spokenText = text

      const nativeMatch = voices.find((v) =>
        v.lang.toLowerCase().startsWith(langCode.toLowerCase())
      )

      if (nativeMatch) {
        chosenVoice = nativeMatch
        spokenLang = nativeMatch.lang
        spokenText = text
      } else {
        const indianMatch = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().includes('hi')
        )
        const defaultVoice = voices.find((v) => v.default) || voices[0]
        chosenVoice = indianMatch || defaultVoice || null
        spokenLang = chosenVoice ? chosenVoice.lang : 'en-US'
        spokenText = phoneticFallback || text
      }

      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.volume = 1.0
      utterance.pitch = 1.25 // Cute robotic / child-friendly pitch
      utterance.rate = 0.96  // Clear, crisp robotic delivery
      utterance.lang = spokenLang
      if (chosenVoice) {
        utterance.voice = chosenVoice
      }

      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        this.isSpeaking = false
        this.currentUtterance = null
        if (onEnd) onEnd()
      }

      utterance.onstart = () => {
        this.isSpeaking = true
        if (onStart) onStart()
      }

      utterance.onend = finish
      utterance.onerror = finish

      // Keep utterance in service reference to prevent Chromium GC cancellation bug
      this.currentUtterance = utterance

      // Safety timeout: ensure onEnd is always called even if browser TTS drops onend
      const approxDurationMs = Math.max(2000, (spokenText.length / 8) * 1000)
      setTimeout(() => {
        if (!finished && this.isSpeaking) {
          finish()
        }
      }, approxDurationMs + 800)

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('Robo speech synthesis error:', err)
      this.isSpeaking = false
      this.currentUtterance = null
      if (onEnd) onEnd()
    }
  }

  // Announces what card is wanted clearly to the child
  announceTargetLetter(letterItem, langCode = 'en', callbacks = {}) {
    let text = ''
    let phonetic = ''

    if (langCode === 'ml') {
      text = `അക്ഷരം '${letterItem.letter}' ഉള്ള കാർഡ് കണ്ടെത്തൂ! ${letterItem.word}!`
      phonetic = `Aksharam ${letterItem.phonetic || letterItem.letter} ulla card kandethoo! ${letterItem.word}!`
    } else if (langCode === 'hi') {
      text = `अक्षर '${letterItem.letter}' वाला कार्ड ढूंढिए! ${letterItem.letter} से ${letterItem.word}!`
      phonetic = `Akshar ${letterItem.phonetic || letterItem.letter} waala card dhoondhiye! ${letterItem.word}!`
    } else {
      text = `Find the card for letter ${letterItem.letter}! ${letterItem.letter} for ${letterItem.word}!`
      phonetic = text
    }

    this.speakRoboText(text, langCode, phonetic, callbacks)
  }

  // Helper alias to tell what card is wanted
  tellWhatCardWanted(letterItem, langCode = 'en', callbacks = {}) {
    this.announceTargetLetter(letterItem, langCode, callbacks)
  }

  // Celebrates when child selects the correct alphabet card
  celebrateCorrect(letterItem, langCode = 'en', callbacks = {}) {
    this.playCorrectSound()

    let text = ''
    let phonetic = ''

    if (langCode === 'ml') {
      text = `വളരെ ശരിയാണ്! അക്ഷരം '${letterItem.letter}'! ${letterItem.word}!`
      phonetic = `Valare shariyaanu! Aksharam ${letterItem.phonetic || letterItem.letter}! ${letterItem.word}!`
    } else if (langCode === 'hi') {
      text = `शाबाश! बिल्कुल सही! अक्षर '${letterItem.letter}'! ${letterItem.word}!`
      phonetic = `Shabaash! Bilkul sahi card! Akshar ${letterItem.phonetic || letterItem.letter}! ${letterItem.word}!`
    } else {
      text = `Awesome! Correct card! Letter ${letterItem.letter} for ${letterItem.word}!`
      phonetic = text
    }

    this.speakRoboText(text, langCode, phonetic, callbacks)
  }

  // Celebrates when the child wins the game
  celebrateGameWin(langCode = 'en', callbacks = {}) {
    this.playVictoryFanfare()

    let text = ''
    let phonetic = ''

    if (langCode === 'ml') {
      text = `വിജയം! നിങ്ങൾ ആൽഫബെറ്റ് ഗെയിം വിജയിച്ചിരിക്കുന്നു! അഭിനന്ദനങ്ങൾ!`
      phonetic = `Victory! You won the Alphabet Game! Congratulations!`
    } else if (langCode === 'hi') {
      text = `जीत गए! आपने वर्णमाला खेल जीत लिया! बहुत-बहुत बधाई!`
      phonetic = `Victory! Aapne game jeet liya! Bahut bahut badhaai!`
    } else {
      text = `Hurray! You won the Alphabet Card Game! Congratulations!`
      phonetic = text
    }

    this.speakRoboText(text, langCode, phonetic, callbacks)
  }
}

export const roboAudio = new RoboAudioService()
