import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Mic, MicOff, RefreshCw, Activity, Volume2 } from 'lucide-react'

export function Waveform({
  micHook,
  isRecording = false,
  pacingProgress = null,
  showEasyOnset = false,
}) {
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const { hasPermission, error, initMicrophone, drawWaveform } = micHook

  // Attach canvas 60fps render loop
  useEffect(() => {
    let cleanup = null
    if (canvasRef.current && hasPermission) {
      cleanup = drawWaveform(canvasRef.current, {
        primaryColor: isRecording ? '#EF4444' : '#10B981', // Red when recording, emerald otherwise
        secondaryColor: isRecording ? '#F87171' : '#34D399',
        pacingProgress: isRecording ? pacingProgress : null,
        easyOnset: showEasyOnset,
      })
    }
    return () => {
      if (cleanup) cleanup()
    }
  }, [hasPermission, isRecording, pacingProgress, showEasyOnset, drawWaveform])

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-3xl p-3 border-4 border-emerald-200 shadow-md">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-700">
          <Activity className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          <span>{t('practice.waveform')}</span>
        </div>

        {/* Live Recording Badge */}
        {isRecording && (
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-extrabold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>{t('practice.recordingState')}</span>
          </div>
        )}

        {showEasyOnset && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
            <span>🌸 Easy-Onset Guide Active</span>
          </div>
        )}
      </div>

      {/* Canvas Wave Container */}
      <div className="relative w-full h-28 sm:h-32 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
        {hasPermission === false || error ? (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <MicOff className="w-8 h-8 text-rose-500 mb-1" />
            <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-xs mb-2">
              {t('practice.micDeniedNote')}
            </p>
            <button
              onClick={initMicrophone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('practice.retryMic')}</span>
            </button>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={600}
            height={130}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Pacing Guide notice */}
      {showEasyOnset && (
        <div className="w-full mt-2 text-center text-[11px] font-semibold text-slate-500">
          Tip: Let voice rise gently from a soft whisper to a clear tone like the smooth pink wave!
        </div>
      )}
    </div>
  )
}
