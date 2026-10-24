import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Settings,
  Sparkles,
  Cpu,
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
    setScreen,
  } = useAppStore()

  const handleModelChange = (modelId) => {
    updateSettings({ whisperModelId: modelId })
    if (whisperHook?.changeModel) {
      whisperHook.changeModel(modelId)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header matching Mockup Screen 6 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setScreen('welcome')}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-transform active:scale-95 cursor-pointer border-2 border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka m-0">
          Settings
        </h2>

        <div className="w-10" />
      </div>

      {/* 3-Column Settings Layout matching Mockup Screen 6 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* COLUMN 1: Language */}
        <div className="bg-white rounded-3xl p-5 border-3 border-sky-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 font-fredoka uppercase tracking-wider mb-4">
            Language
          </h3>

          <div className="space-y-3">
            {/* Malayalam */}
            <button
              onClick={() => setLanguage('ml')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                currentLanguage === 'ml'
                  ? 'border-sky-500 bg-sky-50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-sm font-black text-slate-900 block font-fredoka">
                മലയാളം
              </span>
              <span className="text-xs font-bold text-slate-500">
                Malayalam
              </span>
            </button>

            {/* Hindi */}
            <button
              onClick={() => setLanguage('hi')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                currentLanguage === 'hi'
                  ? 'border-sky-500 bg-sky-50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-sm font-black text-slate-900 block font-fredoka">
                हिन्दी
              </span>
              <span className="text-xs font-bold text-slate-500">
                Hindi
              </span>
            </button>

            {/* English */}
            <button
              onClick={() => setLanguage('en')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                currentLanguage === 'en'
                  ? 'border-sky-500 bg-sky-50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <span className="text-sm font-black text-slate-900 block font-fredoka">
                English
              </span>
              <span className="text-xs font-bold text-slate-500">
                English
              </span>
            </button>
          </div>
        </div>

        {/* COLUMN 2: Display & Pacing */}
        <div className="bg-white rounded-3xl p-5 border-3 border-sky-100 shadow-sm flex flex-col gap-6">
          {/* Display */}
          <div>
            <h3 className="text-sm font-black text-slate-800 font-fredoka uppercase tracking-wider mb-4">
              Display
            </h3>

            <div className="space-y-4">
              {/* High Contrast Mode */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  High Contrast Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.highContrast)}
                    onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* Reduce Motion */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Reduce Motion
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.reduceMotion)}
                    onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Pacing Speed Slider */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-800 font-fredoka uppercase tracking-wider mb-3">
              Pacing Speed
            </h3>

            <div className="px-2">
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={settings.pacing === 'slow' ? 0 : settings.pacing === 'fast' ? 2 : 1}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  const pacingMap = ['slow', 'normal', 'fast']
                  updateSettings({ pacing: pacingMap[val] })
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500 mt-1">
                <span>Slow</span>
                <span className="text-sky-600">Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Audio, Camera & Microphone */}
        <div className="bg-white rounded-3xl p-5 border-3 border-sky-100 shadow-sm flex flex-col gap-6">
          {/* Audio */}
          <div>
            <h3 className="text-sm font-black text-slate-800 font-fredoka uppercase tracking-wider mb-4">
              Audio
            </h3>

            <div className="space-y-4">
              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Sound Effects
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects !== false}
                    onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* Voice Samples */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Voice Samples
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.voiceSamples !== false}
                    onChange={(e) => updateSettings({ voiceSamples: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Camera & Microphone */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-800 font-fredoka uppercase tracking-wider mb-4">
              Camera & Microphone
            </h3>

            <div className="space-y-4">
              {/* Enable Camera */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Enable Camera
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (for Magic Mouth Mirror)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableCamera !== false}
                    onChange={(e) => updateSettings({ enableCamera: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* Enable Microphone */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Enable Microphone
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (for Speech Practice)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.enableMic !== false}
                    onChange={(e) => updateSettings({ enableMic: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Whisper Model Configuration Section */}
      <div className="mt-6 bg-white rounded-3xl p-5 border-3 border-sky-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-800 font-fredoka m-0">
            Whisper Speech Recognition Model (On-Device)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: 'onnx-community/whisper-tiny', name: 'Whisper Tiny', desc: 'Fastest load, lightweight' },
            { id: 'onnx-community/whisper-base', name: 'Whisper Base', desc: 'Balanced accuracy & speed' },
            { id: 'onnx-community/whisper-small', name: 'Whisper Small', desc: 'Highest accuracy' },
          ].map((m) => {
            const isSel = (settings.whisperModelId || 'onnx-community/whisper-small') === m.id
            return (
              <button
                key={m.id}
                onClick={() => handleModelChange(m.id)}
                className={`p-3 rounded-2xl text-left border-2 cursor-pointer transition-all ${
                  isSel ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-xs text-slate-900">{m.name}</div>
                <div className="text-[11px] text-slate-500">{m.desc}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
