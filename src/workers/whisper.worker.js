/**
 * Whisper Web Worker for VocaSight Kids
 * Executes speech recognition in background thread using @huggingface/transformers
 */
import { pipeline } from '@huggingface/transformers'

class WhisperWorkerSingleton {
  static instance = null
  static currentModelId = null

  static async getInstance(modelId = 'onnx-community/whisper-tiny', progress_callback = null) {
    if (this.instance && this.currentModelId === modelId) {
      return this.instance
    }

    this.currentModelId = modelId

    // Try WebGPU first, fall back to wasm CPU
    let transcriber = null
    try {
      transcriber = await pipeline('automatic-speech-recognition', modelId, {
        dtype: 'fp32',
        device: 'webgpu',
        progress_callback,
      })
    } catch (gpuError) {
      console.warn('WebGPU init failed, falling back to WASM CPU:', gpuError)
      transcriber = await pipeline('automatic-speech-recognition', modelId, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback,
      })
    }

    this.instance = transcriber
    return this.instance
  }
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data

  if (type === 'init' || type === 'load') {
    const { modelId = 'onnx-community/whisper-tiny' } = data || {}
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
