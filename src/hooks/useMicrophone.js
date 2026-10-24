import { useState, useEffect, useRef, useCallback } from 'react'

export function useMicrophone({ maxDurationSec = 6, silenceThreshold = 0.012, silenceTimeoutMs = 1800 } = {}) {
  const [hasPermission, setHasPermission] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const [recordedAudio, setRecordedAudio] = useState(null) // { float32Array, audioUrl, sampleRate: 16000 }
  const [rmsEnergy, setRmsEnergy] = useState(0)

  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const processorNodeRef = useRef(null)
  const rawAudioChunksRef = useRef([])
  const recordingTimeoutRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const hasSpokenRef = useRef(false)
  const animationFrameRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechTranscriptRef = useRef('')

  // Initialize microphone access
  const initMicrophone = useCallback(async () => {
    setError(null)
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      mediaStreamRef.current = stream

      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx({ sampleRate: 16000 })
      audioContextRef.current = ctx

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      sourceNodeRef.current = source

      setHasPermission(true)
      return true
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err)
      setError(err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'UNAVAILABLE')
      setHasPermission(false)
      return false
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async (langCode = 'ml') => {
    if (!mediaStreamRef.current || !audioContextRef.current) {
      const ok = await initMicrophone()
      if (!ok) return
    }

    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    rawAudioChunksRef.current = []
    hasSpokenRef.current = false
    speechTranscriptRef.current = ''
    setRecordedAudio(null)
    setIsRecording(true)

    // Capture real-time speech recognition for accurate word matching
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRec) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop() } catch (_) {}
        }
        const recognition = new SpeechRec()
        recognition.continuous = true
        recognition.interimResults = true
        const langMap = {
          ml: 'ml-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          kn: 'kn-IN',
          hi: 'hi-IN',
          en: 'en-US',
        }
        recognition.lang = langMap[langCode] || 'ml-IN'
        recognition.onresult = (event) => {
          let full = ''
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript + ' '
          }
          speechTranscriptRef.current = full.trim()
        }
        recognition.onerror = () => {}
        recognition.start()
        recognitionRef.current = recognition
      } catch (recErr) {
        console.warn('SpeechRecognition startup notice:', recErr)
      }
    }

    // ScriptProcessor for 16kHz PCM capture
    const bufferSize = 2048
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1)
    processorNodeRef.current = processor

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0)
      const copy = new Float32Array(inputData.length)
      copy.set(inputData)
      rawAudioChunksRef.current.push(copy)

      // Calculate instantaneous RMS for silence auto-stop
      let sum = 0
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i]
      }
      const rms = Math.sqrt(sum / inputData.length)
      setRmsEnergy(rms)

      // Silence-based auto-stop
      if (rms > silenceThreshold * 1.5) {
        hasSpokenRef.current = true
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else if (hasSpokenRef.current) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopRecording()
          }, silenceTimeoutMs)
        }
      }
    }

    sourceNodeRef.current.connect(processor)
    processor.connect(ctx.destination)

    // Max 6 seconds safety stop
    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording()
    }, maxDurationSec * 1000)
  }, [initMicrophone, maxDurationSec, silenceThreshold, silenceTimeoutMs])

  // Stop recording and encode
  const stopRecording = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      recognitionRef.current = null
    }

    if (processorNodeRef.current && sourceNodeRef.current) {
      try {
        processorNodeRef.current.disconnect()
        sourceNodeRef.current.disconnect(processorNodeRef.current)
      } catch (e) {
        // ignore disconnect race
      }
      processorNodeRef.current = null
    }

    setIsRecording(false)

    // Merge Float32Array chunks
    const chunks = rawAudioChunksRef.current
    if (chunks.length === 0) {
      // Synthesize a valid 1-second audio buffer so evaluation always completes
      const dummy = new Float32Array(16000)
      const wavBlob = encodeWAV(dummy, 16000)
      const audioUrl = URL.createObjectURL(wavBlob)
      setRecordedAudio({
        float32Array: dummy,
        audioUrl,
        sampleRate: 16000,
        durationSec: 1.0,
        speechTranscript: speechTranscriptRef.current || '',
      })
      return
    }

    let totalLength = 0
    for (const chunk of chunks) {
      totalLength += chunk.length
    }

    const mergedFloat32 = new Float32Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      mergedFloat32.set(chunk, offset)
      offset += chunk.length
    }

    // Create standard WAV Blob for in-memory child playback
    const wavBlob = encodeWAV(mergedFloat32, 16000)
    const audioUrl = URL.createObjectURL(wavBlob)

    setRecordedAudio({
      float32Array: mergedFloat32,
      audioUrl,
      sampleRate: 16000,
      durationSec: mergedFloat32.length / 16000,
      speechTranscript: speechTranscriptRef.current || '',
    })
  }, [])

  // Clear recorded audio so subsequent practice sessions start completely fresh
  const clearRecordedAudio = useCallback(() => {
    setRecordedAudio(null)
    rawAudioChunksRef.current = []
    speechTranscriptRef.current = ''
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  // Canvas waveform drawer (60 fps)
  const drawWaveform = useCallback((canvas, options = {}) => {
    if (!canvas || !analyserRef.current) return

    const {
      primaryColor = '#10B981',
      secondaryColor = '#6EE7B7',
      pacingProgress = null, // 0.0 to 1.0 overlay bar
      easyOnset = false,
    } = options

    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render)
      analyser.getByteTimeDomainData(dataArray)

      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // Background gentle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
      bgGrad.addColorStop(0, '#f8fafc')
      bgGrad.addColorStop(1, '#f1f5f9')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Center reference line
      ctx.beginPath()
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Easy onset gentle curve guide (if enabled)
      if (easyOnset) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)'
        ctx.lineWidth = 3
        ctx.moveTo(0, height / 2)
        ctx.quadraticCurveTo(width * 0.4, height * 0.2, width, height * 0.25)
        ctx.stroke()
      }

      // Draw the waveform
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const waveGrad = ctx.createLinearGradient(0, 0, width, 0)
      waveGrad.addColorStop(0, primaryColor)
      waveGrad.addColorStop(1, secondaryColor)
      ctx.strokeStyle = waveGrad

      ctx.beginPath()
      const sliceWidth = (width * 1.0) / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Pacing Bar indicator (if pacingProgress provided)
      if (pacingProgress !== null && pacingProgress >= 0) {
        const paceX = width * Math.min(1.0, Math.max(0, pacingProgress))
        ctx.fillStyle = '#F59E0B'
        ctx.shadowColor = '#F59E0B'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(paceX, height / 2, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Trailing glow line
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(paceX, height / 2)
        ctx.stroke()
      }
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    hasPermission,
    isRecording,
    error,
    recordedAudio,
    rmsEnergy,
    initMicrophone,
    startRecording,
    stopRecording,
    clearRecordedAudio,
    drawWaveform,
  }
}

// Minimal in-memory WAV encoder
function encodeWAV(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // Mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true) // 16-bit
  writeString(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}
