import { useState, useEffect, useRef, useCallback } from 'react'
import { companionVoice } from '../services/companionVoice'

export function useWhisper({ defaultModelId = 'onnx-community/whisper-small' } = {}) {
  const [modelId, setModelId] = useState(defaultModelId)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0) // 0 to 100
  const [loadingStatus, setLoadingStatus] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState(null)

  const workerRef = useRef(null)
  const pendingPromiseRef = useRef(null)

  // Initialize Worker
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../workers/whisper.worker.js', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event) => {
        const { type, status, progress, file, text, words, error: workerErr, isFallback } = event.data

        if (type === 'status') {
          setLoadingStatus(status)
          if (status === 'loading') {
            setIsModelLoading(true)
            setModelReady(false)
          }
        } else if (type === 'progress') {
          setIsModelLoading(true)
          setLoadProgress(progress || 0)
          setLoadingStatus(`Downloading AI Speech Model (${progress}%)... ${file ? file.split('/').pop() : ''}`)
        } else if (type === 'ready') {
          setIsModelLoading(false)
          setModelReady(true)
          setLoadProgress(100)
          setLoadingStatus('Speech AI Ready')
        } else if (type === 'transcribing') {
          setIsTranscribing(true)
        } else if (type === 'result') {
          setIsTranscribing(false)
          if (pendingPromiseRef.current) {
            pendingPromiseRef.current.resolve({
              text: text || '',
              words: words || [],
              isFallback: Boolean(isFallback),
            })
            pendingPromiseRef.current = null
          }
        } else if (type === 'error') {
          setIsModelLoading(false)
          setIsTranscribing(false)
          setError(workerErr)
          // If a transcription was pending, resolve gracefully
          if (pendingPromiseRef.current) {
            pendingPromiseRef.current.resolve({
              text: '',
              words: [],
              isFallback: true,
              error: workerErr,
            })
            pendingPromiseRef.current = null
          }
        }
      }

      worker.onerror = (e) => {
        console.warn('Whisper worker error event:', e)
        setError('Worker communication error')
        setIsModelLoading(false)
        setIsTranscribing(false)
      }

      workerRef.current = worker

      // Trigger initial load
      worker.postMessage({ type: 'load', data: { modelId: defaultModelId } })

      return () => {
        worker.terminate()
      }
    } catch (err) {
      console.warn('Worker initialization failed:', err)
      setError('Web Worker not supported in this browser')
    }
  }, [defaultModelId])

  // Change model
  const changeModel = useCallback((newModelId) => {
    setModelId(newModelId)
    setModelReady(false)
    setIsModelLoading(true)
    setLoadProgress(0)
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'load', data: { modelId: newModelId } })
    }
  }, [])

  // Transcribe audio
  const transcribeAudio = useCallback(
    (audioFloat32Array, whisperLang = 'english', targetWord = '', speechTranscript = '') => {
      return new Promise((resolve) => {
        // If live SpeechRecognition captured what was spoken, return it so accurate matching occurs
        if (speechTranscript && speechTranscript.trim()) {
          resolve({ text: speechTranscript.trim(), words: [], isFallback: false })
          return
        }

        // If worker is missing or model is still downloading in background, return speechTranscript or empty string
        // so that wrong speech or silence is NEVER falsely marked correct!
        if (!workerRef.current || !modelReady) {
          resolve({ text: speechTranscript || '', words: [], isFallback: true })
          return
        }

        pendingPromiseRef.current = { resolve }
        setIsTranscribing(true)

        workerRef.current.postMessage({
          type: 'transcribe',
          data: {
            audio: audioFloat32Array,
            language: whisperLang,
            modelId,
            targetWord,
          },
        })

        // Snappy safety timeout of 3.5s so kids are never stuck waiting
        setTimeout(() => {
          if (pendingPromiseRef.current) {
            console.warn('Whisper transcription timeout - providing fallback')
            pendingPromiseRef.current.resolve({
              text: speechTranscript || '',
              words: [],
              isFallback: true,
            })
            pendingPromiseRef.current = null
            setIsTranscribing(false)
          }
        }, 3500)
      })
    },
    [modelId, modelReady]
  )

  // Speech synthesis audio for target words with multi-language support
  const playSampleAudio = useCallback((text, langCode = 'ml') => {
    try {
      companionVoice.speak(text, langCode, false)
    } catch (e) {
      console.warn('Speech synthesis error:', e)
    }
  }, [])

  return {
    modelId,
    isModelLoading,
    modelReady,
    loadProgress,
    loadingStatus,
    isTranscribing,
    error,
    changeModel,
    transcribeAudio,
    playSampleAudio,
  }
}
