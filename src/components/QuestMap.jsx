import React from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Lock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function QuestMap() {
  const { t } = useTranslation()
  const {
    soundPack,
    currentLanguage,
    unlockedAreas,
    completedSounds,
    setSelectedSound,
    setScreen,
  } = useAppStore()

  const sounds = soundPack?.sounds || []

  const handleSelectQuestArea = (sound) => {
    setSelectedSound(sound.id, 0)
    setScreen('practice')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('quest.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka m-0">
          Explore Speech Island Havens
        </h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
          {t('quest.subtitle')}
        </p>
      </div>

      {/* Quest Map Canvas Grid */}
      <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100 rounded-3xl p-6 sm:p-8 border-4 border-teal-300 shadow-xl overflow-hidden min-h-[440px] flex flex-col justify-between">
        {/* Decorative background clouds / waves */}
        <div className="absolute top-4 left-6 text-4xl opacity-30 select-none">☁️</div>
        <div className="absolute top-12 right-12 text-3xl opacity-30 select-none">☁️</div>
        <div className="absolute bottom-6 left-12 text-3xl opacity-30 select-none">⛵</div>
        <div className="absolute bottom-4 right-8 text-4xl opacity-30 select-none">🌴</div>

        {/* Quest Areas Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {sounds.map((sound, index) => {
            const quest = sound.quest || {
              area: sound.id,
              name: `${sound.symbol} Haven`,
              themeColor: '#10B981',
              icon: '🏝️',
              unlockAfter: index * 2,
            }

            const isCompleted = completedSounds.includes(sound.id)
            const isUnlocked =
              unlockedAreas.includes(quest.area) ||
              completedSounds.length >= (quest.unlockAfter || 0) ||
              index === 0

            return (
              <div
                key={sound.id}
                className={`flex flex-col rounded-3xl p-5 border-4 transition-all duration-300 relative shadow-md ${
                  isUnlocked
                    ? 'bg-white hover:shadow-xl hover:-translate-y-1'
                    : 'bg-slate-100/90 border-slate-300 opacity-80'
                }`}
                style={{
                  borderColor: isUnlocked ? quest.themeColor || '#10B981' : '#CBD5E1',
                }}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{quest.icon || '🏝️'}</span>
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('quest.completed')}</span>
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Open Quest
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" />
                      <span>{t('quest.locked')}</span>
                    </span>
                  )}
                </div>

                {/* Sound Symbol & Area Name */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900 font-fredoka">
                    {sound.symbol}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    ({sound.translit})
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 m-0 leading-snug">
                  {quest.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1 mb-4 flex-1">
                  {sound.words?.map((w) => w.text).join(' • ')}
                </p>

                {/* Action Button */}
                {isUnlocked ? (
                  <button
                    onClick={() => handleSelectQuestArea(sound)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-sm text-white shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                    style={{ backgroundColor: quest.themeColor || '#10B981' }}
                  >
                    <span>{t('quest.unlocked')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-2xl bg-slate-200 text-slate-500 font-semibold text-xs text-center">
                    {t('quest.unlockAt', { count: quest.unlockAfter })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 pt-4 border-t-2 border-teal-200/60 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-teal-900 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span>Master all sounds to discover the Secret Golden Island!</span>
          </div>
          <button
            onClick={() => setScreen('sound-select')}
            className="text-teal-700 hover:text-teal-950 underline cursor-pointer"
          >
            Switch to Card Grid &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
