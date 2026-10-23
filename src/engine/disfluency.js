/**
 * Rule-based Fluency Pattern Support Engine
 * Identifies acoustic features of prolongations, blocks, and repetitions
 * NOTE: For informational and clinical discussion purposes only. Never uses negative or labeling terms.
 */

/**
 * Calculates Root Mean Square (RMS) energy of an audio buffer slice
 */
export function calculateRMS(audioFloat32Array) {
  if (!audioFloat32Array || audioFloat32Array.length === 0) return 0
  let sum = 0
  for (let i = 0; i < audioFloat32Array.length; i++) {
    sum += audioFloat32Array[i] * audioFloat32Array[i]
  }
  return Math.sqrt(sum / audioFloat32Array.length)
}

/**
 * Splits audio array into energy frames (e.g. 50ms window with 25ms hop)
 */
export function extractEnergyEnvelope(audioData, sampleRate = 16000, frameDurationMs = 50, hopDurationMs = 25) {
  const frameLength = Math.floor((sampleRate * frameDurationMs) / 1000)
  const hopLength = Math.floor((sampleRate * hopDurationMs) / 1000)
  const energies = []

  for (let i = 0; i + frameLength <= audioData.length; i += hopLength) {
    const slice = audioData.subarray(i, i + frameLength)
    const rms = calculateRMS(slice)
    const timeSec = (i + frameLength / 2) / sampleRate
    energies.push({ timeSec, rms })
  }

  return { energies, hopLength, hopDurationMs }
}

/**
 * Detects possible fluency patterns from raw audio and whisper timestamps
 *
 * @param {Float32Array} audioData - 16kHz PCM audio
 * @param {number} sampleRate - default 16000
 * @param {Array} wordTimestamps - optional Whisper word chunks [{ word, start, end }]
 * @param {number} wordLengthThreshold - expected word duration threshold
 */
export function analyzeFluencyPatterns(audioData, sampleRate = 16000, wordTimestamps = [], wordLengthThreshold = 1.2) {
  if (!audioData || audioData.length === 0) {
    return {
      hasDisfluency: false,
      prolongation: { detected: false },
      block: { detected: false },
      repetition: { detected: false },
      confidence: 'low',
      summary: 'Normal speech pattern',
    }
  }

  const { energies } = extractEnergyEnvelope(audioData, sampleRate, 50, 25)
  if (energies.length === 0) {
    return {
      hasDisfluency: false,
      prolongation: { detected: false },
      block: { detected: false },
      repetition: { detected: false },
    }
  }

  // 1. Noise floor estimation (from first 100ms)
  let noiseFloor = 0.008
  if (energies.length >= 4) {
    const initialEnergies = energies.slice(0, 4).map((e) => e.rms)
    noiseFloor = Math.max(0.005, Math.min(...initialEnergies) * 1.5)
  }

  const speechThreshold = Math.max(0.015, noiseFloor * 2.5)

  // 2. Block detection:
  // Silence > 1.0s between start of recording and first sound, or a sudden gap > 1.0s inside speech
  let firstSpeechTime = null
  let maxSilenceInsideSpeech = 0
  let isInsideSpeech = false
  let currentSilenceDuration = 0

  for (let i = 0; i < energies.length; i++) {
    const { timeSec, rms } = energies[i]
    const isVoiced = rms > speechThreshold

    if (isVoiced) {
      if (firstSpeechTime === null) {
        firstSpeechTime = timeSec
      }
      isInsideSpeech = true
      currentSilenceDuration = 0
    } else {
      if (isInsideSpeech) {
        currentSilenceDuration += 0.025
        if (currentSilenceDuration > maxSilenceInsideSpeech) {
          maxSilenceInsideSpeech = currentSilenceDuration
        }
      }
    }
  }

  const initialDelay = firstSpeechTime !== null ? firstSpeechTime : energies[energies.length - 1].timeSec
  const blockDetected = initialDelay > 1.1 || maxSilenceInsideSpeech > 0.95
  const blockConfidence = initialDelay > 1.4 || maxSilenceInsideSpeech > 1.2 ? 'high' : 'medium'

  // 3. Prolongation detection:
  // Continuous voiced segment > 1.2s for a single syllable/short word
  let maxContinuousVoicedSec = 0
  let currentVoicedSec = 0

  for (let i = 0; i < energies.length; i++) {
    if (energies[i].rms > speechThreshold) {
      currentVoicedSec += 0.025
      if (currentVoicedSec > maxContinuousVoicedSec) {
        maxContinuousVoicedSec = currentVoicedSec
      }
    } else {
      currentVoicedSec = 0
    }
  }

  const prolongationDetected = maxContinuousVoicedSec > wordLengthThreshold
  const prolongationConfidence = maxContinuousVoicedSec > 1.6 ? 'high' : 'medium'

  // 4. Repetition detection:
  // Repeated short energy bursts (30-150ms) in the first 1.5s
  let burstCount = 0
  let inBurst = false
  const burstDurations = []
  let burstLen = 0

  const first15SecEnergies = energies.filter((e) => e.timeSec <= 1.5)
  for (const e of first15SecEnergies) {
    if (e.rms > speechThreshold) {
      if (!inBurst) {
        inBurst = true
        burstCount++
        burstLen = 0.025
      } else {
        burstLen += 0.025
      }
    } else {
      if (inBurst) {
        burstDurations.push(burstLen)
        inBurst = false
      }
    }
  }
  if (inBurst) burstDurations.push(burstLen)

  // Check whisper word timestamps for repeated tokens
  let timestampRepetition = false
  if (wordTimestamps && wordTimestamps.length >= 2) {
    for (let k = 0; k < wordTimestamps.length - 1; k++) {
      const w1 = (wordTimestamps[k].word || '').trim().toLowerCase()
      const w2 = (wordTimestamps[k + 1].word || '').trim().toLowerCase()
      if (w1 && w2 && (w1 === w2 || w2.startsWith(w1))) {
        timestampRepetition = true
        break
      }
    }
  }

  const repetitionDetected = (burstCount >= 3 && burstDurations.some((d) => d < 0.2)) || timestampRepetition
  const repetitionConfidence = burstCount >= 4 || timestampRepetition ? 'high' : 'medium'

  const hasDisfluency = prolongationDetected || blockDetected || repetitionDetected

  return {
    hasDisfluency,
    prolongation: {
      detected: prolongationDetected,
      duration: Number(maxContinuousVoicedSec.toFixed(2)),
      confidence: prolongationConfidence,
      description: 'Gentle continuous sound elongation observed',
    },
    block: {
      detected: blockDetected,
      initialDelay: Number(initialDelay.toFixed(2)),
      gapDuration: Number(maxSilenceInsideSpeech.toFixed(2)),
      confidence: blockConfidence,
      description: 'Gentle pause before voicing observed',
    },
    repetition: {
      detected: repetitionDetected,
      burstCount,
      confidence: repetitionConfidence,
      description: 'Multiple rhythm starts observed',
    },
    confidence: hasDisfluency ? (blockConfidence === 'high' || prolongationConfidence === 'high' ? 'high' : 'medium') : 'none',
  }
}
