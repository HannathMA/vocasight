import React, { useState } from 'react'
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function AnimalChallenge({
  targetWord,
  onPlaySample = null,
  isCompleted = false,
}) {
  const { soundPack } = useAppStore()
  const [activeAnimal, setActiveAnimal] = useState('elephant') // 'elephant' | 'rabbit' | 'parrot'

  const animals = [
    {
      id: 'elephant',
      name: 'Ollie Elephant',
      emoji: '🐘',
      role: 'Word Introducer',
      bubble: `Hello friend! Let's explore the special word "${targetWord?.text || ''}"!`,
      actionLabel: 'Introduce Word',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    {
      id: 'rabbit',
      name: 'Barnaby Bunny',
      emoji: '🐰',
      role: 'Audio Player',
      bubble: `Listen closely to my gentle voice as I say "${targetWord?.text || ''}"!`,
      actionLabel: 'Listen to Barnaby',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'parrot',
      name: 'Pip Parrot',
      emoji: '🦜',
      role: 'Cheer Buddy',
      bubble: isCompleted
        ? `Squawk! Incredible! You pronounced "${targetWord?.text || ''}" like a champion!`
        : `Your turn explorer! Take a gentle breath and say it into the Magic Mirror!`,
      actionLabel: 'Cheer With Pip',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
  ]

  const selectedAnimal = animals.find((a) => a.id === activeAnimal) || animals[0]

  const handleAnimalAction = (animalId) => {
    setActiveAnimal(animalId)
    if (animalId === 'rabbit' && onPlaySample) {
      onPlaySample()
    }
  }

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 border-4 border-amber-200 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-slate-800">
          <span>🐾 Talking Animal Challenge</span>
        </div>
        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          3 Animal Steps
        </span>
      </div>

      {/* 3 Animal Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {animals.map((a) => {
          const isSelected = activeAnimal === a.id
          return (
            <button
              key={a.id}
              onClick={() => handleAnimalAction(a.id)}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-400 bg-amber-50 shadow-sm scale-102 font-extrabold'
                  : 'border-slate-200 hover:border-amber-300 bg-slate-50'
              }`}
            >
              <span className="text-3xl sm:text-4xl animate-gentle-bounce mb-1">
                {a.emoji}
              </span>
              <span className="text-xs font-bold text-slate-800">{a.name}</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {a.role}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Animal Speech Bubble */}
      <div
        className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center gap-3 ${selectedAnimal.bgColor}`}
      >
        <div className="shrink-0 text-4xl sm:text-5xl">{selectedAnimal.emoji}</div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">
            {selectedAnimal.name} says:
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 m-0 leading-snug">
            "{selectedAnimal.bubble}"
          </p>
        </div>

        {selectedAnimal.id === 'rabbit' && onPlaySample && (
          <button
            onClick={onPlaySample}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Play Audio</span>
          </button>
        )}
      </div>
    </div>
  )
}
