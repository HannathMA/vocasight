import { useState, useEffect, useRef, useCallback } from 'react'
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import {
  MouthMetricsSmoother,
  LIP_CONTOUR_OUTER,
  LIP_CONTOUR_INNER,
  LIP_LANDMARK_INDICES,
} from '../engine/mouthMetrics'

export function useFaceLandmarker() {
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [metrics, setMetrics] = useState(null) // { raw, smoothed, calibrated }
  const [matchResult, setMatchResult] = useState({ score: 0.5, isMatch: false, details: {} })
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [calibrationProgress, setCalibrationProgress] = useState(0) // 0 to 100
  const [isSparkling, setIsSparkling] = useState(false)

  const landmarkerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const requestAnimationIdRef = useRef(null)
  const smootherRef = useRef(new MouthMetricsSmoother(5))
  const calibrationFramesRef = useRef([])
  const targetProfileRef = useRef(null)

  // 1. Initialize Face Landmarker (GPU with CPU fallback)
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current

    setIsModelLoading(true)
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      let landmarker = null
      try {
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      } catch (gpuErr) {
        console.warn('MediaPipe GPU delegate failed, falling back to CPU:', gpuErr)
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      }

      landmarkerRef.current = landmarker
      setIsModelLoading(false)
      return landmarker
    } catch (err) {
      console.warn('FaceLandmarker load failed:', err)
      setIsModelLoading(false)
      return null
    }
  }, [])

  // 2. Start Camera Feed
  const startCamera = useCallback(async (videoElement, canvasElement) => {
    videoRef.current = videoElement
    canvasRef.current = canvasElement
    setCameraError(null)

    try {
      await initLandmarker()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      })

      if (videoElement) {
        videoElement.srcObject = stream
        videoElement.onloadedmetadata = () => {
          videoElement.play()
          setIsCameraActive(true)
          startProcessingLoop()
        }
      }
      return true
    } catch (err) {
      console.warn('Camera permission denied or camera not found:', err)
      setCameraError(err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'UNAVAILABLE')
      setIsCameraActive(false)
      return false
    }
  }, [initLandmarker])

  // 3. Stop Camera
  const stopCamera = useCallback(() => {
    if (requestAnimationIdRef.current) {
      cancelAnimationFrame(requestAnimationIdRef.current)
      requestAnimationIdRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setFaceDetected(false)
  }, [])

  // 4. Calibration for 2 seconds (neutral face baseline)
  const calibrateNeutralFace = useCallback((onComplete = null) => {
    setIsCalibrating(true)
    setCalibrationProgress(0)
    calibrationFramesRef.current = []

    const startTime = Date.now()
    const duration = 2000 // 2 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(100, Math.round((elapsed / duration) * 100))
      setCalibrationProgress(progress)

      if (elapsed >= duration) {
        clearInterval(timer)
        setIsCalibrating(false)

        // Compute average baseline offset
        const frames = calibrationFramesRef.current
        if (frames.length > 0) {
          const baseline = {
            jawOpen: 0,
            mouthFunnel: 0,
            mouthPucker: 0,
            mouthClose: 0,
            mouthStretch: 0,
            mouthSmile: 0,
          }
          for (const f of frames) {
            for (const k of Object.keys(baseline)) {
              baseline[k] += f[k] || 0
            }
          }
          for (const k of Object.keys(baseline)) {
            baseline[k] = baseline[k] / frames.length
          }
          smootherRef.current.setCalibration(baseline)
        }

        if (onComplete) onComplete()
      }
    }, 50)
  }, [])

  // 5. Trigger Sparkles on activity completion
  const triggerSparkles = useCallback(() => {
    setIsSparkling(true)
    setTimeout(() => {
      setIsSparkling(false)
    }, 2500)
  }, [])

  // 6. Frame Processing Loop
  const startProcessingLoop = useCallback(() => {
    let lastVideoTime = -1

    const renderLoop = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      const landmarker = landmarkerRef.current

      if (video && canvas && video.readyState >= 2) {
        const videoWidth = video.videoWidth || 640
        const videoHeight = video.videoHeight || 480

        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth
          canvas.height = videoHeight
        }

        const ctx = canvas.getContext('2d')
        ctx.save()

        // Mirrored drawing
        ctx.scale(-1, 1)
        ctx.translate(-videoWidth, 0)
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

        // Process landmarks if landmarker is active
        if (landmarker && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const results = landmarker.detectForVideo(video, performance.now())

          const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0
          setFaceDetected(hasFace)

          if (hasFace) {
            const landmarks = results.faceLandmarks[0]
            const blendshapes = results.faceBlendshapes

            // Smooth metrics
            const currentMetrics = smootherRef.current.processFrame(blendshapes)
            if (currentMetrics) {
              setMetrics(currentMetrics)

              // Record baseline during calibration
              if (calibrationFramesRef.current) {
                calibrationFramesRef.current.push(currentMetrics.smoothed)
              }

              // Evaluate match vs targetProfile
              if (targetProfileRef.current) {
                const match = smootherRef.current.evaluateMatch(
                  currentMetrics.calibrated,
                  targetProfileRef.current
                )
                setMatchResult(match)
              }
            }

            // Draw glowing lip landmarks
            drawLipGlow(ctx, landmarks, videoWidth, videoHeight, matchResult.isMatch)
          }
        }

        // Draw sparkle particles if completed
        if (isSparkling) {
          drawSparkles(ctx, videoWidth, videoHeight)
        }

        ctx.restore()
      }

      requestAnimationIdRef.current = requestAnimationFrame(renderLoop)
    }

    renderLoop()
  }, [isSparkling, matchResult.isMatch])

  // Update target profile
  const setTargetMouthProfile = useCallback((targetProfile) => {
    targetProfileRef.current = targetProfile
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    isModelLoading,
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
    triggerSparkles,
    setTargetMouthProfile,
  }
}

