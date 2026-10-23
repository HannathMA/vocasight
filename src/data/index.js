import soundsMl from './sounds.ml.json'
import soundsHi from './sounds.hi.json'
import soundsEn from './sounds.en.json'
import soundsTa from './sounds.ta.json'
import soundsTe from './sounds.te.json'
import soundsKn from './sounds.kn.json'

export const languagePacks = {
  ml: soundsMl,
  hi: soundsHi,
  en: soundsEn,
  ta: soundsTa,
  te: soundsTe,
  kn: soundsKn,
}

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', scriptCode: 'en' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🌴', scriptCode: 'ml' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🪷', scriptCode: 'hi' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🛕', scriptCode: 'ta' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🌾', scriptCode: 'te' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '⛰️', scriptCode: 'kn' },
]

export function getSoundPack(langCode = 'en') {
  return languagePacks[langCode] || languagePacks.en
}

export function getAllSounds(langCode = 'en') {
  const pack = getSoundPack(langCode)
  return pack.sounds || []
}

export function getSoundById(soundId, langCode = 'en') {
  const pack = getSoundPack(langCode)
  return pack.sounds.find((s) => s.id === soundId) || pack.sounds[0]
}
