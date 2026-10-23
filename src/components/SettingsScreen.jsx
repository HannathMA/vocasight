import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Languages,
  Eye,
  Sliders,
  Cpu,
  Volume2,
  Sparkles,
  Check,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function SettingsScreen({ whisperHook }) {
  const { t } = useTranslation()
  const {
    currentLanguage,
    setLanguage,
    supportedLanguages,
    settings,
    updateSettings,
  } = useAppStore()

  const handleModelChange = (modelId) => {
    updateSettings({ whisperModelId: modelId })
    if (whisperHook?.changeModel) {
      whisperHook.changeModel(modelId)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs mb-2">
          <Settings className="w-4 h-4 text-amber-600" />
          <span>{t('settings.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka m-0">
          Preferences & Accessibility
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Language Preference */}
        <div className="bg-white p-5 rounded-3xl border-3 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                {t('settings.language')}
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Select your preferred regional language pack
              </p>
            </div>
          </div>

          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-50 border-2 border-slate-300 font-bold text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-teal-500"
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* 2. High Contrast Mode */}
        <div className="bg-white p-5 rounded-3xl border-3 border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                {t('settings.contrast')}
              </h3>
              <p className="text-xs text-slate-500 m-0">
                {t('settings.contrastDesc')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.highContrast)}
              onChange={(e) => updateSettings({ highContrast: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </label>
        </div>

        {/* 3. Speech Guidance Pacing */}
        <div className="bg-white p-5 rounded-3xl border-3 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                {t('settings.pacing')}
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Adjust pacing bar rhythm for speech comfort
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateSettings({ pacing: 'normal' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                settings.pacing === 'normal'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('settings.pacingNormal')}
            </button>
            <button
              onClick={() => updateSettings({ pacing: 'slow' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                settings.pacing === 'slow'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('settings.pacingSlow')}
            </button>
          </div>
        </div>

        {/* 4. Whisper On-Device Model Selection */}
        <div className="bg-white p-5 rounded-3xl border-3 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                {t('settings.whisperModel')}
              </h3>
              <p className="text-xs text-slate-500 m-0">
                {t('settings.whisperDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'onnx-community/whisper-tiny', name: 'Whisper Tiny', desc: 'Fastest load, light RAM (Recommended)' },
              { id: 'onnx-community/whisper-base', name: 'Whisper Base', desc: 'Balanced accuracy & speed' },
              { id: 'onnx-community/whisper-small', name: 'Whisper Small', desc: 'Highest accuracy (Requires strong device)' },
            ].map((m) => {
              const isSelected = (settings.whisperModelId || 'onnx-community/whisper-tiny') === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-indigo-300 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{m.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight block">
                    {m.desc}
                  </span>
                </button>
              )
            })}
          </div>

          {whisperHook.isModelLoading && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{whisperHook.loadingStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
