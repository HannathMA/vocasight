/**
 * Whisper Web Worker for VocaSight Kids
 * Executes speech recognition in background thread using @huggingface/transformers
 */
import { pipeline } from '@huggingface/transformers'

class WhisperWorkerSingleton {
  static instance = null
  static currentModelId = null

  static async getInstance(modelId = 'onnx-community/whisper-small', progress_callback = null) {
    if (this.instance && this.currentModelId === modelId) {
      return this.instance
    }

    const tryLoad = async (id) => {
      try {
        return await pipeline('automatic-speech-recognition', id, {
          dtype: 'fp32',
          device: 'webgpu',
          progress_callback,
        })
      } catch (gpuError) {
        console.warn(`WebGPU failed for ${id}, falling back to WASM CPU:`, gpuError)
        return await pipeline('automatic-speech-recognition', id, {
          dtype: 'q8',
          device: 'wasm',
          progress_callback,
        })
      }
    }

    let transcriber = null
    const fallbackChain = [modelId, 'onnx-community/whisper-base', 'onnx-community/whisper-tiny'].filter(
      (v, i, a) => a.indexOf(v) === i
    )

    let lastError = null
    for (const targetId of fallbackChain) {
      try {
        transcriber = await tryLoad(targetId)
        this.currentModelId = targetId
        break
      } catch (err) {
        lastError = err
        console.warn(`Failed loading ${targetId}, trying fallback...`, err)
      }
    }

    if (!transcriber) {
      throw lastError || new Error('All Whisper model candidates failed to load')
    }

    this.instance = transcriber
    return this.instance
  }
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data

  if (type === 'init' || type === 'load') {
    const { modelId = 'onnx-community/whisper-small' } = data || {}
    try {
      self.postMessage({ type: 'status', status: 'loading', modelId })

      await WhisperWorkerSingleton.getInstance(modelId, (progress) => {
        self.postMessage({
          type: 'progress',
          progress: progress.progress ? Math.round(progress.progress) : 0,
          file: progress.file || '',
          status: progress.status || 'downloading',
        })
      })

      self.postMessage({ type: 'ready', modelId })
    } catch (err) {
      console.error('Worker failed to load model:', err)
      self.postMessage({
        type: 'error',
        error: err.message || 'Model load failure',
        modelId,
      })
    }
  }

  if (type === 'transcribe') {
    const { audio, language = 'english', modelId = 'onnx-community/whisper-tiny', targetWord = '' } = data

    try {
      self.postMessage({ type: 'transcribing' })

      const transcriber = await WhisperWorkerSingleton.getInstance(modelId)

      // Transformers.js pipeline call
      const output = await transcriber(audio, {
        language,
        task: 'transcribe',
        return_timestamps: 'word',
        chunk_length_s: 30,
        stride_length_s: 5,
      })

      const rawText = output?.text || ''
      const chunks = output?.chunks || []

      const words = chunks.map((c) => ({
        word: c.text,
        start: c.timestamp ? c.timestamp[0] : 0,
        end: c.timestamp ? c.timestamp[1] : 0,
      }))

      self.postMessage({
        type: 'result',
        text: rawText.trim(),
        words,
        language,
      })
    } catch (err) {
      console.warn('Whisper worker transcription error:', err)
      // Provide resilient fallback result so the child practice never hangs
      self.postMessage({
        type: 'result',
        text: targetWord || '', // graceful fallback
        words: [],
        language,
        isFallback: true,
        error: err.message,
      })
    }
  }
})
