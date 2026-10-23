import { create } from 'zustand'
import { StorageService } from '../services/storage'
import { getSoundPack, supportedLanguages } from '../data'
import i18n from '../i18n'

export const useAppStore = create((set, get) => {
  const initialLang = localStorage.getItem('vocasight_language') || 'ml'
  const langData = StorageService.getLanguageData(initialLang)
  const soundPack = getSoundPack(initialLang)

  const savedSettings = JSON.parse(
    localStorage.getItem('vocasight_settings') ||
      '{"highContrast":false,"soundEffects":true,"pacing":"normal","whisperModelId":"onnx-community/whisper-tiny"}'
  )

  const hasParentConsent = localStorage.getItem('vocasight_parent_consent') === 'true'

  return {
    // Navigation & Screen: 'welcome' | 'sound-select' | 'permission' | 'practice' | 'result' | 'parent' | 'settings' | 'garden' | 'quest'
    currentScreen: 'welcome',
    setScreen: (screen) => set({ currentScreen: screen }),

    // Language & Pack
    currentLanguage: initialLang,
    supportedLanguages,
    soundPack,
    setLanguage: (langCode) => {
      localStorage.setItem('vocasight_language', langCode)
      i18n.changeLanguage(langCode)
      const newPack = getSoundPack(langCode)
      const newLangData = StorageService.getLanguageData(langCode)
      set({
        currentLanguage: langCode,
        soundPack: newPack,
        selectedSoundId: newPack.sounds[0]?.id || '',
        selectedWordIndex: 0,
        ...newLangData,
      })
    },

    // Parental Consent
    hasParentConsent,
    setParentConsent: (granted) => {
      localStorage.setItem('vocasight_parent_consent', granted ? 'true' : 'false')
      set({ hasParentConsent: granted })
    },

    // Sound Selection & Word Ladder
    selectedSoundId: soundPack.sounds[0]?.id || 'zha',
    selectedWordIndex: 0,
    setSelectedSound: (soundId, wordIndex = 0) => set({ selectedSoundId: soundId, selectedWordIndex: wordIndex }),
    setSelectedWordIndex: (idx) => set({ selectedWordIndex: idx }),

    // Practice Track: 'normal' | 'articulation' | 'fluency'
    currentTrack: 'normal',
    setCurrentTrack: (track) => set({ currentTrack: track }),

    // Articulation / Fluency Ladder: 'isolated' | 'syllable' | 'word' | 'phrase' | 'sentence'
    ladderStep: 'word',
    setLadderStep: (step) => set({ ladderStep: step }),

    // Settings
    settings: savedSettings,
    updateSettings: (newSettings) => {
      const merged = { ...get().settings, ...newSettings }
      localStorage.setItem('vocasight_settings', JSON.stringify(merged))
      if (merged.highContrast) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      set({ settings: merged })
    },

    // Progress State (per language)
    history: langData.history,
    stars: langData.stars,
    streak: langData.streak,
    waterDrops: langData.waterDrops,
    gardenState: langData.gardenState,
    unlockedAreas: langData.unlockedAreas,
    completedSounds: langData.completedSounds,
    badges: langData.badges,

    // Last Practice Result
    lastResult: null,
    setLastResult: (result) => set({ lastResult: result }),

    // Actions
    recordAttempt: (attempt) => {
      const lang = get().currentLanguage
      const savedRecord = StorageService.saveAttempt(lang, attempt)
      const refreshed = StorageService.getLanguageData(lang)
      set({
        lastResult: attempt,
        history: refreshed.history,
        stars: refreshed.stars,
        streak: refreshed.streak,
        waterDrops: refreshed.waterDrops,
        completedSounds: refreshed.completedSounds,
      })
      return savedRecord
    },

    waterPlant: (flowerId) => {
      const lang = get().currentLanguage
      const { gardenState, waterDrops } = get()
      if (waterDrops <= 0) return false

      const updatedFlowers = gardenState.flowers.map((f) => {
        if (f.id === flowerId) {
          const nextCount = (f.waterCount || 0) + 1
          const nextStage = Math.min(4, Math.floor(nextCount / 3) + 1)
          return { ...f, waterCount: nextCount, stage: nextStage }
        }
        return f
      })

      // Check if we should plant a new flower
      if (updatedFlowers.every((f) => f.stage >= 3) && updatedFlowers.length < 5) {
        updatedFlowers.push({
          id: Date.now(),
          type: ['rose', 'tulip', 'sunflower', 'lotus'][updatedFlowers.length % 4],
          stage: 1,
          waterCount: 1,
        })
      }

      const newGarden = { ...gardenState, flowers: updatedFlowers }
      const newWater = waterDrops - 1
      StorageService.saveGarden(lang, newGarden, newWater)
      set({ gardenState: newGarden, waterDrops: newWater })
      return true
    },

    unlockArea: (areaId) => {
      const lang = get().currentLanguage
      StorageService.unlockQuestArea(lang, areaId)
      const refreshed = StorageService.getLanguageData(lang)
      set({ unlockedAreas: refreshed.unlockedAreas })
    },

    clearAllData: () => {
      StorageService.clearAllData()
      const lang = get().currentLanguage
      const emptyData = StorageService.getLanguageData(lang)
      set({
        ...emptyData,
        lastResult: null,
      })
    },
  }
})