// Helpers for drawing glowing lip landmarks
function drawLipGlow(ctx, landmarks, width, height, isMatch) {
  if (!landmarks || landmarks.length === 0) return

  const glowColor = isMatch ? '#10B981' : '#38BDF8' // Emerald if match, Sky Blue otherwise
  const strokeColor = isMatch ? '#34D399' : '#0EA5E9'

  // Draw outer contour
  ctx.beginPath()
  for (let i = 0; i < LIP_CONTOUR_OUTER.length; i++) {
    const pt = landmarks[LIP_CONTOUR_OUTER[i]]
    if (!pt) continue
    const x = pt.x * width
    const y = pt.y * height
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  ctx.shadowColor = glowColor
  ctx.shadowBlur = isMatch ? 20 : 10
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 3
  ctx.stroke()

  // Subtle fill glow
  ctx.fillStyle = isMatch ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)'
  ctx.fill()

  // Draw key landmark glowing dots
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = glowColor
  ctx.shadowBlur = 8

  for (const idx of [61, 291, 0, 17, 13, 14]) {
    const pt = landmarks[idx]
    if (pt) {
      ctx.beginPath()
      ctx.arc(pt.x * width, pt.y * height, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.shadowBlur = 0
}

// Sparkle stars drawing
function drawSparkles(ctx, width, height) {
  const time = Date.now() / 200
  const count = 12

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + time
    const radius = 90 + Math.sin(time + i) * 35
    const x = width / 2 + Math.cos(angle) * radius
    const y = height / 2 + Math.sin(angle) * radius * 0.7

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(time * 2 + i)

    ctx.fillStyle = '#FBBF24'
    ctx.shadowColor = '#F59E0B'
    ctx.shadowBlur = 12

    // 4-pointed star
    ctx.beginPath()
    for (let s = 0; s < 4; s++) {
      ctx.lineTo(0, -10)
      ctx.lineTo(3, -3)
      ctx.lineTo(10, 0)
      ctx.lineTo(3, 3)
      ctx.lineTo(0, 10)
      ctx.lineTo(-3, 3)
      ctx.lineTo(-10, 0)
      ctx.lineTo(-3, -3)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}
