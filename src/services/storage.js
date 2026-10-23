/**
 * Storage Service for VocaSight Kids
 * Manages per-language local progress, streaks, badges, quest map, garden, and attempt history.
 * PRIVACY GUARANTEE: Audio and video are strictly never persisted in LocalStorage or uploaded anywhere.
 */

const STORAGE_PREFIX = 'vocasight_'

function getKey(key, lang = 'ml') {
  return `${STORAGE_PREFIX}${lang}_${key}`
}

export const StorageService = {
  // Load state for language
  getLanguageData(lang = 'ml') {
    try {
      const history = JSON.parse(localStorage.getItem(getKey('history', lang)) || '[]')
      const stars = Number(localStorage.getItem(getKey('stars', lang)) || '0')
      const streak = JSON.parse(localStorage.getItem(getKey('streak', lang)) || '{"days":1,"lastDate":""}')
      const waterDrops = Number(localStorage.getItem(getKey('water_drops', lang)) || '5')
      const gardenState = JSON.parse(
        localStorage.getItem(getKey('garden', lang)) ||
          '{"flowers":[{"id":1,"type":"lotus","stage":3,"waterCount":6}],"level":1}'
      )
      const unlockedAreas = JSON.parse(
        localStorage.getItem(getKey('unlocked_quests', lang)) || '["rain-forest","emerald-forest","whispering-woods","rain-forest-ta","crystal-springs","whispering-hills"]'
      )
      const completedSounds = JSON.parse(localStorage.getItem(getKey('completed_sounds', lang)) || '[]')
      const badges = JSON.parse(localStorage.getItem(getKey('badges', lang)) || '["first_step"]')

      return {
        history,
        stars,
        streak,
        waterDrops,
        gardenState,
        unlockedAreas,
        completedSounds,
        badges,
      }
    } catch (e) {
      console.error('Failed to load language data:', e)
      return {
        history: [],
        stars: 0,
        streak: { days: 1, lastDate: '' },
        waterDrops: 5,
        gardenState: { flowers: [], level: 1 },
        unlockedAreas: [],
        completedSounds: [],
        badges: [],
      }
    }
  },

  // Save attempt record
  saveAttempt(lang, attempt) {
    try {
      const historyKey = getKey('history', lang)
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]')

      const record = {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        soundId: attempt.soundId,
        soundSymbol: attempt.soundSymbol,
        targetWord: attempt.targetWord,
        transcript: attempt.transcript,
        similarity: attempt.similarity,
        isSuccess: attempt.isSuccess,
        substitution: attempt.substitution || null,
        disfluencyFlags: attempt.disfluencyFlags || null,
        track: attempt.track || 'normal',
        starsAwarded: attempt.starsAwarded || 1,
      }

      existing.push(record)
      localStorage.setItem(historyKey, JSON.stringify(existing.slice(-200))) // keep up to 200 recent records

      // Update stars
      const starsKey = getKey('stars', lang)
      const currentStars = Number(localStorage.getItem(starsKey) || '0')
      localStorage.setItem(starsKey, String(currentStars + (attempt.starsAwarded || 1)))

      // Update water drops (1 drop per practice attempt)
      const waterKey = getKey('water_drops', lang)
      const currentWater = Number(localStorage.getItem(waterKey) || '5')
      localStorage.setItem(waterKey, String(currentWater + 1))

      // Update completed sounds list if success
      if (attempt.isSuccess) {
        const completedKey = getKey('completed_sounds', lang)
        const completed = new Set(JSON.parse(localStorage.getItem(completedKey) || '[]'))
        completed.add(attempt.soundId)
        localStorage.setItem(completedKey, JSON.stringify(Array.from(completed)))
      }

      // Update streaks
      this.updateStreak(lang)

      return record
    } catch (e) {
      console.error('Error saving attempt:', e)
      return null
    }
  },

  // Update streak counter
  updateStreak(lang) {
    try {
      const streakKey = getKey('streak', lang)
      const streakData = JSON.parse(localStorage.getItem(streakKey) || '{"days":1,"lastDate":""}')
      const today = new Date().toISOString().slice(0, 10)

      if (streakData.lastDate === today) {
        // Already practiced today
        return streakData
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (streakData.lastDate === yesterday) {
        streakData.days += 1
      } else if (!streakData.lastDate) {
        streakData.days = 1
      } else {
        streakData.days = 1 // reset after missing a day
      }
      streakData.lastDate = today
      localStorage.setItem(streakKey, JSON.stringify(streakData))
      return streakData
    } catch (e) {
      return { days: 1, lastDate: '' }
    }
  },

  // Garden updates
  saveGarden(lang, gardenState, waterDrops) {
    try {
      localStorage.setItem(getKey('garden', lang), JSON.stringify(gardenState))
      localStorage.setItem(getKey('water_drops', lang), String(waterDrops))
    } catch (e) {
      console.error('Error updating garden:', e)
    }
  },

  // Quest unlock updates
  unlockQuestArea(lang, areaId) {
    try {
      const key = getKey('unlocked_quests', lang)
      const existing = new Set(JSON.parse(localStorage.getItem(key) || '[]'))
      existing.add(areaId)
      localStorage.setItem(key, JSON.stringify(Array.from(existing)))
    } catch (e) {
      console.error('Error unlocking quest:', e)
    }
  },

  // Delete all data
  clearAllData() {
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith('vocasight_'))) {
          keysToRemove.push(key)
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k)
      }
      return true
    } catch (e) {
      console.error('Error clearing data:', e)
      return false
    }
  },
}
