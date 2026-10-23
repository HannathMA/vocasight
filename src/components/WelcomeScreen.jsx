import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  ShieldCheck,
  Languages,
  ArrowRight,
  Lock,
  HeartHandshake,
  Check,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { SpeechBuddy } from './SpeechBuddy'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const {
    currentLanguage,
    setLanguage,
    supportedLanguages,
    hasParentConsent,
    setParentConsent,
    setScreen,
  } = useAppStore()

  const [showConsentModal, setShowConsentModal] = useState(false)
  const [agreedConsent, setAgreedConsent] = useState(hasParentConsent)

  const handleStartClicked = () => {
    if (hasParentConsent) {
      setScreen('sound-select')
    } else {
      setShowConsentModal(true)
    }
  }

  const handleConsentConfirm = () => {
    if (agreedConsent) {
      setParentConsent(true)
      setShowConsentModal(false)
      setScreen('sound-select')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Card */}
      <div className="relative bg-gradient-to-b from-amber-100 via-orange-50 to-teal-50 rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-xl overflow-hidden text-center">
        {/* Floating background playful bubbles */}
        <div className="absolute top-4 left-6 text-3xl opacity-40 select-none animate-float">🎈</div>
        <div className="absolute top-8 right-8 text-3xl opacity-40 select-none animate-gentle-bounce">⭐</div>
        <div className="absolute bottom-6 left-12 text-3xl opacity-40 select-none animate-float">🦜</div>
        <div className="absolute bottom-6 right-12 text-3xl opacity-40 select-none animate-gentle-bounce">🌈</div>

        {/* Mascot Face Icon */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 bg-gradient-to-tr from-teal-400 via-emerald-300 to-amber-300 rounded-3xl p-3 shadow-lg border-4 border-white animate-gentle-bounce">
          <img src="/favicon.svg" alt="VocaSight Mascot" className="w-full h-full object-contain" />
        </div>

        {/* Hero Title & Subtitle */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-fredoka mb-2">
          {t('welcome.heroTitle')}
        </h2>
        <p className="text-base sm:text-lg text-slate-700 max-w-xl mx-auto font-medium mb-6">
          {t('welcome.heroSubtitle')}
        </p>

        {/* Language Selection Buttons */}
        <div className="max-w-md mx-auto mb-6 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border-2 border-amber-200">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span>{t('welcome.selectLanguage')}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentLanguage === l.code
                    ? 'bg-amber-400 text-amber-950 font-black shadow-sm scale-105 border-2 border-amber-500'
                    : 'bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="text-base sm:text-lg">{l.flag}</div>
                <div className="truncate">{l.nativeName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Big Start Practice CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={handleStartClicked}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-3 border-teal-300"
          >
            <span>{t('welcome.startBtn')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setScreen('parent')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base shadow-sm border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>{t('welcome.parentZoneBtn')}</span>
          </button>
        </div>

        {/* AI Buddy Scripted Greeting */}
        <div className="max-w-xl mx-auto my-4 text-left">
          <SpeechBuddy mode="encourage" showDailyQuest={false} />
        </div>

        {/* Privacy Note Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-slate-600 bg-white/70 py-2 px-4 rounded-2xl max-w-lg mx-auto border border-amber-200">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-800">{t('welcome.privacyBadge')}:</span>
          <span>{t('welcome.privacyDetails')}</span>
        </div>

        {/* Medical & Diagnostic Tool Disclaimer */}
        <div className="mt-4 text-[11px] font-semibold text-amber-900 bg-amber-200/60 py-1.5 px-4 rounded-xl max-w-lg mx-auto border border-amber-300">
          ⚠️ {t('welcome.medicalNote')}
        </div>
      </div>

      {/* Parental Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl animate-gentle-bounce">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-600">
              <HeartHandshake className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2 font-fredoka">
              {t('welcome.parentalConsentModal')}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 text-center mb-4 leading-relaxed">
              {t('welcome.parentalConsentDesc')}
            </p>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={agreedConsent}
                onChange={(e) => setAgreedConsent(e.target.checked)}
                className="w-5 h-5 rounded-md text-teal-600 mt-0.5 cursor-pointer accent-teal-600"
              />
              <span className="text-xs font-bold text-slate-800 leading-snug">
                {t('welcome.consentCheckbox')}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowConsentModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConsentConfirm}
                disabled={!agreedConsent}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  agreedConsent
                    ? 'bg-teal-500 hover:bg-teal-600 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{t('welcome.continueBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
