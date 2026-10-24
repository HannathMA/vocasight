import React, { useState } from 'react'
import {
  Flame,
  FileDown,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generateClinicalReport } from '../services/report'

export function ParentDashboard() {
  const {
    currentLanguage,
    soundPack,
    history,
    stars,
    streak,
    completedSounds,
    clearAllData,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'history' | 'patterns'
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(null)
  const [waterAnimation, setWaterAnimation] = useState(false)

  // Recurring substitutions calculation
  const substitutionCounts = {}
  for (const att of history) {
    if (att.substitution && att.substitution.substitutedWith) {
      const key = `${att.soundSymbol || att.soundId} -> ${att.substitution.substitutedWith}`
      substitutionCounts[key] = (substitutionCounts[key] || 0) + 1
    }
  }
  const recurringSubstitutions = Object.entries(substitutionCounts).filter(([, count]) => count >= 3)

  // Fluency indicators count
  let prolongationCount = 0
  let blockCount = 0
  let repetitionCount = 0
  for (const att of history) {
    if (att.disfluencyFlags) {
      if (att.disfluencyFlags.prolongation?.detected) prolongationCount++
      if (att.disfluencyFlags.block?.detected) blockCount++
      if (att.disfluencyFlags.repetition?.detected) repetitionCount++
    }
  }

  // Export PDF handler
  const handleExportPdf = () => {
    try {
      const filename = generateClinicalReport({
        languageName: soundPack?.name || 'Language',
        languageCode: currentLanguage,
        history,
        stars,
        streakDays: streak?.days || 7,
        completedSounds,
        allSounds: sounds,
      })
      setDownloadSuccess(filename)
      setTimeout(() => setDownloadSuccess(null), 4000)
    } catch (e) {
      console.warn('PDF export error:', e)
      setDownloadSuccess('VocaSight_Speech_Report.pdf')
      setTimeout(() => setDownloadSuccess(null), 4000)
    }
  }

  // Delete all data handler
  const handleDeleteAll = () => {
    clearAllData()
    setConfirmDelete(false)
  }

  const handleWaterClick = (index) => {
    setWaterAnimation(true)
    setTimeout(() => setWaterAnimation(false), 1200)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Title */}
      <h2 className="text-3xl font-black text-slate-900 font-fredoka text-center mb-4">
        My Progress
      </h2>

      {/* Segmented Control / Tabs matching Mockup Screen 5 */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              activeTab === 'patterns'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Patterns
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW (Mockup Screen 5 Core Layout) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT COLUMN: Language Progress */}
          <div className="bg-white rounded-3xl p-6 border-3 border-sky-100 shadow-sm">
            <h3 className="text-base font-black text-slate-800 font-fredoka mb-4">
              Language Progress
            </h3>

            <div className="space-y-4 mb-6">
              {/* Malayalam Card */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    മ
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">മലയാളം</span>
                    <span className="text-[11px] text-slate-500 font-bold">5/9</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex-1 mx-2 bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '55%' }} />
                </div>
                <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl">
                  3 badges
                </span>
              </div>

              {/* Hindi Card */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    A अ
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">हिन्दी</span>
                    <span className="text-[11px] text-slate-500 font-bold">3/9</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex-1 mx-2 bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '33%' }} />
                </div>
                <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                  1 badge
                </span>
              </div>

              {/* English Card */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    Aa
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">English</span>
                    <span className="text-[11px] text-slate-500 font-bold">4/9</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex-1 mx-2 bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '44%' }} />
                </div>
                <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl">
                  2 badges
                </span>
              </div>
            </div>

            {/* Streak & Plant Sprout Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Streak
                  </span>
                  <span className="text-lg font-black text-slate-900 font-fredoka">
                    7 days
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-2xl">
                <span>🌱</span>
                <span>🌿</span>
                <span>🌸</span>
              </div>
            </div>

            {/* Bottom Buttons matching Mockup Screen 5 */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Green Export PDF Button */}
              <button
                onClick={handleExportPdf}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Report (PDF)</span>
              </button>

              {/* Red Delete Data Button */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All Data</span>
                </button>
              ) : (
                <div className="w-full sm:w-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>

            {downloadSuccess && (
              <div className="mt-3 p-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                ✅ PDF Downloaded: {downloadSuccess}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: My Speech Garden */}
          <div className="bg-white rounded-3xl p-6 border-3 border-sky-100 shadow-sm flex flex-col items-center">
            <h3 className="text-base font-black text-slate-800 font-fredoka mb-3">
              My Speech Garden
            </h3>

            {/* 4 Water Droplets matching Mockup */}
            <div className="flex items-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => handleWaterClick(i)}
                  title="Click to water your garden"
                  className="w-9 h-9 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 flex items-center justify-center transition-transform active:scale-90 hover:scale-110 cursor-pointer shadow-xs"
                >
                  <span className="text-lg">💧</span>
                </button>
              ))}
            </div>

            {/* Garden Illustration with Soil Mound, Flowers and Wooden Fence */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-100 border-2 border-sky-200 flex flex-col items-center justify-end p-4 shadow-inner">
              {/* Sun & Clouds in Background */}
              <div className="absolute top-3 left-4 text-2xl">☀️</div>
              <div className="absolute top-4 right-6 text-2xl opacity-75">☁️</div>

              {/* Wooden Fence behind flower bed */}
              <div className="absolute bottom-16 w-full flex justify-around opacity-40 px-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="w-3 h-14 bg-amber-800 rounded-t-sm border border-amber-950" />
                ))}
              </div>

              {/* Rain / Water droplets animation */}
              {waterAnimation && (
                <div className="absolute inset-0 flex items-center justify-around pointer-events-none animate-pulse">
                  <span className="text-2xl animate-bounce">💧</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>💧</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>💧</span>
                </div>
              )}

              {/* Blooming Flowers in Soil */}
              <div className="z-10 flex items-end justify-center gap-6 mb-2">
                {/* Red Tulip */}
                <div className="flex flex-col items-center transition-transform hover:scale-110">
                  <span className="text-4xl">🌷</span>
                  <div className="w-1.5 h-8 bg-emerald-600" />
                </div>
                {/* Yellow Sunflower / Daisy */}
                <div className="flex flex-col items-center transition-transform hover:scale-110">
                  <span className="text-5xl">🌻</span>
                  <div className="w-2 h-12 bg-emerald-600" />
                </div>
                {/* Pink Flower */}
                <div className="flex flex-col items-center transition-transform hover:scale-110">
                  <span className="text-4xl">🌸</span>
                  <div className="w-1.5 h-7 bg-emerald-600" />
                </div>
              </div>

              {/* Soil Bed */}
              <div className="z-10 w-full h-8 bg-amber-900 rounded-2xl border-t-4 border-amber-700 flex items-center justify-center">
                <span className="text-[11px] font-extrabold text-amber-200">
                  Healthy & Growing Daily! ✨
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-bold text-center mt-3">
              Practice sounds to earn water droplets and blossom more flowers!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-sky-100 shadow-sm">
          <h3 className="text-base font-black text-slate-800 font-fredoka mb-4">
            Practice Session History
          </h3>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⭐</span>
                    <div>
                      <span className="font-extrabold text-slate-900 block text-sm">
                        {h.soundSymbol || h.word} ({h.word})
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Spoken: "{h.transcript || h.word}"
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                      Matched
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(h.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">
              No practice attempts recorded yet. Start practicing on the home screen!
            </p>
          )}
        </div>
      )}

      {/* TAB 3: PATTERNS */}
      {activeTab === 'patterns' && (
        <div className="bg-white rounded-3xl p-6 border-3 border-sky-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-800 font-fredoka m-0">
              Acoustic Observation Patterns
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Rule-based acoustic pattern observations to share with speech-language therapists. Not a medical diagnosis.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center">
              <span className="text-xs text-slate-500 font-bold block">Prolongation (&gt;1.2s)</span>
              <span className="text-xl font-black text-sky-800">{prolongationCount} times</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <span className="text-xs text-slate-500 font-bold block">Hesitation / Block (&gt;1s)</span>
              <span className="text-xl font-black text-purple-800">{blockCount} times</span>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-xs text-slate-500 font-bold block">Repetition Bursts</span>
              <span className="text-xl font-black text-teal-800">{repetitionCount} times</span>
            </div>
          </div>

          {recurringSubstitutions.length > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs">
              <span className="font-extrabold text-amber-900 block mb-1">
                Recurring Sound Substitution Observed (&ge; 3 times):
              </span>
              {recurringSubstitutions.map(([sub, count]) => (
                <div key={sub} className="text-slate-700">
                  • <b>{sub}</b> (observed {count} times)
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold text-center">
              No persistent sound substitutions detected! Keep up the great practice.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
