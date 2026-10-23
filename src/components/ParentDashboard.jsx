import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  FileDown,
  Trash2,
  Flame,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { generateClinicalReport } from '../services/report'

export function ParentDashboard() {
  const { t } = useTranslation()
  const {
    currentLanguage,
    soundPack,
    history,
    stars,
    streak,
    completedSounds,
    clearAllData,
    setScreen,
  } = useAppStore()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(null)

  const sounds = soundPack?.sounds || []
  const totalAttempts = history.length
  const successfulAttempts = history.filter((h) => h.isSuccess).length
  const successRate = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 100

  // Identify recurring articulation substitutions (count >= 3 for same sound)
  const substitutionCounts = {}
  for (const att of history) {
    if (att.substitution && att.substitution.substitutedWith) {
      const key = `${att.soundSymbol || att.soundId} -> ${att.substitution.substitutedWith}`
      substitutionCounts[key] = (substitutionCounts[key] || 0) + 1
    }
  }
  const recurringSubstitutions = Object.entries(substitutionCounts).filter(([_, count]) => count >= 3)

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
    const filename = generateClinicalReport({
      languageName: soundPack?.name || 'Language',
      languageCode: currentLanguage,
      history,
      stars,
      streakDays: streak?.days || 1,
      completedSounds,
      allSounds: sounds,
    })
    setDownloadSuccess(filename)
    setTimeout(() => setDownloadSuccess(null), 4000)
  }

  // Delete all data handler
  const handleDeleteAll = () => {
    clearAllData()
    setConfirmDelete(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900 font-bold text-xs mb-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>{t('parent.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-fredoka m-0">
          Clinical Progress & Observation Dashboard
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto mt-1">
          {t('parent.subtitle')}
        </p>
      </div>

      {/* Prominent Medical Disclaimer Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-amber-900 mb-0.5">
            Important Clinical Information:
          </span>
          <span>
            {t('parent.patternsDisclaimer')}
          </span>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {t('parent.totalAttempts')}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka">
            {totalAttempts}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {t('parent.successRate')}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-fredoka">
            {successRate}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            {t('parent.activeStreak')}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-orange-500 font-fredoka flex items-center justify-center gap-1">
            <Flame className="w-6 h-6 fill-orange-500" />
            <span>{streak?.days || 1}d</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Stars Earned
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-500 font-fredoka flex items-center justify-center gap-1">
            <Star className="w-6 h-6 fill-yellow-400" />
            <span>{stars}</span>
          </span>
        </div>
      </div>

      {/* Observed Articulation & Fluency Patterns Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-teal-200 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-slate-900 m-0">
            {t('parent.patternsTitle')}
          </h3>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Rule-Based Indicators
          </span>
        </div>

        {/* Articulation Substitutions */}
        <div className="mb-4">
          <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
            1. Articulation Substitutions (Threshold: &ge; 3 repeated occurrences for the same sound)
          </h4>
          {recurringSubstitutions.length > 0 ? (
            <div className="space-y-2">
              {recurringSubstitutions.map(([pat, count]) => (
                <div
                  key={pat}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between"
                >
                  <span className="font-bold">
                    Pattern observed: <span className="text-rose-700 font-extrabold text-sm">{pat}</span> ({count} times)
                  </span>
                  <span className="text-[11px] bg-rose-200/60 px-2 py-0.5 rounded-md font-semibold">
                    Discuss tongue placement with SLP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              No persistent substitution patterns detected. Great job!
            </p>
          )}
        </div>

        {/* Fluency Observations */}
        <div>
          <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
            2. Acoustic Fluency Observations (Informational Rule-Based)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Prolongation (&gt;1.2s):</span>
              <span className="font-extrabold text-slate-800 text-sm">{prolongationCount} times</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Hesitation / Block (&gt;1s):</span>
              <span className="font-extrabold text-slate-800 text-sm">{blockCount} times</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Repetition Bursts:</span>
              <span className="font-extrabold text-slate-800 text-sm">{repetitionCount} times</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Export Report & Delete Data */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-4 rounded-2xl border border-slate-300 mb-6">
        <div>
          <h4 className="text-sm font-bold text-slate-800 m-0">Clinical Summary Report</h4>
          <p className="text-xs text-slate-500 m-0">
            Generate printable PDF summary to share with your Speech-Language Pathologist.
          </p>
        </div>

        <button
          onClick={handleExportPdf}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
        >
          <FileDown className="w-4 h-4" />
          <span>{t('parent.exportPdf')}</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
          ✅ Clinical PDF downloaded: {downloadSuccess}
        </div>
      )}

      {/* Delete All Data Danger Section */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-rose-700 block">Privacy & Data Management</span>
          <span className="text-[11px] text-slate-500">
            All records are stored strictly in your browser's LocalStorage.
          </span>
        </div>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('parent.deleteAll')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAll}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm"
            >
              Confirm Erase
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
