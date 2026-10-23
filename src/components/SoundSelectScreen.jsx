import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Volume2,
  Sparkles,
  Map,
  Grid,
  ArrowRight,
  CheckCircle2,
  Smile,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { QuestMap } from './QuestMap'

export function SoundSelectScreen({ whisperHook }) {
  const { t } = useTranslation()
  const {
    soundPack,
    currentLanguage,
    completedSounds,
    setSelectedSound,
    setScreen,
  } = useAppStore()

  const [activeView, setActiveView] = useState('grid') // 'grid' | 'quest'
  const sounds = soundPack?.sounds || []

  const handlePlayWord = (e, word) => {
    e.stopPropagation()
    if (whisperHook?.playSampleAudio) {
      whisperHook.playSampleAudio(word.text, currentLanguage)
    }
  }

  const handleSelectSound = (sound, wordIdx = 0) => {
    setSelectedSound(sound.id, wordIdx)
    setScreen('practice')
  }

  if (activeView === 'quest') {
    return (
      <div>
        <div className="max-w-4xl mx-auto px-4 pt-4 flex justify-end">
          <button
            onClick={() => setActiveView('grid')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            <Grid className="w-4 h-4 text-emerald-600" />
            <span>{t('soundSelect.gridView')}</span>
          </button>
        </div>
        <QuestMap />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{soundPack?.name || 'Speech Adventure'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka m-0">
            {t('soundSelect.title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            {t('soundSelect.subtitle')}
          </p>
        </div>

        {/* Quest Map Switcher */}
        <button
          onClick={() => setActiveView('quest')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Map className="w-4 h-4" />
          <span>{t('soundSelect.questView')}</span>
        </button>
      </div>

      {/* Sounds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sounds.map((sound, sIdx) => {
          const isCompleted = completedSounds.includes(sound.id)

          return (
            <div
              key={sound.id}
              className={`bg-white rounded-3xl p-5 border-4 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl ${
                isCompleted
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-amber-200 hover:border-amber-400'
              }`}
            >
              <div>
                {/* Sound Symbol Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-300 to-orange-400 flex items-center justify-center text-slate-900 font-black text-3xl shadow-sm border-2 border-white">
                    {sound.symbol}
                  </div>

                  <div className="text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        Sound {sIdx + 1}
                      </span>
                    )}
                    <span className="block text-xs font-semibold text-slate-500 mt-1">
                      {sound.translit}
                    </span>
                  </div>
                </div>

                {/* Lip Tip Hint */}
                <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 mb-4 line-clamp-2">
                  💡 {sound.tip || 'Shape your lips gently as shown in the mirror!'}
                </p>

                {/* Minimal Pairs Info */}
                {sound.minimalPairs && sound.minimalPairs.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 font-semibold">
                    <span>{t('soundSelect.minimalPairs')}</span>
                    {sound.minimalPairs.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Words List */}
                <div className="space-y-2 mb-4">
                  {sound.words?.map((word, wIdx) => (
                    <div
                      key={word.text}
                      onClick={() => handleSelectSound(sound, wIdx)}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-100/60 border border-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{word.icon || '🌟'}</span>
                        <div className="text-left">
                          <span className="text-sm font-extrabold text-slate-900 block group-hover:text-amber-900">
                            {word.text}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {word.translit} ({word.meaning})
                          </span>
                        </div>
                      </div>

                      {/* Play audio button */}
                      <button
                        onClick={(e) => handlePlayWord(e, word)}
                        title="Listen to sample audio"
                        className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 cursor-pointer transition-transform active:scale-90"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Practice for this Sound */}
              <button
                onClick={() => handleSelectSound(sound, 0)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <span>{t('soundSelect.practiceWord')} {sound.symbol}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
