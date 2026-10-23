import fs from 'fs'
import path from 'path'

const audioDir = path.resolve('public', 'audio')
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

// Generate a cheerful C-major arpeggio chime (C5, E5, G5, C6) WAV
function createChimeWav() {
  const sampleRate = 22050
  const duration = 0.8
  const totalSamples = Math.floor(sampleRate * duration)
  const buffer = Buffer.alloc(44 + totalSamples * 2)

  // WAV header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + totalSamples * 2, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // Mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(totalSamples * 2, 40)

  const freqs = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  let offset = 44

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    const noteIdx = Math.min(freqs.length - 1, Math.floor(t / 0.18))
    const freq = freqs[noteIdx]
    const env = Math.exp(-3 * (t % 0.18))
    const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.4
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)))
    buffer.writeInt16LE(intSample, offset)
    offset += 2
  }

  fs.writeFileSync(path.join(audioDir, 'celebrate.wav'), buffer)
  fs.writeFileSync(path.join(audioDir, 'chime.wav'), buffer)
}

createChimeWav()
console.log('Audio chime generated!')
