import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplet, Sparkles, Sun, Heart, Flame } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import confetti from 'canvas-confetti'

export function SpeechGarden() {
  const { t } = useTranslation()
  const { waterDrops, gardenState, streak, waterPlant, setScreen } = useAppStore()
  const [wateringId, setWateringId] = useState(null)

  const flowers = gardenState?.flowers || []
  const gardenLevel = gardenState?.level || 1

  const handleWater = (flowerId) => {
    if (waterDrops <= 0) return

    setWateringId(flowerId)
    const success = waterPlant(flowerId)

    if (success) {
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4ECDC4', '#FFD166', '#FF8484'],
        })
      } catch (e) {}
    }

    setTimeout(() => {
      setWateringId(null)
    }, 800)
  }

  const flowerStageIcons = {
    1: '🌱',
    2: '🌿',
    3: '🌸',
    4: '🌺✨',
  }

  const flowerStageNames = {
    1: 'Sprout',
    2: 'Budding',
    3: 'Blooming',
    4: 'Golden Blossom',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 border border-pink-300 text-pink-800 font-bold text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>{t('garden.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka m-0">
          Grow Your Speech Flowers
        </h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
          {t('garden.subtitle')}
        </p>
      </div>

      {/* Garden Stats Top Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6">
        <div className="flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-2xl border-2 border-sky-300 text-sky-900 font-bold text-sm shadow-xs">
          <Droplet className="w-5 h-5 text-sky-500 fill-sky-400 animate-bounce" />
          <span>{waterDrops} Water Drops</span>
        </div>

        <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-2xl border-2 border-pink-300 text-pink-900 font-bold text-sm shadow-xs">
          <Heart className="w-5 h-5 text-pink-500 fill-pink-400" />
          <span>{flowers.filter((f) => f.stage >= 3).length} Blooming Flowers</span>
        </div>

        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-2xl border-2 border-amber-300 text-amber-900 font-bold text-sm shadow-xs">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span>{streak?.days || 1} Days Streak</span>
        </div>
      </div>

      {/* Garden Ground Plot */}
      <div className="relative bg-gradient-to-b from-sky-200 via-amber-50 to-emerald-200 rounded-3xl p-6 sm:p-8 border-4 border-emerald-400 shadow-xl overflow-hidden min-h-[380px] flex flex-col justify-between">
        {/* Sunny Sky & Butterflies */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1 text-4xl animate-pulse">
            <Sun className="w-10 h-10 text-amber-400 fill-amber-300" />
          </div>
          <div className="flex gap-4 text-2xl select-none">
            <span className="animate-gentle-bounce">🦋</span>
            <span className="animate-float">🐝</span>
            <span className="animate-gentle-bounce">🌈</span>
          </div>
        </div>

        {/* Flower Beds */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 my-6 z-10">
          {flowers.map((flower) => {
            const isBeingWatered = wateringId === flower.id
            const stage = flower.stage || 1
            const icon = flowerStageIcons[stage] || '🌸'
            const name = flowerStageNames[stage] || 'Sprout'

            return (
              <div
                key={flower.id}
                className="flex flex-col items-center bg-white/90 backdrop-blur-xs rounded-3xl p-4 border-3 border-emerald-300 shadow-md transition-transform hover:scale-103"
              >
                {/* Flower Emoji Graphic */}
                <div
                  className={`text-5xl sm:text-6xl my-2 cursor-pointer transition-transform ${
                    isBeingWatered ? 'scale-125 rotate-6' : 'animate-gentle-bounce'
                  }`}
                  onClick={() => handleWater(flower.id)}
                >
                  {icon}
                </div>

                <h4 className="text-sm font-extrabold text-slate-800 m-0">
                  {flower.type ? flower.type.toUpperCase() : 'FLOWER'}
                </h4>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                  {name} (Level {stage})
                </span>

                {/* Progress bar to next bloom */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3 mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((flower.waterCount || 0) % 3) * 35 + 25)}%` }}
                  />
                </div>

                {/* Water Button */}
                <button
                  onClick={() => handleWater(flower.id)}
                  disabled={waterDrops <= 0}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    waterDrops > 0
                      ? 'bg-sky-500 hover:bg-sky-600 text-white active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5 fill-white" />
                  <span>Water Plant</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Garden Bottom Tip */}
        <div className="pt-3 border-t-2 border-emerald-300/60 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-emerald-950 z-10">
          <div>
            💡 Each speech practice session awards +1 Water Drop to nurture your flowers!
          </div>
          <button
            onClick={() => setScreen('sound-select')}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold cursor-pointer shadow-xs"
          >
            Practice More Sounds &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
