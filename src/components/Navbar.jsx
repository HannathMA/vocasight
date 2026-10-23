import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import {
  Sparkles,
  Map,
  Flower2,
  Users,
  Settings,
  ShieldCheck,
  Languages,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react'

export function Navbar() {
  const { t } = useTranslation()
  const {
    currentScreen,
    setScreen,
    currentLanguage,
    setLanguage,
    supportedLanguages,
    stars,
    streak,
    settings,
    updateSettings,
  } = useAppStore()

  const navItems = [
    { id: 'welcome', label: t('nav.home'), icon: Sparkles },
    { id: 'sound-select', label: t('nav.practice'), icon: Sparkles },
    { id: 'quest', label: t('nav.quest'), icon: Map },
    { id: 'garden', label: t('nav.garden'), icon: Flower2 },
    { id: 'animals', label: t('nav.animals'), icon: Users },
    { id: 'parent', label: t('nav.parent'), icon: ShieldCheck },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-amber-200 px-4 py-2.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <button
          onClick={() => setScreen('welcome')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 p-1.5 shadow-md group-hover:scale-105 transition-transform">
            <img src="/favicon.svg" alt="VocaSight Mascot" className="w-full h-full object-contain" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none m-0 font-fredoka flex items-center gap-1.5">
              <span>VocaSight</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold shadow-xs">
                Kids
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 m-0 hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-2xl border-2 border-amber-200/80 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentScreen === item.id || (item.id === 'sound-select' && currentScreen === 'practice')
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-amber-950 shadow-sm scale-102 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-amber-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Info: Streak, Stars, Language Picker */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div
            title="Daily Practice Streak"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-700 font-bold text-xs shadow-xs"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streak?.days || 1}d</span>
          </div>

          {/* Stars */}
          <div
            title="Earned Gold Stars"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 font-bold text-xs shadow-xs"
          >
            <span className="text-sm">⭐</span>
            <span>{stars || 0}</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
            title={settings.soundEffects ? 'Sound Effects Enabled' : 'Muted'}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            {settings.soundEffects ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold text-xs rounded-xl pl-7 pr-3 py-1.5 cursor-pointer shadow-xs focus:outline-none hover:bg-emerald-100 transition-colors"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
            <Languages className="w-3.5 h-3.5 text-emerald-600 absolute left-2 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  )
}
