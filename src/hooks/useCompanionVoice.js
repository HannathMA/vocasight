import { useState, useEffect, useCallback, useRef } from 'react'
import { companionVoice, COMPANION_PROMPTS, getWordPrompt } from '../services/companionVoice'
import { useAppStore } from '../store/useAppStore'

export function useCompanionVoice() {
  const { currentScreen, currentLanguage, settings } = useAppStore()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const lastSpokenScreenRef = useRef(null)

  // Subscribe to companion voice speaking updates
  useEffect(() => {
    const unsubscribe = companionVoice.subscribe((speaking) => {
      setIsSpeaking(speaking)
    })
    return () => {
      unsubscribe()
      companionVoice.stop()
    }
  }, [])

  // Prompt text for the current screen in the current language
  const currentPrompts = COMPANION_PROMPTS[currentScreen] || COMPANION_PROMPTS.welcome
  const currentPromptText = currentPrompts[currentLanguage] || currentPrompts.en

  // Speak the prompt for a specific screen or current screen
  const speakCurrentScreen = useCallback(
    (screen = currentScreen, lang = currentLanguage) => {
      if (settings.voiceSamples === false) return
      companionVoice.speakScreen(screen, lang)
    },
    [currentScreen, currentLanguage, settings.voiceSamples]
  )

  // Speak target word clearly as tutor
  const speakWord = useCallback(
    (wordText, lang = currentLanguage, translit = null) => {
      if (settings.voiceSamples === false) return
      return companionVoice.speakWord(wordText, lang, translit)
    },
    [currentLanguage, settings.voiceSamples]
  )

  // Speak custom text
  const speakText = useCallback(
    (text, lang = currentLanguage) => {
      if (settings.voiceSamples === false) return
      companionVoice.speak(text, lang)
    },
    [currentLanguage, settings.voiceSamples]
  )

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    companionVoice.stop()
  }, [])

  // Auto-speak on screen transition if voice samples enabled
  useEffect(() => {
    if (settings.voiceSamples === false) return
    if (lastSpokenScreenRef.current === currentScreen) return

    lastSpokenScreenRef.current = currentScreen

    // Practice screen handles speaking the active target word directly
    if (currentScreen === 'practice') return

    // Gentle 350ms delay for screen transition to settle
    const timer = setTimeout(() => {
      speakCurrentScreen(currentScreen, currentLanguage)
    }, 350)

    return () => clearTimeout(timer)
  }, [currentScreen, currentLanguage, settings.voiceSamples, speakCurrentScreen])

  return {
    isSpeaking,
    currentPromptText,
    speakCurrentScreen,
    speakWord,
    speakText,
    stopSpeaking,
  }
}
