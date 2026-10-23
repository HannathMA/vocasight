import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  CameraOff,
  Sparkles,
  Smile,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

export function MouthMirror({
  faceHook,
  targetSound,
  onCalibrateComplete = null,
}) {
  const { t } = useTranslation()
  const {
    isCameraActive,
    cameraError,
    faceDetected,
    metrics,
    matchResult,
    isCalibrating,
    calibrationProgress,
    startCamera,
    stopCamera,
    calibrateNeutralFace,
    setTargetMouthProfile,
  } = faceHook

  const videoElementRef = useRef(null)
  const canvasElementRef = useRef(null)

  // Attach sound target mouth profile
  useEffect(() => {
    if (targetSound && targetSound.targetMouth) {
      setTargetMouthProfile(targetSound.targetMouth)
    }
  }, [targetSound, setTargetMouthProfile])

  // Initialize camera when mounted
  useEffect(() => {
    if (videoElementRef.current && canvasElementRef.current && !isCameraActive && !cameraError) {
      startCamera(videoElementRef.current, canvasElementRef.current)
    }
  }, [isCameraActive, cameraError, startCamera])

  const handleStartCalibration = () => {
    calibrateNeutralFace(onCalibrateComplete)
  }

  return (
    <div className="relative flex flex-col items-center bg-slate-900 rounded-3xl p-3 border-4 border-amber-300 shadow-lg overflow-hidden w-full max-w-md mx-auto">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between px-2 py-1 mb-2 z-10 text-white">
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{t('practice.magicMirror')}</span>
        </div>

        {/* Match Indicator Pill */}
        {isCameraActive && faceDetected && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all duration-300 ${
              matchResult.isMatch
                ? 'bg-emerald-500 text-white shadow-[0_0_12px_#10B981] animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {matchResult.isMatch ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Mouth Match!</span>
              </>
            ) : (
              <>
                <Smile className="w-3.5 h-3.5 text-sky-400" />
                <span>{Math.round(matchResult.score * 100)}% Shape</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Video & Canvas Container */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-800">
        {/* Hidden video element supplying stream to MediaPipe */}
        <video
          ref={videoElementRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
        />

        {/* Canvas that renders the mirrored feed with glowing lip landmarks */}
        <canvas
          ref={canvasElementRef}
          className={`w-full h-full object-cover transition-all duration-300 ${
            matchResult.isMatch ? 'filter drop-shadow-[0_0_16px_rgba(16,185,129,0.45)]' : ''
          }`}
        />

        {/* Target Guide Ring in Center */}
        {isCameraActive && faceDetected && (
          <div
            className={`absolute pointer-events-none w-36 h-24 rounded-[45%] border-3 transition-all duration-300 ${
              matchResult.isMatch
                ? 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_20px_#34d399]'
                : 'border-dashed border-sky-300/60 bg-sky-500/5'
            }`}
          />
        )}

        {/* Calibration Overlay */}
        {isCalibrating && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
            <Smile className="w-12 h-12 text-amber-400 animate-gentle-bounce mb-2" />
            <h4 className="text-white font-bold text-sm sm:text-base mb-1">
              {t('practice.calibrating')}
            </h4>
            <div className="w-48 bg-slate-700 h-3 rounded-full overflow-hidden border border-slate-600 mt-2">
              <div
                className="bg-amber-400 h-full transition-all duration-150 rounded-full"
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>
            <p className="text-amber-200 text-xs font-bold mt-2">{calibrationProgress}%</p>
          </div>
        )}

        {/* No Face Detected Overlay */}
        {isCameraActive && !faceDetected && !isCalibrating && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
            <Smile className="w-10 h-10 text-amber-400 animate-pulse mb-2" />
            <p className="text-white font-bold text-sm">
              {t('practice.lookingForFace')}
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Sit in a bright room and smile into the camera!
            </p>
          </div>
        )}

        {/* Camera Denied / Optional Fallback Overlay */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center z-20">
            <CameraOff className="w-12 h-12 text-amber-400 mb-2" />
            <p className="text-white font-bold text-sm max-w-xs mb-2">
              {t('practice.camDeniedNote')}
            </p>
            <button
              onClick={() => startCamera(videoElementRef.current, canvasElementRef.current)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}
      </div>

      {/* Target Sound Mouth Shape Guide Footer */}
      {targetSound && (
        <div className="w-full mt-2.5 p-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs flex items-center justify-between gap-2">
          <div className="flex-1 text-left">
            <span className="font-bold text-amber-300 block">
              💡 {targetSound.symbol} ({targetSound.translit}) Lip Tip:
            </span>
            <span className="text-[11px] text-slate-300 line-clamp-2">
              {targetSound.tip || 'Shape your lips gently as shown in the mirror!'}
            </span>
          </div>

          {/* Quick Calibrate Button */}
          {isCameraActive && (
            <button
              onClick={handleStartCalibration}
              disabled={isCalibrating}
              title="Calibrate neutral relaxed face"
              className="shrink-0 px-2.5 py-1.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/50 text-teal-300 border border-teal-400/40 text-[11px] font-bold cursor-pointer"
            >
              Calibrate
            </button>
          )}
        </div>
      )}
    </div>
  )
}
